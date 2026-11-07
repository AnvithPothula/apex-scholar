import { withStallRecovery } from './stallRecovery';

const never = () => new Promise(() => {});

test('returns the read without resetting when it answers', async () => {
  const reset = jest.fn(async () => {});
  await expect(withStallRecovery(async () => 'doc', reset, 20)).resolves.toBe('doc');
  expect(reset).not.toHaveBeenCalled();
});

test('a hung read resets the connection and retries', async () => {
  const read = jest.fn().mockImplementationOnce(never).mockImplementationOnce(async () => 'doc');
  const reset = jest.fn(async () => {});
  await expect(withStallRecovery(read, reset, 20)).resolves.toBe('doc');
  expect(reset).toHaveBeenCalledTimes(1);
  expect(read).toHaveBeenCalledTimes(2);
});

test('an offline error also resets and retries', async () => {
  const offline = Object.assign(new Error('client is offline'), { code: 'unavailable' });
  const read = jest.fn().mockRejectedValueOnce(offline).mockResolvedValueOnce('doc');
  await expect(withStallRecovery(read, async () => {}, 20, 1)).resolves.toBe('doc');
});

test('keeps trying briefly when the client still reports offline after the reset', async () => {
  const offline = Object.assign(new Error('client is offline'), { code: 'unavailable' });
  const read = jest.fn(async () => { throw offline; }).mockImplementationOnce(never);
  await expect(withStallRecovery(read, async () => {}, 20, 1)).rejects.toBe(offline);
  expect(read).toHaveBeenCalledTimes(4); // the stall, then three tries after the reset
  const heals = jest.fn().mockImplementationOnce(never).mockRejectedValueOnce(offline).mockResolvedValueOnce('doc');
  await expect(withStallRecovery(heals, async () => {}, 20, 1)).resolves.toBe('doc');
});

test('gives up instead of hanging when the retry or the reset hangs too', async () => {
  await expect(withStallRecovery(never, async () => {}, 20)).rejects.toMatchObject({ code: 'stalled' });
  await expect(withStallRecovery(never, never, 20)).rejects.toMatchObject({ code: 'stalled' });
});

test('other errors are not retried', async () => {
  const denied = Object.assign(new Error('denied'), { code: 'permission-denied' });
  const reset = jest.fn(async () => {});
  await expect(withStallRecovery(async () => { throw denied; }, reset, 20)).rejects.toBe(denied);
  expect(reset).not.toHaveBeenCalled();
});
