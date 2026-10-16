# Referencia al canon oficial de VT2

**Fuentes remotas del mismo repositorio** (`vaisork/MatiasGameLab/main`), verificadas al iniciar cada encargo:
- `AGENTS.md`, `vintage-telnet-2/AGENTS.md`
- `vintage-telnet-2/docs/DECISIONES_VIGENTES.md` y decisiones expresas posteriores del creador
- `vintage-telnet-2/docs/CANON_VIGENTE.md`
- `vintage-telnet-2/CONTENT_CONTRACT.md`, `vintage-telnet-2/CANON_EXPANSION.md`
- `vintage-telnet-2/content/world.json`, `vintage-telnet-2/content/regions/*.json`
- `vintage-telnet-2/docs/PROMPT_MAESTRO_2026-10-08.md` como referencia histórica subordinada
- Arte: `vintage-telnet-2/client/art/{places,bestiary,species,encounters}/` más manifiestos y aprobaciones.

## Hallazgos documentales contrastados (2026-10-14)
- Cuatro clases vigentes: **Juramentado, Arcano, Sombra y Artífice**; **Vigía e Invocador descartados** del alcance actual.
- Especies del mundo documentadas: humano, Felaryn, Dravak, Marevyn, Vesperi; biología y cultura según `docs/CANON_VIGENTE.md`. No describir Felaryn como voladores, Dravak como dragones, Marevyn como acuáticos que respiran bajo el agua, ni Vesperi con alas/ecolocalización.
- Edran/Valdren: campos y trabajo comunitario. Hoshai/Khariel: alturas; Korven/Brumak: piedra; Lethra/Narevia: agua; Nhal/Velmora: bosque; Veyra/Vaisgard: encuentro de rutas y piedras antiguas con origen desconocido.
- En `content/regions/edran.json` se verifica la ruta local `valdren_plaza → valdren_huertos → edran_salida_huertos → edran_acequia → edran_surcos → edran_lindero`. **Son conexiones, no distancias ni tiempos medidos**.
- En `content/regions/veyra.json`, `veyra_puerta_campos` conecta con `edran_hito_campos`; verificar las conexiones completas al cerrar la ruta literaria hasta Vaisgard.
- Ejemplos de lugares existentes: `valdren_plaza`, `valdren_fragua`, `edran_acequia`, `vaisgard_mercado`, `veyra_plaza_rutas`. La presencia de un NPC u objeto requiere verificación específica según condiciones del contenido.
- El origen de las piedras más antiguas de Vaisgard **no está resuelto**. Ningún escritor puede atribuirles constructores.

## Contrato de evidencia por capítulo
Registrar: dato → fuente/ruta/ref o SHA → clasificación ABIERTA/DESCUBRIBLE/RESERVADA → certeza → personaje que lo sabe → posible tensión → ilustración aprobada. Las propuestas nuevas permanecen **compatibles**, nunca canon jugable automático.

**En conflicto documental**, priorizar la decisión reciente del propietario y el canon vigente, pero no elegir unilateralmente entre contradicciones actuales: elevar a ambos arquitectos en la PR.
