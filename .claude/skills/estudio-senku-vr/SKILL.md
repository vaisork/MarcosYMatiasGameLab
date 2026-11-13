---
name: estudio-senku-vr
description: Estudio de videojuegos para Senku VR. Coordina diseño, nivel, mundo, narrativa, texto, balance y QA de cambios en senku/vr/. Usar al pedir contenido o revisar diseño del juego WebXR.
---

# Estudio Senku VR

Flujo de producción de Claude Code Game Studios (Donchitos, MIT). La sesión principal coordina y revisa a los agentes en `.claude/agents/`; usa los roles necesarios, no todos por defecto. `AGENTS.md` y `senku/` prevalecen sobre las convenciones del estudio.

## Flujo

1. **Encargo**: concreta objetivo, experiencia, alcance y criterios de aceptación. Registra decisiones de diseño en `senku/vr/docs/` cuando el encargo lo requiera.
2. **Diseño**: `game-designer` define loop y mecánicas; `level-designer` plantea recorridos, encuentros y ritmo dentro del espacio WebXR.
3. **Canon y mundo**: consulta `world-builder` o `narrative-director` si afecta identidad, personajes o mundo de Senku. No contradigas los documentos existentes ni decidas por Matías/Javier.
4. **Texto y presentación**: `writer` propone texto de juego; revisa controles y legibilidad en visor con las pautas existentes. No añadas contenido o imágenes privadas a Git.
5. **Sistemas y rendimiento**: `systems-designer` concreta reglas verificables. Mantén física/reglas probables en módulos puros con pruebas. Para Quest, cuida draw calls, geometría, memoria y objetivo existente de 72 FPS; mide antes de afirmar rendimiento.
6. **QA**: `qa-tester` especifica casos. Ejecuta `node --test senku/vr/tests/*.test.mjs` para la lógica cubierta; los tests de Node no sustituyen una comprobación real en Quest.
7. **Cierre**: revisa cambios, pruebas y `git diff --check`. Sigue las reglas globales de rama, PR e integración; el estudio no autoriza publicar, desplegar ni usar dispositivos/cuentas personales.

## Límites técnicos

- Proyecto: `senku/vr/`; aplicación web sin build, Three.js 0.170.0 y WebXR.
- Lee primero `senku/vr/README.md` y solo los módulos/documentos que afecte el encargo.
- Pruebas: `node --test senku/vr/tests/*.test.mjs`.
- Prioriza Quest 2 y el presupuesto ya descrito en el README; no cambies objetivos de producto sin decisión de Javier/Matías.
- No copies runtime, secretos, partidas reales ni fotos originales a fixtures o commits.
