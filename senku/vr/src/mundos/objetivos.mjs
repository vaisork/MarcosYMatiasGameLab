export const objetivoNeon = (estado, id) => estado.encendidos.has(id) ? estado : (estado.encendidos.add(id), estado);
export const objetivoLuke = (estado, id) => estado.acariciados.has(id) ? estado : (estado.acariciados.add(id), estado);
export const objetivoBusqueda = (estado, atrapado, jalando) => {
  if (!atrapado) estado.atrapado = false;
  else if (jalando && !estado.atrapado) { estado.capturas++; estado.atrapado = true; }
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
