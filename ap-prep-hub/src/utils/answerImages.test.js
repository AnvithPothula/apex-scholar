import geminiService from '../services/geminiService';
import { toImageParts } from './answerImages';

const photo = (b64, mime = 'image/jpeg') => ({ id: b64, name: 'p', dataUrl: `data:${mime};base64,${b64}` });

test('photos become { data, mimeType } parts for the AI', () => {
  expect(toImageParts([photo('AAA'), photo('BBB', 'image/png')])).toEqual([
    { data: 'AAA', mimeType: 'image/jpeg' },
    { data: 'BBB', mimeType: 'image/png' },
  ]);
});

describe('generateWithImages with several photos (a multi-page FRQ)', () => {
  afterEach(() => jest.restoreAllMocks());

  test('every page reaches the grader; Puter (one image per call) is skipped', async () => {
    const puter = jest.spyOn(geminiService, '_askPuter').mockResolvedValue('from puter');
    const google = jest.spyOn(geminiService, '_googleGenerateWithImages').mockResolvedValue('graded');
    const out = await geminiService.generateWithImages('grade this', toImageParts([photo('P1'), photo('P2')]), { usageCategory: 'practiceTest' });
    expect(out).toBe('graded');
    expect(puter).not.toHaveBeenCalled();
    expect(google.mock.calls[0][1]).toEqual(['data:image/jpeg;base64,P1', 'data:image/jpeg;base64,P2']);
  });

  test('a single photo still tries Puter first', async () => {
    const puter = jest.spyOn(geminiService, '_askPuter').mockResolvedValue(null);
    const google = jest.spyOn(geminiService, '_googleGenerateWithImages').mockResolvedValue('graded');
    await geminiService.generateWithImages('grade this', toImageParts([photo('P1')]), { usageCategory: 'practiceTest' });
    expect(puter.mock.calls[0][1]).toBe('data:image/jpeg;base64,P1');
    expect(google.mock.calls[0][1]).toEqual(['data:image/jpeg;base64,P1']);
  });
});
