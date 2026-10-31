// Un paso de movimiento de Senku que combina física normal, anclador y garras.
// main.mjs y las pruebas usan esta misma función, así lo probado es lo que se juega.

import { actualizarCuerpo } from './fisica.mjs';
import { actualizarAnclador, controlaCuerpo, soltarAnclador } from './anclador.mjs';
import { actualizarGarras, resolverParedes, esPared } from './garras.mjs';

// Las paredes no son plataformas de un solo sentido: su cima sí se pisa.
function plataformasPisables(plataformas) {
  return plataformas.filter((p) => p.tipo !== 'anclaje');
}

export function pasoMovilidad(cuerpo, anclador, entrada, plataformas, limites, dt,
  { tieneAnclador = false, tieneGarras = false, config = {} } = {}) {
  const eventos = [];
  const paredes = plataformas.filter(esPared);

  if (tieneAnclador && anclador && !cuerpo.agarrado) {
    const e = actualizarAnclador(anclador, cuerpo, entrada, plataformas, dt);
    if (e) eventos.push(e);
    if (e === 'llegar' && tieneGarras) {
      // Llegar a una pared con garras deja a Senku agarrado, listo para trepar.
      const pared = paredes.find((p) => Math.abs(cuerpo.x + cuerpo.w - p.x) <= 2 || Math.abs(cuerpo.x - (p.x + p.w)) <= 2);
      if (pared) {
        cuerpo.agarrado = { pared: pared.id, lado: cuerpo.x < pared.x ? 1 : -1 };
        eventos.push('agarrar');
      }
    }
    if (controlaCuerpo(anclador)) {
      // Saltar suelta la cuerda.
      if (entrada?.salto && !cuerpo.saltoPresionado) {
        soltarAnclador(anclador);
        eventos.push('soltar-cuerda');
      } else {
        cuerpo.saltoPresionado = Boolean(entrada?.salto);
        return eventos;
      }
    }
  }

  if (cuerpo.agarrado) {
    const e = actualizarGarras(cuerpo, entrada, paredes, dt, { tieneGarras });
    if (e) eventos.push(e);
    cuerpo.saltoPresionado = Boolean(entrada?.salto);
    if (cuerpo.agarrado) return eventos;
  }

  // Mientras apunta, Senku no camina (como en Worms): la mira necesita quietud.
  const apuntando = anclador?.estado === 'apuntando';
  const entradaFisica = apuntando ? { ...entrada, izquierda: false, derecha: false } : entrada;
  actualizarCuerpo(cuerpo, entradaFisica, plataformasPisables(plataformas), limites, dt, config);
  resolverParedes(cuerpo, paredes);
  const e = actualizarGarras(cuerpo, entrada, paredes, dt, { tieneGarras });
  if (e) eventos.push(e);
  return eventos;
}
