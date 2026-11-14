export const objetivoNeon = (estado, id) => estado.encendidos.has(id) ? estado : (estado.encendidos.add(id), estado);
export const objetivoLuke = (estado, id) => estado.acariciados.has(id) ? estado : (estado.acariciados.add(id), estado);
export const objetivoBusqueda = (estado, atrapado) => {
  if (!atrapado) estado.atrapado = false;
  else if (!estado.atrapado) { estado.capturas++; estado.atrapado = true; }
  return estado;
};
export const objetivoMarcosUV = (estado, id) => (estado.revelados.add(id), estado);
export const objetivoFsGato = (estado, id) => (estado.reventadas.add(id), estado);
export const objetivoRataTaqueria = (estado, golpe) => {
  if (!golpe) estado.atrapada = false;
  else if (!estado.atrapada) { estado.capturas++; estado.atrapada = true; }
  return estado;
};
export const objetivoColumpiaEstilo = (estado, id) => (estado.piruetas.add(id), estado);
export const objetivoBotiquin = (estado, id) => estado.curados.has(id) ? estado : (estado.curados.add(id), estado);
export const objetivoSenku2 = (estado, id) => estado.cruzados.has(id) ? estado : (estado.cruzados.add(id), estado.combo = (estado.combo || 0) + 1, estado);
export const objetivoGrietaMadre = (estado, puertaId) => {
  if (estado.elegida !== null && estado.elegida !== undefined) return estado;
  estado.elegida = puertaId;
  estado.abierta = true;
  return estado;
};
export const objetivoVuelo = (estado, id, volando = true) => {
  if (!volando) return estado;
  if (!estado.recogidos.has(id)) estado.recogidos.add(id);
  return estado;
};

export const VUELOS_PERFECTOS_PARA_VUELO_PERMANENTE = 5;
export const CLAVE_VUELOS_PERFECTOS = 'senku_vr_vuelos_perfectos';

const TIEMPOS_VUELO = [45, 40, 35, 30, 26];
const CHURUS_MOVILES_VUELO = [0, 2, 4, 6, 8];

export function dificultadVuelo(perfectos = 0) {
  const nivelGanado = Math.max(0, Math.min(4, Math.trunc(Number(perfectos) || 0)));
  return Object.freeze({
    nivel: nivelGanado + 1,
    tiempoLimite: TIEMPOS_VUELO[nivelGanado],
    churusMoviles: CHURUS_MOVILES_VUELO[nivelGanado],
    velocidadMovimiento: 0.45 + nivelGanado * 0.22,
  });
}

export function tiempoVueloAgotado(transcurrido, limite) {
  return transcurrido >= limite;
}

export function falloIntentoVuelo({ volando, aterrizo = false, cayendo = false, tiempoAgotado = false, recogidos = 0 }) {
  return recogidos < 10 && (aterrizo || cayendo || !volando || tiempoAgotado);
}

export function registrarVueloPerfecto(progreso, perfecto) {
  if (!perfecto || progreso >= VUELOS_PERFECTOS_PARA_VUELO_PERMANENTE) return progreso;
  return progreso + 1;
}

export function cargarVuelosPerfectos(almacenamiento) {
  try {
    const guardados = Number(almacenamiento.getItem(CLAVE_VUELOS_PERFECTOS));
    return Number.isInteger(guardados) ? Math.max(0, Math.min(VUELOS_PERFECTOS_PARA_VUELO_PERMANENTE, guardados)) : 0;
  } catch { return 0; }
}

export function guardarVuelosPerfectos(almacenamiento, progreso) {
  try { almacenamiento.setItem(CLAVE_VUELOS_PERFECTOS, String(progreso)); } catch { /* sin almacenamiento */ }
}
