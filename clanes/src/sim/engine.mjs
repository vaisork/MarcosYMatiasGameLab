import { makeMap, findPath } from '../path/grid.mjs';
import { FARO } from '../content/catalog.mjs';
import { openingMap, openingResult } from '../content/campaign.mjs';

const TICKS = 30;
const popCost = unit => unit.tipo === 'heroe' ? 4 : unit.nombre === 'Musgaguarda' || unit.nombre === 'Trepacopas' ? 2 : 1;
const worker = unit => unit.rol === 'trabajador';

export function createGame({ seed = 917, catalog, mission = null }) {
  const opening = mission?.id === 'semillas-al-alba';
  const map = opening ? openingMap() : makeMap(seed), game = { mission: opening ? mission : null, seed: seed >>> 0, tick: 0, map, catalog, entities: [], players: [], commands: [], result: null, nextId: 1 };
  for (const [id, clan, x, z] of [[0, 'Dosel', 8, 24], [1, 'Forja', 39, 24]]) {
    const p = { id, clan, resources: opening ? { Brote: 0, Prisma: 0 } : { Brote: 650, Prisma: 220 }, population: 12, used: 0, buildings: [], queue: [], ai: !opening && id === 1 };
    game.players.push(p);
    if (opening && id === 1) continue;
    spawn(game, { type: 'building', owner: id, name: id ? 'Patio de Remaches' : 'Nido de Raices', x, z, complete: true, hp: id ? 950 : 900 });
    const names = opening ? ['Semillero', 'Semillero', 'Semillero'] : id ? ['Remachador', 'Remachador', 'Rodacobre', 'Bumeran de Chispa'] : ['Semillero', 'Semillero', 'Semillero', 'Zarzapaso', 'Lanzafruto'];
    names.forEach((name, i) => spawnUnit(game, id, name, x + (i % 2) * 1.2 + 2, z + Math.floor(i / 2) * 1.3 - 1));
  }
  reveal(game);
  return game;
}

function spawn(game, e) {
  const entity = { id: game.nextId++, type: e.type, owner: e.owner, name: e.name, x: e.x, z: e.z, hp: e.hp ?? e.stats?.vida ?? 1, maxHp: e.maxHp ?? e.hp ?? e.stats?.vida ?? 1, stats: e.stats ?? null, complete: e.complete ?? true, progress: 0, order: null, path: [], cooldown: 0, cargo: 0, workTicks: 0, group: 0, stars: 0 };
  game.entities.push(entity); game.players[e.owner].used += e.type === 'unit' ? popCost(e.stats) : 0;
  if (e.type === 'building') game.players[e.owner].buildings.push(entity.id);
  return entity;
}

export function findStats(game, name, clan = 'Dosel') { return game.catalog.find(r => r.nombre === name && r.clan === clan) ?? (name === FARO.nombre ? FARO : null); }

function spawnUnit(game, owner, name, x, z) {
  const stats = findStats(game, name, game.players[owner].clan);
  return spawn(game, { type: 'unit', owner, name, stats, x, z, hp: stats.vida });
}

export function issue(game, command) {
  const cmd = { tick: game.tick, ...command };
  game.commands.push(cmd);
  const selected = game.entities.filter(e => cmd.ids.includes(e.id) && e.type === 'unit' && e.owner === 0);
  if (cmd.action === 'stop') for (const e of selected) e.order = e.path = null;
  if (cmd.action === 'move' || cmd.action === 'attack' || cmd.action === 'gather' || cmd.action === 'build') for (const e of selected) {
    if (cmd.action === 'build' && !worker(e.stats)) continue;
    e.order = { action: cmd.action, x: cmd.x, z: cmd.z, targetId: cmd.targetId ?? null, building: cmd.building ?? null };
    e.path = findPath(game.map, e.x, e.z, cmd.x, cmd.z, new Set(game.entities.filter(b => b.type === 'building' && b.complete).map(b => Math.floor(b.z) * 48 + Math.floor(b.x))));
  }
  return cmd;
}

export function placeBuilding(game, owner, name, x, z) {
  const player = game.players[owner], stats = findStats(game, name, player.clan);
  if (!stats || (stats.tipo !== 'edificio') || !canPay(player, stats) || game.entities.some(e => e.type === 'building' && Math.abs(e.x - x) < 2 && Math.abs(e.z - z) < 2)) return null;
  pay(player, stats);
  const building = spawn(game, { type: 'building', owner, name, stats, x: Math.floor(x) + .5, z: Math.floor(z) + .5, complete: false, hp: stats.vida });
  building.progress = 0;
  return building;
}

export function enqueue(game, owner, name) {
  const p = game.players[owner], stats = findStats(game, name, p.clan), building = game.entities.find(e => e.owner === owner && e.type === 'building' && e.complete && (e.name === 'Taller de Brotes' || e.name === 'Galpon de Ruedas'));
  if (!stats || !building || p.queue.length >= 5 || p.used + p.queue.reduce((n, q) => n + q.pop, 0) + popCost(stats) > p.population || !canPay(p, stats)) return false;
  pay(p, stats); p.queue.push({ name, stats, building: building.id, time: stats.tiempo_s * TICKS, pop: popCost(stats) }); return true;
}

function canPay(p, s) { return p.resources.Brote >= s.costo_brote && p.resources.Prisma >= s.costo_prisma; }
function pay(p, s) { p.resources.Brote -= s.costo_brote; p.resources.Prisma -= s.costo_prisma; }

export function step(game, ticks = 1) {
  for (let n = 0; n < ticks; n++) {
    if (game.result) break;
    game.tick++;
    const ordered = [...game.entities].sort((a, b) => a.id - b.id);
    for (const e of ordered) if (e.type === 'unit' && e.hp > 0) updateUnit(game, e);
    updateBuildings(game, ordered);
    if (game.tick % (90 * TICKS) === 0) for (const r of game.map.resources) r.amount = Math.min(r.max, r.amount + (r.kind === 'Brote' ? 10 : 4));
    if (game.tick % 15 === 0) reveal(game);
    if (game.players[1].ai && game.tick % (5 * 60 * TICKS) === 0) aiTurn(game);
    cleanup(game);
    if (game.mission) {
      game.result = openingResult(game.players[0].resources, game.tick);
      continue;
    }
    const center = game.entities.find(e => e.type === 'building' && e.name === 'Patio de Remaches' && e.hp > 0);
    const home = game.entities.find(e => e.type === 'building' && e.name === 'Nido de Raices' && e.hp > 0);
    if (!center) game.result = { winner: 0, reason: 'Centro rival destruido' };
    else if (!home) game.result = { winner: 1, reason: 'Nido de Raices destruido' };
    const beacon = game.entities.find(e => e.type === 'building' && e.owner === 0 && e.name === FARO.nombre && e.complete);
    if (!game.result && beacon) game.result = { winner: 0, reason: 'Faro de Concordia' };
  }
}

function updateUnit(game, e) {
  if (e.cooldown > 0) e.cooldown--;
  const order = e.order;
  if (!order) return;
  if (order.action === 'gather') {
    const node = game.map.resources.find(r => r.id === order.targetId);
    if (!node) { e.order = null; return; }
    if (e.cargo) {
      const homes = game.entities.filter(b => b.owner === e.owner && b.type === 'building' && b.complete && b.hp > 0);
      const home = homes.sort((a, b) => Math.hypot(e.x - a.x, e.z - a.z) - Math.hypot(e.x - b.x, e.z - b.z))[0];
      if (!home) { e.order = null; return; }
      if (Math.hypot(e.x - home.x, e.z - home.z) > 1.5) {
        if (!e.path?.length) e.path = findPath(game.map, e.x, e.z, home.x, home.z);
        return move(e);
      }
      game.players[e.owner].resources[e.cargoKind ?? node.kind] += e.cargo;
      e.cargo = 0; e.cargoKind = null; e.path = findPath(game.map, e.x, e.z, node.x, node.z);
      return;
    }
    if (node.amount <= 0) { e.order = null; return; }
    if (Math.hypot(e.x - node.x, e.z - node.z) > 1) return move(e);
    if (++e.workTicks >= 54) {
      e.workTicks = 0;
      const amount = Math.min(node.kind === 'Brote' ? 10 : 5, node.amount);
      node.amount -= amount; e.cargo = amount; e.cargoKind = node.kind; e.path = [];
    }
    return;
  }
  if (order.action === 'build') {
    const site = game.entities.find(b => b.id === order.targetId && b.owner === e.owner && !b.complete);
    if (!site || site.complete) { e.order = null; return; }
    if (Math.hypot(e.x - site.x, e.z - site.z) > 1.6) return move(e);
    const builders = game.entities.filter(u => u.owner === e.owner && u.type === 'unit' && u.order?.action === 'build' && u.order.targetId === site.id).sort((a, b) => a.id - b.id);
    const rank = builders.indexOf(e), rate = [1, .65, .4][rank];
    if (rate) site.progress += rate / (site.stats.tiempo_s * TICKS);
    if (site.progress >= 1) { site.complete = true; if (site.name === 'Refugio de Polen') game.players[e.owner].population = Math.min(100, game.players[e.owner].population + 8); e.order = null; }
    return;
  }
  if (order.action === 'attack') {
    const target = game.entities.find(t => t.id === order.targetId && t.hp > 0);
    if (!target) { e.order = null; return; }
    if (Math.hypot(e.x - target.x, e.z - target.z) > e.stats.alcance) return move(e);
    if (!e.cooldown) { target.hp -= e.stats.danio; e.cooldown = 18; if (target.hp <= 0) target.stars = TICKS * .65; }
    return;
  }
  if (order.action === 'move') move(e);
}

function move(e) {
  if (!e.path?.length) return;
  const [x, z] = e.path[0], speed = (e.stats.velocidad || 2) / TICKS, dx = x - e.x, dz = z - e.z, d = Math.hypot(dx, dz);
  if (d <= speed) { e.x = x; e.z = z; e.path.shift(); } else { e.x += dx / d * speed; e.z += dz / d * speed; }
}

function updateBuildings(game, entities) {
  for (const b of entities) if (b.type === 'building' && b.owner === 0 && b.name === 'Arco de Savia' && b.complete && game.tick % 45 === 0) {
    const t = game.entities.filter(e => e.type === 'unit' && e.owner !== 0 && e.hp > 0).sort((a, c) => Math.hypot(a.x - b.x, a.z - b.z) - Math.hypot(c.x - b.x, c.z - b.z))[0];
    if (t && Math.hypot(t.x - b.x, t.z - b.z) <= b.stats.alcance) { t.hp -= b.stats.danio; if (t.hp <= 0) t.stars = TICKS * .65; }
  }
  for (const p of game.players) {
    const q = p.queue[0]; if (!q) continue;
    const site = game.entities.find(e => e.id === q.building && e.complete); if (!site) continue;
    q.time--; if (q.time <= 0) { const unit = spawnUnit(game, p.id, q.name, site.x + 1, site.z + 1); unit.group = 0; p.queue.shift(); }
  }
}

function reveal(game) {
  for (let owner = 0; owner < 2; owner++) {
    const fog = game.map.fog[owner];
    for (let i = 0; i < fog.length; i++) if (fog[i] === 2) fog[i] = 1;
    for (const e of game.entities) if (e.owner === owner && (e.type === 'unit' || e.type === 'building' && e.complete)) {
      const radius = e.type === 'building' ? (e.name === 'Mirador Florido' || e.name === 'Cometa de Senales' ? 8 : 5) : 5;
      for (let z = Math.max(0, e.z - radius); z <= Math.min(47, e.z + radius); z++) for (let x = Math.max(0, e.x - radius); x <= Math.min(47, e.x + radius); x++) if ((x - e.x) ** 2 + (z - e.z) ** 2 <= radius ** 2) fog[Math.floor(z) * 48 + Math.floor(x)] = 2;
    }
  }
}

function aiTurn(game) {
  const p = game.players[1], workers = game.entities.filter(e => e.owner === 1 && e.type === 'unit' && worker(e.stats));
  for (const e of workers) {
    const node = game.map.resources.filter(r => r.kind === 'Brote' && r.amount > 0).sort((a, b) => Math.hypot(e.x - a.x, e.z - a.z) - Math.hypot(e.x - b.x, e.z - b.z))[0];
    if (node) { e.order = { action: 'gather', targetId: node.id }; e.path = findPath(game.map, e.x, e.z, node.x, node.z); }
  }
  if (!p.buildings.length) return;
  if (p.resources.Brote > 200 && !game.entities.some(e => e.owner === 1 && e.name === 'Galpon de Ruedas')) {
    const site = placeBuilding(game, 1, 'Galpon de Ruedas', 37, 27); if (site) for (const w of workers.slice(0, 2)) { w.order = { action: 'build', x: site.x, z: site.z, targetId: site.id }; w.path = findPath(game.map, w.x, w.z, site.x, site.z); }
  }
  if (p.queue.length < 2) enqueue(game, 1, 'Rodacobre');
  const squad = game.entities.filter(e => e.owner === 1 && e.type === 'unit' && !worker(e.stats));
  if (squad.length >= 6) for (const e of squad) { e.order = { action: 'attack', targetId: game.entities.find(t => t.owner === 0 && t.type === 'building').id }; e.path = findPath(game.map, e.x, e.z, 8, 24); }
}

function cleanup(game) {
  for (const e of game.entities) if (e.hp <= 0 && e.stars > 0) e.stars--;
  game.entities = game.entities.filter(e => e.hp > 0 || e.stars > 0);
  for (const p of game.players) p.used = game.entities.filter(e => e.type === 'unit' && e.owner === p.id && e.hp > 0).reduce((n, e) => n + popCost(e.stats), 0);
}

export function stateHash(game) {
  let hash = 2166136261;
  const data = JSON.stringify({ seed: game.seed, tick: game.tick, result: game.result, players: game.players.map(p => [p.resources.Brote, p.resources.Prisma, p.population, p.used, p.queue.map(q => [q.name, q.time])]), entities: game.entities.map(e => [e.id, e.type, e.owner, e.name, +e.x.toFixed(4), +e.z.toFixed(4), e.hp, e.complete, +e.progress.toFixed(4), e.order, e.path, e.cooldown, e.cargo, e.cargoKind, e.workTicks, e.group, e.stars]), resources: game.map.resources.map(r => r.amount), fog: game.map.fog.map(f => Array.from(f)), commands: game.commands });
  for (let i = 0; i < data.length; i++) hash = Math.imul(hash ^ data.charCodeAt(i), 16777619) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
