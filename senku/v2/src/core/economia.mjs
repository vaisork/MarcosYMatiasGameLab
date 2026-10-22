import { VERSION } from './store.mjs';
import { TRAJES, normalizarTrajesDeLegacy } from '../data/trajes.mjs';

const texto = (valor) => typeof valor === 'string' && valor.trim().length > 0;
const cantidadValida = (valor) => Number.isSafeInteger(valor) && valor >= 0;

function preparar(estado) {
  if (!estado || estado.version !== VERSION || !cantidadValida(estado.churus)
      || !Array.isArray(estado.coleccionados) || !estado.coleccionados.every(texto)) {
    return { error: 'estado_invalido' };
  }
  return normalizarTrajesDeLegacy(estado);
}

// Operaciones puras sobre estados de store. Los errores no alteran el estado recibido.
// Cero es válido; incluso una fuente de cero Churus queda consumida una sola vez.
export function ganarChurus(estado, cantidad, idFuente) {
  const nuevo = preparar(estado);
  if (nuevo.error) return nuevo;
  if (!cantidadValida(cantidad)) return { error: 'cantidad_invalida' };
  if (!texto(idFuente)) return { error: 'fuente_invalida' };
  if (nuevo.coleccionados.includes(idFuente)) return { error: 'fuente_duplicada' };
  if (!Number.isSafeInteger(nuevo.churus + cantidad)) return { error: 'saldo_fuera_de_rango' };
  return {
    ...nuevo,
    churus: nuevo.churus + cantidad,
    coleccionados: [...nuevo.coleccionados, idFuente],
  };
}

export function gastarChurus(estado, cantidad) {
  const nuevo = preparar(estado);
  if (nuevo.error) return nuevo;
  if (!cantidadValida(cantidad)) return { error: 'cantidad_invalida' };
  if (cantidad > nuevo.churus) return { error: 'saldo_insuficiente' };
  return { ...nuevo, churus: nuevo.churus - cantidad };
}

// Catálogo indexado por id, con el mismo formato que TRAJES.
// Un precio null siempre devuelve precio_no_definido, incluso si ya se posee el traje.
export function comprarTraje(estado, idTraje, catalogo = TRAJES) {
  const nuevo = preparar(estado);
  if (nuevo.error) return nuevo;
  if (!catalogo || typeof catalogo !== 'object' || Array.isArray(catalogo)) {
    return { error: 'catalogo_invalido' };
  }
  if (!texto(idTraje) || !Object.hasOwn(catalogo, idTraje)) return { error: 'traje_desconocido' };
  const traje = catalogo[idTraje];
  if (!traje || typeof traje !== 'object' || Array.isArray(traje)) return { error: 'catalogo_invalido' };
  if (traje.precio === null) return { error: 'precio_no_definido' };
  if (!cantidadValida(traje.precio)) return { error: 'precio_invalido' };
  if (nuevo.trajes.includes(idTraje)) return nuevo;
  const pagado = gastarChurus(nuevo, traje.precio);
  if (pagado.error) return pagado;
  return normalizarTrajesDeLegacy({ ...pagado, trajes: [...pagado.trajes, idTraje] });
}

export function equipar(estado, idTraje) {
  const nuevo = preparar(estado);
  if (nuevo.error) return nuevo;
  const id = TRAJES.rata.equivaleA.includes(idTraje) ? 'rata' : idTraje;
  if (!texto(id) || !Object.hasOwn(TRAJES, id)) return { error: 'traje_desconocido' };
  if (!nuevo.trajes.includes(id)) return { error: 'traje_bloqueado' };
  return { ...nuevo, equipado: id };
}
