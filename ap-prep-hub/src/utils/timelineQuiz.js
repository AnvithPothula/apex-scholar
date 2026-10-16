/**
 * Events for a timeline "Quiz me": up to `count` events from one unit, each
 * from a different decade so the order is never a coin flip (events in the
 * same decade have no recorded year to sort by). Returned in true order as
 * TimelineOrder expects: { year: decade index, when: decade label, label }.
 */
export function pickQuizEvents(events, periods, unit, count = 5, rand = Math.random) {
  const order = new Map(periods.map((p, i) => [p.id, i]));
  const byPeriod = new Map();
  events.filter((e) => e.unit === unit).forEach((e) => {
    if (!byPeriod.has(e.period)) byPeriod.set(e.period, []);
    byPeriod.get(e.period).push(e);
  });
  const shuffle = (list) => list.map((v) => [rand(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  return shuffle([...byPeriod.keys()]).slice(0, count)
    .map((pid) => {
      const pool = byPeriod.get(pid);
      const e = pool[Math.floor(rand() * pool.length)];
      return { year: order.get(pid), when: periods[order.get(pid)].label, label: e.text };
    })
    .sort((a, b) => a.year - b.year);
}
