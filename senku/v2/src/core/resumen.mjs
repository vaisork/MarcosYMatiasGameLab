// Resumen del capítulo para la pantalla final: churus, enemigos vencidos y secretos encontrados.
// Lógica pura: sin DOM.

export function resumenCapitulo(estadoJugador, escenas) {
  const coleccionados = new Set(estadoJugador?.coleccionados || []);
  const idsEscena = new Set(escenas.map((e) => e.id));
  const secretos = escenas.flatMap((e) => (e.objetos || []).filter((o) => o.secreto).map((o) => o.id));
  return {
    churus: estadoJugador?.churus ?? 0,
    enemigos: [...coleccionados].filter((id) => {
      const separador = id.indexOf(':derrotado:');
      return separador > 0 && idsEscena.has(id.slice(0, separador));
    }).length,
    secretosEncontrados: secretos.filter((id) => coleccionados.has(id)).length,
    secretosTotales: secretos.length,
  };
}
