"""Criaturas encontrables de la microaventura piloto VT-NAR-003 (El lindero
roto). El canon narrativo (comportamiento, aspecto, senales) sale de
vintage-telnet/CREATURES.md y no se toca aqui.

CREATURES.md dice explicitamente que no define estadisticas/dano/HP -- eso
"pertenece a Jugabilidad" (GAMEPLAY.md). Los valores de combate de este
archivo (hp/precision/damage) son el perfil v1 aprobado directamente por
Jugabilidad en vintage-telnet/STARTER_CREATURE_BALANCE.md -- no un modelo
derivado de atributos genericos. La revision de Arquitectura de PR #49
senalo que una version anterior de este archivo, que derivaba HP/precision/
dano de un modelo de atributos generico (20.4), divergia demasiado de esa
tabla aprobada; por eso los tres numeros de combate se copian aqui tal
cual, y `server/combat.py` los resuelve con `resolve_fixed_attack_roll`/
`fixed_expected_dps` en vez de `resolve_attack_roll`/`expected_dps`.
GAMEPLAY.md 20.15 marca explicitamente la dificultad concreta de cada
enemigo como "afinable sin rediseñar el sistema" tras pruebas reales --
estos valores deben tratarse como esa primera calibracion, no como balance
definitivo.

`behavior_text` reformula sin inventar el comportamiento ya descrito en
CREATURES.md ("corre en zigzag hacia agujeros o maleza" / "eriza las puas
antes de atacar" / "resopla con pesadez") para que las criaturas se lean
como distintas antes de que el jugador decida atacar/huir (VT-PSY-004).

Cornalomo (Issue #213 / DEATH-01): perfil v1 aprobado directamente por
Jugabilidad en STARTER_CREATURE_BALANCE.md y DEATH_PLAYTEST.md como amenaza
superior regional de Edran para la prueba de muerte y respawn."""

CREATURES = {
    "mordelinde": {
        "name": "Mordelinde",
        "family": "mordelinde",
        "reference_level": 1,
        "hp": 28,
        "precision": 45,
        "damage": 5,
        "flee_agilidad": 14,
        "flee_percepcion": 11,
        "behavior_text": ("Mordelinde no te persigue: si detecta movimiento, corre en zigzag "
                           "buscando una madriguera o la maleza."),
    },
    "espinajo_rastrojo": {
        "name": "Espinajo de rastrojo",
        "family": "espinajo_rastrojo",
        "reference_level": 2,
        "hp": 40,
        "precision": 50,
        "damage": 8,
        "flee_agilidad": 9,
        "flee_percepcion": 10,
        "behavior_text": ("Espinajo de rastrojo eriza las puas del lomo y se mantiene firme: "
                           "vigila su territorio y no huye con facilidad."),
        "prepared_action": {
            "id": "embestida_territorial",
            "name": "embestida territorial",
            "interruptible": True,
            "frontal": True,
            "telegraph": ("Espinajo de rastrojo baja la cabeza raspando el suelo con sus púas, "
                          "preparando una embestida frontal."),
            "precision": 60,
            "damage": 8,
        },
    },
    "cornalomo": {
        "name": "Cornalomo",
        "family": "cornalomo",
        "reference_level": 8,
        "hp": 120,
        "precision": 65,
        "damage": 20,
        "armor_reduction": 0.20,
        "flee_agilidad": 8,
        "flee_percepcion": 9,
        "behavior_text": ("Cornalomo sacude la placa ósea de la frente y resopla con pesadez: "
                           "no busca combate sin motivo, pero su masa y cuernos curvos dominan el terreno."),
    },
    "unapiedra": {
        "name": "Uñapiedra",
        "family": "unapiedra",
        "reference_level": 1,
        "hp": 30,
        "precision": 45,
        "damage": 5,
        "flee_agilidad": 15,
        "flee_percepcion": 12,
        "behavior_text": ("Uñapiedra se aplasta contra la roca y busca una grieta o saliente cercana; "
                           "si la acorralas, sisea y defiende el refugio con una mordida corta."),
    },
    "saltacresta": {
        "name": "Saltacresta",
        "family": "saltacresta",
        "reference_level": 2,
        "hp": 36,
        "precision": 50,
        "damage": 7,
        "flee_agilidad": 16,
        "flee_percepcion": 14,
        "behavior_text": ("Saltacresta flexiona las patas traseras y busca una terraza libre; "
                           "si le cierras la salida, golpea el suelo y se prepara para defenderse con una patada corta."),
    },
    # Fauna regional v1 — contratos mecánicos literales de #298–#303.
    # Sin assets aprobados: estas criaturas dejan el marco de combate neutral.
    "cascapedernal": {
        "name": "Cascapedernal",
        "family": "cascapedernal",
        "reference_level": 1,
        "hp": 34,
        "precision": 42,
        "damage": 5,
        "armor_reduction": 0.10,
        "flee_agilidad": 8,
        "flee_percepcion": 9,
        "behavior_text": ("Cascapedernal se encoge y golpea el suelo con el borde de su caparazón; "
                           "permanece junto a la piedra cálida y busca una hendidura estrecha."),
    },
    "colagrieta": {
        "name": "Colagrieta",
        "family": "colagrieta",
        "reference_level": 2,
        "hp": 33,
        "precision": 52,
        "damage": 7,
        "flee_agilidad": 14,
        "flee_percepcion": 13,
        "behavior_text": ("Colagrieta asoma la cabeza desde una fisura y repliega su cola contra la roca; "
                           "evita permanecer en terreno abierto y retrocede al notar vibraciones."),
    },
    "pinzajunco": {
        "name": "Pinzajunco",
        "family": "pinzajunco",
        "reference_level": 1,
        "hp": 32,
        "precision": 47,
        "damage": 6,
        "armor_reduction": 0.05,
        "flee_agilidad": 8,
        "flee_percepcion": 10,
        "behavior_text": ("Pinzajunco levanta la pinza mayor como advertencia y se mueve de lado "
                           "entre barro, raíces y juncos."),
    },
    "saltalodo": {
        "name": "Saltalodo",
        "family": "saltalodo",
        "reference_level": 2,
        "hp": 38,
        "precision": 50,
        "damage": 7,
        "flee_agilidad": 14,
        "flee_percepcion": 12,
        "behavior_text": ("Saltalodo permanece semisumergido; al asustarse, salta hacia el agua profunda, "
                           "aunque un ejemplar territorial puede defender su charca."),
    },
    "rondamusgo": {
        "name": "Rondamusgo",
        "family": "rondamusgo",
        "reference_level": 1,
        "hp": 29,
        "precision": 44,
        "damage": 5,
        "flee_agilidad": 14,
        "flee_percepcion": 12,
        "behavior_text": ("Rondamusgo se queda inmóvil al oír pasos y corre cuando se siente observado; "
                           "busca hongos y raíces tiernas entre la hojarasca."),
    },
    "hilaria_niebla": {
        "name": "Hilaria de niebla",
        "family": "hilaria_niebla",
        "reference_level": 2,
        "hp": 34,
        "precision": 52,
        "damage": 7,
        "flee_agilidad": 10,
        "flee_percepcion": 14,
        "behavior_text": ("Hilaria de niebla permanece inmóvil junto a su red baja; los filamentos "
                           "vibran antes de que retroceda hacia un hueco de corteza."),
    },
    # GAMEPLAY §40 / REGIONAL_THREAT_PROFILES.md (#335): Amenazas regionales C3 v1
    "rasgacumbres": {
        "name": "Rasgacumbres",
        "family": "rasgacumbres",
        "reference_level": 9,
        "hp": 110,
        "precision": 70,
        "damage": 22,
        "armor_reduction": 0.10,
        "flee_agilidad": 18,
        "flee_percepcion": 17,
        "behavior_text": ("Rasgacumbres vigila desde las alturas de la sierra y reduce distancia "
                           "en picado hacia las crestas."),
        "prepared_action": {
            "id": "rasgacumbres_descenso",
            "name": "Descenso de picada",
            "signal": "grava que cae y reducción rápida de distancia desde altura",
            "frontal": False,
            "interruptible": True,
            "precision": 76,
            "damage": 30,
        },
    },
    "quebrarrocas": {
        "name": "Quebrarrocas",
        "family": "quebrarrocas",
        "reference_level": 10,
        "hp": 150,
        "precision": 55,
        "damage": 24,
        "armor_reduction": 0.30,
        "flee_agilidad": 8,
        "flee_percepcion": 11,
        "behavior_text": ("Quebrarrocas empuja desde la roca fracturada; su cuerpo acorazado "
                           "y macizo avanza como un ariete."),
        "prepared_action": {
            "id": "quebrarrocas_empuje",
            "name": "Empuje de roca",
            "signal": "vibración fuerte y piedras desplazándose con violencia",
            "frontal": True,
            "interruptible": True,
            "precision": 64,
            "damage": 34,
        },
    },
    "dorsalodo": {
        "name": "Dorsalodo",
        "family": "dorsalodo",
        "reference_level": 10,
        "hp": 135,
        "precision": 62,
        "damage": 24,
        "armor_reduction": 0.15,
        "flee_agilidad": 12,
        "flee_percepcion": 16,
        "behavior_text": ("Dorsalodo emerge del agua turbia alineando su cuerpo dorsal "
                           "acorazado para arremeter."),
        "prepared_action": {
            "id": "dorsalodo_arremetida",
            "name": "Arremetida de fango",
            "signal": "onda amplia en el agua y juncos abiertos súbitamente",
            "frontal": True,
            "interruptible": True,
            "precision": 72,
            "damage": 32,
        },
    },
    "rasgacorteza": {
        "name": "Rasgacorteza",
        "family": "rasgacorteza",
        "reference_level": 10,
        "hp": 145,
        "precision": 60,
        "damage": 25,
        "armor_reduction": 0.25,
        "flee_agilidad": 10,
        "flee_percepcion": 17,
        "behavior_text": ("Rasgacorteza se desgaja del follaje como una pared viva "
                           "y bloquea el paso en silencio."),
        "prepared_action": {
            "id": "rasgacorteza_arremetida",
            "name": "Arremetida de tronco",
            "signal": "corteza desprendiéndose y masa viva interponiéndose en el paso",
            "frontal": True,
            "interruptible": True,
            "precision": 68,
            "damage": 35,
        },
    },
    # Segunda oleada de fauna menor (#412) — contratos mecánicos literales de #340, #342–#345.
    # Sin assets aprobados: estas criaturas dejan el marco de combate neutral.
    "remojunco": {
        "name": "Remojunco",
        "family": "remojunco",
        "reference_level": 1,
        "hp": 24,
        "precision": 42,
        "damage": 4,
        "flee_agilidad": 16,
        "flee_percepcion": 12,
        "behavior_text": ("Remojunco busca raíces y semillas entre juncos; al menor peligro "
                           "se sumerge o corre hacia la vegetación de ribera."),
    },
    "garralaja": {
        "name": "Garralaja",
        "family": "garralaja",
        "reference_level": 1,
        "hp": 22,
        "precision": 46,
        "damage": 4,
        "flee_agilidad": 17,
        "flee_percepcion": 14,
        "behavior_text": ("Garralaja permanece adherida a la roca seca y se repliega lateralmente "
                           "hacia fisuras estrechas si detecta pasos cercanos."),
    },
    "cavapolvo": {
        "name": "Cavapolvo",
        "family": "cavapolvo",
        "reference_level": 2,
        "hp": 35,
        "precision": 48,
        "damage": 7,
        "armor_reduction": 0.05,
        "flee_agilidad": 9,
        "flee_percepcion": 10,
        "behavior_text": ("Cavapolvo se planta frente a su madriguera de grava y tierra dura; "
                           "si te acercas demasiado, defiende la entrada antes de escarbar para huir."),
    },
    "velacauce": {
        "name": "Velacauce",
        "family": "velacauce",
        "reference_level": 2,
        "hp": 27,
        "precision": 53,
        "damage": 6,
        "flee_agilidad": 15,
        "flee_percepcion": 14,
        "behavior_text": ("Velacauce aguarda inmóvil entre raíces sumergidas; al menor disturbio "
                           "en el agua se desliza hacia el fondo del canal."),
    },
    "silbarisco": {
        "name": "Silbarisco",
        "family": "silbarisco",
        "reference_level": 1,
        "hp": 26,
        "precision": 43,
        "damage": 4,
        "flee_agilidad": 17,
        "flee_percepcion": 13,
        "behavior_text": ("Silbarisco vigila desde una terraza baja entre raíces y roca; "
                           "emite un silbido agudo de alarma y busca cobertura entre la maleza."),
    },
    # Issue #336/#339: fauna mayor C4 de Edran (GAMEPLAY §38.7).
    "cargallanura": {
        "name": "Cargallanura", "family": "cargallanura", "reference_level": 12,
        "hp": 210, "precision": 58, "damage": 26, "armor_reduction": 0.25,
        "flee_agilidad": 10, "flee_percepcion": 12,
        "behavior_text": ("Cargallanura resopla con lentitud y te evalúa con indiferencia territorial "
                          "mientras mantengas la distancia."),
    },
}


# Ilustración de cada criatura para el marco de arte durante el combate
# (petición de Javier, 2026-09-25). Solo criaturas con imagen aprobada y
# publicada en assets/vintage-telnet/creatures/; una criatura sin fila deja
# el marco vacío y quieto en combate, nunca muestra una imagen ajena.
# Formato de cada fila: {"src": "/assets/creatures/<id>.webp", "alt": ...,
# "width": ..., "height": ...}.
CREATURE_ART = {
    # Issue #151, aprobados por Dirección de Arte y publicados en las PR #161
    # (SHA-256 036ab079...) y #170 (SHA-256 abd4187d...).
    "mordelinde": {"src": "/assets/creatures/mordelinde.webp",
                   "alt": "Mordelinde acorralado en una parcela removida",
                   "width": 1536, "height": 1024},
    "espinajo_rastrojo": {"src": "/assets/creatures/espinajo_rastrojo.webp",
                          "alt": "Espinajo de rastrojo con la cresta de púas erizada",
                          "width": 1536, "height": 1024},
    # Issue #180, aprobado por Dirección de Arte y publicado en PR #188.
    "cornalomo": {"src": "/assets/creatures/cornalomo.webp",
                  "alt": "Cornalomo avanzando por los Llanos de Edran con la placa frontal y las estructuras dorsales visibles",
                  "width": 1536, "height": 1024},
    # Publicado en PR #258 (Issue #205)
    "rasgacorteza": {"src": "/assets/creatures/rasgacorteza.webp",
                     "alt": "Rasgacorteza camuflado en el follaje del bosque de Nhal",
                     "width": 1536, "height": 1024},
    # Issue #548 (APPROVED-BINDINGS-01): arte aprobado ya publicado que
    # seguia sin conectarse al runtime. Uñapiedra rescatada en PR #227
    # (aprobacion original PR #178, Issue #167); Cascapedernal aprobado en
    # Issue #231 y publicado en PR #262.
    "unapiedra": {"src": "/assets/creatures/unapiedra.webp",
                  "alt": "Uñapiedra aplastado contra la roca en un saliente de Hoshai",
                  "width": 1536, "height": 1024},
    "cascapedernal": {"src": "/assets/creatures/cascapedernal.webp",
                      "alt": "Cascapedernal encogido junto a la piedra cálida de Korven",
                      "width": 1536, "height": 1024},
    "hilaria_niebla": {"src": "/assets/creatures/hilaria_niebla.webp",
                       "alt": "Hilaria de niebla entre las raíces del bosque de Nhal",
                       "width": 1536, "height": 1024},
    # Note: saltacresta approved without artwork (Issue #408) — uses neutral frame in combat
    # C3 Threats and Regional Wave Fauna (Issue #346)
    "rasgacumbres": {"src": "/assets/creatures/rasgacumbres.webp",
                     "alt": "Rasgacumbres descendiendo en picada desde las alturas de Hoshai",
                     "width": 1536, "height": 1024},
    "quebrarrocas": {"src": "/assets/creatures/quebrarrocas.webp",
                     "alt": "Quebrarrocas avanzando como un ariete acorazado desde Korven",
                     "width": 1536, "height": 1024},
    "dorsalodo": {"src": "/assets/creatures/dorsalodo.webp",
                  "alt": "Dorsalodo emergiendo del agua de Lethra con su dorsal visible",
                  "width": 1536, "height": 1024},
    # Note: Second wave fauna (remojunco, garralaja, cavapolvo, velacauce, silbarisco)
    # and regional fauna without approved artwork (colagrieta, pinzajunco, saltalodo,
    # rondamusgo, cargallanura, saltacresta) are intentionally excluded from CREATURE_ART
    # per approved contracts — they use neutral frame in combat.
}


def get_creature(creature_id):
    return CREATURES.get(creature_id)
