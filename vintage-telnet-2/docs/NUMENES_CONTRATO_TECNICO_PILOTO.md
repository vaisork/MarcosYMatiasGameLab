# Contrato técnico: Númenes (compañeros animales con anomalía) — Piloto VT2

**Estado:** CONTRATO TÉCNICO DE PILOTO AUTORIZADO PARA PRUEBAS EN RAMA `agy/numenes-piloto`.  
**Entorno:** Vintage Telnet 2.  
**Fecha:** 2026-10-14.  
**Destinatarios:** Javier, Arquitectura, Jugabilidad, QA.  
**Aprobación requerida:** No se integra en `main` ni se despliega sin aprobación explícita de Javier y Arquitectura.

---

## 1. Fundamentos y Respeto a las 10 Reglas Históricas Recuperadas

Este contrato implementa el piloto completo de los ocho Númenes respetando punto por punto las diez reglas históricas recuperadas en `docs/NUMENES_REGLAS_RECUPERADAS_VT2.md`:

1. **R01 — Vinculación, nunca captura automática:**  
   Proceso en fases: *encontrar → observar → comprender comportamiento → comprobar compatibilidad → generar confianza mediante decisiones respetuosas → vínculo voluntario mutuo → nombrar*.  
   Queda terminantemente prohibido comprar animales, atraparlos por la fuerza, reducirlos en combate o ingresarlos automáticamente al inventario.
2. **R02 — Confianza discreta y contextual:**  
   La confianza no se mide en barras numéricas de XP ni porcentajes expuestos al jugador. Se organiza en estados discretos legibles narrativamente: `desconfiado` (1), `tolera_presencia` (2), `se_acerca` (3), `confia` (4), `vinculo_posible` (5) en el encuentro, y tras el vínculo: `cauteloso` (1), `cercano` (2), `confiado` (3), `fiel` (4), `inseparable` (5).  
   Repetir la misma acción en el mismo contexto no genera puntos de confianza (antifarming estricto).
3. **R03 — Rechazo legible y no punitivo:**  
   Cualquier interacción brusca o invasiva produce una reacción conductual clara (orejas recogidas, retroceso, mirada fija, repliegue) y pausa o cierra el encuentro. Un error razonable **no destruye** al Númen ni lo elimina permanentemente del mundo, ni desata un combate ni causa daño físico al personaje.
4. **R04 — Compatibilidad de poderes adquiridos:**  
   En el piloto, los ocho Númenes son compatibles de forma universal con las 4 clases actuales de VT2 (Juramentado, Arcano, Sombra, Artífice). No hay vetos de clase ni de especie. No se reabre ninguna clase histórica extinta (Vigía, Invocador).
5. **R05 — No retroactividad:**  
   Aprender habilidades o poderes futuros jamás anula un vínculo ya constituido.
6. **R06 — Tres vinculados, exactamente uno activo:**  
   Límite estricto e invariable: máximo **3 Númenes vinculados por personaje** (`0..3`). Exactamente **1 Númen activo en viaje** (`0..1`). Los Númenes en descanso permanecen en el hogar del personaje y no otorgan bonificaciones pasivas ni activas mientras no estén en viaje activo.
7. **R07 — Un poder único fijo por modelo más compañía:**  
   Los Númenes no suben de nivel, no acumulan atributos (PA/PP), no tienen árbol de habilidades ni equipo. Aportan presencia, afecto y un **único poder temático prudente de apoyo** con recarga (`cooldown`), subordinado al protagonismo del jugador.
8. **R08 — Supervivencia ordinaria:**  
   La caída o derrota habitual del personaje en combate no mata permanentemente a su Númen. El compañero se refugia oportunamente y se reúne con el personaje en su hogar o tras la recuperación, preservando nombre, confianza y vínculo intactos.
9. **R09 — Nombre individual del jugador:**  
   Los modelos A–H son claves editoriales internas, nunca nombres propios de la criatura. Al formalizarse el vínculo, el jugador elige libremente un nombre propio (2 a 24 caracteres, validado y persistido por el servidor).
10. **R10 — Naturaleza personal en mundo compartido:**  
    El progreso de encuentro, confianza, posesión y vínculo reside exclusivamente en el estado privado del personaje (`state['numenes']`). La presencia del animal en una sala no bloquea a otros jugadores ni revela secretos de terceros.

---

## 2. Modelo de Datos y Persistencia en el Estado del Jugador

El estado del personaje (`state` serializado en JSON en la tabla `characters` de SQLite) incorpora la clave `'numenes'`:

```json
{
  "numenes": {
    "active": "numen_f47ac10b",
    "bonded": [
      {
        "id": "numen_f47ac10b",
        "model": "a",
        "name": "Tizón",
        "trust": 3,
        "trust_stage": "confiado",
        "care": {
          "last_fed": 1728950000,
          "last_rested": 1728950000,
          "fed_today": true,
          "well_cared": true
        },
        "power": "oido_ruta",
        "bonded_at": 1728940000,
        "location": "travel"
      }
    ],
    "encounters": {
      "a": {
        "stage": "anomalia_comprendida",
        "step": 2,
        "last_action": "observar",
        "rejected": false
      }
    }
  }
}
```

### Campos del modelo:
- `numenes.active`: ID del ejemplar que acompaña al jugador en viaje (cadena o `null`).
- `numenes.bonded`: Lista de hasta 3 objetos ejemplar.
  - `id`: Identificador estable del ejemplar (`"numen_" + uuid_hex[:8]`).
  - `model`: Clave del modelo (`'a'` a `'h'`).
  - `name`: Nombre propio asignado por el jugador al vincular.
  - `trust`: Entero discreto del 1 al 5.
  - `trust_stage`: Etiqueta legible (`cauteloso`, `cercano`, `confiado`, `fiel`, `inseparable`).
  - `care`: Estado de cuidado cotidiano:
    - `last_fed`: Marca de tiempo del último alimento.
    - `last_rested`: Marca de tiempo del último descanso conjunto.
    - `well_cared`: Booleano calculado (refleja si ha comido o descansado en las últimas 24h de juego).
  - `power`: Identificador de la habilidad de apoyo fija del modelo.
  - `location`: `"travel"` si es el activo; `"home"` si descansa en el hogar.
- `numenes.encounters`: Diccionario privado por modelo de encuentro (`a`..`h`), con la progresión de acercamiento del personaje actual, independiente de otros jugadores en la misma sala.

### Compatibilidad y migración automática:
Partidas y personajes preexistentes no poseen la clave `numenes`. El motor la inicializa automáticamente al cargar el estado con `get('numenes', {'active': None, 'bonded': [], 'encounters': {}})`, garantizando retrocompatibilidad absoluta sin romper bases de datos existentes.

---

## 3. Encuentros, Acercamiento y Rechazo en el Motor

### Telegrafiado en salas candidatas
Los encuentros se ubican en las ocho salas candidatas autorizadas del dossier:
1. **Modelo A (Perro de cuatro orejas):** `edran_camino_carros`.
2. **Modelo B (Gato de ojos profundos):** `lethra_orilla_silente`.
3. **Modelo C (Conejo de cuatro orejas):** `hoshai_terraza_cargas`.
4. **Modelo D (Ratón de bigotes luminosos):** `korven_almacen_grano`.
5. **Modelo E (Ave de sombra doble):** `veyra_huerta_baja`.
6. **Modelo F (Cachorro de aire ondulante):** `edran_reparo`.
7. **Modelo G (Gato de dos colas):** `veyra_patio_porte`.
8. **Modelo H (Conejo silencioso):** `nhal_suelo_hojas`.

### Flujo de interacción:
1. **Llegada y Observación Inicial:**  
   El animal está presente como parte natural del entorno. Al usar `mirar` o `examinar`, se descubre la anomalía física sin explicaciones místicas ni etiquetas de "Númen" o "Mascota".
2. **Primera Acción Favorable (Paciencia / Respeto de espacio):**  
   El jugador elige una acción respetuosa (e.g. esperar a que pase el carro, guardar silencio, no bloquear la retirada). La confianza sube al escalón 2 (`tolera_presencia`).
3. **Segunda Acción Favorable (Comprensión mutua):**  
   Una decisión contextual compatible (e.g. no hacer ruidos bruscos, dejar libre la salida). La confianza alcanza el escalón 3 (`se_acerca`).
4. **Iniciativa del Númen e Invitación al Vínculo:**  
   El animal da un paso hacia el jugador. Se desbloquea la acción opcional `vincular_numen_<modelo>`.
5. **Rechazo Legible:**  
   Si el jugador intenta abalanzarse, agarrarlo bruscamente o forzarlo, el encuentro pasa a `rejected: true`, el animal se repliega a un refugio seguro con una descripción clara de su incomodidad y la interacción se pausa. El jugador puede retomar el encuentro en una visita posterior.

---

## 4. Vínculo, Cuidado y Crecimiento

### Formalización del Vínculo
- **Requisitos autoritativos:**
  - El encuentro debe estar en estado de invitación (`vinculo_posible`).
  - El jugador debe tener menos de 3 Númenes vinculados (`len(bonded) < 3`).
  - Proporcionar un nombre válido (2 a 24 caracteres legibles).
- **Resultado:**
  - Se crea la ficha del ejemplar y se añade a `bonded`.
  - Si el jugador no tenía Númen activo, el nuevo pasa a ser el acompañante activo (`active = id`, `location = "travel"`). Si ya tenía uno activo, el nuevo queda descansando en su hogar (`location = "home"`).
  - Se emite un evento narrativo entrañable y se registra en el diario del personaje.

### Cuidado Cotidiano
El jugador cuida a su Númen mediante acciones no intrusivas:
- **Alimentar (`alimentar_numen`):** Compartir una ración de viaje o comida del inventario. El Númen come con calma, activando `well_cared = true`.
- **Descanso conjunto (`descansar_numen`):** Al descansar en el hogar o en una zona de descanso autorizada, el Númen activo duerme junto al personaje, recuperando su ánimo.
- **Caricias / Calma (`atender_numen`):** Acción de afecto que brinda un mensaje reconfortante en el registro sin coste mecánico.

### Crecimiento de Confianza
- La confianza del compañero vinculado avanza discretamente del nivel 1 (`cauteloso`) al nivel 5 (`inseparable`) conforme el jugador viaja con él, lo alimenta y descansa a su lado.
- Una confianza alta (`fiel` o `inseparable`) añade matices de complicidad a los textos narrativos de viaje y reduce en 1 ronda la recarga del poder de apoyo en combate.

---

## 5. Efectos de Apoyo en Exploración y Combate (Sin Quitar Protagonismo)

El Númen es un **apoyo modesto y entrañable**, nunca un combatiente que sustituya al personaje ni un radar de secretos mágicos.

### En Exploración:
- Si el personaje examina una sala o busca indicios, el Númen activo puede aportar una reacción ambiental sutil acorde a su modelo:
  - **A (Oído):** Mueve sus orejas hacia un sonido ya existente en el entorno.
  - **B (Mirada):** Fija sus ojos en un detalle visible del canal o la piedra.
  - **C (Terreno):** Se detiene antes de un escalón o suelo irregular.
  - **D (Penumbra):** Sus bigotes aclaran el borde inmediato de una tabla.
  - **E (Perspectiva):** Sus dos sombras destacan la dirección de la luz.
  - **F (Calma):** Su proximidad templada alivia la fatiga al reposar.
  - **G (Atención):** Sus dos colas marcan un momento de pausa en el patio.
  - **H (Silencio):** Sus pisadas recuerdan la quietud del bosque.
- **Límite inviolable:** Nunca revela habitaciones secretas ocultas, nunca hackea guardas de atributos y nunca sustituye las habilidades de clase.

### En Combate (Acción de Apoyo con Recarga):
- Cuando el jugador tiene un Númen activo, la lista de acciones disponibles en combate incluye la acción de apoyo del compañero:
  - **Identificador:** `apoyo_numen` (con etiqueta personalizada según el nombre del Númen, ej: *"Aliento de Tizón"*).
  - **Recarga (Cooldown):** 3 rondas (2 rondas con confianza `fiel` o superior).
  - **Coste de fatiga:** 0 (el Númen actúa voluntariamente).
  - **Efecto prudente de piloto:**
    - Modelo A: *Alerta auditiva:* Concede +5% de evasión en la ronda actual al avisar de un golpe.
    - Modelo B: *Mirada profunda:* Concede +5% de precisión en el siguiente ataque.
    - Modelo C: *Aviso de apoyo:* Reduce en 1 el gasto de fatiga de la siguiente acción.
    - Modelo D: *Destello sutil:* Distrae al rival restando 5% a su precisión.
    - Modelo E: *Doble sombra:* Genera una pequeña duda visual, reduciendo el daño recibido en 2 puntos.
    - Modelo F: *Calma cercana:* Alivia 4 puntos de fatiga al personaje.
    - Modelo G: *Paso juguetón:* Desvía la atención rival, mitigando 2 puntos de daño.
    - Modelo H: *Pausa silenciosa:* Permite preparar la guardia sin hacer ruido (+1 a armadura/bloqueo en esa ronda).
- **Límite inviolable:** El Númen no recibe daño, no tiene barra de vida enemiga, no realiza ataques letales ni le roba la victoria al jugador de 9 años.

---

## 6. Gestión de Hogar y Cambio de Acompañante

- En la sala de hogar del personaje (`room['kind'] == 'home'`), el jugador puede ver a sus compañeros vinculados que están descansando.
- La interfaz y el comando de hogar permiten cambiar de acompañante:
  - `activar_numen`: El Númen seleccionado pasa a estado `travel` y el anterior regresa al hogar (`home`).
  - `descansar_numen`: Envía al Númen activo a descansar a casa si el jugador desea viajar solo (`active = null`).
- Exactamente uno (o ninguno) está activo en viaje en cualquier instante.

---

## 7. Derrota Ordinaria y Supervivencia

- Cuando los puntos de vida del personaje llegan a 0 y se desencadena la retirada/derrota estándar:
  - El Númen activo **no muere** ni desaparece del estado.
  - La narración describe cómo el compañero se aparta prudentemente o corre hacia un refugio seguro.
  - Al reaparecer el personaje en su punto de descanso/hogar, el Númen lo espera allí, aliviado de verle a salvo.
  - Su nombre, confianza y vínculo quedan 100% intactos.

---

## 8. Qué Queda Fuera del Piloto

Para mantener el diseño enfocado, mínimo y robusto (principios *ponytail*):
1. **No hay almacenamiento masivo:** El límite es estrictamente 3 ejemplares en total por personaje.
2. **No hay cría, cruce ni evolución genética:** Cada Númen es un ser único en el mundo.
3. **No hay comercio, venta ni transferencias:** Los seres vivos con voluntad no se compran ni venden en tiendas.
4. **No hay muerte permanente del Númen:** La experiencia emocional está cuidada para un público infantil y familiar.
5. **No hay árboles de talento ni niveles RPG del compañero:** El crecimiento es puramente afectivo y de confianza.
6. **No hay clases extintas:** Ninguna función exige ni menciona Invocador ni Vigía.
7. **No hay audio sintético ni modelos 3D obligatorios:** La experiencia es plena y autosuficiente en texto accesible y vista 2D.

---

## 9. Pruebas de Aceptación Requeridas para Validación del Piloto

El código debe satisfacer las siguientes pruebas automatizadas en `tests/test_numenes.py`:
- `test_primer_encuentro_telegrafiado`: Llegada a sala candidata muestra presencia sin revelar anomalía oculta ni crear mascota.
- `test_examen_descubre_anomalia`: Examinar la criatura descubre la anomalía física sin bautizarla.
- `test_rechazo_legible_no_punitivo`: Acción brusca genera repliegue y pausa sin combate ni daño.
- `test_vinculo_y_nombre_propio`: Tras invitación voluntaria, se crea el vínculo y se persiste el nombre elegido.
- `test_limite_maximo_tres_vinculados`: No se permite adoptar un 4º Númen.
- `test_un_solo_numen_activo`: En cualquier momento hay exactamente 0 o 1 activo; cambio en el hogar funciona de forma atómica.
- `test_cuidado_y_aumento_de_confianza`: Alimentar y descansar aumenta el cuidado y la confianza discretamente.
- `test_apoyo_en_combate_con_recarga`: La acción de apoyo funciona en combate, aplica su efecto y respeta el cooldown.
- `test_persistencia_ante_derrota`: Al caer en combate, el Númen se refugia y permanece vinculado con el personaje al reaparecer.
- `test_compatibilidad_cuatro_clases`: Cualquier clase (Juramentado, Arcano, Sombra, Artífice) puede vincularse y utilizar el apoyo.

---
*Fin del contrato técnico de piloto.*
