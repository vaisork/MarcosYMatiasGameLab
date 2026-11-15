export function parseBalance(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const keys = header.split(',');
  return lines.filter(Boolean).map(line => {
    const values = line.split(',');
    const row = Object.fromEntries(keys.map((key, i) => [key, values[i]]));
    for (const key of ['vida', 'danio', 'alcance', 'velocidad', 'costo_brote', 'costo_prisma', 'tiempo_s']) row[key] = Number(row[key]);
    return row;
  });
}

export const FARO = { tipo: 'edificio', clan: 'Dosel', nombre: 'Faro de Concordia', vida: 1200, danio: 0, alcance: 0, velocidad: 0, costo_brote: 420, costo_prisma: 260, tiempo_s: 90, rol: 'victoria' };

export function roster(catalog, clan) {
  return catalog.filter(item => item.clan === clan);
}
