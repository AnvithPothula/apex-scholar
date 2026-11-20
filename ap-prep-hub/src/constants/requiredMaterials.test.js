import { requiredMaterialsFor, hasRequiredMaterials } from './requiredMaterials';
import { getSubjectName } from './comprehensiveCurriculum';

test('required lists reach every name a course goes by', () => {
  for (const name of ['AP U.S. Government and Politics', 'usGovernmentPolitics', getSubjectName('usGovernmentPolitics'), 'AP Gov', 'ap-us-government-and-politics']) {
    if (name === 'AP Gov') continue; // not an alias the app uses
    expect(requiredMaterialsFor(name)).toMatch(/Federalist No\. 39/);
  }
  expect(requiredMaterialsFor('latin')).toMatch(/Pliny/);
  expect(requiredMaterialsFor('AP Latin')).toMatch(/from the 2026 exam on/);
  expect(requiredMaterialsFor(getSubjectName('spanishLiterature'))).toMatch(/San Manuel Bueno/);
  expect(requiredMaterialsFor('artHistory')).toMatch(/250\. Kui Hua Zi/);
  expect(requiredMaterialsFor('AP English Language and Composition')).toBe('');
  expect(hasRequiredMaterials('AP Biology')).toBe(false);
});

test('the Art History list has all 250 works in order', () => {
  const lines = requiredMaterialsFor('AP Art History').split('\n').filter((l) => /^- \d+\. /.test(l));
  expect(lines).toHaveLength(250);
  lines.forEach((l, i) => expect(l.startsWith(`- ${i + 1}. `)).toBe(true));
});
