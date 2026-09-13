// Per-IP daily caps. Lives in memory, so it resets on a fresh deploy — fine for now.
// NEW_DESIGNS_PER_DAY = fresh photos. Chat tweaks on an existing design are uncapped.
const NEW_DESIGNS_PER_DAY = 10;
const hits = new Map();
const DAY = 24 * 60 * 60 * 1000;

export function allow(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < DAY);
  if (list.length >= NEW_DESIGNS_PER_DAY) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}
