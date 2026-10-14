"""Fresh state transitions and authored situational narrative."""
import json
import hashlib
import math
import random
import re
import unicodedata
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo
from . import mechanics as m

class RuleError(ValueError):
    def __init__(self,message,status=400):self.status=status;super().__init__(message)

def event(kind,text):return {'kind':kind,'text':text}

def signal_present(signal,room,world,now):
 key=f"{room['id']}:{signal['creature']}"
 return signal.get('persistent_trace',False) or (world['deaths'].get(key,0)<=now and world.get('creature_states',{}).get(key,{}).get('stage')!='sheltered')

def flags_for(state,world):return set(state['flags'])|set(world['flags'])
def allowed(item,state,world):
 flags=flags_for(state,world)
 return (set(item.get('requires_flags',[])).issubset(flags) and not set(item.get('forbids_flags',[]))&flags
         and (not item.get('requires_species') or state.get('species') in item['requires_species'])
         and (not item.get('requires_classes') or state.get('class_id') in item['requires_classes']))

class Engine:
    def __init__(self,content,clock,rng=None,timezone='UTC'):self.content=content;self.clock=clock;self.rng=rng or random.SystemRandom();self.timezone=ZoneInfo(timezone)

    def allowed(self,item,state,world):
        if not allowed(item,state,world):return False
        if not set(item.get('requires_examined',[])).issubset(state.get('examined',{}).get(state['location'],[])):return False
        visit_requirement=item.get('requires_visits',{})
        visits=state.get('visits',{}).get(state['location'],0)
        if visits<visit_requirement.get('min',0) or ('max' in visit_requirement and visits>visit_requirement['max']):return False
        for item_id,quantity in item.get('requires_items',{}).items():
            if sum(i.get('quantity',1) for i in state['inventory'] if i.get('catalog_id',i['id'])==item_id)<quantity:return False
        room=self.content.rooms.get(state['location'])
        if not room:
            key,_=self.region_for(state['species']);room={'region':key}
        ambient=self.ambient(room,world);phase=ambient['time_of_day'].lower();weather=ambient['weather'].lower()
        if item.get('requires_time') and phase not in item['requires_time']:return False
        if item.get('requires_weather') and weather not in item['requires_weather']:return False
        if weather in item.get('forbids_weather',[]):return False
        npc_id=item.get('requires_npc')
        if npc_id:
            npc=self.content.npcs.get(npc_id)
            if not npc or npc_id not in room.get('npcs',[]) or npc.get('home_room',state['location'])!=state['location']:return False
            if not self.allowed({k:v for k,v in npc.items() if k!='requires_npc'},state,world):return False
            if npc.get('schedule') and phase not in npc['schedule'] and not (phase in ('amanecer','atardecer') and 'día' in npc['schedule']):return False
        return True

    def region_for(self,species):
        aliases={'humano','humanos'} if species=='humano' else {species}
        for key,region in self.content.regions.items():
            value=region.get('species','');values={str(i).lower() for i in value} if isinstance(value,list) else {str(value).lower()}
            if aliases&values:return key,region
        raise RuleError('No hay una comunidad de origen disponible para esta especie.')

    def creature_prose(self,room,creature_id):
        creature=dict(self.content.creatures.get(creature_id,{}))
        overrides=room.get('adversary_prose',{}).get(creature_id,{})
        for field in ('name','description','warning','dialogue','combat_intro','defeat_text'):
            value=overrides.get(field)
            if field=='dialogue' and isinstance(value,dict):
                creature[field]={topic:text for topic,text in value.items() if isinstance(text,str)}
            elif field!='dialogue' and isinstance(value,str):creature[field]=value
        return creature

    def room(self,character,world=None):
        state=character['state'];location=state['location']
        if location==state['home']:
            key,region=self.region_for(character['species']);template=region.get('home',{})
            return dict(template,id=location,name=template.get('name',f"Hogar de {character['name']}"),kind='home',region=key,
                        description=(template.get('introduction') if state['visits'].get(location,0)==1 else None) or template.get('description','Tu hogar abre hacia la comunidad de origen. El equipo de viaje ocupa su lugar junto a la salida.'),
                        exits={'salir':region['settlement']},npcs=[],safe=True)
        if location not in self.content.rooms:raise RuleError('La ubicación no pertenece al mundo.',409)
        room=dict(self.content.rooms[location])
        for variant in room.get('states',[]):
            if world is not None and self.allowed(variant,state,world):
                for key,value in variant.get('overrides',{}).items():
                    if key not in ('description','brief','dawn','day','dusk','night','rain','clear','weather','return','examine','focus','art_variant'):continue
                    if key=='description' and 'brief' not in variant['overrides']:room.pop('brief',None)
                    room[key]=dict(room.get(key,{}),**value) if key=='examine' else value
        for cid,overrides in room.get('absent_creatures',{}).items():
            key=f'{location}:{cid}'
            if (world or {}).get('deaths',{}).get(key,0)>self.clock() or (world or {}).get('creature_states',{}).get(key,{}).get('stage')=='sheltered':
                for field,value in overrides.items():
                    if field=='description':room.pop('brief',None)
                    if field in ('description','dawn','day','dusk','night','examine'):room[field]=dict(room.get(field,{}),**value) if field=='examine' else value
        encounter=(world or {}).get('wildlife',{}).get(location)
        if encounter and encounter.get('signal') and (encounter.get('until',0)>self.clock() or f"{location}:{encounter['signal']['creature']}" in (world or {}).get('encounters',{})):
            room['signals']=[*room.get('signals',[]),encounter['signal']]
        return room

    def encounter(self,character,world):
        room=self.room(character,world);pool=room.get('wildlife_pool',[])
        if not pool:return
        records=world.setdefault('wildlife',{});previous=records.get(room['id'],{})
        now=self.clock()
        if previous.get('until',0)>now:return
        if previous.get('signal') and f"{room['id']}:{previous['signal']['creature']}" in world.get('encounters',{}):
            previous['until']=now+300;return
        # Spawn is shared by the room. Personal knowledge filters visibility later,
        # and must not let the first visitor choose wildlife for everyone else.
        ambient_keys=('requires_time','requires_weather','forbids_weather')
        candidates=[signal for signal in pool if self.allowed({k:v for k,v in signal.items() if k in ambient_keys},character['state'],world)
                    and signal_present(dict(signal,persistent_trace=False),room,world,now)]
        # Fair fights are three times likelier than overwhelming fauna; most wild places hold something.
        weighted=[c for c in candidates for _ in range({'favorable':3,'comparable':3,'peligroso':2}.get(m.PROFILES.get(c['creature'],{}).get('category'),1))]
        roll=self.rng.random();signal=None
        if weighted and roll<.7:
            signal=dict(weighted[min(int(roll/.7*len(weighted)),len(weighted)-1)])
            # Farther from a town, stronger rivals: level 1-6 from distance, with a little chance either way.
            if m.PROFILES.get(signal['creature'],{}).get('category') in m.SCALED_CATEGORIES and 'level' not in signal:
                try:_,distance=self.nearest_settlement(room['id'])
                except RuleError:distance=4
                wobble=self.rng.random();signal['level']=max(1,min(6,1+distance//3+(-1 if wobble<.25 else 1 if wobble>=.75 else 0)))
        records[room['id']]={'signal':signal,'until':now+300}

    def remember_clue(self,state,room,clue):
        if not isinstance(clue,dict) or not clue.get('flag'):return
        if clue['flag'] not in state['flags']:state['flags'].append(clue['flag'])
        memory=f"En {room['name']}: {clue['text']}"
        if memory not in state['journal']:state['journal'].append(memory)

    def search(self,character,world):
        self.encounter(character,world)
        state=character['state'];room=self.room(character,world);now=self.clock()
        search=self.content.regions[room['region']].get('search') if room['kind'] in ('road','wilderness','landmark') and not room.get('safe',False) else None
        state.setdefault('searches',{})[room['id']]=now
        searched='buscado:'+room['id']
        if searched not in state['flags']:state['flags'].append(searched)
        # A place's own hidden things come first: unique ones once per player, the rest restock.
        for index,hidden in enumerate(room.get('hallazgos',[])):
            if hidden.get('item') not in self.content.items:continue
            key=f"hallazgo_sala:{room['id']}:{index}"
            if hidden.get('unico'):
                if key in state['flags']:continue
                state['flags'].append(key)
            else:
                stock=world.setdefault('search_stock',{})
                if stock.get(key,0)>now or self.rng.random()>=hidden.get('chance',.5):continue
                stock[key]=now+1800
            self.add_item(state,hidden['item'])
            memory=f"En {room['name']} encontraste {self.content.items[hidden['item']]['name']}."
            if memory not in state['journal']:state['journal'].append(memory)
            state['events']=[event('discovery',hidden['text']),event('action',f"Guardas {self.content.items[hidden['item']]['name']} en la mochila.")]
            return
        if not search:
            state['events']=[event('world','Revisas cada rincón, pero no queda nada más que llevarse.')];return
        roll=self.rng.random();finds=search['finds'];stock=world.setdefault('search_stock',{})
        found=finds[min(int(roll/.5*len(finds)),len(finds)-1)] if roll<.5 else None
        if found and stock.get(room['id']+':'+found['item'],0)<=now:
            self.add_item(state,found['item']);stock[room['id']+':'+found['item']]=now+1800
            flag='hallazgo:'+found['item']
            if flag not in state['flags']:state['flags'].append(flag)
            memory=f"En {room['name']} encontraste {self.content.items[found['item']]['name']}."
            if memory not in state['journal']:state['journal'].append(memory)
            state['events']=[event('discovery',found['text']),event('action',f"Guardas {self.content.items[found['item']]['name']} en la mochila.")]
        elif roll<.75:
            traces=search['traces'];fraction=(roll-.5)/.25 if roll>=.5 else roll/.5
            trace=traces[min(int(fraction*len(traces)),len(traces)-1)]
            # A clue may remember that it was seen, so the place that explains it can offer to follow it up.
            if isinstance(trace,dict):
                self.remember_clue(state,room,trace)
                trace=trace['text']
            state['events']=[event('trace',trace)]
        else:
            empty=search['empty'];fraction=(roll-.75)/.25
            state['events']=[event('world',empty[min(int(fraction*len(empty)),len(empty)-1)])]

    def ambient(self,room,world):
        now=self.clock();hour=datetime.fromtimestamp(now,self.timezone).hour;phase='Noche' if hour<6 or hour>=20 else 'Amanecer' if hour<8 else 'Atardecer' if hour>=18 else 'Día'
        region=self.content.regions[room['region']];weather=region.get('weather',['Despejado'])
        if isinstance(weather,dict):choices=list(weather)
        elif isinstance(weather,list):choices=[v.get('id',v.get('name','Despejado')) if isinstance(v,dict) else v for v in weather]
        else:choices=['Despejado']
        offset=region.get('weather_offset',int.from_bytes(hashlib.sha256(room['region'].encode()).digest()[:2],'big'))
        value=choices[(int(now//7200)+offset)%len(choices)] if choices else 'Despejado'
        value=str(value).capitalize()
        description=weather.get(str(value).lower(),weather.get(value,'')) if isinstance(weather,dict) else ''
        return {'time_of_day':phase,'weather':value,'weather_description':description,'region':room['region'],'timestamp':now}

    def people(self,room,state,world,ambient):
        people=[]
        for npc_id in room.get('npcs',[]):
            npc=self.content.npcs[npc_id]
            if npc.get('home_room',room['id'])!=room['id'] or not self.allowed(npc,state,world):continue
            schedule=npc.get('schedule')
            if schedule and ('noche' if ambient['time_of_day']=='Noche' else 'día') not in schedule:continue
            person=dict(npc,id=npc_id)
            for variant in npc.get('states',[]):
                if self.allowed(variant,state,world):
                    for key,value in variant.get('overrides',{}).items():
                        if key in ('topics','memory','world_memory') and isinstance(value,dict):
                            person[key]={**person.get(key,{}),**value}
                        if key in ('description','dawn','day','dusk','night'):
                            person[key]=value
            people.append(person)
        return people

    def narrative(self,character,world,mode='navigation',target=None):
        state=character['state'];room=self.room(character,world);ambient=self.ambient(room,world);lines=[]
        if mode=='examinar':
            detail=room.get('examine',{}).get(target)
            if isinstance(detail,dict):
                if not self.allowed(detail,state,world):detail=None
                else:detail=detail.get('text')
            return [event('world',detail or 'Buscas un detalle nuevo, pero aquí no encuentras una señal adicional.')]
        if mode=='observar':
            for signal in room.get('signals',[]):
                if self.allowed(signal,state,world) and signal_present(signal,room,world,self.clock()):lines.append(event('danger' if m.PROFILES.get(signal['creature'],{}).get('category') not in (None,'favorable') else 'trace',signal['text']))
            for npc in self.people(room,state,world,ambient):lines.append(event('world',npc.get('description',npc['name'])))
            phase_key={'Amanecer':'dawn','Día':'day','Atardecer':'dusk','Noche':'night'}[ambient['time_of_day']]
            if not room.get(phase_key):phase_key='night' if phase_key=='night' else 'day'
            for text in (room.get(phase_key), self.local_weather(room,ambient)):
                if text and not any(line['text']==text for line in lines):lines.append(event('world',text))
            details=[detail.get('text') if isinstance(detail,dict) else detail for detail in room.get('examine',{}).values() if not isinstance(detail,dict) or self.allowed(detail,state,world)]
            if details:
                index=max(0,state.get('observations',{}).get(room['id'],1)-1)%len(details)
                if details[index]:lines.append(event('trace',details[index]))
            return lines or [event('world',room.get('description',''))]
        # Space stays explicit; secondary layers compete for attention rather than accumulate.
        layers={};priority=[]
        if state.get('arrival'):
            arrival=room.get('arrivals',{}).get(state.get('last_room'))
            if arrival:layers['arrival']=event('world',arrival)
        phase_key={'Amanecer':'dawn','Día':'day','Atardecer':'dusk','Noche':'night'}[ambient['time_of_day']]
        activity=room.get(phase_key) or room.get('night' if phase_key=='night' else 'day')
        if activity:layers['activity']=event('world',activity)
        weather_name=str(ambient['weather']).lower()
        weather=self.local_weather(room,ambient)
        if weather and weather not in (room.get('day'),room.get('night')):layers['weather']=event('world',weather)
        memories=[i for i in room.get('memories',[]) if self.allowed(i,state,world)]
        if memories:layers['memory']=event('discovery',memories[-1]['text'])
        elif state['visits'].get(room['id'],0)>1 and room.get('return'):layers['return']=event('world',room['return'])
        present=self.people(room,state,world,ambient)
        people_lines=[event('world',npc.get(phase_key) or npc.get('night' if phase_key=='night' else 'day') or npc['name']+' está aquí.') for npc in present]
        for signal in room.get('signals',[]):
            if self.allowed(signal,state,world) and signal_present(signal,room,world,self.clock()):layers['danger']=event('danger' if m.PROFILES.get(signal['creature'],{}).get('category') not in (None,'favorable') else 'trace',signal['text']);break
        visits=state['visits'].get(room['id'],0)
        recall=visits<=2 or visits%3==2
        priority=['danger']+(['memory','return'] if recall else [])+['arrival']
        priority+=['weather','activity'] if weather_name in ('lluvia','tormenta','nieve','niebla','viento') else ['activity','weather']
        priority+=['people','memory','return']
        authored=room.get('focus',room.get('order',[]))
        if isinstance(authored,str):authored=[authored]
        priority=['danger']+(['memory'] if recall else [])+[key for key in authored if key in layers and key!='danger']+priority
        limit=room.get('max_layers',3)
        limit=min(8,max(1,limit)) if isinstance(limit,int) else 3
        brief=room.get('brief') if mode=='navigation' and visits>1 else None
        description=brief or room['description']
        lines=[event('look' if mode=='mirar' else 'world',description)];seen={description}
        # The walk is told before the place it leads to.
        if mode=='navigation' and 'arrival' in layers:
            arrival=layers.pop('arrival');lines.insert(0,arrival);seen.add(arrival['text']);limit+=1
        # First step into a region: say where the player is before describing the place.
        previous=self.content.rooms.get(state.get('last_room') or '')
        region=room.get('region');entry=self.content.regions.get(region,{}).get('entry')
        if mode=='navigation' and state.get('arrival') and isinstance(entry,str) and isinstance(previous,dict) and previous.get('region')!=region and not any(self.content.rooms.get(v,{}).get('region')==region for v in state.get('visited',[]) if v!=room['id']):
            lines.insert(0,event('discovery',entry));seen.add(entry);limit+=1
        if brief:
            options=list(dict.fromkeys(key for key in priority if key in layers and key!='danger'))
            if options:
                shift=visits%len(options);options=options[shift:]+options[:shift]
            chosen=(['danger'] if 'danger' in layers else [])+options
            # Three live layers, as authored; danger always occupies the first slot.
            chosen=chosen[:3]
        else:chosen=priority
        selected=[]
        for key in chosen:
            if not brief and len(lines)>=limit:break
            line=layers.get(key)
            if line and line['text'] not in seen:
                lines.append(line);seen.add(line['text']);selected.append(key)
        # A remembered person does not establish their current presence.
        for npc,line in zip(present,people_lines):
            if any(npc['name'] in layers[key]['text'] for key in selected if key in ('activity','weather','arrival')):continue
            text=npc['name']+' está aquí.' if brief else line['text']
            if text not in seen:lines.append(event('world',text));seen.add(text)
        echoes=[item.get('text') if isinstance(item,dict) else item for item in room.get('echoes',[]) if not isinstance(item,dict) or self.allowed(item,state,world)]
        stayed=self.clock()-state.get('arrived_at',self.clock())
        if mode=='navigation' and echoes and stayed>=60 and 'danger' not in layers and not state.get('combat'):
            window=int((stayed-60)//75)
            if window<len(echoes):lines.append(event('world',echoes[(window+visits)%len(echoes)]))
        return lines

    @staticmethod
    def local_weather(room,ambient):
        weather_name=str(ambient['weather']).lower()
        return room.get('weather',{}).get(weather_name) or (room.get('rain') if weather_name in ('lluvia','tormenta','rain') else room.get('clear') if weather_name in ('despejado','nublado') else None)

    def observe(self,state,room,world):
        for signal in room.get('signals',[]):
            if not self.allowed(signal,state,world) or not signal_present(signal,room,world,self.clock()):continue
            creature_id=signal['creature'];creature=self.creature_prose(room,creature_id)
            if creature and creature.get('combatant_kind')!='human':
                state['bestiary'].setdefault(creature_id,{'id':creature_id,'name':creature['name'],'description':creature.get('description',signal['text']),'first_seen':self.clock(),'status':'avistado'})

    def learn_creature_behavior(self,state,room,creature_id,quiet=False):
        creature=self.creature_prose(room,creature_id)
        if creature.get('combatant_kind')=='human':return
        entry=state['bestiary'][creature_id]
        learned=entry.setdefault('behavior',[])
        for field in ('warning','presagio','habitat'):
            text=creature.get(field)
            if isinstance(text,str) and text.strip() and text!=entry.get('description') and text not in learned:
                learned.append(text)
                state['events'].append(event('discovery','Aprendes algo nuevo: '+text))
                return
        if not quiet:state['events'].append(event('action',f"Ya conoces todos los datos de conducta disponibles aquí sobre {creature['name']}."))

    def tick_shared(self,participants,world):
        if len(participants)==1:return self.tick(participants[0],world)
        now=self.clock();key=f"{participants[0]['state']['location']}:{participants[0]['state']['combat']['creature']}"
        animal=world.setdefault('creature_states',{}).setdefault(key,{})
        animal.setdefault('hp',min(p['state']['combat']['hp'] for p in participants))
        due=min(p['state']['combat']['next_round'] for p in participants)
        changed=False
        for _ in range(min(60,max(0,int((now-due)//4)+1))):
            active=[p for p in participants if p['state']['combat']]
            if not active:break
            owner=world.setdefault('encounters',{}).get(key)
            primary=next((p for p in active if p['id']==owner),active[0]);world['encounters'][key]=primary['id']
            creature_id=primary['state']['combat']['creature'];creature=self.creature_prose(self.room(primary,world),creature_id)
            prepared=primary['state']['combat'].get('prepared',False);responses=[]
            for player in active:
                state=player['state'];combat=state['combat'];combat['hp']=animal['hp'];combat['prepared']=prepared
                if combat.get('intervention',{}).get('id')=='abrir_salida':
                    animal['escape_open']=True
                    for person in active:self.withdraw_animal(person,world,creature_id)
                    return True
                chosen=combat.get('intervention',{}).get('id','atacar')
                has_weapon=bool(state['equipment'].get('weapon'))
                class_action_ids={a['id'] for a in m.CLASS_ACTIONS.get(player['class_id'],[])}
                contribution=(chosen=='atacar' and has_weapon) or chosen=='capacidad' or chosen in class_action_ids or (player is primary and chosen in ('defender','esquivar','bloquear','resistir'))
                state['_class']=player['class_id'];lines,outcome=m.resolve_round(state,creature,self.rng,respond=False);state.pop('_class',None)
                state['events']=lines;state['last_active']=now;changed=True
                if outcome=='fled':self.flee(player,world);continue
                combat['eligible']=combat.get('eligible',False) or contribution;animal['hp']=max(0,combat['hp']);prepared=combat.get('prepared',False)
                responses.append((player,combat.get('_response',{})));combat['next_round']=due+4
                if animal['hp']<=0:
                    eligible=[p for p in active if p['state']['combat'] and p['state']['combat'].get('eligible')]
                    group=1 if len(eligible)==1 else .8 if len(eligible)==2 else .7 if len(eligible)==3 else .6
                    for index,person in enumerate(eligible):self.victory(person,world,person['state']['combat'],creature,group,index==0)
                    for person in active:
                        if person['state']['combat']:person['state']['combat']=None
                    return True
            remaining=[p for p in active if p['state']['combat']]
            if not remaining:world['encounters'].pop(key,None);break
            if not primary['state']['combat']:primary=remaining[0];world['encounters'][key]=primary['id']
            state=primary['state'];combat=state['combat'];reply=next((r for p,r in responses if p['id']==primary['id']),{})
            accuracy=reply.get('accuracy',combat['profile']['accuracy'])
            for player,response in responses:
                if player is primary:continue
                if player['class_id'] in ('arcano','sombra','artifice') and any('Usas ' in event['text'] for event in player['state']['events']):accuracy=min(accuracy,response.get('accuracy',accuracy))
            if self.rng.random()*100<m.clamp(accuracy,20,90):
                damage=max(1,m.rounded(combat['profile']['damage']*(1-reply.get('reduction',0))*(1-state.get('armor_reduction',0))*(1-reply.get('guard',0))))
                state['hp']-=damage;m.wound(state,damage);state['events'].append(event('combat',m.creature_prose(creature,'hit',damage,combat['round'])))
                if state['hp']<=0:self.death(primary,world)
            else:
                state['events'].append(event('combat',m.creature_prose(creature,'miss',0,combat['round'])))
                for player,response in responses:
                    if player['class_id']=='sombra' and (response.get('signature') or response.get('action')=='borrar_foco') and player['state']['combat']:
                        player['state']['combat']['opening']=True
                        player['state']['events'].append(event('combat','Su respuesta falla. Tienes una apertura para tu siguiente ataque básico.'))
            for player in remaining:
                if player['state']['combat']:player['state']['combat'].update(hp=animal['hp'],prepared=False)
            due+=4
        return changed

    def tick(self,character,world):
        state=character['state'];now=self.clock();combat=state['combat'];changed=False
        if not combat:
            elapsed=max(0,now-state['last_active']);previous_fatigue=state['fatigue'];state['fatigue']=max(0,state['fatigue']-math.floor(elapsed/10));state['last_active']+=math.floor(elapsed/10)*10
            return state['fatigue']<previous_fatigue
        # Persist every due round exactly once; reconnect does not pause combat.
        rounds=min(60,max(0,int((now-combat['next_round'])//4)+1))
        for _ in range(rounds):
            if not state['combat']:break
            combat=state['combat'];state['_class']=character['class_id']
            creature=self.creature_prose(self.room(character,world),combat['creature'])
            if combat.get('intervention',{}).get('id')=='abrir_salida':
                world.setdefault('creature_states',{}).setdefault(f"{state['location']}:{combat['creature']}",{})['escape_open']=True
                self.withdraw_animal(character,world,combat['creature']);changed=True;break
            lines,outcome=m.resolve_round(state,creature,self.rng);state.pop('_class',None);state['events']=lines;changed=True
            world.setdefault('creature_states',{}).setdefault(f"{state['location']}:{combat['creature']}",{}).update(hp=max(0,combat['hp']))
            if outcome=='victory':self.victory(character,world,combat,creature)
            elif outcome=='death':self.death(character,world)
            elif outcome=='fled':
                world.setdefault('encounters',{}).pop(f"{state['location']}:{combat['creature']}",None);self.flee(character,world)
            else:combat['next_round']+=4
        state['last_active']=now
        return changed

    def flee(self,character,world):
        state=character['state'];room=self.room(character,world)
        destinations=list(room.get('exits',{}).values())
        self.clear_attention(character,world)
        if destinations:
            previous=state.get('last_room')
            destination=previous if previous in destinations else destinations[0]
            self.visit(state,destination)
            self.observe(state,self.room(character,world),world)
            state['events'].append(event('action',f"Recuperas distancia en {self.room(character,world)['name']}."))

    def victory(self,character,world,combat,creature,group=1,salvage=True):
        # A resolved encounter cannot credit this character twice, including a repeated tick.
        if character['state']['combat'] is not combat:return
        creature=self.creature_prose(self.room(character,world),combat['creature'])
        self.clear_attention(character,world)
        state=character['state'];profile=combat['profile'];family=profile['family'];history=(state['victories']+[family])[-10:];count=history.count(family);multiplier=1 if count<=3 else .6 if count<=5 else .25
        coefficient={'trivial':.02,'favorable':.07,'comparable':.12,'peligroso':.20,'abrumador':.25}[profile['category']]
        gain=m.rounded(min(m.xp_next(profile['level'])*coefficient,.25*m.xp_next(state['level']))*multiplier*group)
        state['xp']+=gain;state['victories']=history;state['combat']=None
        world.setdefault('encounters',{}).pop(f"{state['location']}:{combat['creature']}",None)
        if creature.get('combatant_kind')=='human':
            amount=creature.get('seal_reward',4)+2*(profile['level']-1)
            if type(amount) is not int or amount<1:raise RuleError('El adversario no tiene una recompensa de sellos válida.',409)
            state['seals']+=amount
            state['ledger'].append({'kind':'combat_seals','creature':combat['creature'],'room':state['location'],'at':self.clock(),'amount':amount})
            state['events'].append(event('world',creature.get('defeat_text',f"{creature['name']} deja de impedirte el paso. El enfrentamiento ha terminado; ya puedes decidir por dónde seguir.")))
            state['events'].append(event('reward',f"Vences a {creature['name']}. Ganas {gain} XP y {amount} sellos."))
        else:
            if creature.get('defeat_text'):state['events'].append(event('world',creature['defeat_text']))
            state['events'].append(event('reward',f"Vences a {creature['name']}. Ganas {gain} XP; este enfrentamiento no entrega sellos."))
        while state['level']<100 and state['xp']>=m.xp_next(state['level']):
            old_max=m.hp_max(state);state['xp']-=m.xp_next(state['level']);state['level']+=1;state['pa']+=2;state['hp']=min(m.hp_max(state),state['hp']+m.hp_max(state)-old_max)
            if state['level']%5==0:state['pp']+=1
            state['events'].append(event('reward',f"Alcanzas nivel {state['level']}. Dispones de puntos de atributo para decidir tu formación."))
        deathkey=f"{state['location']}:{combat['creature']}";world['deaths'][deathkey]=self.clock()+300
        world.setdefault('creature_states',{}).pop(deathkey,None)
        local_victory=f"victoria:{state['location']}:{combat['creature']}"
        if local_victory not in state['flags']:state['flags'].append(local_victory)
        for flag in creature.get('victory_flags',[]):
            if flag not in state['flags']:state['flags'].append(flag)
        self.update_quests(state,world,{'id':'vencer','target':combat['creature']})
        material=creature.get('material')
        if salvage and creature.get('loot'):
            # Every rival leaves something worth carrying back to a buyer; repeated farming yields less.
            for drop in creature['loot']:
                if drop.get('item') in self.content.items and self.rng.random()<min(1,drop.get('chance',1)*(1+.15*(profile['level']-1)))*max(multiplier,.5):
                    self.add_item(state,drop['item']);state['events'].append(event('reward',drop.get('text') or f"Recoges {self.content.items[drop['item']]['name']}."))
        elif creature.get('combatant_kind')!='human' and salvage and material and profile['level'] in (1,2) and self.rng.random()<.7*multiplier:
            item_id=material.get('id') if isinstance(material,dict) else material
            if item_id in self.content.items:
                self.add_item(state,item_id)
                state['events'].append(event('reward',f"Recuperas una unidad de {self.content.items[item_id]['name']}."))

    def nearest_settlement(self,location):
        towns={region['settlement'] for region in self.content.regions.values()}
        queue=[(location,0)];seen={location}
        for place,distance in queue:
            if place in towns:return place,distance
            for destination in self.content.rooms.get(place,{}).get('exits',{}).values():
                if destination not in seen:
                    seen.add(destination);queue.append((destination,distance+1))
        raise RuleError('No hay un pueblo accesible desde este lugar.',409)

    def death(self,character,world):
        self.clear_attention(character,world)
        state=character['state'];room=self.room(character,world);destination,distance=self.nearest_settlement(state['location'])
        recovery={'from':state['location'],'from_name':room['name'],'to':destination,'to_name':self.content.rooms[destination]['name'],'distance':distance,'at':self.clock()}
        state['last_recovery']=recovery
        world.setdefault('encounters',{}).pop(f"{state['location']}:{state['combat']['creature']}",None)
        state['combat']=None;state['hp']=.6*m.hp_max(state);state['fatigue']=40;state['rest_budget']=None
        state['wound']={'grave':'moderada','moderada':'leve','leve':None,None:None}[state['wound']]
        self.visit(state,destination,mark_route=False);state['events'].append(event('danger',f"Caes en {room['name']}. Recuperas el conocimiento en {recovery['to_name']}, el pueblo más cercano, a {distance} tramos del lugar de la derrota. Es un traslado de recuperación; conservas tu progreso."))

    def clear_attention(self,character,world):
        state=character['state'];key=state.pop('wildlife_target',None)
        if key:
            animal=world.get('creature_states',{}).get(key,{})
            animal['attention']=[owner for owner in animal.get('attention',[]) if owner!=character['id']]
            if not animal['attention']:animal.pop('stage',None)

    def withdraw_animal(self,character,world,target):
        state=character['state'];key=f"{state['location']}:{target}"
        animal=world.setdefault('creature_states',{}).setdefault(key,{})
        animal['stage']='sheltered';animal.setdefault('attention',[])
        if character['id'] not in animal['attention']:animal['attention'].append(character['id'])
        state['wildlife_target']=key;state['combat']=None
        world.setdefault('encounters',{}).pop(key,None)
        state['events']=[event('danger','El Mordelinde aprovecha el paso libre y se recoge entre la maleza y su refugio. No vuelve para perseguirte.')]

    def visit(self,state,destination,mark_route=True):
        previous=state['location']
        if mark_route and previous!=destination:
            pair=sorted((previous,destination))
            if pair not in state['routes']:state['routes'].append(pair)
        state['last_room']=previous;state['location']=destination;state['arrival']=True;state['arrived_at']=self.clock()
        for key in ('known','visited'):
            if destination not in state[key]:state[key].append(destination)
        state['visits'][destination]=state['visits'].get(destination,0)+1

    def add_item(self,state,item_id):
        if self.content.items[item_id].get('kind')=='weapon':
            state['inventory'].append(dict(self.content.items[item_id],catalog_id=item_id,id=item_id+':'+uuid.uuid4().hex,quantity=1,condition='intact'))
            return
        existing=next((i for i in state['inventory'] if i['id']==item_id),None)
        if existing:existing['quantity']+=1
        else:state['inventory'].append(dict(self.content.items[item_id],id=item_id,quantity=1))

    def adversary_dialogue(self,creature):
        return creature.get('dialogue') or {
            'exigencia':'La carga se queda aquí. Si quieres seguir, tendrás que buscar otro paso.',
            'salida':'Puedes dar media vuelta. No he cerrado todos los caminos.'}

    def quest_speaker(self,quest,room,state,world):
        return next((npc for npc in self.people(room,state,world,self.ambient(room,world)) if npc['id']==quest.get('npc')),None)

    def quest_reward(self,state,qid,now):
        quest=self.content.quests[qid];family=quest.get('family','valdren_paid_errands')
        repeatable=quest.get('repeatable',qid in ('valdren_recado_forja','valdren_revision_cobertizos','valdren_estado_vado'))
        count=sum(1 for line in state['ledger'] if line.get('family')==family and now-line['at']<3600)
        multiplier=(1 if count<2 else .6 if count<4 else .3) if repeatable else 1
        return family,math.floor(quest['payout']*multiplier)

    def actions(self,character,world):
        state=character['state'];room=self.room(character,world);combat=state['combat'];actions=[]
        if combat:
            actions=[{'id':'atacar','label':'Mantener ataque básico'}, {'id':'huir','label':'Intentar huir'},
                     {'id':'defender','target':'esquivar','label':'Esquivar'},{'id':'defender','target':'resistir','label':'Resistir'}]
            weapon=next((i for i in state['inventory'] if i['id']==state['equipment']['weapon']),{})
            block=next((i for i in state['inventory'] if i['id']==state['equipment']['block']),{})
            if weapon.get('block') or block:actions.append({'id':'defender','target':'bloquear','label':'Bloquear'})
            for item in state['inventory']:
                if item.get('kind')=='consumable' and item.get('effect') in ('potion','basic_provision'):actions.append({'id':'usar','target':item['id'],'label':f"Beber {item['name']} ({item.get('quantity',1)})" if item.get('effect')=='potion' else f"Comer {item['name']} ({item.get('quantity',1)})",'reason':'Gastas la ronda en usarlo; tu rival responde.'})
            penalty,_=m.penalties(state);attributes=state['attributes']
            dodge=.48*(attributes['agilidad']-10)+.12*(attributes['percepcion']-10)-penalty
            resist=max(0,min(.38,.0055*(attributes['resistencia']-10))-penalty/100)
            blocking=max(0,min(.32,.10+.0035*(attributes['destreza']-10))-penalty/100)
            reasons={'esquivar':f'Reduce la precisión del rival en {dodge:g} puntos.' if dodge>0 else 'Tus atributos y estado actuales no dan ventaja a la esquiva.',
                     'resistir':f'Reduce el daño recibido un {resist*100:g}%.' if resist>0 else 'Tu resistencia y estado actuales no reducen el daño con esta defensa.',
                     'bloquear':f'Reduce el daño recibido un {blocking*100:g}%.' if blocking>0 else 'Tu estado actual anula la reducción del bloqueo.'}
            for defense in actions:
                if defense['id']=='defender':defense['reason']=reasons[defense['target']]
            cls=character['class_id'];context=room.get('combat_context',{})
            prepared=m.preparation(combat)
            class_acts=[]
            for act in m.CLASSES.get(cls,{}).get('actions',[]):
                aid=act['id']
                cd=combat.get('cooldowns',{}).get(aid,0)
                if act.get('signature') and combat.get('cooldown',0)>cd:cd=combat['cooldown']
                valid=True;invalid_reason=''
                if aid=='guardia_comprometida':
                    if not (weapon.get('block') or block):valid=False;invalid_reason='Tu equipo no permite esa respuesta: necesitas arma con guardia o escudo.'
                    elif prepared and not prepared.get('frontal',False):valid=False;invalid_reason='Esta acción preparada no es frontal; la guardia no puede responderla.'
                elif aid=='paso_ruptura':
                    if not weapon:valid=False;invalid_reason='Sin un arma activa no puedes ejecutar el paso de ruptura.'
                elif aid=='impulso_arcano':
                    if not weapon.get('focus'):valid=False;invalid_reason='Necesitas un foco arcano para canalizar el impulso.'
                    elif prepared and not prepared.get('interruptible',False):valid=False;invalid_reason='Esta acción preparada no puede interrumpirse.'
                elif aid in ('velo_contencion','destello_frio'):
                    if not weapon.get('focus'):valid=False;invalid_reason='Necesitas un foco arcano para esta capacidad.'
                elif aid=='borrar_foco':
                    if not context.get('focus_break_possible',True):valid=False;invalid_reason='El entorno no permite romper la línea visual.'
                elif aid=='golpe_apertura':
                    if not weapon:valid=False;invalid_reason='Sin un arma activa no puedes ejecutar el golpe.'
                elif aid=='tiro_interrupcion':
                    if not weapon.get('ranged'):valid=False;invalid_reason='Necesitas un arma a distancia para el tiro.'
                    elif not context.get('line_of_fire',True):valid=False;invalid_reason='No tienes línea de tiro despejada.'
                elif aid=='balsamo_campo':
                    if state['hp']>=m.hp_max(state) and state['fatigue']<=0:valid=False;invalid_reason='No tienes heridas ni fatiga que aliviar.'
                disabled=bool(cd) or (not valid)
                reason=f"Recarga: {cd} rondas" if cd else (invalid_reason if not valid else act['description'])
                class_acts.append({'id':aid,'label':act['label'],'description':act['description'],'disabled':disabled,'reason':reason})
            actions=[actions[0]]+class_acts+actions[1:]
            if combat['creature']=='mordelinde' and room.get('combat_context',{}).get('escape_can_be_opened'):
                actions.insert(0,{'id':'abrir_salida','label':'Dejar libre la salida del Mordelinde'})
            if combat.get('intervention'):
                for available in actions:
                    available['disabled']=True;available['reason']='Tu decisión está preparada para esta ronda.'
            return actions
        actions=[{'id':'mirar','label':'Mirar'},{'id':'observar','label':'Observar'}]
        if (self.content.regions[room['region']].get('search') and room['kind'] in ('road','wilderness','landmark') and not room.get('safe',False)) or room.get('hallazgos'):
            remaining=state.get('searches',{}).get(room['id'],-60)+60-self.clock()
            actions.append({'id':'buscar','label':'Buscar alrededor','disabled':remaining>0,'reason':f'Ya revisaste este lugar. Puedes buscar de nuevo en {int(remaining)+1} s.' if remaining>0 else 'Revisar suelo, refugios y objetos que hayan quedado en el camino.'})
        for attribute,value in state['attributes'].items():
            cost=1 if value<20 else 2 if value<35 else 3 if value<45 else 4 if value<60 else 5
            if state['pa']>=cost:actions.append({'id':'atributo','target':attribute,'label':f'Mejorar {attribute} · {cost} PA','confirmation':f'Aumentar {attribute} de {value} a {value+1} por {cost} PA. No podrás deshacerlo.'})
        actions += [{'id':'examinar','target':key,'label':f'Examinar {key}'} for key,value in room.get('examine',{}).items() if not isinstance(value,dict) or self.allowed(value,state,world)]
        actions += [{'id':'mirar_direccion','target':direction,'label':f'Mirar hacia el {direction}'} for direction in room.get('look',{}) if direction in room.get('exits',{})]
        for direction,destination in room.get('exits',{}).items():
            gate=room.get('exit_requirements',{}).get(direction,{})
            _,origin=self.region_for(character['species'])
            gate_open=destination==origin['settlement'] or destination in state['visited'] or self.allowed(gate,state,world)
            actions.append({'id':'mover','target':direction,'label':f"{direction.capitalize()} · {self.content.rooms[destination]['name'] if destination in state['visited'] else 'Salida por explorar'}",'disabled':not gate_open,'reason':gate.get('text','Solicita permiso antes de entrar.') if not gate_open else ''})
        _,region=self.region_for(character['species'])
        if state['location']==region['settlement']:actions.append({'id':'mover','target':'hogar','label':'Regresar a tu hogar'})
        if room.get('safe',room['kind'] in ('home','settlement','interior')):
            rested=state.copy();healing=m.rest(rested);relief=state['fatigue']-rested['fatigue']
            changes=([f'+{healing:g} vida'] if healing>0 else [])+([f'−{relief:g} fatiga'] if relief>0 else [])
            reason='' if changes else ('Ya estás sin fatiga y con toda tu vitalidad.' if state['hp']>=m.hp_max(state) else 'El descanso ya no recupera más vida. Puedes usar una provisión o buscar cuidados.')
            actions.append({'id':'descansar','label':'Descansar'+(' · '+' · '.join(changes) if changes else ''),'disabled':not changes,'reason':reason})
        for npc in self.people(room,state,world,self.ambient(room,world)):
            actions += [{'id':'hablar','target':npc['id'],'topic':topic,'label':f"{npc['name']} · {value.get('label',topic) if isinstance(value,dict) else topic}"} for topic,value in npc.get('topics',{}).items() if not isinstance(value,dict) or self.allowed(value,state,world)]
        for item in room.get('actions',[]):
            if self.allowed(item,state,world):actions.append({'id':item['id'],'label':item['label']})
        for signal in room.get('signals',[]):
            cid=signal['creature']
            if cid in self.content.creatures and self.allowed(signal,state,world) and signal_present(dict(signal,persistent_trace=False),room,world,self.clock()):
                actions.append({'id':'examinar_criatura','target':cid,'label':f"Examinar {self.creature_prose(room,cid)['name']}"})
                creature=self.creature_prose(room,cid)
                if creature.get('combatant_kind')=='human' and f"{state['location']}:{cid}" not in world.get('encounters',{}):
                    npc_topics={(npc['name'],topic) for npc in self.people(room,state,world,self.ambient(room,world)) for topic,value in npc.get('topics',{}).items() if not isinstance(value,dict) or self.allowed(value,state,world)}
                    for topic,text in self.adversary_dialogue(creature).items():
                        if isinstance(text,str) and (creature['name'],topic) not in npc_topics:actions.append({'id':'hablar_adversario','target':cid,'topic':topic,'label':f"Hablar con {creature['name']} · {topic}"})
            if cid in m.PROFILES and (cid in state['bestiary'] or self.content.creatures.get(cid,{}).get('combatant_kind')=='human') and self.allowed(signal,state,world) and signal_present(dict(signal,persistent_trace=False),room,world,self.clock()):actions.append({'id':'evaluar','target':cid,'label':f"Evaluar {self.creature_prose(room,cid)['name']}"})
            key=f"{state['location']}:{cid}"
            if cid in m.PROFILES and cid in self.content.creatures and self.allowed(signal,state,world) and signal_present(dict(signal,persistent_trace=False),room,world,self.clock()) :
                warned=state.get('wildlife_target')==key or key in world.get('encounters',{})
                if m.PROFILES[cid]['category'] in m.AVOIDABLE_CATEGORIES and not warned:
                    actions.append({'id':'acercarse','target':cid,'label':f"Observar de cerca a {self.creature_prose(room,cid)['name']}"})
                else:
                    actions.append({'id':'combatir','target':cid,'label':('Insistir en enfrentarte a ' if m.PROFILES[cid]['category'] in m.AVOIDABLE_CATEGORIES else 'Enfrentarte a ')+self.creature_prose(room,cid)['name']+(f" · nivel {m.scaled(m.PROFILES[cid],signal.get('level'))['level']}" if signal.get('level') else '')})
                if m.PROFILES[cid]['category'] in m.AVOIDABLE_CATEGORIES and warned:actions.append({'id':'retirarse','target':cid,'label':'Retirarte antes del enfrentamiento'})
        for qid,q in self.content.quests.items():
            if q.get('accept_room')==state['location']:
                instance=state['quests'].get(qid)
                speaker=self.quest_speaker(q,room,state,world)
                absent=bool(q.get('npc') and not speaker)
                quest_npc=self.content.npcs.get(q.get('npc'),{})
                absence_reason=f"{quest_npc.get('name','Quien ofrece el encargo')} no está aquí ahora. Vuelve cuando esté presente."
                if quest_npc.get('schedule'):absence_reason+=' Su horario aquí es de '+', '.join(quest_npc['schedule'])+'.'
                if instance and instance['status']=='paid' and not q.get('repeatable',qid in ('valdren_recado_forja','valdren_revision_cobertizos','valdren_estado_vado')):continue
                actions.append({'id':'cobrar' if instance and instance['status']=='ready' else 'aceptar','target':qid,'label':('Entregar ' if instance and instance['status']=='ready' else 'Aceptar ')+q['name'],'disabled':absent or bool(instance and (instance['status']=='accepted' or (instance['status']=='paid' and not q.get('repeatable',qid in ('valdren_recado_forja','valdren_revision_cobertizos','valdren_estado_vado'))))),'reason':absence_reason if absent else ('El encargo está en marcha; completa la tarea antes de entregarlo.' if instance and instance['status']=='accepted' else '')})
        for category,item_id in state['equipment'].items():
            if item_id:actions.append({'id':'desequipar','target':category,'label':{'weapon':'Guardar arma','armor':'Quitar armadura','block':'Guardar escudo'}.get(category,'Quitar pieza de '+m.SLOT_NAMES.get(category,category))})
        forge=bool(room.get('forge_service') and any(n['id']==room['forge_service'] for n in self.people(room,state,world,self.ambient(room,world))))
        for item in state['inventory']:
            if forge and item.get('kind')=='weapon' and item.get('activated',True) and item.get('condition','intact')=='intact' and not item.get('honed'):
                actions.append({'id':'afinar','target':item['id'],'label':f"Afinar {item['name']} · 12 sellos · +1 daño",'disabled':bool(room.get('honing_material') and not self.allowed({'requires_items':{room['honing_material']:1}},state,world)),'reason':('Consume 1 '+self.content.items[room['honing_material']]['name']) if room.get('honing_material') else '', 'confirmation':f"Afinar {item['name']}: daño base {item['damage']} → {item['damage']+1}. Coste: 12 sellos"+(' y 1 '+self.content.items[room['honing_material']]['name'] if room.get('honing_material') else '')+'. Sólo una vez por pieza. No activa ni valida Forja.'})
            if forge and item.get('condition')=='damaged_event':actions.append({'id':'reparar','target':item['id'],'label':'Reparar '+item['name']+' · 8 sellos'})
            catalog=self.content.items.get(item.get('catalog_id',item['id']),{})
            if forge and catalog.get('kind')=='weapon' and item['id'] not in state['equipment'].values() and item.get('condition','intact')=='intact' and sum(i.get('quantity',1) for i in state['inventory'] if i.get('kind')=='weapon' and i.get('activated',True) and i.get('condition','intact')=='intact')>1:
                actions.append({'id':'vender','target':item['id'],'label':f"Vender {item['name']} · {catalog['sell_price']} sellos",'confirmation':f"¿Vender {item['name']} por {catalog['sell_price']} sellos?"})
            if item.get('kind') in ('weapon','armor','block','accessory'):actions.append({'id':'equipar','target':item['id'],'label':'Equipar '+item['name'],'disabled':item.get('condition','intact')!='intact' or not item.get('activated',True),'reason':'La pieza necesita reparación.' if item.get('condition','intact')!='intact' else 'La pieza requiere validación de Forja.' if not item.get('activated',True) else ''})
            if item.get('kind')=='consumable':actions.append({'id':'usar','target':item['id'],'label':'Usar '+item['name']})
            if item.get('kind') in ('armor','accessory','consumable') and room.get('buys_gear') and item['id'] not in state['equipment'].values() and isinstance(item.get('sell_price'),int) and any(n['id']==room.get('buyer') for n in self.people(room,state,world,self.ambient(room,world))):actions.append({'id':'vender','target':item['id'],'label':f"Vender {item['name']} · {item['sell_price']} sellos"})
            if item.get('kind')=='material' and room.get('buyer') and ('buy_items' not in room or item.get('catalog_id',item['id']) in room['buy_items']) and isinstance(item.get('sell_price'),int) and 0<item['sell_price']<=60 and any(n['id']==room['buyer'] for n in self.people(room,state,world,self.ambient(room,world))):actions.append({'id':'vender','target':item['id'],'label':f"Vender {item['name']} · {item['sell_price']} sellos"})
        recovery_present=not room.get('recovery_npc') or any(n['id']==room['recovery_npc'] for n in self.people(room,state,world,self.ambient(room,world)))
        if room.get('recovery_service') and recovery_present and room.get('safe',room['kind'] in ('home','settlement','interior')):
            no_effect=state['hp']>=.9*m.hp_max(state) and state['fatigue']==0 and state['wound'] is None and state['rest_budget'] is None
            actions.append({'id':'recuperacion','label':'Servicio de recuperación · 18 sellos','disabled':no_effect,'reason':'No necesitas atención ahora.' if no_effect else ''})
        for item_id in room.get('shop',[]):
            item=self.content.items.get(item_id)
            if item and 'price' in item and (not room.get('forge_service') or forge):
                details=[]
                if item.get('kind')=='weapon':
                    details.append(f"daño base {item['damage']}")
                    for key,value in item.get('bonus',{}).items():details.append(f"+{value} {key.replace('dano','daño').replace('precision','precisión')}")
                    if item.get('ranged'):details.append('a distancia')
                    if item.get('focus'):details.append('foco arcano')
                    if item.get('block'):details.append('permite bloquear')
                    active=next((piece for piece in state['inventory'] if piece['id']==state['equipment'].get('weapon')),None)
                    reference=f" Tu arma activa tiene {active['damage']} de daño base." if active else ' No llevas un arma activa.'
                    explanation='Va a tu mochila; debes equiparla para usarla.'+reference
                elif item.get('kind')=='armor':
                    details.append(f"{m.SLOT_NAMES.get(item.get('slot','torso'))} · −{round(item['armor_reduction']*100)}% daño recibido")
                    explanation=item.get('description','Protege una parte del cuerpo.')
                elif item.get('kind')=='accessory':
                    details.append(m.SLOT_NAMES.get(item.get('slot'),'')+' · '+', '.join(f"+{v} {k.replace('dano','daño').replace('precision','precisión')}" for k,v in item.get('bonus',{}).items()))
                    explanation=item.get('description','')
                elif item.get('effect')=='potion':
                    details.append(', '.join(x for x in (f"+{round(item.get('heal',0)*100)}% vida" if item.get('heal') else '',f"−{item['fatigue']} fatiga" if item.get('fatigue') else '','alivia heridas' if item.get('wound_steps') else '') if x))
                    explanation='Puedes usarla también en mitad de un combate.'
                elif item.get('effect')=='basic_provision':
                    # Same capped recovery as usar; no change to its price or effect.
                    details.append(f"recupera hasta {.18*m.hp_max(state):g} vida; reduce hasta 20 fatiga")
                    explanation='Recuperación limitada por tu vida máxima y fatiga actual. No trata heridas.'
                else:
                    explanation=item.get('description','Va a tu mochila.')
                suffix=' · '+' · '.join(details) if details else ''
                actions.append({'id':'comprar','target':item_id,'label':f"Comprar {item['name']} · {item['price']} sellos{suffix}",'reason':explanation})
        # Shop sections: the client groups purchases and sales by what kind of thing they are.
        for choice in actions:
            if choice['id'] not in ('comprar','vender'):continue
            item=self.content.items.get(choice['target']) if choice['id']=='comprar' else next((i for i in state['inventory'] if i['id']==choice['target']),None)
            kind=(item or {}).get('kind')
            choice['category']={'weapon':'armas','armor':'armaduras','accessory':'joyas','consumable':'pociones','material':'materiales'}.get(kind,'otros')
            if kind in ('armor','accessory'):choice['slot']=item.get('slot','torso')
        for choice in actions:
            cost=self.content.items[choice['target']]['price'] if choice['id']=='comprar' else {'afinar':12,'reparar':8,'recuperacion':18}.get(choice['id'])
            if cost is None:continue
            choice['cost']=cost
            if state['seals']<cost and not (choice['id']=='recuperacion' and choice.get('disabled')):
                choice.update(disabled=True,reason=f"Te faltan {cost-state['seals']} sellos.")
        story_ids={item['id'] for item in room.get('actions',[])}
        actions.sort(key=lambda action:0 if action['id'] in story_ids or action['id'] in ('cobrar','examinar_criatura','buscar','combatir','acercarse','retirarse') else 1)
        return actions

    def parse_intent(self,character,world,intent):
        if intent.get('id')=='decir':return intent
        if 'text' not in intent:return intent
        text=intent['text']
        if not isinstance(text,str) or not 1<=len(text.strip())<=300:raise RuleError('Escribe una acción breve del lugar.')
        def normalize(value):
            value=''.join(c for c in unicodedata.normalize('NFKD',str(value)) if not unicodedata.combining(c)).casefold()
            return ' '.join(re.sub(r'[^\w\s]',' ',value).split())
        if text.strip().casefold().startswith('decir '):return {'id':'decir','text':text.strip()[6:]}
        typed=normalize(text);state=character['state'];room=self.room(character,world);matches=[]
        if typed in ('mira','mirar'):typed='mirar'
        if typed in ('ayuda','inventario'):return {'id':typed}
        choices=self.actions(character,world)
        for npc in self.people(room,state,world,self.ambient(room,world)) if not state['combat'] else []:
            if typed in {normalize(prefix+' '+npc['name']) for prefix in ('hablar','hablar con','conversar con')}:
                return {'id':'saludar','target':npc['id']}
        for choice in choices:
            id=choice['id'];target=choice.get('target');aliases={normalize(choice['label'])}
            if target is None:aliases.add(normalize(id))
            if id=='mover':
                aliases.update(normalize(v) for v in (target,'ir '+target,'mover '+target))
                if target=='hogar':aliases.update(('volver a casa','volver al hogar','casa'))
                short={'norte':'n','sur':'s','este':'e','oeste':'o'}
                if target in short:aliases.add(short[target])
            elif id=='examinar':aliases.add(normalize('examinar '+target))
            elif id=='mirar_direccion':aliases.update(normalize(v) for v in ('mirar '+target,'mirar al '+target,'mirar hacia el '+target))
            elif id=='hablar':
                npc=self.content.npcs.get(target,{})
                for prefix in ('hablar','hablar con','conversar con'):
                    aliases.add(normalize(prefix+' '+npc.get('name',target)+' '+choice['topic']))
            elif id=='hablar_adversario':
                creature=self.creature_prose(room,target)
                aliases.add(normalize('hablar con '+creature['name']+' '+choice['topic']))
                aliases.add(normalize('hablar '+creature['name']+' '+choice['topic']))
            elif id=='defender':aliases.add(normalize(target))
            elif id in ('equipar','usar','comprar','vender','reparar','afinar'):
                item=self.content.items.get(target) or next((i for i in state['inventory'] if i['id']==target),{})
                aliases.add(normalize(id+' '+item.get('name',target)))
            elif id in ('combatir','evaluar','acercarse','retirarse','examinar_criatura'):
                creature=self.creature_prose(room,target)
                aliases.add(normalize(id+' '+creature.get('name',target)))
                if id=='combatir':aliases.add(normalize('atacar '+creature.get('name',target)))
            if typed in aliases:matches.append(choice)
        if not matches and not state['combat']:
            def keywords(value):return set(normalize(value).split())-{'a','al','la','las','el','los','de','del','en','con','y','un','una'}
            words=keywords(typed)
            for authored in room.get('actions',[]):
                label=keywords(authored['label'])
                water=typed=='nadar' and bool(label&{'nadar','agua','sumergirse'})
                if not ((words and words.issubset(label) and normalize(typed).split()[0]==normalize(authored['label']).split()[0]) or water):continue
                without_species={k:v for k,v in authored.items() if k!='requires_species'}
                if not self.allowed(without_species,state,world):continue
                if not self.allowed(authored,state,world):
                    raise RuleError('Tu especie no puede realizar esa acción. Requiere: '+', '.join(authored['requires_species'])+'.',409)
                matches.append({'id':authored['id']})
        if len(matches)!=1:
            local=[a for a in choices if not a.get('disabled') and (a['id'] in ('mover','examinar') or a['id'] in {item['id'] for item in room.get('actions',[])})]
            suggestions=[a['label'] for a in local[:3]]
            suggestions += [a['label'] for a in choices if not a.get('disabled') and a['label'] not in suggestions][:max(0,3-len(suggestions))]
            raise RuleError('No entiendo esas palabras. Puedes probar: '+'; '.join(suggestions)+'.',409)
        choice=matches[0]
        if choice.get('disabled'):raise RuleError(choice.get('reason') or 'Esa decisión todavía no está disponible.',409)
        result={key:choice[key] for key in ('id','target','topic') if key in choice}
        if intent.get('confirmed'):result['confirmed']=True
        return result

    def apply(self,character,world,intent):
        state=character['state'];room=self.room(character,world);action=intent.get('id');target=intent.get('target')
        if action in ('ayuda','inventario'):
            text='Comandos básicos: mirar, observar, examinar <objeto>, ir <salida>, hablar con <nombre>, inventario.' if action=='ayuda' else 'Inventario: '+('; '.join(f"{item['name']} ({item.get('quantity',1)})" for item in state['inventory']) or 'vacío')+'.'
            state['events']=[event('info',text)];return
        if action=='saludar':
            npc=next((n for n in self.people(room,state,world,self.ambient(room,world)) if n['id']==target),None)
            if not npc or state['combat']:raise RuleError('No puedes conversar con ese personaje ahora.',409)
            topics=[a['topic'] for a in self.actions(character,world) if a['id']=='hablar' and a['target']==target]
            state['events']=[event('npc',npc['name']+': Hola. Temas disponibles: '+(', '.join(topics) or 'ninguno por ahora')+'.')];return
        known_before=set(state['bestiary'])
        candidates=self.actions(character,world)
        if action=='decir':
            text=intent.get('text','')
            if not isinstance(text,str) or not 1<=len(text.strip())<=500:raise RuleError('Escribe un mensaje local de 1–500 caracteres.')
            now=self.clock();presence=world.setdefault('presence',{})
            recipients=[int(key) for key,value in presence.items() if value['room']==state['location'] and now-value['at']<30]
            if character['id'] not in recipients:recipients.append(character['id'])
            message={'id':world.get('chat_sequence',0)+1,'sender_id':character['id'],'sender':character['name'],'text':text.strip(),'at':now,'room':state['location'],'recipients':recipients}
            world['chat_sequence']=message['id'];world.setdefault('chat',[]).append(message)
            state['events']=[event('chat','Envías tu mensaje a quienes están aquí.')];return
        if state['combat'] and action=='capacidad':
            action=m.CLASSES[character['class_id']]['signature_id']
        candidate=next((a for a in candidates if a['id']==action and a.get('target')==target and (a.get('topic') is None or a.get('topic')==intent.get('topic'))),None)
        if not candidate or candidate.get('disabled'):raise RuleError((candidate or {}).get('reason') or 'Esa acción no está disponible en tu situación actual.',409)
        state['events']=[]
        if state['combat']:
            combat=state['combat']
            if combat.get('intervention'):raise RuleError('Ya has decidido tu intervención para esta ronda.',409)
            combat['intervention']={'id':action,'target':target};state['events']=[event('action','Tu decisión queda preparada para la próxima respuesta de tu rival.')]
            return
        if action=='mirar_direccion':
            state['events']=[event('world',room['look'][target])]
        elif action in ('mirar','observar','examinar'):
            if action in ('mirar','observar'):self.observe(state,room,world)
            if action=='observar':
                observations=state.setdefault('observations',{});observations[room['id']]=observations.get(room['id'],0)+1
            if action=='examinar':
                examined=state.setdefault('examined',{}).setdefault(room['id'],[])
                if target not in examined:examined.append(target)
                self.remember_clue(state,room,room.get('examine',{}).get(target))
            state['events']=self.narrative(character,world,action,target)
            if action=='observar':
                state['events'].append(event('action','Observas con atención.'))
                creature_id=next((a['target'] for a in candidates if a['id']=='examinar_criatura' and self.creature_prose(room,a['target']).get('combatant_kind')!='human'),None)
                if creature_id:self.learn_creature_behavior(state,room,creature_id,quiet=True)
        elif action=='buscar':
            self.search(character,world)
        elif action=='examinar_criatura':
            self.observe(state,room,world)
            creature=self.creature_prose(room,target)
            state['events']=[event('world',creature['description'])]
            if creature.get('combatant_kind')!='human':
                state['events'].append(event('discovery',f"{creature['name']} está en tu bestiario."))
                self.learn_creature_behavior(state,room,target)
        elif action=='mover':
            _,region=self.region_for(character['species']);destination=state['home'] if target=='hogar' else room.get('exits',{}).get(target)
            if target=='hogar' and state['location']!=region['settlement']:raise RuleError('Tu hogar no está conectado con este lugar.',409)
            if not destination:raise RuleError('No hay una salida por ahí.')
            self.clear_attention(character,world);self.visit(state,destination);self.encounter(character,world);self.observe(state,self.room(character,world),world);state['events']=self.narrative(character,world)
        elif action=='descansar':
            before=state['fatigue'];healed=m.rest(state);relief=before-state['fatigue']
            changes=([f'recuperas {healed:g} de vida'] if healed>0 else [])+([f'reduces {relief:g} de fatiga'] if relief>0 else [])
            state['events']=[event('action','Descansas: '+' y '.join(changes)+'.')]
            if state['hp']<m.hp_max(state) and state['rest_budget'] is not None and state['rest_budget']<=0:state['events'].append(event('info','El descanso ya no recupera más vida. Para recuperarte más puedes usar una provisión o buscar cuidados.'))
        elif action=='hablar':
            npc=next(n for n in self.people(room,state,world,self.ambient(room,world)) if n['id']==target)
            response=npc['topics'][intent['topic']]
            contextual=response!=self.content.npcs[target].get('topics',{}).get(intent['topic'])
            if isinstance(response,dict):
                if not self.allowed(response,state,world):raise RuleError('Esta conversación todavía no está disponible.',409)
                self.effects(state,world,response);response=response['text']
            memories=[('personal:'+flag,v) for flag,v in npc.get('memory',{}).items() if flag in state['flags'] or 'participated:'+flag in state['flags']]
            memories += [('world:'+flag,v) for flag,v in npc.get('world_memory',{}).items() if flag in world['flags']]
            state['events']=[event('npc',f"{npc['name']}: {response}")]
            if memories:
                memory,text=memories[-1];recollection={'visit':state['visits'].get(room['id'],0),'memory':memory}
                recalled=state.setdefault('dialogue_memories',{})
                if not contextual and recalled.get(target)!=recollection:state['events'].append(event('discovery',text))
                recalled[target]=recollection
        elif action=='hablar_adversario':
            creature=self.creature_prose(room,target);response=self.adversary_dialogue(creature)[intent['topic']]
            state['events']=[event('npc',f"{creature['name']}: {response}"),event('world','Mantienes la distancia. Hablar no te obliga a combatir; las salidas siguen siendo una opción.')]
        elif action=='evaluar':
            signal=next((i for i in room.get('signals',[]) if i['creature']==target),{})
            profile=m.scaled(m.PROFILES[target],signal.get('level')) if target in m.PROFILES else None
            if profile:
                text=f"{self.creature_prose(room,target)['name']}: nivel {profile['level']}. Tu nivel: {state['level']}."
                text+=' '+m.threat_observation(target)
                if state['fatigue']>=70 or state['wound']:text+=' Tu fatiga o herida reduce el margen de seguridad.'
            else:text='Tus observaciones todavía no permiten medir con seguridad este peligro.'
            state['events']=[event('danger',text)]
        elif action=='acercarse':
            key=f"{state['location']}:{target}";state['wildlife_target']=key
            animal=world.setdefault('creature_states',{}).setdefault(key,{})
            animal['stage']='warning';animal.setdefault('attention',[])
            if character['id'] not in animal['attention']:animal['attention'].append(character['id'])
            state['events']=[event('danger',self.creature_prose(room,target).get('warning','El Cornalomo orienta el cuerpo hacia ti y marca su distancia. Todavía puedes apartarte sin entrar en combate.'))]
        elif action=='retirarse':
            self.clear_attention(character,world);state['events']=[event('action',m.peaceful_withdrawal(target))]
        elif action=='combatir':
            signal=next((i for i in room.get('signals',[]) if i['creature']==target),{})
            if target=='mordelinde' and f"{state['location']}:{target}" not in world.get('encounters',{}) and (world.get('creature_states',{}).get(f"{state['location']}:{target}",{}).get('escape_open') or not (signal.get('cornered') or room.get('combat_context',{}).get('creature_cornered'))):
                self.withdraw_animal(character,world,target);return
            profile=m.scaled(m.PROFILES[target],signal.get('level'));creature=self.creature_prose(room,target)
            world.setdefault('encounters',{}).setdefault(f"{state['location']}:{target}",character['id'])
            state['combat']={'creature':target,'profile':profile,'hp':world.get('creature_states',{}).get(f"{state['location']}:{target}",{}).get('hp',profile['hp']),'round':0,'next_round':self.clock()+4,'prepared':profile.get('prepared',False),'cooldown':0}
            self.observe(state,room,world)
            if target in state['bestiary']:state['bestiary'][target]['status']='encontrado'
            state['events']=[event('danger',creature.get('combat_intro',creature.get('warning',f"{creature['name']} responde a tu acercamiento. Puedes intervenir antes de que actúe.")))]
            prepared=m.preparation(state['combat'])
            if prepared and prepared.get('tell'):state['events'].append(event('danger',prepared['tell']))
        elif action=='atributo':
            if not intent.get('confirmed'):raise RuleError('Confirma el atributo, el nuevo valor y el coste antes de gastar PA.',409)
            old_max=m.hp_max(state);value=state['attributes'][target];cost=1 if value<20 else 2 if value<35 else 3 if value<45 else 4 if value<60 else 5
            state['pa']-=cost;state['attributes'][target]+=1;state['hp']=min(m.hp_max(state),state['hp']+max(0,m.hp_max(state)-old_max));state['events']=[event('reward',f'Tu formación mejora {target}.')]
        elif action=='equipar':
            item=next(i for i in state['inventory'] if i['id']==target)
            if item.get('condition','intact')!='intact':raise RuleError('La pieza necesita reparación antes de equiparse.',409)
            if not item.get('activated',True):raise RuleError('La pieza requiere validación de Forja.',409)
            category=item.get('slot',item['kind']) if item['kind'] in ('armor','accessory') else item['kind']
            if item['kind']=='armor' and not 0<=item.get('armor_reduction',0)<=.35:raise RuleError('La armadura supera los límites mecánicos.',409)
            if category not in ('weapon','block','armor',*m.ARMOR_SLOTS,*m.ACCESSORY_SLOTS):raise RuleError('La pieza no tiene un lugar donde llevarse.',409)
            if category=='torso' and state['equipment'].get('armor'):state['equipment']['armor']=None
            state['equipment'][category]=target
            state['armor_reduction']=m.armor_total(state);state['hp']=min(state['hp'],m.hp_max(state))
            state['events']=[event('action',f"Te pones {item['name']}." if item['kind'] in ('armor','accessory') else f"Dejas listo {item['name']}.")]
        elif action=='desequipar':
            state['equipment'][target]=None
            state['armor_reduction']=m.armor_total(state);state['hp']=min(state['hp'],m.hp_max(state))
            state['events']=[event('action','Guardas la pieza sin perder su propiedad.')]
        elif action=='aceptar':
            quest=self.content.quests[target]
            payout=quest.get('payout')
            if not isinstance(payout,int) or not 0<=payout<=24:raise RuleError('El encargo no tiene una recompensa válida.',409)
            state['quests'][target]={'status':'accepted','accepted_at':self.clock(),'visited':[],'actions':[]}
            speaker=self.quest_speaker(quest,room,state,world)
            text=quest.get('accept_text',f"Aceptas {quest['name']}.")
            dialogue=quest.get('accept_dialogue')
            state['events']=[event('npc',speaker['name']+': '+dialogue)] if speaker and dialogue else [event('action',text)]
            state['events'].append(event('action',f"Anotas el encargo para volver con lo que te han pedido. El pago de referencia es de {payout} sellos."))
        elif action=='cobrar':
            quest=self.content.quests[target];instance=state['quests'][target];now=self.clock()
            family,amount=self.quest_reward(state,target,now)
            state['seals']+=amount;state['ledger'].append({'kind':'errand','family':family,'quest':target,'at':now,'amount':amount});instance['status']='paid'
            paid_flag='encargo_pagado:'+target
            if paid_flag not in state['flags']:state['flags'].append(paid_flag)
            speaker=self.quest_speaker(quest,room,state,world)
            delivery=quest.get('delivery_text')
            state['events']=([event('world',delivery)] if delivery else [])
            if quest.get('payment_dialogue') and speaker:state['events'].append(event('npc',speaker['name']+': '+quest['payment_dialogue']))
            state['events'].append(event('reward',f"Entregas el encargo «{quest['name']}». "+(f"{speaker['name']} te paga {amount} sellos." if speaker else f"Recibes {amount} sellos.")))
            if amount<quest['payout']:state['events'].append(event('info','El pago es menor porque has cobrado varios encargos de esta misma clase en la última hora.'))
        elif action=='recuperacion':
            if state['seals']<18:raise RuleError('Necesitas 18 sellos para el servicio.',409)
            if state['hp']>=.9*m.hp_max(state) and state['fatigue']==0 and state['wound'] is None and state['rest_budget'] is None:raise RuleError('El servicio no tendría efecto ahora.',409)
            state['seals']-=18;state['hp']=max(state['hp'],.9*m.hp_max(state));state['fatigue']=0;state['wound']={'grave':'moderada','moderada':'leve','leve':None,None:None}[state['wound']];state['rest_budget']=None
            state['ledger'].append({'kind':'recovery','amount':-18,'at':self.clock()});state['events']=[event('action','La atención del servicio te permite preparar la siguiente salida.')]
        elif action=='comprar':
            item=self.content.items[target];price=item['price']
            if not isinstance(price,int) or price<0 or state['seals']<price:raise RuleError('No tienes sellos suficientes para esta compra.',409)
            state['seals']-=price;self.add_item(state,target);state['ledger'].append({'kind':'purchase','item':target,'amount':-price,'at':self.clock()});state['events']=[event('action',f"Pagas {price} sellos por {item['name']} y lo guardas con tus pertenencias. Te quedan {state['seals']} sellos.")]
            if item.get('kind')=='weapon':state['events'].append(event('info','La pieza está en tu inventario; equiparla será una decisión aparte.'))
        elif action=='afinar':
            item=next(i for i in state['inventory'] if i['id']==target)
            if not intent.get('confirmed'):raise RuleError('Confirma el afinado y su coste antes de pagar.',409)
            if state['seals']<12:raise RuleError('Necesitas 12 sellos para afinar esta pieza.',409)
            material=room.get('honing_material')
            if material:self.effects(state,world,{'consume_items':{material:1}})
            state['seals']-=12;item['damage']+=1;item['honed']=True
            state['ledger'].append({'kind':'honing','item':target,'amount':-12,'at':self.clock()})
            state['events']=[event('action',f"Afinas {item['name']}. Su daño base aumenta a {item['damage']}; pagas 12 sellos.")]
        elif action=='reparar':
            item=next(i for i in state['inventory'] if i['id']==target)
            if state['seals']<8:raise RuleError('Necesitas 8 sellos para reparar esta pieza.',409)
            state['seals']-=8;item['condition']='intact'
            state['ledger'].append({'kind':'repair','item':target,'amount':-8,'at':self.clock()})
            smith=self.content.npcs[room['forge_service']]['name']
            state['events']=[event('action',f"{smith} repara {item['name']} por 8 sellos. La pieza queda en tu inventario.")]
        elif action=='vender':
            item=next(i for i in state['inventory'] if i['id']==target)
            if item.get('kind')=='weapon' and not intent.get('confirmed'):raise RuleError('Confirma la venta de esta arma antes de entregarla.',409)
            catalog=self.content.items.get(item.get('catalog_id',target),item)
            price=catalog['sell_price'];item['quantity']-=1
            if not item['quantity']:state['inventory'].remove(item)
            state['seals']+=price;state['ledger'].append({'kind':'sale','item':target,'amount':price,'at':self.clock()});buyer_id=room.get('forge_service') if item.get('kind')=='weapon' else room.get('buyer')
            buyer=next((npc for npc in self.people(room,state,world,self.ambient(room,world)) if npc['id']==buyer_id),None)
            state['events']=[event('reward',f"Entregas una unidad de {item['name']}"+(f" a {buyer['name']}" if buyer else '')+f" y recibes {price} sellos. Te quedan {state['seals']} sellos.")]
        elif action=='usar':
            item=next(i for i in state['inventory'] if i['id']==target)
            # Recovery quantities must be explicitly source-backed by authored mechanical contract.
            if item.get('effect') not in ('basic_provision','potion'):raise RuleError('El objeto no tiene efecto de recuperación validado.',409)
            if state['hp']>=m.hp_max(state) and state['fatigue']==0 and not (item.get('wound_steps') and state.get('wound')):raise RuleError('No tendría efecto ahora.',409)
            text=m.use_consumable(state,item);item['quantity']-=1
            if not item['quantity']:state['inventory'].remove(item)
            state['events']=[event('action',text)]
        else:
            authored=next(a for a in room.get('actions',[]) if a['id']==action)
            self.effects(state,world,authored)
            if authored.get('next'):
                if authored['next'] not in self.content.rooms:raise RuleError('La escena no tiene un destino válido.',409)
                self.visit(state,authored['next']);self.encounter(character,world);self.observe(state,self.room(character,world),world)
            state['events']=[event('action',authored['text'])]
        for cid in state['bestiary']:
            if cid not in known_before and action!='examinar_criatura':
                state['events'].append(event('discovery',f"Añades {state['bestiary'][cid]['name']} al bestiario."))
        self.update_quests(state,world,intent,room['id'])
        state['last_active']=self.clock()

    def effects(self,state,world,item):
        for item_id,quantity in item.get('give_items',{}).items():
            if item_id not in self.content.items or not isinstance(quantity,int) or not 1<=quantity<=3:raise RuleError('La entrega no tiene un objeto válido.',409)
        for item_id,quantity in item.get('consume_items',{}).items():
            if not isinstance(quantity,int) or quantity<1:raise RuleError('Cantidad de entrega inválida.',409)
            owned=[i for i in state['inventory'] if i.get('catalog_id',i['id'])==item_id and i.get('kind') not in ('weapon','armor','block')]
            if sum(i.get('quantity',1) for i in owned)<quantity:raise RuleError('No tienes los objetos necesarios para esta entrega.',409)
        for item_id,quantity in item.get('consume_items',{}).items():
            for owned in list(state['inventory']):
                if owned.get('catalog_id',owned['id'])!=item_id:continue
                amount=min(quantity,owned['quantity']);owned['quantity']-=amount;quantity-=amount
                if not owned['quantity']:state['inventory'].remove(owned)
                if not quantity:break
        for item_id,quantity in item.get('give_items',{}).items():
            if item_id not in self.content.items or not isinstance(quantity,int) or not 1<=quantity<=3:raise RuleError('La entrega no tiene un objeto válido.',409)
            for _ in range(quantity):self.add_item(state,item_id)
        destination=world['flags'] if item.get('scope','player')=='world' else state['flags']
        for flag in item.get('set_flags',[]):
            if flag not in destination:destination.append(flag)
            if item.get('scope','player')=='world' and 'participated:'+flag not in state['flags']:state['flags'].append('participated:'+flag)
        for known in item.get('discover_rooms',[]):
            if known not in self.content.rooms:raise RuleError('El descubrimiento no pertenece al mundo.',409)
            if known not in state['known']:state['known'].append(known)
        if item.get('journal') and item['journal'] not in state['journal']:state['journal'].append(item['journal'])

    def update_quests(self,state,world,intent,room=None):
        for qid,instance in state['quests'].items():
            if instance['status']!='accepted':continue
            quest=self.content.quests[qid]
            performed={k:intent[k] for k in ('id','target','topic') if k in intent};performed['room']=room or state['location']
            if performed not in instance.setdefault('actions',[]):instance['actions'].append(performed)
            if state['location'] in quest.get('required_rooms',[]) and state['location'] not in instance['visited']:instance['visited'].append(state['location'])
            if set(quest.get('required_rooms',[])).issubset(instance['visited']) and set(quest.get('required_flags',[])).issubset(flags_for(state,world)) and all(any(all(done.get(k)==v for k,v in needed.items()) for done in instance['actions']) for needed in quest.get('required_actions',[])):
                instance['status']='ready';state['events'].append(event('discovery',quest.get('ready_text','El encargo ya puede entregarse.')))

    def snapshot(self,character,world):
        state=character['state'];room=self.room(character,world);ambient=self.ambient(room,world)
        people=self.people(room,state,world,ambient)
        known=set(state['known']);nodes=[]
        home_room=self.room({**character,'state':{**state,'location':state['home']}},world)
        for key in state['known']:
            r=home_room if key==state['home'] else self.content.rooms.get(key)
            if r:
                node={'id':key,'name':r['name'],'region':r['region'],'kind':r['kind'],'visited':key in state['visited']}
                position=self.content.spatial.get('homes',{}).get(r['region']) if key==state['home'] else self.content.spatial.get('positions',{}).get(key)
                if position is not None:node['position']=list(position)
                buyer=r.get('buyer');forge=r.get('forge_service')
                if buyer or forge:
                    node['commerce']={'buys_materials':bool(buyer and buyer in r.get('npcs',[])),'buys_weapons':bool(forge and forge in r.get('npcs',[]))}
                    if buyer in self.content.npcs:node['commerce']['buyer_name']=self.content.npcs[buyer]['name']
                    if forge in self.content.npcs:node['commerce']['smith_name']=self.content.npcs[forge]['name']
                nodes.append(node)
        # Knowledge comes from traversed pairs. Directions come from actual exits,
        # never from an assumed reverse cardinal direction or global coordinates.
        routes=[];origin_region=self.region_for(character['species'])[1]
        for pair in state['routes']:
            if not set(pair).issubset(known) or len(pair)!=2:continue
            for source,destination in (pair,tuple(reversed(pair))):
                exits={'salir':origin_region['settlement']} if source==state['home'] else dict(self.content.rooms.get(source,{}).get('exits',{}))
                if source==origin_region['settlement']:exits['hogar']=state['home']
                for direction,target in exits.items():
                    if target==destination:
                        route={'from':source,'to':destination,'direction':direction}
                        spatial_source=f"home:{home_room['region']}" if source==state['home'] else source
                        spatial_target=f"home:{home_room['region']}" if destination==state['home'] else destination
                        points=self.content.spatial_roads.get((spatial_source,spatial_target))
                        if points:route['points']=[list(point) for point in points]
                        routes.append(route)
        current_exits=dict(room.get('exits',{}))
        if state['location']==origin_region['settlement']:current_exits['hogar']=state['home']
        frontiers=[{'from':state['location'],'direction':direction} for direction in current_exits
                   if not any(r['from']==state['location'] and r['direction']==direction for r in routes)]
        for node in nodes:
            source=node['id']
            if not node['visited']:continue
            exits={'salir':origin_region['settlement']} if source==state['home'] else dict(self.content.rooms.get(source,{}).get('exits',{}))
            if source==origin_region['settlement']:exits['hogar']=state['home']
            node['unexplored_directions']=[direction for direction in exits if not any(route['from']==source and route['direction']==direction for route in routes)]
        combat=state['combat'];safe_combat=None
        if combat:
            creature=self.creature_prose(self.room(character,world),combat['creature'])
            safe_combat={'creature':combat['creature'],'combatant_kind':creature.get('combatant_kind','animal'),'name':creature['name']+(f" · nivel {combat['profile']['level']}" if combat['profile'].get('category') in m.SCALED_CATEGORIES and combat['profile']['level']>1 else ''),'round':combat['round'],'next_round':combat['next_round'],'prepared':combat['prepared'],'prepared_action':m.preparation(combat),'hp':combat['hp'],'hp_max':combat['profile']['hp'],'cooldown':combat['cooldown'],'intervention_pending':bool(combat.get('intervention'))}
            if creature.get('illustration') and creature.get('combatant_kind')=='human':safe_combat['illustration']=creature['illustration']
        char={key:character[key] for key in ('id','name','species','class_id','status')}
        char['gender']=state.get('gender')
        portrait=state.get('portrait')
        if isinstance(portrait,str) and re.fullmatch(r'/client/art/players/[a-z0-9-]+\.webp',portrait):char['portrait']=portrait
        char.update({key:state[key] for key in ('location','level','xp','hp','fatigue','wound','seals','attributes','equipment','pa','pp')})
        char.update(hp_max=m.hp_max(state),xp_next=m.xp_next(state['level']),combat=safe_combat)
        quests=[]
        for qid,instance in state['quests'].items():
            quest=self.content.quests.get(qid)
            if not quest or instance.get('status') not in ('accepted','ready','paid'):continue
            _,reward_current=self.quest_reward(state,qid,self.clock())
            entry={'id':qid,'name':quest['name'],'status':instance['status'],'reward':quest['payout'],'reward_current':reward_current,
                   'summary':quest.get('ready_text','La tarea está lista para entregar.') if instance['status']=='ready' else quest.get('accept_text','Completa el encargo que aceptaste.')}
            if quest['accept_room'] in state['visited']:entry['return_room_name']=self.content.rooms[quest['accept_room']]['name']
            if instance['status']=='paid':
                payments=[line for line in state['ledger'] if line.get('kind')=='errand' and line.get('quest')==qid]
                if payments:entry['paid_amount']=payments[-1]['amount']
                entry['summary']=quest.get('paid_text','Este encargo ya está completado.')
            quests.append(entry)
        return {'version':world['version'],'character':char,'room':{'id':room['id'],'name':room['name'],'region':room['region'],'kind':room['kind'],'description':room['description'],
            **({'art_variant':room['art_variant']} if room.get('art_variant') else {}),
            'npcs':[{'id':n['id'],'name':n['name'],'role':n.get('role',''),'description':n.get('description',''),'topics':[t for t,v in n.get('topics',{}).items() if not isinstance(v,dict) or self.allowed(v,state,world)]} for n in people],
            'exits':[{'direction':d,'label':d.capitalize()} for d in room.get('exits',{})]},
            'presence':[{k:v[k] for k in ('id','name','species','class_id')} for v in world.get('presence',{}).values() if v['id']!=character['id'] and v['room']==state['location'] and self.clock()-v['at']<30],
            'chat':[{k:v[k] for k in ('id','sender_id','sender','text','at')} for v in world.get('chat',[]) if v['room']==state['location'] and self.clock()-v['at']<600 and character['id'] in v['recipients']][-30:],
            'narrative':state['events'] or self.narrative(character,world),'scene':self.narrative(character,world),'actions':self.actions(character,world),
            'map':{'nodes':nodes,'edges':[p for p in state['routes'] if set(p).issubset(known)],'routes':routes,'frontiers':frontiers,**({'recovery':state['last_recovery']} if state.get('last_recovery') else {})},
            'inventory':state['inventory'],'bestiary':[{**entry,'behavior':list(entry.get('behavior',[])),**({'illustration':self.content.creatures[cid]['illustration']} if self.content.creatures.get(cid,{}).get('illustration') else {})} for cid,entry in state['bestiary'].items()],'journal':state['journal'],'secrets':{'found':sum(1 for secret in getattr(self.content,'secrets',{}).values() if secret.get('flag') in state['flags'] or 'participated:'+str(secret.get('flag')) in state['flags'])},'quests':quests,'ambient':ambient}
