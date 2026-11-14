export function crearEstadoGallinas({
  total = 5,
  enfriamientoTelaraña = 4.0,
  duracionAtrapada = 6.0,
  corral = { minX: -5.5, maxX: 5.5, minZ: -14.5, maxZ: -5.5 },
  limites = { minX: -18, maxX: 18, minZ: -18, maxZ: 18 },
  posicionesIniciales = null,
} = {}) {
  const posicionesPorDefecto = [
    { x: -8, y: 0, z: 3 },
    { x: 8, y: 0, z: 5 },
    { x: -5, y: 0, z: 9 },
    { x: 6, y: 0, z: -2 },
    { x: 1, y: 0, z: 11 },
  ];
  const gallinas = [];
  for (let i = 0; i < total; i++) {
    const p = posicionesIniciales?.[i] || posicionesPorDefecto[i % posicionesPorDefecto.length];
    gallinas.push({
      id: i,
      pos: { x: p.x, y: p.y || 0, z: p.z },
      vel: { x: 0, y: 0, z: 0 },
      estado: 'libre',
      enCorral: false,
      atrapada: false,
      llevada: false,
      tiempoAtrapada: 0,
      angulo: 0,
      saltando: false,
    });
  }
  return {
    gallinas,
    total,
    enCorral: 0,
    recargaTelaraña: 0,
    enfriamientoTelaraña,
    duracionAtrapada,
    corral,
    limites,
    gallinaLlevada: null,
    reloj: 0,
    victoria: false,
    alimentadas: false,
    premiado: false,
  };
}

export function contarGallinasEnCorral(gallinas) {
  return gallinas.reduce((acc, g) => (g.enCorral ? acc + 1 : acc), 0);
}

export function estaEnCorral(pos, corralBounds) {
  return (
    pos.x >= corralBounds.minX &&
    pos.x <= corralBounds.maxX &&
    pos.z >= corralBounds.minZ &&
    pos.z <= corralBounds.maxZ
  );
}

export function actualizarHuida(
  gallina,
  posSenku,
  obstaculos = [],
  limites = { minX: -18, maxX: 18, minZ: -18, maxZ: 18 },
  dt = 0.016,
  opciones = {}
) {
  if (gallina.enCorral || gallina.atrapada || gallina.llevada) return gallina;

  const radioHuida = opciones.radioHuida ?? 7.0;
  const velocidadHuida = opciones.velocidadHuida ?? 3.8;
  const dx = gallina.pos.x - posSenku.x;
  const dz = gallina.pos.z - posSenku.z;
  const dist = Math.hypot(dx, dz);

  if (dist < radioHuida && dist > 0.001) {
    const dirX = dx / dist;
    const dirZ = dz / dist;
    gallina.estado = 'huyendo';
    gallina.vel.x = dirX * velocidadHuida;
    gallina.vel.z = dirZ * velocidadHuida;
    gallina.angulo = Math.atan2(dirX, dirZ);

    for (const obs of obstaculos) {
      const dObs = Math.hypot(gallina.pos.x - obs.x, gallina.pos.z - obs.z);
      const radioObs = (obs.radio ?? 1.0) + 0.4;
      if (dObs < radioObs && gallina.pos.y <= 0.05) {
        gallina.vel.y = obs.salto ?? 3.5;
        gallina.saltando = true;
        break;
      }
    }
  } else {
    gallina.estado = 'libre';
    gallina.vel.x *= 0.85;
    gallina.vel.z *= 0.85;
  }

  gallina.pos.x += gallina.vel.x * dt;
  gallina.pos.z += gallina.vel.z * dt;

  if (gallina.pos.y > 0 || gallina.vel.y > 0) {
    gallina.pos.y += gallina.vel.y * dt;
    gallina.vel.y -= 9.8 * dt;
    if (gallina.pos.y <= 0) {
      gallina.pos.y = 0;
      gallina.vel.y = 0;
      gallina.saltando = false;
    }
  }

  if (gallina.pos.x < limites.minX) {
    gallina.pos.x = limites.minX;
    gallina.vel.x = Math.abs(gallina.vel.x);
  } else if (gallina.pos.x > limites.maxX) {
    gallina.pos.x = limites.maxX;
    gallina.vel.x = -Math.abs(gallina.vel.x);
  }
  if (gallina.pos.z < limites.minZ) {
    gallina.pos.z = limites.minZ;
    gallina.vel.z = Math.abs(gallina.vel.z);
  } else if (gallina.pos.z > limites.maxZ) {
    gallina.pos.z = limites.maxZ;
    gallina.vel.z = -Math.abs(gallina.vel.z);
  }

  return gallina;
}

export function intentarAtraparTelaraña(estado, { impactoPos, radioImpacto = 2.2 }) {
  if (estado.recargaTelaraña > 0) {
    return { atrapada: false, motivo: 'recargando', recargaRestante: estado.recargaTelaraña };
  }
  const gallina = estado.gallinas.find((g) => {
    if (g.enCorral || g.atrapada || g.llevada) return false;
    const d = Math.hypot(g.pos.x - impactoPos.x, g.pos.z - impactoPos.z);
    return d < radioImpacto;
  });

  if (!gallina) {
    return { atrapada: false, motivo: 'sin_objetivo' };
  }

  gallina.atrapada = true;
  gallina.tiempoAtrapada = estado.duracionAtrapada;
  gallina.estado = 'atrapada';
  gallina.vel.x = 0;
  gallina.vel.z = 0;
  estado.recargaTelaraña = estado.enfriamientoTelaraña;

  return { atrapada: true, gallina };
}

export function actualizarLlevarGallina(estado, posSenku, corralBounds, opciones = {}) {
  const radioRecoger = opciones.radioRecoger ?? 2.0;

  if (estado.gallinaLlevada) {
    const g = estado.gallinaLlevada;
    g.pos.x = posSenku.x;
    g.pos.y = posSenku.y + 0.3;
    g.pos.z = posSenku.z;

    if (estaEnCorral(posSenku, corralBounds)) {
      g.llevada = false;
      g.atrapada = false;
      g.enCorral = true;
      g.pos.y = 0;
      g.estado = 'en_corral';
      estado.gallinaLlevada = null;
      estado.enCorral = contarGallinasEnCorral(estado.gallinas);
      if (estado.enCorral >= estado.total) {
        estado.victoria = true;
      }
      return { depositada: true, gallina: g, enCorral: estado.enCorral, total: estado.total };
    }
    return { llevando: true, gallina: g };
  }

  const candidata = estado.gallinas.find((g) => {
    if (!g.atrapada || g.llevada || g.enCorral) return false;
    const d = Math.hypot(g.pos.x - posSenku.x, g.pos.z - posSenku.z);
    return d < radioRecoger;
  });

  if (candidata) {
    candidata.llevada = true;
    candidata.estado = 'llevada';
    estado.gallinaLlevada = candidata;
    return { recogida: true, gallina: candidata };
  }

  return {};
}

export function actualizarRonda(
  estado,
  dt,
  posSenku,
  corralBounds = estado.corral,
  obstaculos = [],
  limites = estado.limites
) {
  estado.reloj += dt;
  estado.recargaTelaraña = Math.max(0, estado.recargaTelaraña - dt);

  for (const g of estado.gallinas) {
    if (g.atrapada && !g.llevada && !g.enCorral) {
      g.tiempoAtrapada -= dt;
      if (g.tiempoAtrapada <= 0) {
        g.atrapada = false;
        g.estado = 'libre';
      }
    } else if (!g.enCorral && !g.atrapada && !g.llevada) {
      actualizarHuida(g, posSenku, obstaculos, limites, dt);
    }
  }

  actualizarLlevarGallina(estado, posSenku, corralBounds);
  estado.enCorral = contarGallinasEnCorral(estado.gallinas);
  if (estado.enCorral >= estado.total) {
    estado.victoria = true;
  }

  return estado;
}

export function alimentarCorral(estado, posSenku, posComedero, radio = 2.5) {
  if (!estado.victoria || estado.alimentadas) return false;
  const d = Math.hypot(posSenku.x - posComedero.x, posSenku.z - posComedero.z);
  if (d < radio) {
    estado.alimentadas = true;
    estado.premiado = true;
    for (const g of estado.gallinas) {
      if (g.enCorral) g.estado = 'comiendo';
    }
    return true;
  }
  return false;
}
