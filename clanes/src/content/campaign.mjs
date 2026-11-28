import { SIZE, idx } from '../path/grid.mjs';

export const MISSIONS = [
  {
    id: 'semillas-al-alba', number: 1, seed: 1331, title: 'Semillas al alba',
    brief: 'La corriente movió los huertos durante la noche. Ayuda a Nara a volver a llenar el Nido de Raíces.',
    objective: 'Deposita 80 Brotes en el Nido.',
    bonuses: ['Deposita 10 Prismas.', 'Termina en menos de 3 minutos.'],
    ready: true
  },
  { id: 'puente-para-todos', number: 2, title: 'Un puente para todos' },
  { id: 'sendero-cubierto', number: 3, title: 'El sendero cubierto' },
  { id: 'copa-tranquila', number: 4, title: 'La copa tranquila' },
  { id: 'ruedas-que-escuchan', number: 5, title: 'Ruedas que escuchan' },
  { id: 'eco-de-la-campana', number: 6, title: 'El eco de la campana' },
  { id: 'pasarela-de-ida-y-vuelta', number: 7, title: 'Pasarela de ida y vuelta' },
  { id: 'mapa-incompleto', number: 8, title: 'El mapa incompleto' },
  { id: 'agua-entre-islas', number: 9, title: 'Agua entre islas' },
  { id: 'corriente-amable', number: 10, title: 'Una corriente amable' },
  { id: 'faro-compartido', number: 11, title: 'El faro compartido' },
  { id: 'concordia-de-nimbora', number: 12, title: 'Concordia de Nimbora' }
];

export function openingMap() {
  const terrain = new Uint8Array(SIZE * SIZE);
  const resources = [
    { id: 1, x: 13, z: 24, kind: 'Brote', amount: 210, max: 210 },
    { id: 2, x: 12, z: 28, kind: 'Prisma', amount: 55, max: 55 },
    { id: 3, x: 15, z: 27, kind: 'Brote', amount: 160, max: 160 }
  ];
  for (let z = 0; z < SIZE; z++) for (let x = 0; x < SIZE; x++) {
    const curve = 19 + Math.round(Math.sin(x / 4) * 1.6);
    const water = (z === curve || z === 32 + Math.round(Math.cos(x / 4))) && (x < 6 || x > 16);
    const ridge = (z < 22 || z > 29 || x < 6 || x > 16) && (x * 13 + z * 7) % 9 < 2;
    terrain[idx(x, z)] = water ? 2 : ridge ? 1 : 0;
  }
  return { size: SIZE, terrain, resources, fog: [new Uint8Array(terrain.length), new Uint8Array(terrain.length)] };
}

export function openingResult({ Brote, Prisma }, tick) {
  if (Brote < 80) return null;
  const bonuses = [Prisma >= 10, tick < 3 * 60 * 30];
  return { winner: 0, reason: 'El Nido ya tiene sus Brotes', stars: 1 + bonuses.filter(Boolean).length, bonuses };
}

const SAVE_KEY = 'guerra-de-clanes.campana.v1';
export function loadProgress(storage) {
  try {
    const value = JSON.parse(storage.getItem(SAVE_KEY) || '{}');
    return Object.fromEntries(MISSIONS.flatMap(({ id }) =>
      Number.isInteger(value?.[id]) && value[id] >= 1 && value[id] <= 3 ? [[id, value[id]]] : []));
  } catch {
    return {};
  }
}
export function saveMission(storage, id, stars) {
  if (!MISSIONS.some(m => m.ready && m.id === id) || !Number.isInteger(stars) || stars < 1 || stars > 3) return false;
  try {
    const previous = loadProgress(storage);
    storage.setItem(SAVE_KEY, JSON.stringify({ ...previous, [id]: Math.max(previous[id] || 0, stars) }));
    return true;
  } catch {
    return false;
  }
}
export function isUnlocked(mission, progress) {
  return mission.ready === true && (mission.number === 1 || Boolean(progress[MISSIONS[mission.number - 2]?.id]));
}
