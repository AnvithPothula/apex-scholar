/**
 * Class assignments: work a teacher sets for a class, and each student's
 * submission.
 *
 *   classes/{code}/assignments/{id}                 everyone in the class reads
 *   classes/{code}/assignments/{id}/private/key     answer keys + rubrics (owners)
 *   classes/{code}/assignments/{id}/submissions/{uid}  that student + owners
 *
 * Types: practiceTest (a configured practice test), questions (a teacher's
 * question set, AI-drafted and reviewed, the same for everyone or drawn from a
 * bank), studyPack (a study-pack unit), pastFrq (an official past AP question,
 * graded in the Grader against College Board's scoring guidelines).
 *
 * Private by default: `countsOnLeaderboard` is false unless the teacher turns
 * it on, and responses and scores are only ever visible to the student and
 * the class's owners (firestore.rules).
 */
import { loadFirestore } from '../config/firestoreLazy';
import { generateMcqs } from './ai/mcqGenerator';
import geminiService from './geminiService';
import { getMyClasses } from './classes';
import errorLogger from '../utils/errorLogger';
import { requiredMaterialsFor } from '../constants/requiredMaterials';

export const TYPES = {
  practiceTest: 'Practice test',
  questions: 'Question set',
  studyPack: 'Study pack unit',
  pastFrq: 'Past AP FRQ',
};

// ---- Bank draw. Identical copy of netlify/lib/assignmentPick.js ------------
export function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function pickItemIds(itemIds, { mode, perStudent } = {}, uid = '', assignmentId = '') {
  const ids = Array.isArray(itemIds) ? itemIds.slice() : [];
  const n = Math.floor(Number(perStudent) || 0);
  if (mode !== 'bank' || n <= 0 || n >= ids.length) return ids;
  let seed = hash32(`${uid}:${assignmentId}`) || 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const chosen = new Set(ids.slice(0, n));
  return itemIds.filter((id) => chosen.has(id));
}

/** A submission's score as the teacher and student see it: the teacher's override wins. */
export function scoreOf(sub) {
  if (!sub) return null;
  let auto = null;
  if (Number.isFinite(sub.score)) auto = { score: sub.score, max: sub.maxScore ?? null };
  else {
    const frq = Object.values(sub.frqGrades || {});
    if (Number.isFinite(sub.mcqScore) || frq.length) {
      auto = {
        score: (sub.mcqScore || 0) + frq.reduce((s, g) => s + (Number(g?.score) || 0), 0),
        max: (sub.mcqMax || 0) + frq.reduce((s, g) => s + (Number(g?.maxPoints) || 0), 0),
      };
    }
  }
  if (Number.isFinite(sub.teacherScore)) return { score: sub.teacherScore, max: auto?.max ?? sub.maxScore ?? null, by: 'teacher' };
  return auto && { ...auto, by: 'auto' };
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const path = (code, id, ...rest) => ['classes', code, 'assignments', id, ...rest];

// ---- Reads -------------------------------------------------------------------
export async function listAssignments(code) {
  const { db, collection, getDocs } = await loadFirestore();
  const snap = await getDocs(collection(db, 'classes', code, 'assignments'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(a.dueAt || '').localeCompare(String(b.dueAt || '')));
}

export async function getAssignment(code, id) {
  const { db, doc, getDoc } = await loadFirestore();
  const snap = await getDoc(doc(db, ...path(code, id)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getKey(code, id) {
  const { db, doc, getDoc } = await loadFirestore();
  const snap = await getDoc(doc(db, ...path(code, id, 'private', 'key')));
  return snap.exists() ? snap.data().items || {} : {};
}

export async function getMySubmission(code, id, uid) {
  const { db, doc, getDoc } = await loadFirestore();
  const snap = await getDoc(doc(db, ...path(code, id, 'submissions', uid)));
  return snap.exists() ? snap.data() : null;
}

/** Owners only: every student's submission for one assignment. */
export async function listSubmissions(code, id) {
  const { db, collection, getDocs } = await loadFirestore();
  const snap = await getDocs(collection(db, ...path(code, id, 'submissions')));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// ---- Teacher writes --------------------------------------------------------
/**
 * Create or update an assignment. Question items are split: the public doc
 * gets the question text and choices, the private key doc gets answers,
 * explanations, rubrics and sample answers.
 */
export async function saveAssignment(code, user, draft) {
  const { db, doc, serverTimestamp, writeBatch } = await loadFirestore();
  const id = draft.id || newId();
  const items = Array.isArray(draft.items) ? draft.items : [];
  const publicItems = items.map(({ id: itemId, type, question, choices, points }) => ({
    id: itemId, type, question, ...(type === 'mcq' ? { choices } : { points: Number(points) || 0 }),
  }));
  const key = Object.fromEntries(items.map((it) => [it.id, {
    ...(it.type === 'mcq' ? { correctIndex: it.correctIndex, explanations: it.explanations || [] } : {}),
    ...(it.type === 'frq' ? { rubric: it.rubric || '', sampleAnswer: it.sampleAnswer || '' } : {}),
  }]));
  const data = {
    title: String(draft.title || '').trim().slice(0, 140) || TYPES[draft.type],
    type: draft.type,
    subject: draft.subject || '',
    instructions: String(draft.instructions || '').slice(0, 2000),
    dueAt: draft.dueAt || null,
    countsOnLeaderboard: draft.countsOnLeaderboard === true,
    config: draft.config || {},
    items: publicItems,
    mode: draft.mode === 'bank' ? 'bank' : 'same',
    perStudent: draft.mode === 'bank' ? Math.max(1, Number(draft.perStudent) || 1) : null,
    updatedAt: serverTimestamp(),
    ...(draft.id ? {} : { createdBy: user.uid, createdByName: user.displayName || user.fullName || 'Teacher', createdAt: serverTimestamp() }),
  };
  const batch = writeBatch(db);
  batch.set(doc(db, ...path(code, id)), data, { merge: true });
  if (draft.type === 'questions') batch.set(doc(db, ...path(code, id, 'private', 'key')), { items: key });
  await batch.commit();
  return id;
}

export async function deleteAssignment(code, id) {
  const { db, doc, deleteDoc, collection, getDocs } = await loadFirestore();
  const subs = await getDocs(collection(db, ...path(code, id, 'submissions')));
  await Promise.all(subs.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, ...path(code, id, 'private', 'key'))).catch(() => {});
  await deleteDoc(doc(db, ...path(code, id)));
}

/** Owner override of a student's score (null clears it), with an optional comment. */
export async function setTeacherScore(code, id, studentUid, score, note = '') {
  const { db, doc, updateDoc, serverTimestamp } = await loadFirestore();
  await updateDoc(doc(db, ...path(code, id, 'submissions', studentUid)), {
    teacherScore: score === null || score === '' ? null : Number(score),
    teacherNote: String(note || '').slice(0, 2000),
    teacherAt: serverTimestamp(),
  });
}

// ---- Student writes --------------------------------------------------------
export async function saveMySubmission(code, id, user, fields) {
  const { db, doc, setDoc, serverTimestamp } = await loadFirestore();
  await setDoc(doc(db, ...path(code, id, 'submissions', user.uid)), {
    ...fields,
    userId: user.uid,
    displayName: user.displayName || user.fullName || 'Student',
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/** After marking, the only thing a student may still add: AI grades of their written answers. */
export async function saveFrqGrades(code, id, uid, frqGrades) {
  const { db, doc, updateDoc } = await loadFirestore();
  await updateDoc(doc(db, ...path(code, id, 'submissions', uid)), { frqGrades, frqGradedAt: new Date().toISOString() });
}

/** Question sets: the server marks multiple choice and returns this student's keys. */
export async function submitQuestionSet(code, id) {
  const { auth } = await import('../config/firebase');
  const token = await auth.currentUser.getIdToken();
  const res = await fetch('/.netlify/functions/class-assignment-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ classId: code, assignmentId: id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Couldn't submit. Try again.");
  return body;
}

// ---- AI drafting (teacher) -------------------------------------------------
const asItem = (mcq) => ({ id: newId(), type: 'mcq', status: 'draft', question: mcq.question, choices: mcq.choices, correctIndex: mcq.correctIndex, explanations: mcq.explanations });

async function draftFrqs({ subject, topic, count, note = '' }) {
  if (!count) return [];
  const prompt = `You are an experienced ${subject} teacher writing AP-style free-response questions on: ${topic}.
Write ${count} question(s) in the College Board's style for this course, each answerable in 5-15 minutes, with a point-based rubric an AP reader could apply.${note ? `\nTeacher's request: ${note}` : ''}${requiredMaterialsFor(subject) ? `\n${requiredMaterialsFor(subject)}` : ''}
Reply with JSON only: [{"question": "...", "points": 4, "rubric": "Point-by-point scoring guide: what earns each point, with acceptable answers", "sampleAnswer": "a response that earns full credit"}]`;
  const text = await geminiService.generateContent(prompt, { temperature: 0.5, maxTokens: 6000, task: 'frqGrade', usageCategory: 'grade' });
  const parsed = geminiService.parseJSON(text, true);
  const arr = parsed.success && Array.isArray(parsed.data) ? parsed.data : [];
  return arr.filter((q) => q && q.question && q.rubric).slice(0, count).map((q) => ({
    id: newId(), type: 'frq', status: 'draft', question: String(q.question), points: Math.max(1, Math.min(20, Number(q.points) || 4)), rubric: String(q.rubric), sampleAnswer: String(q.sampleAnswer || ''),
  }));
}

/** Draft AP-style questions on a topic; MCQs are checked blind by a second model. */
export async function draftQuestions({ subject, topic, mcqCount = 5, frqCount = 0 }) {
  const [mcqs, frqs] = await Promise.all([
    mcqCount ? generateMcqs({
      subjectName: subject,
      sourceText: `Topic: ${topic}${requiredMaterialsFor(subject) ? `\n\n${requiredMaterialsFor(subject)}` : ''}`,
      count: mcqCount,
      instruction: `Write ${mcqCount} original AP ${subject} exam-style multiple-choice questions on the topic below, aligned with the College Board course framework. Vary difficulty and skills.`,
    }) : [],
    draftFrqs({ subject, topic, count: frqCount }),
  ]);
  return [...mcqs.map(asItem), ...frqs];
}

/** Replace one drafted question, following the teacher's note on what to change. */
export async function redraftQuestion({ subject, topic, item, note }) {
  const ask = `The teacher asked for this question to be changed: "${note || 'write a better question on the same idea'}".\nOriginal question: ${item.question}`;
  if (item.type === 'frq') {
    const [q] = await draftFrqs({ subject, topic, count: 1, note: ask });
    return q ? { ...q, id: item.id } : null;
  }
  const [mcq] = await generateMcqs({ subjectName: subject, sourceText: `Topic: ${topic}`, count: 1, instruction: `Write 1 AP ${subject} exam-style multiple-choice question. ${ask}` });
  return mcq ? { ...asItem(mcq), id: item.id } : null;
}

// ---- Schedule --------------------------------------------------------------
/**
 * Put every class assignment this student hasn't finished into their study
 * schedule as a task (once), and tick off the ones they've submitted. Runs
 * when the Classes page or the scheduler opens.
 */
// One sync at a time per tab: the class page and the scheduler both start
// one, and two overlapping runs each added the same task.
let syncing = null;
export function syncAssignmentsToTasks(uid) {
  if (!uid) return Promise.resolve(0);
  if (!syncing) syncing = runSync(uid).finally(() => { syncing = null; });
  return syncing;
}

async function runSync(uid) {
  try {
    const { db, collection, getDocs, addDoc, updateDoc, query, where, serverTimestamp } = await loadFirestore();
    const classes = await getMyClasses(uid);
    if (!classes.length) return 0;
    const tasksRef = collection(db, 'users', uid, 'tasks');
    const existing = await getDocs(query(tasksRef, where('source', '==', 'apex-class')));
    const byKey = new Map();
    existing.docs.forEach((d) => byKey.set(d.get('classAssignmentKey'), [...(byKey.get(d.get('classAssignmentKey')) || []), d]));
    let added = 0;
    const { doc, getDoc } = await loadFirestore();
    for (const c of classes) {
      // A teacher's own assignments are not their homework.
      const klass = await getDoc(doc(db, 'classes', c.id)).catch(() => null);
      if (klass?.exists() && (klass.data().ownerIds || []).includes(uid)) continue;
      let list = [];
      try { list = await listAssignments(c.id); } catch { continue; }
      for (const a of list) {
        const key = `${c.id}/${a.id}`;
        const sub = await getMySubmission(c.id, a.id, uid).catch(() => null);
        const done = Boolean(sub && (sub.status === 'submitted' || sub.status === 'done'));
        const tasks = byKey.get(key);
        if (tasks) {
          if (done) await Promise.all(tasks.filter((t) => !t.get('is_completed')).map((t) => updateDoc(t.ref, { is_completed: true })));
          continue;
        }
        if (done) continue;
        const minutes = a.type === 'practiceTest' ? Number(a.config?.timeMinutes) || 45 : a.type === 'studyPack' ? 40 : 30;
        await addDoc(tasksRef, {
          name: a.title,
          subject: a.subject || c.name || 'Class assignment',
          type: 'assignment',
          difficulty: 'medium',
          estimated_time: minutes,
          timeRequired: minutes / 60,
          timeSpent: 0,
          deadline: a.dueAt ? new Date(a.dueAt) : new Date(Date.now() + 7 * 864e5),
          description: a.instructions || `${TYPES[a.type]} from ${c.name || 'your class'}`,
          priority: 'high',
          source: 'apex-class',
          classAssignmentKey: key,
          courseName: c.name || '',
          is_completed: false,
          syncedAt: new Date(),
          // The scheduler lists tasks ordered by created_at; a task without it never shows.
          created_at: serverTimestamp(),
        });
        added += 1;
      }
    }
    return added;
  } catch (e) {
    errorLogger.warn('class assignment sync failed', { error: e?.message });
    return 0;
  }
}
