"""Document-sourced rules: GAMEPLAY §§20,22,24,27,36,42,43; WEAPON_CATALOG.
All values transcribed from documents, not imported from the former engine.
"""
import json
import math
from pathlib import Path

ATTRIBUTES = ('fuerza','resistencia','agilidad','percepcion','intelecto','voluntad','destreza','presencia')
CLASS_ATTRIBUTES = {
 'juramentado': {'fuerza':11,'resistencia':10,'agilidad':9,'percepcion':9,'intelecto':9,'voluntad':10,'destreza':10,'presencia':12},
 'arcano': {'fuerza':7,'resistencia':10,'agilidad':8,'percepcion':12,'intelecto':13,'voluntad':10,'destreza':10,'presencia':10},
 'sombra': {'fuerza':8,'resistencia':10,'agilidad':13,'percepcion':12,'intelecto':7,'voluntad':10,'destreza':11,'presencia':9},
 'artifice': {'fuerza':8,'resistencia':10,'agilidad':9,'percepcion':12,'intelecto':11,'voluntad':10,'destreza':13,'presencia':7},
}
ATTRIBUTE_EFFECTS = {
 'fuerza': 'Aumenta el daño físico en combate y permite forzar pasos bloqueados o mover obstáculos pesados.',
 'resistencia': 'Aumenta la vitalidad máxima, acelera la recuperación al descansar y reduce el gasto de fatiga.',
 'agilidad': 'Mejora la evasión y la huida en combate, y permite trepar, saltar obstáculos y usar atajos.',
 'percepcion': 'Aumenta la probabilidad de hallar objetos al buscar y revela pistas y marcas ocultas al examinar.',
 'intelecto': 'Potencia los impulsos y barreras arcanas y permite descifrar inscripciones, notas y textos antiguos.',
 'voluntad': 'Aumenta la barrera mágica y la vitalidad máxima, templa el ánimo contra la fatiga y ayuda a calmar criaturas.',
 'destreza': 'Mejora la precisión con armas y el bloqueo con escudo, además de facilitar tareas delicadas y cerrojos.',
 'presencia': 'Inspira respeto en la gente y abre temas y respuestas adicionales en las conversaciones con habitantes.',
}
CLASS_ACTIONS = {
 'juramentado': [
  {'id':'guardia_comprometida','name':'Guardia Comprometida','label':'Guardia Comprometida','description':'Reduce el 50% del daño del próximo golpe directo frontal y anula empujes.','cooldown':2,'cost':4,'signature':True},
  {'id':'paso_ruptura','name':'Paso de Ruptura','label':'Paso de Ruptura','description':'Golpe de hombro y pomo que interrumpe la preparación rival y desestabiliza su guardia.','cooldown':3,'cost':6},
 ],
 'arcano': [
  {'id':'impulso_arcano','name':'Impulso Arcano','label':'Impulso Arcano','description':'Empuje de fuerza pura que cancela preparaciones y aleja al rival.','cooldown':4,'cost':4,'signature':True},
  {'id':'velo_contencion','name':'Velo de Contención','label':'Velo de Contención','description':'Barrera traslúcida que absorbe el próximo golpe que recibas.','cooldown':3,'cost':5},
  {'id':'destello_frio','name':'Destello Frío','label':'Destello Frío','description':'Resplandor repentino que desorienta al rival reduciendo su precisión o facilita la huida.','cooldown':2,'cost':4},
 ],
 'sombra': [
  {'id':'borrar_foco','name':'Borrar el Foco','label':'Borrar el Foco','description':'Rompe la línea visual reduciendo la precisión del rival; si falla, abre tu siguiente ataque.','cooldown':4,'cost':5,'signature':True},
  {'id':'golpe_apertura','name':'Golpe a la Apertura','label':'Golpe a la Apertura','description':'Puñalada veloz en ángulo descubierto; demoledora si aprovechas una apertura previa.','cooldown':2,'cost':5},
  {'id':'distraccion','name':'Lanzar Distracción','label':'Lanzar Distracción','description':'Ruido con piedras para girar al rival, cancelando cargas y mermando su ataque.','cooldown':2,'cost':4},
 ],
 'artifice': [
  {'id':'tiro_interrupcion','name':'Tiro de Interrupción','label':'Tiro de Interrupción','description':'Disparo certero a las articulaciones que corta la carga o reduce su precisión.','cooldown':2,'cost':5,'signature':True},
  {'id':'traba_campo','name':'Traba de Campo','label':'Traba de Campo','description':'Tiende estacas y cuerdas que enredan y ralentizan al rival.','cooldown':3,'cost':5},
  {'id':'balsamo_campo','name':'Bálsamo de Campo','label':'Bálsamo de Campo','description':'Aplica un ungüento herbal rápido que restaura 15 de vida y alivia la fatiga.','cooldown':4,'cost':2},
 ],
}
CLASSES = {
 'juramentado': {'name':'Juramentado','signature':'Guardia Comprometida','signature_id':'guardia_comprometida','effect':'Reduce el daño del próximo golpe que te alcance.','cooldown':2,'weapon':'espada_juramento','actions':CLASS_ACTIONS['juramentado']},
 'arcano': {'name':'Arcano','signature':'Impulso Arcano','signature_id':'impulso_arcano','effect':'Rompe la preparación y dificulta que te alcance.','cooldown':4,'weapon':'varita_aprendiz','actions':CLASS_ACTIONS['arcano']},
 'sombra': {'name':'Sombra','signature':'Borrar el Foco','signature_id':'borrar_foco','effect':'Reduce su precisión; si falla, abre tu siguiente ataque.','cooldown':4,'weapon':'punal_camino','actions':CLASS_ACTIONS['sombra']},
 'artifice': {'name':'Artífice','signature':'Tiro de Interrupción','signature_id':'tiro_interrupcion','effect':'Un disparo acertado corta la carga o reduce su precisión.','cooldown':2,'weapon':'arco_ruta','actions':CLASS_ACTIONS['artifice']},
}
WEAPONS = {
 'espada_juramento': {'id':'espada_juramento','name':'Espada de juramento','kind':'weapon','damage':10,'block':True,'activated':True},
 'varita_aprendiz': {'id':'varita_aprendiz','name':'Varita de aprendiz','kind':'weapon','damage':7,'focus':True,'activated':True},
 'punal_camino': {'id':'punal_camino','name':'Puñal de camino','kind':'weapon','damage':8,'activated':True},
 'arco_ruta': {'id':'arco_ruta','name':'Arco de ruta','kind':'weapon','damage':9,'ranged':True,'activated':True},
 'espada_bastion': {'id':'espada_bastion','name':'Espada del Bastión','kind':'weapon','damage':14,'block':True,'activated':True},
 'vara_caudales': {'id':'vara_caudales','name':'Vara de los Caudales','kind':'weapon','damage':11,'focus':True,'activated':True},
 'daga_aguas_profundas': {'id':'daga_aguas_profundas','name':'Daga de las Aguas Profundas','kind':'weapon','damage':12,'activated':True},
 'arco_esclusa': {'id':'arco_esclusa','name':'Arco de la Esclusa','kind':'weapon','damage':13,'ranged':True,'activated':True},
}
PROFILES = {
 'mordelinde': {'hp':28,'accuracy':45,'damage':5,'reduction':0,'evasion':15,'level':1,'category':'comparable','family':'mordelinde'},
 'espinajo_rastrojo': {'hp':40,'accuracy':50,'damage':8,'reduction':.10,'level':2,'category':'comparable','prepared':True,'prepared_action':{'id':'embestida_territorial','name':'Embestida territorial','accuracy':60,'interruptible':True,'frontal':True},'family':'espinajo'},
 'cornalomo': {'hp':120,'accuracy':65,'damage':20,'reduction':.20,'level':8,'category':'abrumador','family':'cornalomo'},
}

# Regional fauna reuse the established threat tiers; no new numeric combat scale.
for creature_id in ('dorsalodo','rasgacumbres','quebrarrocas','rasgacorteza'):
 PROFILES[creature_id]=dict(PROFILES['cornalomo'],family=creature_id)
# GAMEPLAY §§36.3,40.7: regional intentions use the same intervention contract.
# The physical tactics are authored extensions; all established numeric tiers stay intact.
REGIONAL_INTENTIONS = {
 'rasgacumbres': {'id':'zarpazo_lateral','name':'Zarpazo lateral','interruptible':True,'frontal':False,'tell':'El Rasgacumbres desplaza el peso hacia una pata delantera y prepara un zarpazo lateral. Puedes interrumpirlo, esquivar o huir; una guardia frontal no cubre ese ángulo.'},
 'quebrarrocas': {'id':'empuje_anclado','name':'Empuje anclado','interruptible':False,'frontal':True,'tell':'El Quebrarrocas afirma el cuerpo contra los bloques y prepara un empuje frontal. El impulso ya está anclado: puedes cubrirte, esquivar o huir, pero no interrumpirlo.'},
 'dorsalodo': {'id':'barrido_pesado','name':'Barrido pesado','interruptible':False,'frontal':False,'tell':'El Dorsalodo extiende el cuerpo entre los juncos para barrer de lado. Su peso ya domina el paso: la guardia frontal y la interrupción no sirven; todavía puedes esquivar o huir.'},
 'rasgacorteza': {'id':'golpe_desde_tronco','name':'Golpe desde el tronco','interruptible':True,'frontal':True,'tell':'El Rasgacorteza separa las patas del tronco y reúne fuerza para un golpe frontal. Puedes interrumpir esa preparación, cubrirte, esquivar o huir.'},
}
for creature_id,intention in REGIONAL_INTENTIONS.items():
 PROFILES[creature_id].update(prepared=True,prepared_action=dict(intention,accuracy=PROFILES[creature_id]['accuracy']))

PROFILES['cascapedernal']=dict(PROFILES['mordelinde'],family='cascapedernal')
PROFILES['forajido_camino']=dict(PROFILES['mordelinde'],family='forajidos')

# Observable tactics enrich existing tiers without inventing another combat scale.
THREAT_OBSERVATIONS = {
 'mordelinde': 'Busca un hueco por donde escapar. Mantener libre su salida evita arrinconarlo.',
 'espinajo_rastrojo': 'Afirma las patas antes de una embestida frontal. Puedes interrumpir esa preparación o protegerte del golpe.',
 'cascapedernal': 'Sus placas forman una cubierta baja junto a la roca. No prepara una carga: conserva distancia si prefieres evitar el contacto.',
 'cornalomo': 'Afirma el peso dentro de su territorio. Apartarte antes del contacto conserva la distancia segura.',
 'dorsalodo': 'El movimiento del agua revela cuánto espacio ocupa entre los juncos. Dejar libre ese paso permite retroceder.',
 'rasgacorteza': 'Las ramas dobladas muestran su alcance junto al tronco. Puedes salir de ese espacio antes del contacto.',
 'rasgacumbres': 'Ocupa el paso alto. Conviene conservar espacio para retroceder antes del contacto.',
 'quebrarrocas': 'Su peso domina el terreno de piedra. Mantener distancia evita entrar en su alcance.',
 'forajido_camino': 'Bloquea el camino y vigila tu acercamiento. Comprueba los desvíos antes de decidir un enfrentamiento.',
}
PEACEFUL_WITHDRAWALS = {
 'cornalomo': 'Retrocedes fuera del herbazal que ocupa. El Cornalomo deja de orientarse hacia ti y conserva su territorio.',
 'dorsalodo': 'Dejas libre el paso entre los juncos. El Dorsalodo vuelve hacia el agua mientras recuperas distancia.',
 'rasgacorteza': 'Te apartas del tronco y de las ramas dobladas. El Rasgacorteza permanece junto a la corteza.',
 'rasgacumbres': 'Retrocedes por el paso alto sin acercarte más. El Rasgacumbres permanece en su territorio.',
 'quebrarrocas': 'Te apartas del terreno que ocupa. El Quebrarrocas conserva su espacio entre las piedras.',
}

def scaled(profile,level):
 """Same creature, stronger with level: +20% hp, +12% damage, +2 accuracy per level above its base."""
 if not level or profile.get('category') not in ('favorable','comparable','peligroso'):return dict(profile)
 steps=max(0,int(level)-profile['level'])
 return dict(profile,level=max(profile['level'],int(level)),hp=rounded(profile['hp']*(1+.2*steps)),damage=rounded(profile['damage']*(1+.12*steps)),accuracy=min(85,profile['accuracy']+2*steps))

def threat_observation(creature_id):
 text=THREAT_OBSERVATIONS.get(creature_id,'Conserva una salida antes de entrar en su alcance.')
 intention=REGIONAL_INTENTIONS.get(creature_id) or MINOR_INTENTIONS.get(creature_id)
 return text+(' '+intention['tell'] if intention else '')

def peaceful_withdrawal(creature_id):
 return PEACEFUL_WITHDRAWALS.get(creature_id,'Te apartas antes del contacto. La criatura no te persigue.')

def clamp(value, low, high): return max(low,min(high,value))
def rounded(value): return math.floor(value+.5)
def cg(state): return 8*(state['level']-1)/99
# Body slots for armour pieces and accessories; legacy 'armor' stays valid as the torso piece of older characters.
ARMOR_SLOTS=('cabeza','torso','brazos','piernas','pies')
ACCESSORY_SLOTS=('anillo','amuleto')
SLOT_NAMES={'weapon':'arma','block':'escudo','armor':'armadura','cabeza':'cabeza','torso':'torso','brazos':'brazos','piernas':'piernas','pies':'pies','anillo':'anillo','amuleto':'amuleto'}
ARMOR_CAP=.5
FUSION_RATES={1:.25,2:.50,3:1.00}
FUSION_REQUIREMENTS={
 1:{'material':'espina_espinajo','quantity':5,'rate':.25},
 2:{'material':'placa_cascapedernal','quantity':5,'rate':.50},
 3:{'material':'escama_dragon','quantity':3,'rate':1.00},
}
MATERIAL_SOURCES={
 'espina_espinajo':'en los espinajos de rastrojo de los caminos de Edran',
 'fibra_espinajo':'en los espinajos de rastrojo de los caminos de Edran',
 'colmillo_mordelinde':'en los mordelindes de los llanos de Edran',
 'piel_mordelinde':'en los mordelindes de los llanos de Edran',
 'placa_cascapedernal':'en los cascapedernales de las tierras de Korven',
 'garra_rasgacumbres':'en los rasgacumbres de los pasos altos de Korven',
 'placa_quebrarrocas':'en los quebrarrocas de los pedrales de Korven',
 'cristal_veta':'en las vetas de piedra de Korven',
 'escama_dragon':'en el Dragón de las Aguas Antiguas en el Bastión',
 'colmillo_dragon':'en el Dragón de las Aguas Antiguas en el Bastión',
 'hierro_viejo':'en los talleres y ruinas del camino',
 'cuero_curtido':'en curtidores y puestos de artesanos',
 'piedra_veteada':'buscando entre las rocas del camino',
}

def gear(state):
 """Equipped items, once each, from any slot."""
 equipped={v for v in (state.get('equipment') or {}).values() if v}
 return [i for i in state.get('inventory',[]) if i.get('id') in equipped]

def gear_bonus(state,key):
 return sum(i.get('bonus',{}).get(key,0) for i in gear(state))

def armor_total(state):
 return min(ARMOR_CAP,sum((i.get('armor_reduction',0)+i.get('fusion',0)*.02) for i in gear(state) if i.get('kind') in ('armor','block')))

def use_consumable(state,item):
 """Apply a potion or provision; returns the narrated result."""
 effect=item.get('effect')
 if effect=='basic_provision':heal,fatigue,wound_steps=.18,20,0
 elif effect=='potion':heal,fatigue,wound_steps=item.get('heal',0),item.get('fatigue',0),item.get('wound_steps',0)
 else:return None
 before=state['hp'];state['hp']=min(hp_max(state),state['hp']+heal*hp_max(state));state['fatigue']=max(0,state['fatigue']-fatigue)
 order=[None,'leve','moderada','grave']
 if wound_steps and state.get('wound') in order:state['wound']=order[max(0,order.index(state['wound'])-wound_steps)]
 parts=[]
 if state['hp']>before:parts.append(f"recuperas {rounded(state['hp']-before)} de vida")
 if fatigue:parts.append('se te pasa el cansancio')
 if wound_steps:parts.append('la herida deja de doler tanto')
 return f"Usas {item['name']}: "+(', '.join(parts) if parts else 'no notas cambios')+'.'

def hp_max(state):
 a=state.get('attributes') or {}; return 100+1.25*(state.get('level',1)-1)+2.5*(a.get('resistencia',10)-10)+.5*(a.get('voluntad',10)-10)+gear_bonus(state,'vida')
# One lifetime reward per room, secret, journal text, ending flag, quest or behavior.
EXPLORATION_XP = {'room':1, 'secret':10, 'clue':3, 'closure':25, 'quest':15, 'behavior':3}
def xp_next(level): return rounded(100+18*(level-1)+.25*(level-1)**2)
def fatigue_cost(state, base):
 multiplier = (1.10 if state.get('wound')=='leve' else 1.20 if state.get('wound')=='moderada' else 1.35 if state.get('wound')=='grave' else 1)
 a = state.get('attributes') or {}
 res_mod = .007*(a.get('resistencia',10)-10)
 vol_mod = .003*(a.get('voluntad',10)-10)
 return base*max(.50,1-res_mod-vol_mod)*multiplier

def penalties(state):
 f=state['fatigue']; accuracy=10 if f>=90 else 5 if f>=70 else 0
 accuracy+=10 if state['wound']=='grave' else 5 if state['wound']=='moderada' else 0
 power=(.8 if f>=90 else .9 if f>=70 else 1)*(.9 if state['wound']=='grave' else 1)
 return accuracy,power

MAX_BONDED_NUMENES = 6

NUMENES_MODELS = {
 'a': {
  'id': 'a',
  'species_name': 'Perro de cuatro orejas',
  'base': 'perro',
  'room': 'edran_camino_carros',
  'anomaly': 'Dos orejas normales y dos más pequeñas detrás con movimiento independiente.',
  'power_id': 'oido_ruta',
  'power_name': 'Oído de Ruta',
  'power_desc': 'Advierte el movimiento del rival antes del golpe, aumentando tu evasión.',
  'cooldown': 3,
  'step1': {'id': 'esperar_carro', 'label': 'Esperar a que pase el carro sin invadir su espacio', 'text': 'Baja una de las orejas pequeñas. Deja de seguir tus manos y tolera tu presencia.'},
  'step2': {'id': 'caminar_borde', 'label': 'Caminar despacio por el borde sin bloquear su vista', 'text': 'Camina a unos pasos de ti; cada tanto se detiene para confirmar que puede volver a la piedra. La confianza se afianza.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Intentar agarrarlo de golpe', 'text': 'Las cuatro orejas se pliegan; el perro retrocede detrás de la piedra y guarda distancia sin atacarte.'},
  'cue': 'Un perro de cuatro orejas descansa junto a una piedra, atento a los ruidos del camino.'
 },
 'b': {
  'id': 'b',
  'species_name': 'Gato de ojos profundos',
  'base': 'gato',
  'room': 'lethra_orilla_silente',
  'anomaly': 'Ojos azules cuya profundidad visual parece continuar sin fondo.',
  'power_id': 'mirada_profunda',
  'power_name': 'Mirada Profunda',
  'power_desc': 'Fija la mirada en el rival, señalando un ángulo descubierto para tu ataque (+precisión).',
  'cooldown': 3,
  'step1': {'id': 'sentarse_distancia', 'label': 'Sentarte sin ocupar la tabla del canal', 'text': 'El gato deja de golpear el suelo con la cola y vuelve la mirada a la corriente, tolerando tu cercanía.'},
  'step2': {'id': 'mirar_canal', 'label': 'Mirar la corriente y dejar que elija la distancia', 'text': 'Estira las patas delanteras y se acomoda cerca de tu sombra, compartiendo el silencio.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Alzarlo sin invitación', 'text': 'Su cuerpo se vuelve rígido. Salta al borde más lejano del canal, evitando tu mirada.'},
  'cue': 'Un gato de ojos azules profundos observa la corriente desde una tabla seca.'
 },
 'c': {
  'id': 'c',
  'species_name': 'Conejo de cuatro orejas',
  'base': 'conejo',
  'room': 'hoshai_terraza_cargas',
  'anomaly': 'Dos pares de orejas finas e independientes que captan vientos y pisadas.',
  'power_id': 'apoyo_terreno',
  'power_name': 'Apoyo de Terreno',
  'power_desc': 'Señala un apoyo firme en el suelo rocoso, ahorrándote fatiga (-fatiga).',
  'cooldown': 3,
  'step1': {'id': 'retroceder_paso', 'label': 'Retroceder del paso entre rocas', 'text': 'Las patas dejan de presionar la piedra. El conejo vuelve a masticar briznas y te observa de lado.'},
  'step2': {'id': 'quedarse_quieto', 'label': 'Quedarte inmóvil mientras cambia el viento', 'text': 'Se adelanta una longitud de cuerpo. Sus cuatro orejas quedan abiertas pero ya no busca refugio.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Cerrar la salida para acorralarlo', 'text': 'Las orejas desaparecen entre las piedras en un parpadeo, buscando una grieta segura.'},
  'cue': 'Un conejo con dos pares de orejas finas mastica hierba entre las cargas.'
 },
 'd': {
  'id': 'd',
  'species_name': 'Ratón de bigotes luminosos',
  'base': 'raton',
  'room': 'korven_almacen_grano',
  'anomaly': 'Bigotes delgados que emiten una tenue hebra de luz fría en la penumbra.',
  'power_id': 'hilo_penumbra',
  'power_name': 'Hilo de Penumbra',
  'power_desc': 'Emite un destello sutil con sus bigotes que desorienta al rival (-precisión rival).',
  'cooldown': 3,
  'step1': {'id': 'despejar_grieta', 'label': 'Mover el pie que cubre la grieta', 'text': 'El ratón asoma el hocico, comprueba la salida y vuelve por el grano; la luz de sus bigotes tiembla junto a la tabla.'},
  'step2': {'id': 'esperar_recorrido', 'label': 'Esperar en silencio a que traslade el grano', 'text': 'Deja el grano junto a la pared y avanza hacia tu bota con curiosidad tranquila antes de apartarse.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Intentar atraparlo en un cuenco', 'text': 'La rendija queda vacía al instante. La tenue hebra de luz se oculta tras el zócalo.'},
  'cue': 'Un ratón menudo cuyos bigotes emiten una tenue luz fría cruza junto a los sacos de grano.'
 },
 'e': {
  'id': 'e',
  'species_name': 'Ave de sombra doble',
  'base': 'ave',
  'room': 'veyra_huerta_baja',
  'anomaly': 'Ave pequeña que proyecta dos sombras sobre el suelo bajo una única fuente de luz.',
  'power_id': 'doble_sombra',
  'power_name': 'Doble Sombra',
  'power_desc': 'Proyecta dos sombras que confunden el ataque rival, reduciendo el daño recibido.',
  'cooldown': 3,
  'step1': {'id': 'guardar_distancia', 'label': 'Guardar distancia y observar la zona soleada', 'text': 'El ave picotea una semilla sin dejar de mirarte. No necesita elevarse para alejarse.'},
  'step2': {'id': 'despejar_vuelo', 'label': 'Apartarte de donde podría abrir las alas', 'text': 'Se posa en la piedra cerca de ti, con un movimiento elegido en vez de forzado.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Lanzar un objeto para obligarla a volar', 'text': 'Bate las alas y remonta hacia una cornisa lejana, perdiendo la cercanía ganada.'},
  'cue': 'Un ave pequeña brinca en la huerta proyectando dos sombras nítidas sobre la piedra.'
 },
 'f': {
  'id': 'f',
  'species_name': 'Cachorro de aire ondulante',
  'base': 'cachorro',
  'room': 'edran_reparo',
  'anomaly': 'El aire alrededor de su lomo vibra suavemente con una refracción tibia.',
  'power_id': 'calma_cercana',
  'power_name': 'Calma Cercana',
  'power_desc': 'Transmite una tibia calma que templa el ánimo y alivia la fatiga (-fatiga).',
  'cooldown': 3,
  'step1': {'id': 'esperar_despierte', 'label': 'Sentarte a distancia y esperar a que despierte', 'text': 'Al rato se estira solo, bosteza y se acerca a oler el suelo a un paso de ti.'},
  'step2': {'id': 'dejar_oler', 'label': 'Dejar la mano quieta y permitir que se acerque', 'text': 'Se sienta cerca, con la cola golpeando suavemente la tabla y el aire ondulando con suavidad.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Alzarlo bruscamente mientras descansa', 'text': 'Se encoge, esconde el hocico y busca el rincón más apartado del refugio.'},
  'cue': 'Un cachorro mestizo duerme en el refugio; el contorno de su pelo hace ondular levemente la pared de fondo.'
 },
 'g': {
  'id': 'g',
  'species_name': 'Gato de dos colas',
  'base': 'gato',
  'room': 'veyra_patio_porte',
  'anomaly': 'Dos colas independientes que se mueven en ritmos opuestos.',
  'power_id': 'paso_jugueton',
  'power_name': 'Paso Juguetón',
  'power_desc': 'Agita sus dos colas con ritmos opuestos distrayendo al rival (-precisión rival).',
  'cooldown': 3,
  'step1': {'id': 'observar_juego', 'label': 'Seguir el juego con la mirada sin extender las manos', 'text': 'Una cola queda inmóvil mientras la otra sigue moviéndose. El gato no abandona la piedra.'},
  'step2': {'id': 'esperar_baje', 'label': 'Aceptar el ritmo de espera sin perseguirlo', 'text': 'Baja al suelo, vuelve a subir y se queda más cerca, observando qué harás tú.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Intentar sujetarlo por una de sus colas', 'text': 'Sube a lo alto de un fardo fuera de tu alcance y desvía la mirada con disgusto.'},
  'cue': 'Un gato ágil descansa sobre una piedra del patio; dos colas salen de su espalda moviéndose a ritmos distintos.'
 },
 'h': {
  'id': 'h',
  'species_name': 'Conejo silencioso',
  'base': 'conejo',
  'room': 'nhal_suelo_hojas',
  'anomaly': 'Sus saltos sobre hojas secas, ramas o grava no emiten el menor chasquido.',
  'power_id': 'pausa_silenciosa',
  'power_name': 'Pausa Silenciosa',
  'power_desc': 'Enseña a moverse en el silencio del bosque, reforzando la postura defensiva (+defensa).',
  'cooldown': 3,
  'step1': {'id': 'detener_pasos', 'label': 'Detener tus pasos para no tapar el silencio', 'text': 'En el silencio que dejas, una hoja se levanta sin sonido bajo su pata. El conejo nota que te has parado.'},
  'step2': {'id': 'despejar_tronco', 'label': 'Retroceder un paso dejando libre el tronco', 'text': 'El conejo cruza el sendero con tres saltos mudos y se queda cerca, sin huir a la espesura.'},
  'unfavorable': {'id': 'forzar_acercamiento', 'label': 'Lanzar una piedra para ver si hace ruido al huir', 'text': 'El animal desaparece entre los helechos sin emitir un sonido. Su confianza se ha quebrado por hoy.'},
  'cue': 'Un conejo salta sobre una alfombra de hojas secas sin producir el menor ruido.'
 }
}

def _load_numenes_reacciones():
 path = Path(__file__).resolve().parents[1] / 'content' / 'numenes.json'
 if not path.is_file():
  return
 data = json.loads(path.read_text(encoding='utf-8')).get('numenes', {})
 for m_id, entry in data.items():
  if m_id in NUMENES_MODELS and 'reacciones' in entry:
   NUMENES_MODELS[m_id]['reacciones'] = entry['reacciones']

_load_numenes_reacciones()

TRUST_STAGES = {
 1: 'vínculo_naciente',
 2: 'confianza_estable',
 3: 'armonía_profunda'
}

def get_active_numen(state):
 numenes = state.get('numenes') or {}
 active_id = numenes.get('active')
 if not active_id: return None
 return next((n for n in numenes.get('bonded', []) if n.get('id') == active_id), None)

def numen_mood(numen, now=None):
 if not numen:
  return 'contento'
 care = numen.get('care') or {}
 last_fed = care.get('last_fed')
 last_rested = care.get('last_rested', last_fed)
 if now is None:
  if numen.get('mood') in ('contento', 'con hambre', 'decaído') and care.get('_mood_fed') == last_fed:
   return numen['mood']
  return 'contento'
 if last_fed is None:
  return 'contento'
 unfed_h = max(0.0, (now - last_fed) / 3600.0)
 unrested_h = max(0.0, (now - (last_rested if last_rested is not None else last_fed)) / 3600.0)
 if unfed_h > 24 or (unfed_h > 16 and unrested_h > 24):
  return 'decaído'
 if unfed_h > 8:
  return 'con hambre'
 return 'contento'

def sync_numenes(state, now):
 numenes = state.get('numenes') or {}
 for n in numenes.get('bonded', []):
  care = n.setdefault('care', {})
  mood = numen_mood(n, now)
  n['mood'] = mood
  care['_mood_fed'] = care.get('last_fed')
  care['well_cared'] = (mood == 'contento')
  care['fed_today'] = (max(0.0, now - care.get('last_fed', now)) <= 86400)
  mod = NUMENES_MODELS.get(n.get('model'), {})
  n.setdefault('power_desc', mod.get('power_desc', ''))
  if not n.get('last_reaction'):
   n['last_reaction'] = f"{n.get('name', 'Tu compañero')} te acompaña con atención."
 return numenes

def pick_numen_reaction(numen, situation='llegar', now=None, rng=None):
 if not numen:
  return ''
 m_id = numen.get('model', 'a')
 name = numen.get('name', 'Tu compañero')
 mod = NUMENES_MODELS.get(m_id, {})
 reacciones = mod.get('reacciones') or {}
 mood = 'contento' if situation == 'comer' else numen_mood(numen, now)
 numen['mood'] = mood
 suffix = ''
 if situation == 'comer':
  pool = reacciones.get('comer') or ["{name} come su Bocado de Númen con apetito."]
 elif situation == 'apoyo_combate':
  if mood in ('decaído', 'con hambre'):
   pool = reacciones.get('apoyo_combate_decaido') or reacciones.get('apoyo_combate') or ["Aunque está cansado, {name} te apoya en combate."]
  else:
   pool = reacciones.get('apoyo_combate') or ["{name} te apoya con atención en combate."]
 elif situation in ('llegar', 'observar'):
  if mood == 'decaído':
   pool = reacciones.get('decaido') or ["{name} camina despacito a tu lado; está decaído."]
  elif mood == 'con hambre':
   pool = reacciones.get('hambre') or ["{name} mira tu mochila con hambre."]
  else:
   pool = reacciones.get('llegar') or ["{name} explora el lugar a tu lado."]
 else:
  pool = reacciones.get(situation) or reacciones.get('llegar') or ["{name} está a tu lado."]
  if mood == 'decaído':
   suffix = ' Se nota decaído y sin fuerzas, pero sigue contigo.'
  elif mood == 'con hambre':
   suffix = ' Notas que tiene hambre.'
 formatted = [tpl.format(name=name) + suffix for tpl in pool]
 prev = numen.get('last_reaction')
 candidates = [p for p in formatted if p != prev] or formatted
 if len(candidates) == 1:
  chosen = candidates[0]
 elif rng is not None and hasattr(rng, 'random'):
  idx = min(int(rng.random() * len(candidates)), len(candidates) - 1)
  if candidates[idx] == prev and len(candidates) > 1:
   idx = (idx + 1) % len(candidates)
  chosen = candidates[idx]
 else:
  step = int(numen.get('_reaction_seq', 0))
  chosen = candidates[step % len(candidates)]
 numen['_reaction_seq'] = int(numen.get('_reaction_seq', 0)) + 1
 numen['last_reaction'] = chosen
 return chosen

def validate_numen_name(name):
 if name is None:
  raise ValueError('Escribe un nombre para tu compañero Númen (entre 2 y 24 caracteres).')
 clean = str(name).strip()
 if not (2 <= len(clean) <= 24):
  raise ValueError('El nombre del Númen debe tener entre 2 y 24 caracteres.')
 if '<' in clean or '>' in clean or any(ord(c) < 32 or ord(c) == 127 for c in clean):
  raise ValueError('El nombre del Númen no puede contener <, > ni caracteres de control.')
 return clean

def rename_numen(state, numen_id, name):
 clean_name = validate_numen_name(name)
 numenes = state.setdefault('numenes', {'active': None, 'bonded': [], 'encounters': {}})
 bonded = numenes.setdefault('bonded', [])
 target = next((n for n in bonded if n['id'] == numen_id), None) if numen_id else get_active_numen(state)
 if not target:
  raise ValueError('No se encontró ese Númen entre tus compañeros vinculados.')
 target['name'] = clean_name
 return target

def bond_numen(state, model_id, name, now):
 numenes = state.setdefault('numenes', {'active': None, 'bonded': [], 'encounters': {}})
 bonded = numenes.setdefault('bonded', [])
 # El compañero del DM no desplaza vínculos previos de un roster completo.
 if len(bonded) >= MAX_BONDED_NUMENES and not (is_vaisork(state) and model_id == 'b' and name == 'Senku'):
  raise ValueError(f'Límite alcanzado: máximo {MAX_BONDED_NUMENES} Númenes vinculados.')
 clean_name = validate_numen_name(name)
 if model_id not in NUMENES_MODELS:
  raise ValueError('Modelo de Númen desconocido.')
 if any(n.get('model') == model_id for n in bonded):
  raise ValueError('Ya tienes un vínculo con un ejemplar de este modelo.')
 numen_id = f"numen_{model_id}_{len(bonded)+1}"
 numen = {
  'id': numen_id,
  'model': model_id,
  'species_name': NUMENES_MODELS[model_id]['species_name'],
  'name': clean_name,
  'trust': 1,
  'trust_stage': TRUST_STAGES[1],
  'mood': 'contento',
  'care': {
   'last_fed': now,
   'last_rested': now,
   '_mood_fed': now,
   'well_cared': True,
   'fed_today': True
  },
  'power': NUMENES_MODELS[model_id]['power_id'],
  'power_name': NUMENES_MODELS[model_id]['power_name'],
  'power_desc': NUMENES_MODELS[model_id]['power_desc'],
  'bonded_at': now,
  'location': 'travel' if numenes.get('active') is None else 'home'
 }
 pick_numen_reaction(numen, 'llegar', now=now)
 bonded.append(numen)
 if numenes.get('active') is None:
  numenes['active'] = numen_id
 return numen

def activate_numen(state, numen_id):
 numenes = state.setdefault('numenes', {'active': None, 'bonded': [], 'encounters': {}})
 bonded = numenes.setdefault('bonded', [])
 target = next((n for n in bonded if n['id'] == numen_id), None)
 if not target:
  raise ValueError('No se encontró ese Númen entre tus compañeros vinculados.')
 numenes['active'] = target['id']
 for n in bonded:
  n['location'] = 'travel' if n['id'] == target['id'] else 'home'
 return target

def send_numen_home(state, numen_id=None):
 numenes = state.setdefault('numenes', {'active': None, 'bonded': [], 'encounters': {}})
 bonded = numenes.setdefault('bonded', [])
 numenes['active'] = None
 for n in bonded:
  n['location'] = 'home'

def care_numen(state, action, now):
 active = get_active_numen(state)
 if not active:
  raise ValueError('No tienes un compañero Númen activo a tu lado.')
 care = active.setdefault('care', {})
 if action == 'alimentar':
  inv = state.get('inventory', [])
  bocado = next((i for i in inv if (i.get('id') == 'bocado_numen' or i.get('catalog_id') == 'bocado_numen' or i.get('kind') == 'numen_food') and i.get('quantity', 1) > 0), None)
  if not bocado:
   raise ValueError('Necesitas un Bocado de Númen; cuesta 2 sellos en los puestos de comida y pociones.')
  if bocado.get('quantity', 1) > 1:
   bocado['quantity'] -= 1
  else:
   inv.remove(bocado)
  care['last_fed'] = now
  care['_mood_fed'] = now
  care['well_cared'] = True
  care['fed_today'] = True
  active['mood'] = 'contento'
  reaction = pick_numen_reaction(active, 'comer', now=now)
  if active.get('trust', 1) < 3:
   active['trust'] = active.get('trust', 1) + 1
   active['trust_stage'] = TRUST_STAGES[active['trust']]
   return f"{reaction} Su confianza aumenta a {active['trust_stage']}."
  return reaction
 elif action == 'cuidar':
  care['last_rested'] = now
  mood = numen_mood(active, now)
  active['mood'] = mood
  care['well_cared'] = (mood == 'contento')
  return pick_numen_reaction(active, 'caricia', now=now)
 return 'Cuidas a tu compañero.'

def exploration_cue(numen, room, now=None, ambient=None, rng=None):
 if not numen:
  return None
 sit = 'llegar'
 if ambient:
  weather = str(ambient.get('weather', '')).lower()
  if weather in ('lluvia', 'tormenta', 'rain') or ambient.get('time_of_day') == 'Noche':
   sit = 'lluvia_noche'
 return pick_numen_reaction(numen, sit, now=now, rng=rng)

def new_state(species,class_id,home,now):
 weapon=dict(WEAPONS[CLASSES[class_id]['weapon']],quantity=1)
 attrs=dict(CLASS_ATTRIBUTES.get(class_id, dict.fromkeys(ATTRIBUTES,10)))
 return {'species':species,'class_id':class_id,'location':home,'home':home,'level':1,'xp':0,'pa':0,'pp':0,'attributes':attrs,
 'hp':100,'fatigue':0,'wound':None,'seals':20,'inventory':[weapon],'equipment':{'weapon':weapon['id'],'armor':None,'block':None},
 'flags':[],'visited':[home],'known':[home],'routes':[],'bestiary':{},'journal':[],'visits':{home:1},'last_room':None,
 'combat':None,'victories':[],'rest_budget':None,'quests':{},'ledger':[],'last_active':now,'events':[], 'arrival':True,
 'numenes':{'active':None,'bonded':[],'encounters':{}}}


def rest(state):
 missing=hp_max(state)-state.get('hp',100)
 if missing>0 and state.get('rest_budget') is None: state['rest_budget']=.3*missing
 cap=(.65 if state.get('wound')=='grave' else .85 if state.get('wound')=='moderada' else 1)*hp_max(state)
 healed=max(0,min(.1*hp_max(state),state.get('rest_budget') or 0,cap-state.get('hp',100),missing))
 state['hp']=state.get('hp',100)+healed
 if state.get('rest_budget') is not None: state['rest_budget']-=healed
 a=state.get('attributes') or {}
 state['fatigue']=max(0,state.get('fatigue',0)-(25+.2*(a.get('resistencia',10)-10)+.1*(a.get('voluntad',10)-10)))
 return healed


def wound(state,damage):
 ratio=damage/hp_max(state)
 new='grave' if ratio>=.5 else 'moderada' if ratio>=.35 else 'leve' if ratio>=.2 else None
 order={None:0,'leve':1,'moderada':2,'grave':3}
 if order[new]>order[state['wound']]:state['wound']=new


def preparation(combat):
 if not combat.get('prepared'):return None
 return combat.get('prepared_action') or combat['profile'].get('prepared_action',{'name':'Acción preparada','accuracy':60,'interruptible':True,'frontal':True})

def capability_hint(class_id, prepared=None):
 if class_id=='artifice' and prepared:
  if not prepared.get('interruptible',False):return f"{prepared['name']} no puede interrumpirse. El disparo sólo hará daño si acierta; puedes elegir una defensa o huir."
  return f"Si aciertas, interrumpes {prepared['name']}. El rival aún puede responder con su precisión ordinaria."
 if class_id=='arcano' and not prepared:return 'Reduce la precisión de la respuesta ordinaria durante esta ronda.'
 return CLASSES[class_id]['effect']

# Narración de combate: sólo cambia el texto. Daño, precisión y azar no se tocan;
# la variante sale del número de ronda y la intensidad, del daño ya calculado.
WEAPON_PROSE = {
 'espada_juramento': {
  'hit': ['Tajo amplio con la espada', 'La hoja silba en el aire', 'Adelantas la hoja y diriges el golpe', 'Descargas la espada con las dos manos'],
  'miss': ['Tu tajo corta el aire.', 'La espada muerde el suelo; {c} ya no estaba ahí.', 'Estocada: {c} gira y la hoja pasa rozando.'],
  'final': ['Último tajo, firme y limpio. {c} ya no puede seguir: {d} de daño.']},
 'punal_camino': {
  'hit': ['Entras rápido por debajo', 'Amago a un lado, pinchazo al otro', 'Te pegas a su costado con el puñal', 'Golpe corto y seco'],
  'miss': ['El puñal sólo encuentra aire.', '{c} no se cree el amago.', '{c} es más rápido esta vez.'],
  'final': ['Te deslizas a su lado y el puñal decide: {d} de daño a {c}.']},
 'arco_ruta': {
  'hit': ['Tensas, sueltas: la flecha silba', 'Retrocedes un paso y disparas', 'Esperas... ¡ahora! Sueltas la cuerda', 'Disparo rápido, casi sin apuntar'],
  'miss': ['La flecha pasa silbando junto a {c}.', 'Disparas con prisa: la flecha se queda corta.', '{c} se mueve justo al soltar la cuerda.'],
  'final': ['Última flecha, bien apuntada. {c} deja de pelear: {d} de daño.']},
 'varita_aprendiz': {
  'hit': ['Cosquilleo en los dedos: el impulso sale', 'Un círculo en el aire, y el aire empuja', 'Sueltas el impulso de golpe', 'La varita vibra y empuja'],
  'miss': ['El impulso sale torcido y sólo mueve hojas.', 'Pierdes la concentración: un chasquido y nada.', 'El impulso pasa junto a {c}, que ni se inmuta.'],
  'final': ['Toda tu concentración en la punta de la varita: {c} se queda sin fuerzas. {d} de daño.']},
}
# Si un arma nueva no está en la tabla, se elige por sus propiedades.
WEAPON_PROSE_FALLBACK = (('ranged', 'arco_ruta'), ('focus', 'varita_aprendiz'), ('block', 'espada_juramento'))
# Intensidad del acierto según la parte de la vida máxima del rival que quita (como los mensajes de daño clásicos).
HIT_TIERS = ((.10, '. Apenas rozas a {c}: {d} de daño.'), (.20, '. Alcanzas a {c}: {d} de daño.'),
             (.30, '. ¡Das de lleno a {c}! {d} de daño.'), (None, '. ¡Golpe tremendo! {c} se tambalea: {d} de daño.'))
DEFENSE_PROSE = {
 'esquivar': ['Te mueves de lado, ligero.', 'Rodillas dobladas, listo para saltar.', 'Un paso atrás y otro al lado.'],
 'bloquear': ['Te cubres con los brazos firmes.', 'Pones el arma delante del cuerpo.', 'Pies firmes: esperas el choque.'],
 'resistir': ['Aprietas los dientes y te plantas.', 'Bajas el cuerpo, tenso.', 'Respiras hondo y aguantas.'],
}
# Ataque propio de cada rival. {n} es el nombre mostrado (incluye nombres locales como Seran).
CREATURE_PROSE = {
 'mordelinde': {'hit': ['{n} se lanza a tus tobillos y te muerde antes de retroceder', '{n} te araña con las manos delanteras y vuelve a mirar su hueco', '{n} se escurre por un lado y te muerde la mano'],
                'miss': ['{n} amaga hacia tus pies, pero sólo muerde el aire.', '{n} da un salto corto y se queda a medio camino, mirando su salida.']},
 'espinajo_rastrojo': {'hit': ['{n} embiste agachado y sus espinas te pinchan las piernas', '{n} gira de golpe y te golpea con el lomo erizado', '{n} carga desde los tallos con las espinas por delante'],
                       'miss': ['{n} carga, pero te apartas y pasa de largo entre los tallos.', 'Las espinas de {n} se quedan a un palmo de ti.']},
 'cornalomo': {'hit': ['{n} baja la cabeza y te empuja con el cuerno; sales despedido hacia atrás', '{n} pisa fuerte y te alcanza con el costado, como chocar contra un muro', '{n} da un cabezazo que te deja sin aire'],
               'miss': ['{n} embiste, pero sólo levanta tierra donde estabas.', 'El cuerno de {n} pasa rozándote el hombro.']},
 'dorsalodo': {'hit': ['{n} barre los juncos con el cuerpo y te tira al suelo con el agua', 'La espalda rugosa de {n} te golpea de lado', '{n} sale del agua de golpe y te empuja hacia la orilla'],
               'miss': ['{n} levanta una ola de barro, pero no llega a tocarte.', 'El cuerpo de {n} pasa a tu lado y el agua te salpica hasta las rodillas.']},
 'rasgacumbres': {'hit': ['{n} lanza un zarpazo de lado y sus garras te alcanzan', '{n} salta desde la roca y te derriba con las patas', 'Las garras de {n} te raspan el brazo antes de que puedas apartarlo'],
                  'miss': ['Las garras de {n} arañan la piedra donde estabas hace un momento.', '{n} salta, pero calcula mal y cae a un paso de ti.']},
 'quebrarrocas': {'hit': ['{n} te empuja con todo su peso, como una pared que se mueve', '{n} lanza una piedra con el hombro y te golpea', '{n} avanza y te arrincona contra las rocas'],
                  'miss': ['{n} empuja, pero te apartas y sólo mueve un bloque.', 'Una piedra lanzada por {n} rebota a tu lado.']},
 'rasgacorteza': {'hit': ['{n} se separa del tronco y te golpea con un brazo duro como la madera', 'Las ramas crujen y {n} te alcanza desde arriba', '{n} te empuja contra un tronco'],
                  'miss': ['{n} golpea el tronco en vez de a ti, y caen hojas por todas partes.', 'El golpe de {n} pasa por encima de tu cabeza.']},
 'cascapedernal': {'hit': ['{n} se lanza de lado y su caparazón te golpea la pierna', 'El borde del caparazón de {n} te da un golpe seco en la mano', '{n} choca contra tu bota con un ruido de piedra'],
                   'miss': ['{n} golpea la roca con el caparazón, lejos de ti.', '{n} se lanza, pero se queda corto y se recoge.']},
 'forajido_camino': {'hit': ['{n} te da un golpe con el palo en el hombro', '{n} barre con el palo a la altura de las piernas y te alcanza', '{n} amaga arriba y golpea abajo con el palo'],
                     'miss': ['{n} descarga un golpe con el palo, pero lo esquivas por poco.', 'El palo de {n} silba junto a tu oreja sin tocarte.']}}

ACTION_PROSE = {
 'guardia_comprometida': {
  'hit': 'Plantas las botas en el suelo y levantas la hoja frente al pecho. El golpe choca contra el acero con un estruendo seco y apenas te hace retroceder.',
  'nonfrontal': 'El ataque viene de lado: tu guardia frontal no reduce este golpe y el impacto te alcanza de lleno.',
 },
 'paso_ruptura': {
  'hit': 'Avanzas con un paso seco y descargas el pomo y el hombro contra el pecho de {c}, quebrando su postura y cortando su ataque.',
  'miss': 'Intentas el paso de ruptura, pero {c} retrocede a tiempo y el golpe no traba su movimiento.',
 },
 'impulso_arcano': {
  'interrupt': 'Rompes su preparación y reduces la precisión de su respuesta. La varita zumba como una cuerda tensa con olor a tormenta fresca y empuja a {c}.',
  'deflect': 'Desvías su respuesta con un impulso. Pierde precisión en esta ronda. Un círculo en el aire y una onda transparente desvía a {c}.',
  'noninterruptible': 'Esta preparación no puede ser interrumpida; {c} mantiene su respuesta a pesar del impulso.',
 },
 'velo_contencion': {
  'cast': 'Trazas un círculo en el aire; una lámina temblorosa de luz azulada te envuelve como un cristal grueso para absorber el impacto.',
  'absorb': 'El velo azulado cruje como hielo fino y absorbe {a} de daño del golpe de {c}.',
  'full_absorb': 'El golpe de {c} choca contra la lámina de luz y se disipa en un estallido de chispas frías sin tocarte.',
 },
 'destello_frio': {
  'cast': 'Un fogonazo repentino de luz blanca y fría estalla frente a los ojos de {c}. La bestia sacude la cabeza, cegada y desorientada.',
 },
 'borrar_foco': {
  'cast': 'Te agachas en silencio y te pegas a la penumbra. {c} pierde tu silueta y atacará al vacío; si falla, tendrás una apertura.',
  'opening': 'La respuesta de {c} pasa de largo en la penumbra. Reconoces su hueco: tienes una apertura clara para tu siguiente golpe.',
 },
 'golpe_apertura': {
  'hit_opening': '¡Golpe a la apertura! Te deslizas con rapidez por su flanco descubierto y clavas el puñal en el punto vulnerable: {d} de daño a {c}.',
  'hit_normal': 'Lanzas una puñalada rápida al costado de {c}: {d} de daño.',
  'miss': 'El puñal roza el aire; {c} gira a tiempo y cierra su ángulo descubierto.',
 },
 'distraccion': {
  'interrupt': 'Lanzas unas piedras secas hacia los matorrales. El chasquido hace que {c} gire la cabeza desconcertado, cortando su ataque.',
  'deflect': 'Un golpe de piedras distrae a {c}; la fiera vacila buscando el ruido y pierde precisión.',
 },
 'tiro_interrupcion': {
  'hit_interrupt': 'Tensas la cuerda y la flecha silba clavándose en la articulación de {c}, frenando su carga en seco: {d} de daño.',
  'hit_normal': 'La flecha alcanza a {c} de lleno: {d} de daño, haciéndole perder precisión.',
  'miss': 'La flecha pasa rozando a {c} y se clava en la tierra sin frenar su avance.',
 },
 'traba_campo': {
  'cast': 'Despliegas un aparejo de estacas y cordel trenzado. {c} tropieza en los lazos ({d} de daño) y sacude las patas intentando zafarse.',
 },
 'balsamo_campo': {
  'cast': 'Extiendes un ungüento de hierbas sobre tus cortes. El ardor fresco calma el dolor (recuperas {h} de vida) y despeja el cansancio.',
 },
}

def weapon_prose(weapon, kind, creature_name, damage, combat_round, max_hp=1):
    key = str(weapon.get('catalog_id', weapon.get('id', ''))).split(':')[0]
    if key not in WEAPON_PROSE:
        key = next((wid for flag, wid in WEAPON_PROSE_FALLBACK if weapon.get(flag)), 'punal_camino')
    options = WEAPON_PROSE[key][kind]
    text = options[combat_round % len(options)]
    if kind == 'hit':
        share = damage / max(1, max_hp)
        text += next(tail for limit, tail in HIT_TIERS if limit is None or share < limit)
    return text.format(c=creature_name, d=damage)

def defense_prose(action, creature_name, combat_round):
    options = DEFENSE_PROSE[action]
    return options[combat_round % len(options)].format(c=creature_name)

def creature_prose(creature, kind, damage, combat_round):
    options = CREATURE_PROSE.get(creature.get('id'), {}).get(kind)
    if not options:
        return f"{creature['name']} te alcanza: {damage} de daño." if kind == 'hit' else f"La respuesta de {creature['name']} pasa sin alcanzarte."
    text = options[combat_round % len(options)].format(n=creature['name'])
    return text + f": {damage} de daño." if kind == 'hit' else text

def is_vaisork(state):
 return bool(isinstance(state,dict) and (state.get('vaisork') or 'vaisork' in state.get('flags',[])))

def resolve_round(state, creature, rng, respond=True):
 combat=state['combat']; profile=combat['profile']; intervention=combat.pop('intervention',None) or {'id':'atacar'}
 action=intervention['id']; target=intervention.get('target'); a=state['attributes']; penalty,power=penalties(state)
 cls=state.get('_class') or state.get('class_id','juramentado')
 if action=='capacidad':
  action=CLASSES[cls].get('signature_id','guardia_comprometida')
 weapon=next((i for i in state['inventory'] if i['id']==state['equipment']['weapon']),None)
 accuracy=clamp(55+.45*(a['destreza']-10)+.18*(a['percepcion']-10)+.5*(cg(state)-8*(profile['level']-1)/99)-penalty-profile.get('evasion',0)+gear_bonus(state,'precision'),25,90)
 if cls=='arcano':stat_bonus=.48*(a['intelecto']-10)+.12*(a['voluntad']-10)
 elif cls=='sombra':stat_bonus=.48*(a['agilidad']-10)+.12*(a['percepcion']-10)
 elif cls=='artifice':stat_bonus=.48*(a['destreza']-10)+.12*(a['percepcion']-10)
 else:stat_bonus=.48*(a['fuerza']-10)+.12*(a['destreza']-10)
 raw=(weapon['damage'] if weapon else 0)+stat_bonus+.25*cg(state)+gear_bonus(state,'dano')+(weapon.get('fusion',0)*2 if weapon else 0)
 prepared=preparation(combat)
 enemy_accuracy=prepared.get('accuracy',60) if prepared else profile['accuracy']
 reduction=0; guard=0; barrier=0; events=[]; signature=action in (CLASSES[cls].get('signature_id'),'capacidad')
 costs={'atacar':4,'esquivar':6,'bloquear':5,'resistir':3,'huir':8,'capacidad':5,'usar':2,
        'guardia_comprometida':4,'paso_ruptura':6,
        'impulso_arcano':4,'velo_contencion':5,'destello_frio':4,
        'borrar_foco':5,'golpe_apertura':5,'distraccion':4,
        'tiro_interrupcion':5,'traba_campo':5,'balsamo_campo':2,
        'apoyo_numen':0}
 if action=='defender':action=target
 if action=='usar':
  item=next((i for i in state['inventory'] if i['id']==target),None)
  text=use_consumable(state,item) if item else None
  if text:
   item['quantity']-=1
   if not item['quantity']:state['inventory'].remove(item)
  events.append({'kind':'action','text':text or 'No encuentras ese objeto en la mochila.'})
 if action=='huir':
  chance=clamp(50+.45*(a['agilidad']-10)+.15*(a['percepcion']-10)+min(30,.6*max(0,profile['level']-state['level']))+15*combat.get('failed_flee',0)-penalty,20,95)
  if combat.pop('destello_frio',False):chance=100
  if rng.random()*100<chance:
   state['fatigue']=min(100,state['fatigue']+fatigue_cost(state,8));state['combat']=None
   return [{'kind':'action','text':'Te apartas del alcance de tu rival y recuperas distancia.'}], 'fled'
  combat['failed_flee']=combat.get('failed_flee',0)+1;events.append({'kind':'danger','text':'Tu rival corta tu retirada; ahora reconoces mejor su ritmo.'})

 # Class combat actions
 if action=='guardia_comprometida':
  signature=True;combat['cooldown']=CLASSES['juramentado']['cooldown']+1
  combat.setdefault('cooldowns',{})['guardia_comprometida']=CLASSES['juramentado']['cooldown']+1
  if not prepared or prepared.get('frontal',False):
   guard=.50;enemy_accuracy=min(enemy_accuracy,profile['accuracy'])
   events.append({'kind':'action','text':f"Usas Guardia Comprometida. {ACTION_PROSE['guardia_comprometida']['hit']}"})
  else:
   events.append({'kind':'action','text':f"Usas Guardia Comprometida. {ACTION_PROSE['guardia_comprometida']['nonfrontal']}"})
 elif action=='paso_ruptura':
  combat.setdefault('cooldowns',{})['paso_ruptura']=4
  if not weapon:
   events.append({'kind':'action','text':'Sin un arma activa no puedes ejecutar el paso de ruptura.'})
  else:
   if rng.random()*100<accuracy:
    dmg=max(1,rounded(raw*.75*power*(1-profile['reduction'])));combat['hp']-=dmg
    if prepared and prepared.get('interruptible',False):
     combat['prepared']=False;enemy_accuracy=profile['accuracy']-15
     events.append({'kind':'combat','text':f"Usas Paso de Ruptura. "+ACTION_PROSE['paso_ruptura']['hit'].format(c=creature['name'])+f" ({dmg} de daño). Interrumpes {prepared['name']}."})
    else:
     enemy_accuracy-=20
     events.append({'kind':'combat','text':f"Usas Paso de Ruptura. "+ACTION_PROSE['paso_ruptura']['hit'].format(c=creature['name'])+f" ({dmg} de daño). {creature['name']} se tambalea y pierde precisión."})
   else:
    events.append({'kind':'combat','text':f"Intentas el Paso de Ruptura. "+ACTION_PROSE['paso_ruptura']['miss'].format(c=creature['name'])})
 elif action=='impulso_arcano':
  signature=True;combat['cooldown']=CLASSES['arcano']['cooldown']+1
  combat.setdefault('cooldowns',{})['impulso_arcano']=CLASSES['arcano']['cooldown']+1
  if prepared and prepared.get('interruptible',False):
   enemy_accuracy=profile['accuracy']-10;combat['prepared']=False
   events.append({'kind':'action','text':f"Usas Impulso Arcano. {ACTION_PROSE['impulso_arcano']['interrupt'].format(c=creature['name'])}"})
  elif prepared and not prepared.get('interruptible',False):
   events.append({'kind':'action','text':f"Usas Impulso Arcano. {ACTION_PROSE['impulso_arcano']['noninterruptible'].format(c=creature['name'])}"})
  else:
   enemy_accuracy=profile['accuracy']-20
   events.append({'kind':'action','text':f"Usas Impulso Arcano. {ACTION_PROSE['impulso_arcano']['deflect'].format(c=creature['name'])}"})
 elif action=='velo_contencion':
  combat.setdefault('cooldowns',{})['velo_contencion']=4
  barrier=rounded(20+.4*(a['intelecto']-10)+.2*(a['voluntad']-10))
  combat['barrier']=barrier
  events.append({'kind':'action','text':f"Usas Velo de Contención. {ACTION_PROSE['velo_contencion']['cast']}"})
 elif action=='destello_frio':
  combat.setdefault('cooldowns',{})['destello_frio']=3
  enemy_accuracy-=30;combat['destello_frio']=True
  events.append({'kind':'action','text':f"Usas Destello Frío. {ACTION_PROSE['destello_frio']['cast'].format(c=creature['name'])}"})
 elif action=='borrar_foco':
  signature=True;combat['cooldown']=CLASSES['sombra']['cooldown']+1
  combat.setdefault('cooldowns',{})['borrar_foco']=CLASSES['sombra']['cooldown']+1
  enemy_accuracy-=25
  events.append({'kind':'action','text':f"Usas Borrar el Foco. {ACTION_PROSE['borrar_foco']['cast'].format(c=creature['name'])}"})
 elif action=='golpe_apertura':
  combat.setdefault('cooldowns',{})['golpe_apertura']=3
  if not weapon:
   events.append({'kind':'action','text':'Sin un arma activa no puedes ejecutar el golpe a la apertura.'})
  else:
   had_opening=combat.pop('opening',False)
   hit_acc=min(95,accuracy+(25 if had_opening else 5))
   mult=1.6 if had_opening else 0.9
   if rng.random()*100<hit_acc:
    dmg=max(1,rounded(raw*mult*power*(1-profile['reduction'])));combat['hp']-=dmg
    if had_opening:events.append({'kind':'combat','text':ACTION_PROSE['golpe_apertura']['hit_opening'].format(c=creature['name'],d=dmg)})
    else:events.append({'kind':'combat','text':ACTION_PROSE['golpe_apertura']['hit_normal'].format(c=creature['name'],d=dmg)})
   else:
    events.append({'kind':'combat','text':ACTION_PROSE['golpe_apertura']['miss'].format(c=creature['name'])})
 elif action=='distraccion':
  combat.setdefault('cooldowns',{})['distraccion']=3
  if prepared and prepared.get('interruptible',False):
   combat['prepared']=False;enemy_accuracy=profile['accuracy']-15
   events.append({'kind':'action','text':f"Usas Lanzar Distracción. {ACTION_PROSE['distraccion']['interrupt'].format(c=creature['name'])}"})
  else:
   enemy_accuracy-=20
   events.append({'kind':'action','text':f"Usas Lanzar Distracción. {ACTION_PROSE['distraccion']['deflect'].format(c=creature['name'])}"})
 elif action=='tiro_interrupcion':
  signature=True;combat['cooldown']=CLASSES['artifice']['cooldown']+1
  combat.setdefault('cooldowns',{})['tiro_interrupcion']=CLASSES['artifice']['cooldown']+1
  raw*=.75
  if prepared:
   effect=f"Disparas hacia {prepared['name']}. "+('El impacto decidirá si consigues interrumpirlo.' if prepared.get('interruptible',False) else 'No puedes interrumpirlo; el impacto sólo dañará a tu rival.')
  else:
   effect=f"Disparas hacia {creature['name']} para desviar su respuesta. Necesitas acertar para reducir su precisión."
  events.append({'kind':'action','text':f"Usas Tiro de Interrupción. {effect}"})
 elif action=='traba_campo':
  combat.setdefault('cooldowns',{})['traba_campo']=4
  if prepared and prepared.get('interruptible',False):combat['prepared']=False
  reduction+=.25;enemy_accuracy-=15;trap_dmg=4;combat['hp']-=trap_dmg
  events.append({'kind':'action','text':ACTION_PROSE['traba_campo']['cast'].format(c=creature['name'],d=trap_dmg)})
 elif action=='balsamo_campo':
  combat.setdefault('cooldowns',{})['balsamo_campo']=5
  before_hp=state['hp'];state['hp']=min(hp_max(state),state['hp']+15);healed=rounded(state['hp']-before_hp)
  state['fatigue']=max(0,state['fatigue']-20)
  events.append({'kind':'action','text':ACTION_PROSE['balsamo_campo']['cast'].format(h=healed)})
 elif action=='apoyo_numen':
  active=get_active_numen(state)
  if active:
   cd=2 if active.get('trust',1)>=4 else 3
   combat.setdefault('cooldowns',{})['apoyo_numen']=cd+1
   m_id=active['model']
   now_combat=state.get('_now')
   cue=pick_numen_reaction(active,'apoyo_combate',now=now_combat,rng=rng)
   if m_id=='a':
    enemy_accuracy-=15;events.append({'kind':'action','text':f"{cue} (+evasión)"})
   elif m_id=='b':
    combat['opening']=True;events.append({'kind':'action','text':f"{cue} (+precisión)"})
   elif m_id=='c':
    state['fatigue']=max(0,state['fatigue']-8);events.append({'kind':'action','text':f"{cue} (-fatiga)"})
   elif m_id=='d':
    enemy_accuracy-=15;events.append({'kind':'action','text':f"{cue} (-precisión rival)"})
   elif m_id=='e':
    reduction+=.25;events.append({'kind':'action','text':f"{cue} (-daño)"})
   elif m_id=='f':
    state['fatigue']=max(0,state['fatigue']-12);events.append({'kind':'action','text':f"{cue} (-fatiga)"})
   elif m_id=='g':
    enemy_accuracy-=20;events.append({'kind':'action','text':f"{cue} (-precisión rival)"})
   elif m_id=='h':
    guard=max(guard,.25);events.append({'kind':'action','text':f"{cue} (-daño)"})
  else:
   events.append({'kind':'action','text':'No tienes un compañero Númen activo a tu lado.'})

 attack=action=='atacar' or (signature and cls=='artifice')
 if attack and not weapon:
  attack=False;events.append({'kind':'action','text':'Sin un arma activa no puedes ejecutar el ataque físico de tu formación.'})
 if attack:
  if combat.pop('opening',False):accuracy=min(90,accuracy+15)
  if rng.random()*100<accuracy:
   damage=max(1,rounded(raw*power*(1-profile['reduction'])));combat['hp']-=damage
   events.append({'kind':'combat','text':weapon_prose(weapon,'final' if combat['hp']<=0 else 'hit',creature['name'],damage,combat['round'],profile['hp'])})
   if signature and cls=='artifice':
    if prepared and prepared.get('interruptible',False):
     combat['prepared']=False;enemy_accuracy=profile['accuracy'];events.append({'kind':'combat','text':f"Tu disparo interrumpe {prepared['name']}."})
    elif not prepared:
     enemy_accuracy-=15;events.append({'kind':'combat','text':'El disparo le hace perder precisión en su siguiente respuesta.'})
  else:events.append({'kind':'combat','text':weapon_prose(weapon,'miss',creature['name'],0,combat['round'])})
 state['fatigue']=min(100,state['fatigue']+fatigue_cost(state,costs.get(action,4)))
 if combat['hp']<=0:return events,'victory'
 if action in DEFENSE_PROSE:events.append({'kind':'action','text':defense_prose(action,creature['name'],combat['round'])})
 if action=='esquivar':enemy_accuracy-=.48*(a['agilidad']-10)+.12*(a['percepcion']-10)-penalty
 elif action=='bloquear':
  _block_item=next((i for i in state['inventory'] if i['id']==state['equipment'].get('block')),None) or (weapon if weapon and weapon.get('block') else None)
  _block_bonus=(_block_item.get('fusion',0)*.02) if _block_item else 0
  reduction=max(0,min(.32+_block_bonus,.10+.0035*(a['destreza']-10)+_block_bonus)-penalty/100)
 elif action=='resistir':reduction=max(0,min(.38,.0055*(a['resistencia']-10))-penalty/100)
 enemy_accuracy-=gear_bonus(state,'esquiva')
 combat['_response']={'accuracy':enemy_accuracy,'reduction':reduction,'guard':guard,'signature':signature,'action':action}
 if not respond:
  combat['round']+=1;combat['cooldown']=max(0,combat.get('cooldown',0)-1)
  if 'cooldowns' in combat:combat['cooldowns']={k:max(0,v-1) for k,v in combat['cooldowns'].items() if v>1}
  return events,'ongoing'
 connected=rng.random()*100<clamp(enemy_accuracy,20,90)
 if connected:
  damage=max(1,rounded(profile['damage']*(1-reduction)*(1-state.get('armor_reduction',0))*(1-guard)))
  barrier=combat.pop('barrier',0)
  if barrier>0:
   absorbed=min(damage,barrier);damage-=absorbed
   events.append({'kind':'combat','text':ACTION_PROSE['velo_contencion']['absorb'].format(a=absorbed,c=creature['name'])})
  if is_vaisork(state):damage=0
  if damage>0:
   state['hp']-=damage;wound(state,damage)
   events.append({'kind':'combat','text':creature_prose(creature,'hit',damage,combat['round'])})
  elif barrier>0:
   events.append({'kind':'combat','text':ACTION_PROSE['velo_contencion']['full_absorb'].format(c=creature['name'])})
  else:
   events.append({'kind':'combat','text':creature_prose(creature,'hit',0,combat['round'])})
 else:
  events.append({'kind':'combat','text':creature_prose(creature,'miss',0,combat['round'])})
  if (signature and cls=='sombra') or action=='borrar_foco':
   combat['opening']=True
   events.append({'kind':'combat','text':ACTION_PROSE['borrar_foco']['opening'].format(c=creature['name'])})
 combat['round']+=1;combat['cooldown']=max(0,combat.get('cooldown',0)-1)
 preps=profile.get('preparations')
 if preps and state['hp']>0 and combat['hp']>0:
  combat['prepared']=True
  next_prep=preps[combat['round']%len(preps)]
  combat['prepared_action']=next_prep
  if next_prep.get('tell'):events.append({'kind':'danger','text':next_prep['tell']})
 else:
  combat['prepared']=False
 if 'cooldowns' in combat:combat['cooldowns']={k:max(0,v-1) for k,v in combat['cooldowns'].items() if v>1}
 if is_vaisork(state):
  return events,'ongoing'
 return events,'death' if state['hp']<=0 else 'ongoing'


# Minor fauna of Lethra and Nhal (historian's risk bestiary, PR #669). Three risk tiers on the existing scale:
# defensive prey (favorable), common rivals (comparable) and dangerous predators (peligroso, warned and avoidable).
# Existing species (pinzajunco, saltalodo, rondamusgo, hilaria_niebla) stay non-combatant as implemented.
MINOR_FAUNA = {
 'mordijunco': {'profile':{'hp':24,'accuracy':45,'damage':5,'reduction':0,'evasion':10,'level':1,'category':'favorable'},
  'observation':'Muerde y retrocede hacia su madriguera. Si no le cierras el paso, prefiere huir.',
  'prose':{'hit':['{n} te muerde la bota con sus incisivos anchos y retrocede','{n} se revuelve entre los tallos y te muerde la mano','{n} salta desde los juncos y te muerde el tobillo'],
           'miss':['{n} da un mordisco al aire y vuelve a esconderse entre los tallos.','Los dientes de {n} se cierran a un dedo de tu mano.']}},
 'cienfango': {'profile':{'hp':38,'accuracy':52,'damage':7,'reduction':.10,'level':2,'category':'comparable'},
  'intention':{'id':'emboscada_raices','name':'Emboscada desde las raíces','interruptible':True,'frontal':False,'tell':'El Cienfango se pega bajo una raíz húmeda y encoge las patas: va a salir de lado. Puedes interrumpirlo antes de que salte.'},
  'observation':'Ataca desde debajo de troncos y raíces mojadas. Mantente en el centro del paso, lejos de su escondite.',
  'prose':{'hit':['{n} sale de debajo de la raíz y sus mandíbulas te cortan el cuero de la manga','Las patas de {n} se te agarran a la pierna y te muerde','{n} se enrosca y te muerde de lado'],
           'miss':['{n} sale disparado de la raíz, pero sus mandíbulas sólo cortan barro.','Las patas de {n} resbalan en la madera mojada y falla el mordisco.']}},
 'raizacapa': {'profile':{'hp':46,'accuracy':46,'damage':7,'reduction':.20,'level':2,'category':'comparable'},
  'observation':'Su caparazón rugoso aguanta muchos golpes. Es lento: puedes tomarte tiempo para apuntar.',
  'prose':{'hit':['{n} estira el cuello de golpe y te muerde el brazo','{n} te embiste con el borde del caparazón','La mordida de {n} te pilla la pierna y no suelta enseguida'],
           'miss':['{n} saca la cabeza, muerde el aire y se recoge bajo el caparazón.','Tu golpe y su mordisco se cruzan sin tocaros; {n} se esconde otra vez.']}},
 'aguaculebra': {'profile':{'hp':34,'accuracy':50,'damage':7,'reduction':0,'evasion':15,'level':2,'category':'comparable'},
  'observation':'Muerde y se mete en una grieta del agua. Golpea cuando asome la cabeza.',
  'prose':{'hit':['{n} sale de una grieta inundada y te muerde la mano','La cabeza plana de {n} aparece junto a tu pie y te muerde','{n} se enrosca en tu tobillo y te muerde antes de soltarse'],
           'miss':['{n} asoma, abre la boca y vuelve a desaparecer en el agua.','Sólo ves un remolino: {n} ya no está donde golpeaste.']}},
 'cortacorriente': {'profile':{'hp':32,'accuracy':55,'damage':8,'reduction':0,'evasion':10,'level':2,'category':'comparable'},
  'observation':'Es rápido y muerde fuerte dentro del agua, pero fuera de ella es torpe. Quédate en lo seco.',
  'prose':{'hit':['{n} salta desde la corriente y sus dientes te enganchan la pierna','{n} te muerde la mano que tenías cerca del agua','{n} da un coletazo y te muerde al pasar'],
           'miss':['{n} salta, pero cae al agua sin alcanzarte.','Los dientes de {n} chocan contra la tabla donde apoyabas el pie.']}},
 'faucecieno': {'profile':{'hp':80,'accuracy':58,'damage':13,'reduction':.20,'level':4,'category':'peligroso'},
  'intention':{'id':'arrastre','name':'Arrastre al agua','interruptible':False,'frontal':True,'tell':'El Faucecieno abre el hocico ancho y se desliza hacia ti desde el agua turbia: va a morder y arrastrar. No puedes interrumpirlo; protégete o apártate.'},
  'observation':'Embosca desde el agua turbia y arrastra a su presa. No luches donde no haya suelo firme.',
  'withdrawal':'Te alejas del borde y buscas suelo firme. El Faucecieno vuelve a hundirse; sólo quedan burbujas.',
  'prose':{'hit':['{n} te muerde con su hocico ancho y tira de ti hacia el agua','Las placas de {n} te golpean al revolverse en el barro','{n} cierra las mandíbulas sobre tu pierna y sacude la cabeza'],
           'miss':['{n} muerde la orilla donde estabas y levanta una ola de barro.','Te apartas a tiempo: {n} se queda medio fuera del agua, mirándote.']}},
 'tragacharco': {'profile':{'hp':80,'accuracy':56,'damage':13,'reduction':.10,'level':4,'category':'peligroso'},
  'intention':{'id':'embestida_corta','name':'Embestida corta','interruptible':True,'frontal':True,'tell':'El montículo de barro se hincha: el Tragacharco va a lanzarse de frente con la boca abierta. Puedes cortarle el impulso.'},
  'observation':'Parece un montón de barro que respira. Ataca de frente y a poca distancia.',
  'withdrawal':'Retrocedes despacio. El Tragacharco se aplasta otra vez en el charco y vuelve a parecer barro.',
  'prose':{'hit':['{n} se lanza desde el charco y te muerde con su boca enorme','{n} te embiste con todo el cuerpo y te tira al barro','La mandíbula de {n} te atrapa el brazo un momento'],
           'miss':['{n} salta y cae en el barro, a un paso de ti.','{n} abre la boca enorme, pero sólo traga agua.']}},
 'sombranutria': {'profile':{'hp':72,'accuracy':62,'damage':12,'reduction':0,'evasion':15,'level':4,'category':'peligroso'},
  'observation':'Caza de noche bajo los muelles y defiende su sitio. Si te apartas de su territorio, te deja ir.',
  'withdrawal':'Te alejas del muelle. La Sombranutria da dos golpes bajo la madera y se queda en su sitio.',
  'prose':{'hit':['{n} sale de debajo del muelle y te muerde la pierna','{n} te araña con las patas palmeadas','{n} se te sube al brazo y te muerde antes de saltar'],
           'miss':['{n} se lanza, pero resbala en la madera mojada.','Oyes el chapoteo de {n} detrás de ti: falló por poco.']}},
 'velomembrana': {'profile':{'hp':18,'accuracy':45,'damage':4,'reduction':0,'evasion':25,'level':1,'category':'favorable'},
  'observation':'Sólo muerde para defenderse y planea lejos. Es difícil de acertar.',
  'prose':{'hit':['{n} baja planeando y te muerde la oreja','{n} te roza la cara con la membrana y te muerde','Las uñas de {n} te arañan el cuello al pasar'],
           'miss':['{n} planea por encima de tu cabeza y se aleja.','Tu golpe atraviesa el aire donde estaba la sombra de {n}.']}},
 'roecorteza': {'profile':{'hp':28,'accuracy':48,'damage':6,'reduction':0,'evasion':5,'level':1,'category':'favorable'},
  'observation':'Muerde y araña si lo molestas mientras busca larvas, pero no persigue.',
  'prose':{'hit':['{n} te araña con sus uñas curvas','{n} te muerde con los incisivos y suelta tiras de corteza','{n} se te encarama a la pierna y te muerde'],
           'miss':['{n} araña el tronco en vez de a ti.','{n} muerde, pero se queda con un trozo de corteza.']}},
 'quebracascara': {'profile':{'hp':44,'accuracy':48,'damage':7,'reduction':.20,'level':2,'category':'comparable'},
  'observation':'Su cubierta dura frena los golpes. Sus pinzas son lentas: aprovecha cuando las abra.',
  'prose':{'hit':['Las mandíbulas de {n} te pellizcan la mano con fuerza','{n} te pinza el tobillo y no suelta','{n} te golpea con su cubierta dura al girar'],
           'miss':['Las pinzas de {n} se cierran en el aire con un chasquido.','{n} se encoge y tu golpe resbala por su cubierta.']}},
 'escarbaraiz': {'profile':{'hp':42,'accuracy':50,'damage':8,'reduction':.10,'level':2,'category':'comparable'},
  'observation':'Protege la entrada de su refugio. Empuja con las patas delanteras antes de dar el zarpazo.',
  'prose':{'hit':['{n} te empuja con sus patas delanteras y te da un zarpazo','{n} te lanza tierra a los ojos y te araña','Las uñas de {n} te rasgan el pantalón'],
           'miss':['{n} escarba con fuerza y te cubre de tierra, pero no te toca.','El zarpazo de {n} se clava en la raíz.']}},
 'clavaespina': {'profile':{'hp':44,'accuracy':50,'damage':8,'reduction':.10,'level':2,'category':'comparable'},
  'intention':{'id':'carga_de_puas','name':'Carga de púas','interruptible':True,'frontal':True,'tell':'El Clavaespina levanta los hombros y eriza las púas: va a cargar de frente. Puedes interrumpirlo o protegerte.'},
  'observation':'No dispara sus púas: carga con ellas. Si lo golpeas de frente, te pincharás.',
  'prose':{'hit':['{n} carga y sus púas te pinchan el brazo','{n} te golpea con los hombros y las púas','Al golpearlo, las púas de {n} se te clavan en la mano'],
           'miss':['{n} carga, pero pasa de largo entre los helechos.','Las púas de {n} se quedan clavadas en un tronco.']}},
 'mordesombra': {'profile':{'hp':70,'accuracy':62,'damage':13,'reduction':0,'evasion':10,'level':4,'category':'peligroso'},
  'intention':{'id':'acometida_veloz','name':'Acometida veloz','interruptible':True,'frontal':False,'tell':'Entre los helechos se mueven seis patas a la vez: el Mordesombra va a atacar de lado y retirarse. Puedes adelantarte.'},
  'observation':'Ataca muy rápido desde los helechos y se retira. Vigila los lados, no sólo el frente.',
  'withdrawal':'Sales de los helechos a la senda abierta. El Mordesombra no te sigue a la luz.',
  'prose':{'hit':['{n} sale de los helechos y te muerde la pierna antes de que lo veas','{n} te ataca de lado y vuelve a desaparecer','Sus seis patas lo llevan de un salto hasta ti: {n} te muerde'],
           'miss':['{n} sale disparado, pero muerde helechos.','Los ojos bajos de {n} te miran desde la sombra; el ataque no llega.']}},
 'garfarrama': {'profile':{'hp':76,'accuracy':60,'damage':14,'reduction':.10,'level':4,'category':'peligroso'},
  'intention':{'id':'salto_descendente','name':'Salto desde la rama','interruptible':True,'frontal':False,'tell':'Arriba, la corteza cruje: el Garfarrama se suelta para caer sobre ti. Puedes adelantarte antes de que salte.'},
  'observation':'Acecha desde las ramas y salta desde arriba. Mira hacia arriba antes de pasar bajo los árboles.',
  'withdrawal':'Te alejas de los árboles bajos. El Garfarrama se queda en su rama, con la cola rígida.',
  'prose':{'hit':['{n} cae desde la rama y te clava las uñas ganchudas','{n} te golpea con la cola rígida','Las garras de {n} te rasgan el hombro'],
           'miss':['{n} salta, pero cae a tu lado y vuelve a trepar.','Las uñas de {n} se clavan en la corteza, no en ti.']}},
 'tronchacolmillo': {'profile':{'hp':85,'accuracy':55,'damage':14,'reduction':.15,'level':4,'category':'peligroso'},
  'intention':{'id':'carga_anunciada','name':'Carga anunciada','interruptible':True,'frontal':True,'tell':'El Tronchacolmillo resopla, rasca la tierra y baja los colmillos: va a cargar de frente. Interrúmpelo o protégete.'},
  'observation':'Es tranquilo si no se siente cercado. Si le dejas un camino libre, se va.',
  'withdrawal':'Te apartas y le dejas el claro libre. El Tronchacolmillo resopla y vuelve a levantar raíces.',
  'prose':{'hit':['{n} te embiste con los colmillos y te levanta del suelo','El peso de {n} te tira al suelo','{n} te golpea de lado con la cabeza'],
           'miss':['{n} carga y pasa a tu lado como un tronco rodando.','Los colmillos de {n} levantan tierra donde estabas.']}},
}
MINOR_INTENTIONS={}  # signature manoeuvres of minor fauna; REGIONAL_INTENTIONS stays for the great fauna
for creature_id,spec in MINOR_FAUNA.items():
 PROFILES[creature_id]=dict(spec['profile'],family=creature_id)
 THREAT_OBSERVATIONS[creature_id]=spec['observation']
 CREATURE_PROSE[creature_id]=spec['prose']
 if 'withdrawal' in spec:PEACEFUL_WITHDRAWALS[creature_id]=spec['withdrawal']
 if 'intention' in spec:
  MINOR_INTENTIONS[creature_id]=spec['intention']
  PROFILES[creature_id].update(prepared=True,prepared_action=dict(spec['intention'],accuracy=PROFILES[creature_id]['accuracy']))
# Prey, rivals and predators all scale with level; overwhelming fauna stays fixed.
SCALED_CATEGORIES=('favorable','comparable','peligroso')
AVOIDABLE_CATEGORIES=('peligroso','abrumador')

# Light combat for the three existing defensive prey (user decision 2026-10-09); Hilaria de niebla stays non-combatant.
LIGHT_PREY = {
 'pinzajunco': {'profile':{'hp':22,'accuracy':44,'damage':4,'reduction':.15,'level':1,'category':'favorable'},
  'observation':'Defiende su madriguera con la pinza mayor y se repliega enseguida. Si no pisas el borde, no ataca.',
  'prose':{'hit':['{n} te da un pinzazo en el tobillo y retrocede de lado','La pinza mayor de {n} te pellizca la mano','{n} se lanza de lado y te pinza la bota'],
           'miss':['{n} chasca la pinza en el aire y se repliega hacia su agujero.','{n} amaga con la pinza, pero se queda en el borde.']}},
 'saltalodo': {'profile':{'hp':18,'accuracy':40,'damage':3,'reduction':0,'evasion':20,'level':1,'category':'favorable'},
  'observation':'Salta lejos y sólo ataca para defenderse. Cuesta acertarle.',
  'prose':{'hit':['{n} salta contra ti y te golpea con las patas traseras','{n} te escupe barro a la cara y te da un cabezazo','{n} te muerde la mano y salta hacia atrás'],
           'miss':['{n} da un salto enorme y cae lejos de tu golpe.','{n} hincha la bolsa del cuello y se aparta de un brinco.']}},
 'rondamusgo': {'profile':{'hp':26,'accuracy':40,'damage':4,'reduction':.05,'level':1,'category':'favorable'},
  'observation':'Empuja para apartarte y huye hacia una raíz hueca. No persigue.',
  'prose':{'hit':['{n} te empuja con el lomo y casi te tira','{n} te da un topetazo en las rodillas','{n} gira y te golpea con el cuerpo cubierto de musgo'],
           'miss':['{n} embiste, pero tropieza con una raíz.','{n} se encoge y tu golpe sólo arranca un poco de musgo.']}},
}
# Bandit personalities share the 'forajidos' family (repeat-victory limits apply to all of them).
BANDITS = {
 'salteador_desesperado': {'profile':{'hp':22,'accuracy':42,'damage':4,'reduction':0,'evasion':5,'level':1,'category':'comparable'},
  'observation':'Le tiemblan las manos y mira más tu comida que tu mochila. Probablemente se rinda pronto.',
  'prose':{'hit':['{n} te da un golpe torpe con el palo','{n} te empuja con las dos manos','{n} agita el palo y te alcanza el brazo'],
           'miss':['{n} lanza un golpe sin fuerza que no llega.','{n} da un paso atrás, dudando.']}},
 'salteador_bravucon': {'profile':{'hp':36,'accuracy':50,'damage':7,'reduction':0,'level':2,'category':'comparable'},
  'intention':{'id':'golpe_aplastante','name':'Golpe aplastante','interruptible':True,'frontal':True,'tell':'El bravucón levanta el garrote por encima de la cabeza, gritando: va a descargar un golpe enorme. Puedes interrumpirlo o protegerte.'},
  'observation':'Grita mucho y pega fuerte, pero avisa cada golpe grande levantando el garrote.',
  'prose':{'hit':['{n} te da un garrotazo en el hombro mientras se ríe','{n} te empuja con el pecho y te golpea','{n} descarga el garrote y te alcanza la pierna'],
           'miss':['{n} golpea el suelo con el garrote y maldice.','{n} se lanza gritando, pero lo esquivas.']}},
 'salteador_veterano': {'profile':{'hp':50,'accuracy':58,'damage':9,'reduction':.10,'level':3,'category':'comparable'},
  'intention':{'id':'finta_veterana','name':'Finta del veterano','interruptible':True,'frontal':False,'tell':'El veterano baja la espada corta y mira a un lado: es una finta, el golpe vendrá por el otro. Puedes adelantarte.'},
  'observation':'Pelea con calma, con una espada corta y una cota vieja. Engaña con fintas laterales.',
  'prose':{'hit':['{n} te corta en el brazo con un movimiento seco','{n} te engaña con una finta y te golpea en el costado','{n} bloquea tu golpe y te devuelve otro'],
           'miss':['{n} retrocede un paso y estudia tu guardia.','Tu golpe y el de {n} chocan; ninguno pasa.']}},
 'salteadora_negociante': {'profile':{'hp':30,'accuracy':52,'damage':5,'reduction':0,'evasion':10,'level':1,'category':'comparable'},
  'observation':'Prefiere hablar a pelear. Si peleas, es rápida y busca terminar pronto.',
  'prose':{'hit':['{n} te pincha con un cuchillo corto y se aparta','{n} te da una patada rápida en la rodilla','{n} te golpea con la empuñadura del cuchillo'],
           'miss':['{n} se aparta con una sonrisa: «Todavía podemos hablar».','{n} amaga y vuelve a guardar distancia.']}},
}
for creature_id,spec in {**LIGHT_PREY,**BANDITS}.items():
 PROFILES[creature_id]=dict(spec['profile'],family='forajidos' if creature_id in BANDITS else creature_id)
 THREAT_OBSERVATIONS[creature_id]=spec['observation'];CREATURE_PROSE[creature_id]=spec['prose']
 if 'intention' in spec:
  MINOR_INTENTIONS[creature_id]=spec['intention']
  PROFILES[creature_id].update(prepared=True,prepared_action=dict(spec['intention'],accuracy=PROFILES[creature_id]['accuracy']))

PROFILES['dragon_aguas_antiguas'] = {
 'hp': 240,
 'accuracy': 68,
 'damage': 22,
 'reduction': .20,
 'level': 10,
 'category': 'abrumador',
 'family': 'dragon',
 'prepared': True,
 'prepared_action': {
  'id': 'aliento_torrente',
  'name': 'Torrente frontal de agua',
  'accuracy': 70,
  'interruptible': False,
  'frontal': True,
  'tell': 'El dragón abre el pecho entre sus alas y toma aire; el remolino se levanta frente a su hocico y las gotas tiemblan en los arcos. Va a lanzar un torrente frontal imposible de interrumpir: una guardia frontal reduce el golpe; también puedes esquivar o huir.'
 },
 'preparations': [
  {
   'id': 'aliento_torrente',
   'name': 'Torrente frontal de agua',
   'accuracy': 70,
   'interruptible': False,
   'frontal': True,
   'tell': 'El dragón abre el pecho entre sus alas y toma aire; el remolino se levanta frente a su hocico y las gotas tiemblan en los arcos. Va a lanzar un torrente frontal imposible de interrumpir: una guardia frontal reduce el golpe; también puedes esquivar o huir.'
  },
  {
   'id': 'coletazo_giratorio',
   'name': 'Barrido de cola',
   'accuracy': 65,
   'interruptible': True,
   'frontal': False,
   'tell': 'La cola rodea el pedestal, golpea una losa y salpica hasta el techo. Las alas se tensan: viene un barrido amplio. Puedes interrumpir el giro con un tiro o un empuje arcano antes de que alcance el suelo, o esquivar.'
  },
  {
   'id': 'embate_ciego',
   'name': 'Zarpazo en abanico',
   'accuracy': 75,
   'interruptible': False,
   'frontal': False,
   'tell': 'El dragón baja el cuello. Un rugido corta el aire y hace caer gotas del techo; su garra se abre para barrer sin rumbo fijo. No es frontal ni se puede interrumpir: Sombra puede borrar el foco y abrir una oportunidad; también puedes esquivar o huir.'
  }
 ]
}
CREATURE_PROSE['dragon_aguas_antiguas'] = {
 'hit': [
  'El pecho de {n} se ilumina bajo las escamas; un torrente te alcanza y te empuja contra las losas mojadas',
  'El ala de {n} barre el vapor y su ráfaga te golpea antes de que puedas afirmarte',
  'La cola de {n} sacude la cuenca, levanta una ola y te derriba sobre la piedra',
  '{n} deja caer una garra enorme; el golpe te alcanza entre lluvia de gotas'
 ],
 'miss': [
  'El torrente de {n} pasa junto a ti, golpea un arco y lo cubre de espuma; las gotas caen como lluvia.',
  'La cola de {n} pasa por encima de ti; te agachas y una ola se deshace contra el pedestal.',
  '{n} abre la garra en abanico. Alcanzas a apartarte y sus uñas arrancan chispas de la piedra húmeda.'
 ]
}
THREAT_OBSERVATIONS['dragon_aguas_antiguas'] = 'Observa las corrientes de vapor y el movimiento de sus aletas antes de cada ataque para anticipar su preparación.'
PEACEFUL_WITHDRAWALS['dragon_aguas_antiguas'] = 'Retrocedes despacio hacia la entrada de la bóveda. El dragón repliega sus alas y vuelve a reposar sobre el pedestal de las aguas.'
