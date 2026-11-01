const cartel = (id, textura, lineas, opciones = {}) => ({ id, textura, lineas, ...opciones });

// Veinte espacios publicitarios. Los diseños se comparten; cada entrada solo
// añade su ubicación/animación para mantener pequeño el catálogo de texturas.
export const CARTELES = Object.freeze([
  cartel('churus', 'churus.webp', ['¡Churus!', 'El snack favorito', 'de Senku'], { ubicacion: [-1, -1] }),
  cartel('busqueda', 'busqueda.webp', ['SE BUSCA', 'GATO MECÁNICO', 'Recompensa: 100 churus'], { ubicacion: [0, -1] }),
  cartel('senku2', 'senku2.webp', ['SENKU 2', '¡Nueva aventura felina!'], { ubicacion: [1, -1], marquesina: true }),
  cartel('vaisgard', 'vaisgard.webp', ['VAISGARD RPG', '¡Vive la aventura!'], { ubicacion: [1, 0], techo: true }),
  cartel('taqueria', 'taqueria.webp', ['TAQUERÍA', '¡Tacos deliciosos!'], { ubicacion: [1, 1], kiosco: true }),
  cartel('luke', 'luke.webp', ['LUKE', 'La pata más adorable'], { ubicacion: [0, 1] }),
  cartel('ultragato', 'ultragato.webp', ['ULTRA GATO', '¡Ratones de cuerda!'], { ubicacion: [-1, 1], marquesina: true }),
  cartel('neon', 'neon.webp', ['SENKU', '¡Miau, brilla la ciudad!'], { ubicacion: [-1, 0], neon: true }),
  cartel('marcos-uv', 'marcos-uv-diaz.webp', ['MARCOS / UV.DIAZ', '¡La ciudad también es tuya!'], { ubicacion: [-2, -1], nuevo: true }),
  cartel('fs-gato', 'fs-gato.webp', ['FS GATO', '¡Pescaditos y burbujas!'], { ubicacion: [-1, -2], nuevo: true, techo: true }),
  cartel('rata-taqueria', 'rata-taqueria.webp', ['RATA DE LA TAQUERÍA', '¡El taco más travieso!'], { ubicacion: [0, -2], nuevo: true, neon: true }),
  cartel('botiquin', 'botiquin.webp', ['BOTIQUÍN', '¡Cuidarnos es de héroes!'], { ubicacion: [1, -2], nuevo: true, kiosco: true }),
  cartel('columpia-estilo', 'columpia-estilo.webp', ['¡COLUMPIA CON ESTILO!', 'Siente el vuelo'], { ubicacion: [2, -1], nuevo: true, techo: true, marquesina: true }),
  cartel('grieta-madre', 'grieta-madre.webp', ['LA GRIETA MADRE', '¿Qué habrá del otro lado?'], { ubicacion: [2, 0], nuevo: true, techo: true, giro: true }),
  cartel('churus-azotea', 'churus.webp', ['¡CHURUS!', 'Energía para columpiarte'], { ubicacion: [2, 1], techo: true }),
  cartel('busqueda-sur', 'busqueda.webp', ['¡AYÚDANOS A BUSCAR!', 'Gato mecánico perdido'], { ubicacion: [1, 2] }),
  cartel('senku2-sur', 'senku2.webp', ['SENKU 2', '¡Aventura en cada azotea!'], { ubicacion: [0, 2], techo: true }),
  cartel('taqueria-sur', 'taqueria.webp', ['TAQUERÍA', '¡Pasa por unos tacos!'], { ubicacion: [-1, 2], kiosco: true }),
  cartel('neon-oeste', 'neon.webp', ['SENKU', '¡La noche se ilumina!'], { ubicacion: [-2, 1], neon: true }),
  cartel('vaisgard-oeste', 'vaisgard.webp', ['VAISGARD RPG', 'Tu próxima aventura'], { ubicacion: [-2, 0], techo: true }),
]);

export const CARTEL_ANIMACION = Object.freeze({
  marquesinas: 3,
  neones: CARTELES.filter(({ neon }) => neon).length,
  giratorios: CARTELES.filter(({ giro }) => giro).length,
  kioscos: CARTELES.filter(({ kiosco }) => kiosco).length,
});
