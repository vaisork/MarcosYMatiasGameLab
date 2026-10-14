"""Document-sourced rules: GAMEPLAY §§20,22,24,27,36,42,43; WEAPON_CATALOG.
All values transcribed from documents, not imported from the former engine.
"""
import math

ATTRIBUTES = ('fuerza','resistencia','agilidad','percepcion','intelecto','voluntad','destreza','presencia')
CLASSES = {
 'juramentado': {'name':'Juramentado','signature':'Guardia Comprometida','effect':'Reduce el daño del próximo golpe que te alcance.','cooldown':2,'weapon':'espada_juramento'},
 'arcano': {'name':'Arcano','signature':'Impulso Arcano','effect':'Rompe la preparación y dificulta que te alcance.','cooldown':4,'weapon':'varita_aprendiz'},
 'sombra': {'name':'Sombra','signature':'Borrar el Foco','effect':'Reduce su precisión; si falla, abre tu siguiente ataque.','cooldown':4,'weapon':'punal_camino'},
 'artifice': {'name':'Artífice','signature':'Tiro de Interrupción','effect':'Un disparo acertado corta la carga o reduce su precisión.','cooldown':2,'weapon':'arco_ruta'},
}
WEAPONS = {
 'espada_juramento': {'id':'espada_juramento','name':'Espada de juramento','kind':'weapon','damage':10,'block':True,'activated':True},
 'varita_aprendiz': {'id':'varita_aprendiz','name':'Varita de aprendiz','kind':'weapon','damage':7,'focus':True,'activated':True},
 'punal_camino': {'id':'punal_camino','name':'Puñal de camino','kind':'weapon','damage':8,'activated':True},
 'arco_ruta': {'id':'arco_ruta','name':'Arco de ruta','kind':'weapon','damage':9,'ranged':True,'activated':True},
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

def gear(state):
 """Equipped items, once each, from any slot."""
 equipped={v for v in (state.get('equipment') or {}).values() if v}
 return [i for i in state.get('inventory',[]) if i.get('id') in equipped]

def gear_bonus(state,key):
 return sum(i.get('bonus',{}).get(key,0) for i in gear(state))

def armor_total(state):
 return min(ARMOR_CAP,sum(i.get('armor_reduction',0) for i in gear(state) if i.get('kind')=='armor'))

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
 a=state['attributes']; return 100+1.25*(state['level']-1)+2.5*(a['resistencia']-10)+.5*(a['voluntad']-10)+gear_bonus(state,'vida')
# One lifetime reward per room, secret, journal text, ending flag, quest or behavior.
EXPLORATION_XP = {'room':4, 'secret':10, 'clue':3, 'closure':25, 'quest':15, 'behavior':3}

def xp_next(level): return rounded(100+18*(level-1)+.25*(level-1)**2)
def fatigue_cost(state, base):
 multiplier = (1.10 if state['wound']=='leve' else 1.20 if state['wound']=='moderada' else 1.35 if state['wound']=='grave' else 1)
 return base*max(.55,1-.007*(state['attributes']['resistencia']-10))*multiplier

def penalties(state):
 f=state['fatigue']; accuracy=10 if f>=90 else 5 if f>=70 else 0
 accuracy+=10 if state['wound']=='grave' else 5 if state['wound']=='moderada' else 0
 power=(.8 if f>=90 else .9 if f>=70 else 1)*(.9 if state['wound']=='grave' else 1)
 return accuracy,power

def new_state(species,class_id,home,now):
 weapon=dict(WEAPONS[CLASSES[class_id]['weapon']],quantity=1)
 return {'species':species,'class_id':class_id,'location':home,'home':home,'level':1,'xp':0,'pa':0,'pp':0,'attributes':dict.fromkeys(ATTRIBUTES,10),
 'hp':100,'fatigue':0,'wound':None,'seals':20,'inventory':[weapon],'equipment':{'weapon':weapon['id'],'armor':None,'block':None},
 'flags':[],'visited':[home],'known':[home],'routes':[],'bestiary':{},'journal':[],'visits':{home:1},'last_room':None,
 'combat':None,'victories':[],'rest_budget':None,'quests':{},'ledger':[],'last_active':now,'events':[], 'arrival':True}


def rest(state):
 missing=hp_max(state)-state['hp']
 if missing>0 and state['rest_budget'] is None: state['rest_budget']=.3*missing
 cap=(.65 if state['wound']=='grave' else .85 if state['wound']=='moderada' else 1)*hp_max(state)
 healed=max(0,min(.1*hp_max(state),state['rest_budget'] or 0,cap-state['hp'],missing))
 state['hp']+=healed
 if state['rest_budget'] is not None: state['rest_budget']-=healed
 state['fatigue']=max(0,state['fatigue']-(25+.2*(state['attributes']['resistencia']-10)))
 return healed


def wound(state,damage):
 ratio=damage/hp_max(state)
 new='grave' if ratio>=.5 else 'moderada' if ratio>=.35 else 'leve' if ratio>=.2 else None
 order={None:0,'leve':1,'moderada':2,'grave':3}
 if order[new]>order[state['wound']]:state['wound']=new


def preparation(combat):
 if not combat.get('prepared'):return None
 return combat['profile'].get('prepared_action',{'name':'Acción preparada','accuracy':60,'interruptible':True,'frontal':True})

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
                     'miss': ['{n} descarga un golpe con el palo, pero lo esquivas por poco.', 'El palo de {n} silba junto a tu oreja sin tocarte.']},
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

def resolve_round(state, creature, rng, respond=True):
 combat=state['combat']; profile=combat['profile']; intervention=combat.pop('intervention',None) or {'id':'atacar'}
 action=intervention['id']; target=intervention.get('target'); a=state['attributes']; penalty,power=penalties(state)
 weapon=next((i for i in state['inventory'] if i['id']==state['equipment']['weapon']),None)
 accuracy=clamp(55+.45*(a['destreza']-10)+.18*(a['percepcion']-10)+.5*(cg(state)-8*(profile['level']-1)/99)-penalty-profile.get('evasion',0)+gear_bonus(state,'precision'),25,90)
 raw=(weapon['damage'] if weapon else 0)+.48*(a['fuerza']-10)+.12*(a['destreza']-10)+.25*cg(state)+gear_bonus(state,'dano')
 prepared=preparation(combat)
 enemy_accuracy=prepared.get('accuracy',60) if prepared else profile['accuracy']
 reduction=0; guard=0; events=[]; signature=False; costs={'atacar':4,'esquivar':6,'bloquear':5,'resistir':3,'huir':8,'capacidad':5,'usar':2}
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
  if rng.random()*100<chance:
   state['fatigue']=min(100,state['fatigue']+fatigue_cost(state,8));state['combat']=None
   return [{'kind':'action','text':'Te apartas del alcance de tu rival y recuperas distancia.'}], 'fled'
  combat['failed_flee']=combat.get('failed_flee',0)+1;events.append({'kind':'danger','text':'Tu rival corta tu retirada; ahora reconoces mejor su ritmo.'})
 if action=='capacidad':
  signature=True;cls=state['_class'];combat['cooldown']=CLASSES[cls]['cooldown']+1
  if cls=='juramentado' and (not prepared or prepared.get('frontal',False)):guard=min(.45,.30+.0025*(a['destreza']-10)+.0015*(a['resistencia']-10));enemy_accuracy=min(enemy_accuracy,profile['accuracy'])
  elif cls=='arcano':
   if prepared and prepared.get('interruptible',False):enemy_accuracy=profile['accuracy']-10;combat['prepared']=False
   elif not prepared:enemy_accuracy=profile['accuracy']-20
  elif cls=='sombra':enemy_accuracy-=25
  elif cls=='artifice':raw*=.75
  effects={'juramentado':('Afirmas la guardia. Si el golpe llega, recibes menos daño.' if not prepared or prepared.get('frontal',False) else 'El ataque viene de lado: tu guardia frontal no reduce este golpe.'),
           'arcano':('Rompes su preparación y reduces la precisión de su respuesta.' if prepared and prepared.get('interruptible',False) else 'Desvías su respuesta con un impulso. Pierde precisión en esta ronda.'),
           'sombra':'Sales de su foco. Su siguiente respuesta pierde precisión; si falla, tendrás una apertura para atacar.',
           'artifice':(f"Disparas hacia {prepared['name']}. "+('El impacto decidirá si consigues interrumpirlo.' if prepared.get('interruptible',False) else 'No puedes interrumpirlo; el impacto sólo dañará a tu rival.') if prepared else 'Disparas para desviar su respuesta. Necesitas acertar para reducir su precisión.')}
  if cls=='arcano' and prepared and not prepared.get('interruptible',False):effects[cls]='Esta preparación no puede ser interrumpida; mantiene su respuesta.'
  events.append({'kind':'action','text':f"Usas {CLASSES[cls]['signature']}. {effects[cls]}"})
 attack=action=='atacar' or (signature and state['_class']=='artifice')
 if attack and not weapon:
  attack=False;events.append({'kind':'action','text':'Sin un arma activa no puedes ejecutar el ataque físico de tu formación.'})
 if attack:
  if combat.pop('opening',False):accuracy=min(90,accuracy+15)
  if rng.random()*100<accuracy:
   damage=max(1,rounded(raw*power*(1-profile['reduction'])));combat['hp']-=damage
   events.append({'kind':'combat','text':weapon_prose(weapon,'final' if combat['hp']<=0 else 'hit',creature['name'],damage,combat['round'],profile['hp'])})
   if signature and state['_class']=='artifice':
    if prepared and prepared.get('interruptible',False):
     combat['prepared']=False;enemy_accuracy=profile['accuracy'];events.append({'kind':'combat','text':f"Tu disparo interrumpe {prepared['name']}."})
    elif not prepared:
     enemy_accuracy-=15;events.append({'kind':'combat','text':'El disparo le hace perder precisión en su siguiente respuesta.'})
  else:events.append({'kind':'combat','text':weapon_prose(weapon,'miss',creature['name'],0,combat['round'])})
 state['fatigue']=min(100,state['fatigue']+fatigue_cost(state,costs.get(action,4)))
 if combat['hp']<=0:return events,'victory'
 if action in DEFENSE_PROSE:events.append({'kind':'action','text':defense_prose(action,creature['name'],combat['round'])})
 if action=='esquivar':enemy_accuracy-=.48*(a['agilidad']-10)+.12*(a['percepcion']-10)-penalty
 elif action=='bloquear':reduction=max(0,min(.32,.10+.0035*(a['destreza']-10))-penalty/100)
 elif action=='resistir':reduction=max(0,min(.38,.0055*(a['resistencia']-10))-penalty/100)
 enemy_accuracy-=gear_bonus(state,'esquiva')
 combat['_response']={'accuracy':enemy_accuracy,'reduction':reduction,'guard':guard,'signature':signature}
 if not respond:
  combat['round']+=1;combat['cooldown']=max(0,combat.get('cooldown',0)-1)
  return events,'ongoing'
 connected=rng.random()*100<clamp(enemy_accuracy,20,90)
 if connected:
  damage=max(1,rounded(profile['damage']*(1-reduction)*(1-state.get('armor_reduction',0))*(1-guard)));state['hp']-=damage;wound(state,damage)
  events.append({'kind':'combat','text':creature_prose(creature,'hit',damage,combat['round'])})
 else:
  events.append({'kind':'combat','text':creature_prose(creature,'miss',0,combat['round'])})
  if signature and state['_class']=='sombra':combat['opening']=True
 combat['prepared']=False;combat['round']+=1;combat['cooldown']=max(0,combat.get('cooldown',0)-1)
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
