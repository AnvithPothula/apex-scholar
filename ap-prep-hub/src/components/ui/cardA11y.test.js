import { cardA11yProps } from './UIComponents';

const fakeEvent = (key) => {
  const e = { key, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
  return e;
};

describe('cardA11yProps', () => {
  it('gives a clickable Card button semantics and a tab stop', () => {
    // The AP subject picker rendered clickable Cards that never appeared in the
    // accessibility tree, so keyboard users could not choose a subject at all.
    const props = cardA11yProps({ onClick: () => {} });
    expect(props.role).toBe('button');
    expect(props.tabIndex).toBe(0);
  });

  it('activates on Enter and Space, and suppresses Space page-scroll', () => {
    const onClick = jest.fn();
    const { onKeyDown } = cardA11yProps({ onClick });

    const enter = fakeEvent('Enter');
    onKeyDown(enter);
    const space = fakeEvent(' ');
    onKeyDown(space);

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(space.defaultPrevented).toBe(true);
  });

  it('ignores other keys so typing still works inside a Card', () => {
    const onClick = jest.fn();
    cardA11yProps({ onClick }).onKeyDown(fakeEvent('a'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('leaves a non-clickable Card out of the tab order', () => {
    expect(cardA11yProps({})).toBeNull();
  });

  it('honours an explicit role so Cards inside real buttons stay valid', () => {
    expect(cardA11yProps({ onClick: () => {}, role: 'presentation' })).toBeNull();
  });

  it('still runs a caller onKeyDown, and lets it cancel activation', () => {
    const onClick = jest.fn();
    const onKeyDown = jest.fn((e) => e.preventDefault());
    cardA11yProps({ onClick, onKeyDown }).onKeyDown(fakeEvent('Enter'));
    expect(onKeyDown).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
