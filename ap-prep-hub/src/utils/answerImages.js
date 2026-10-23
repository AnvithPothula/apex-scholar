/**
 * Photos of handwritten work attached to written-response answers.
 *
 * They stay on this device: Firestore documents cap at 1 MB, so photos are
 * kept in IndexedDB beside the in-progress test (same key) and sent to the AI
 * only for grading. The grader writes out what it read, and that transcript is
 * what the saved result keeps.
 */

export const MAX_PHOTOS = 4;
const MAX_DIM = 1600; // long edge; enough to read handwriting
const QUALITY = 0.8;

/** Shrink a photo to a JPEG data URL. Phone photos are 3–12 MB; the AI request has to stay small. */
export async function compressImage(file) {
  if (!file || !/^image\//.test(file.type)) throw new Error('That file is not an image.');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This browser can't open that image. Try a JPEG or PNG (iPhone: Settings > Camera > Formats > Most Compatible).");
  }
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // transparent PNGs would turn black as JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name || 'photo',
    dataUrl: canvas.toDataURL('image/jpeg', QUALITY),
  };
}

/** `{ data, mimeType }` parts for geminiService.generateWithImages. */
export const toImageParts = (images = []) => images.map((img) => {
  const [meta, data] = img.dataUrl.split(',');
  return { data, mimeType: meta.slice(5, meta.indexOf(';')) };
});

// ---- IndexedDB (one record per test key: { [questionId]: photos[] }) ---------
const DB = 'apex-answer-images';
const STORE = 'tests';

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no indexedDB')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// Storage failures (private mode, quota) must never break the test itself.
export const saveAnswerImages = (key, images) =>
  run('readwrite', (s) => s.put(images, key)).catch(() => {});
export const loadAnswerImages = (key) =>
  run('readonly', (s) => s.get(key)).then((v) => v || {}).catch(() => ({}));
export const clearAnswerImages = (key) =>
  run('readwrite', (s) => s.delete(key)).catch(() => {});
