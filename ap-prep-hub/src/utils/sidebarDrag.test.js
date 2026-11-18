import { dragWidth, releaseSidebar, SIDEBAR_MIN } from './sidebarDrag';

test('dragging the conversations list resizes it, and far enough hides it', () => {
  expect(dragWidth(320, 100, 480)).toBe(420);
  expect(dragWidth(320, 400, 480)).toBe(480);
  expect(dragWidth(320, -400, 480)).toBe(0);
  expect(releaseSidebar(320, 60, 480)).toEqual({ hide: false, width: 380 });
  expect(releaseSidebar(320, -140, 480)).toEqual({ hide: false, width: SIDEBAR_MIN });
  expect(releaseSidebar(320, -170, 480)).toEqual({ hide: true });
  expect(releaseSidebar(288, -200, 337)).toEqual({ hide: true });
});
