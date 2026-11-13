export const objetivoNeon = (estado, id) => estado.encendidos.has(id) ? estado : (estado.encendidos.add(id), estado);
export const objetivoLuke = (estado, id) => estado.acariciados.has(id) ? estado : (estado.acariciados.add(id), estado);
export const objetivoBusqueda = (estado, atrapado, jalando) => {
  if (!atrapado) estado.atrapado = false;
  else if (jalando && !estado.atrapado) { estado.capturas++; estado.atrapado = true; }
  return estado;
};
export const objetivoBotiquin = (estado, id) => estado.curados.has(id) ? estado : (estado.curados.add(id), estado);
export const objetivoSenku2 = (estado, id) => estado.cruzados.has(id) ? estado : (estado.cruzados.add(id), estado.combo = (estado.combo || 0) + 1, estado);
export const objetivoGrietaMadre = (estado, puertaId) => {
  if (estado.elegida !== null && estado.elegida !== undefined) return estado;
  estado.elegida = puertaId;
  estado.abierta = true;
  return estado;
};
