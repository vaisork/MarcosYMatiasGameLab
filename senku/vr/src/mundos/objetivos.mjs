export const objetivoNeon = (estado, id) => estado.encendidos.has(id) ? estado : (estado.encendidos.add(id), estado);
export const objetivoLuke = (estado, id) => estado.acariciados.has(id) ? estado : (estado.acariciados.add(id), estado);
export const objetivoBusqueda = (estado, atrapado, jalando) => {
  if (!atrapado) estado.atrapado = false;
  else if (jalando && !estado.atrapado) { estado.capturas++; estado.atrapado = true; }
  return estado;
};
