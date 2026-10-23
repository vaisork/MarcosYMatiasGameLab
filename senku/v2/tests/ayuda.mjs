export function memoria(inicial = {}) {
  const d = new Map(Object.entries(inicial));
  return { getItem: (k) => (d.has(k) ? d.get(k) : null), setItem: (k, v) => { d.set(k, String(v)); }, _d: d };
}
