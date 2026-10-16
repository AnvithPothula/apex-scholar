import { subjectName, shortSubjectName, subjectSlug, courseFor, courseTitle } from './subjects';

it('resolves every form a course goes by to one official name, short form and slug', () => {
  for (const s of ['AP U.S. History', 'AP US History', 'AP United States History', 'usHistory', 'ap-us-history', 'APUSH']) {
    expect(subjectName(s)).toBe('AP U.S. History');
    expect(subjectSlug(s)).toBe('ap-us-history');
  }
  expect(subjectName('AP Government and Politics: Comparative')).toBe('AP Comparative Government and Politics');
  expect(shortSubjectName('AP Physics C: Electricity and Magnetism')).toBe('AP Physics C: E&M');
  expect(shortSubjectName('physics1')).toBe('AP Physics 1');
  expect(subjectName('AP Physics 1')).toBe('AP Physics 1: Algebra-Based');
  expect(subjectName('AP Studio Art: Drawing')).toBe('AP Drawing');
  expect(subjectName('Not a course')).toBe('Not a course');
  expect(courseFor('')).toBeNull();
});

it('shows a course-led title with the short form and leaves other titles alone', () => {
  expect(courseTitle('AP US History — Period 3: Revolution')).toBe('AP U.S. History — Period 3: Revolution');
  expect(courseTitle('AP Physics 1: Algebra-Based - Kinematics')).toBe('AP Physics 1 - Kinematics');
  expect(courseTitle('My cell biology set')).toBe('My cell biology set');
  expect(courseTitle('Unit 2 - Cells')).toBe('Unit 2 - Cells');
  expect(courseTitle('Biology - cells')).toBe('Biology - cells');
});
