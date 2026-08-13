/**
 * Subjects where the tutor must NOT default to answering in the target language.
 *
 * Without this, the AP Spanish tutor replies entirely in Spanish — which is
 * exactly the language the student is still learning. A beginner asking "what
 * is the subjunctive for?" cannot read a full Spanish explanation of it, so the
 * answer is worthless to the person most in need of it. Immersion is a teaching
 * choice the STUDENT should make, not a default the app imposes.
 *
 * Latin and Spanish Literature are included: both are taught and examined with
 * English analysis of target-language texts.
 */
const TARGET_LANGUAGE_SUBJECTS = {
  'AP Spanish Language and Culture': 'Spanish',
  'AP Spanish Literature and Culture': 'Spanish',
  'AP French Language and Culture': 'French',
  'AP German Language and Culture': 'German',
  'AP Italian Language and Culture': 'Italian',
  'AP Chinese Language and Culture': 'Chinese',
  'AP Japanese Language and Culture': 'Japanese',
  'AP Latin': 'Latin',
};

/** Language directive for a world-language tutor, or '' for every other subject. */
export function languageDirective(subjectName, targetLanguage) {
  const lang = targetLanguage || TARGET_LANGUAGE_SUBJECTS[subjectName];
  if (!lang) return '';
  return `LANGUAGE OF INSTRUCTION:
Explain in ENGLISH by default. Do not reply entirely in ${lang} unless the
student writes to you in ${lang} or explicitly asks you to.
Use ${lang} for the things that must be in ${lang} — example sentences,
vocabulary, model exam responses, practice prompts, and quoted texts — and give
a short English gloss the first time anything non-obvious appears.
When you set a speaking or writing task, give the instructions in English and
the task itself in ${lang}.
The student is still learning ${lang}; an answer they cannot read teaches them
nothing.`;
}
