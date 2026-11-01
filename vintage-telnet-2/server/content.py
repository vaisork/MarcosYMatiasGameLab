"""Read authored JSON, never import legacy engine modules."""
import json
from pathlib import Path

TABLES = ('regions','rooms','npcs','creatures','stories','items','quests','secrets','recipes')

class Content:
    def __init__(self, root):
        self.root = Path(root)
        self.data = {key:{} for key in TABLES}
        self.fishing={};self.crafting_stations={}
        files = sorted((self.root/'regions').glob('*.json'))
        if (self.root/'world.json').is_file():
            files.insert(0,self.root/'world.json')
        for filename in files:
            document = json.loads(filename.read_text(encoding='utf-8'))
            for table in TABLES:
                for key, value in document.get(table, {}).items():
                    if table == 'npcs' and key in self.data[table]:
                        raise ValueError(f'Duplicate NPC ID {key} in {filename.name}')
                    if key in self.data[table] and self.data[table][key] != value:
                        raise ValueError(f'Duplicate conflicting {table}:{key} in {filename.name}')
                    self.data[table][key] = value
            if filename.name=='world.json':
                self.fishing=document.get('fishing',{})
                self.crafting_stations=document.get('crafting_stations',{})
        for npc_id, npc in self.npcs.items():
            if npc.get('id', npc_id) != npc_id:
                raise ValueError(f'NPC identity mismatch: {npc_id}')
            home_room = npc.get('home_room')
            if home_room is not None and home_room not in self.rooms:
                raise ValueError(f'Unknown home room for NPC {npc_id}: {home_room}')
        numenes_file = self.root/'numenes.json'
        self.numenes = json.loads(numenes_file.read_text(encoding='utf-8')).get('numenes',{}) if numenes_file.is_file() else {}
        vaisork_file = self.root/'vaisork.json'
        self.vaisork = json.loads(vaisork_file.read_text(encoding='utf-8')) if vaisork_file.is_file() else {}
        ficha = dict(self.vaisork.get('ficha_dm', {}))
        if 'como_se_ve' in ficha:
            ficha['como_se_ve'] = ficha['como_se_ve'].split(' Su apariencia debe respetar los retratos existentes')[0]
            self.vaisork['ficha_dm'] = ficha
        self.vaisork_ficha = ficha
        for npc_id, entry in self.vaisork.get('vecinos', {}).items():
            if npc_id not in self.npcs:
                raise ValueError(f'Unknown Vaisork NPC: {npc_id}')
            self.npcs[npc_id].setdefault('topics', {})[entry.get('tema', 'vaisork')] = entry['texto']
        for trace in self.vaisork.get('rastros', []):
            room_id = trace.get('room')
            if room_id not in self.rooms:
                raise ValueError(f'Unknown Vaisork room: {room_id}')
            self.rooms[room_id].setdefault('examine', {})[trace['examine_key']] = trace['text']
        for key, room in self.rooms.items():
            if room.get('id',key) != key or room.get('region') not in self.regions:
                raise ValueError(f'Invalid room identity/region: {key}')
            for destination in room.get('exits',{}).values():
                if destination not in self.rooms:
                    raise ValueError(f'Unknown exit from {key}: {destination}')
            for direction in room.get('look',{}):
                if direction not in room.get('exits',{}):
                    raise ValueError(f'Look direction without exit in {key}: {direction}')
            for npc in room.get('npcs',[]):
                if npc not in self.npcs:
                    raise ValueError(f'Unknown NPC {npc} in {key}')
            for signal in [*room.get('signals',[]),*room.get('wildlife_pool',[])]:
                if signal.get('creature') not in self.creatures:raise ValueError(f'Unknown creature in {key}')
            for item_id in room.get('shop',[]):
                if item_id not in self.items:raise ValueError(f'Unknown shop item {item_id} in {key}')
            for action in room.get('actions',[]):
                if action.get('next') and action['next'] not in self.rooms:raise ValueError(f'Unknown action destination in {key}')
                for destination in action.get('discover_rooms',[]):
                    if destination not in self.rooms:raise ValueError(f'Unknown discovery in {key}')
        for region_id,region in self.regions.items():
            if region.get('settlement') not in self.rooms:raise ValueError(f'Unknown settlement for {region_id}')
        spatial_file=self.root/'spatial.json'
        self.spatial=json.loads(spatial_file.read_text(encoding='utf-8')) if spatial_file.is_file() else {}
        positions=self.spatial.get('positions',{});homes=self.spatial.get('homes',{})
        if positions and set(positions)!=set(self.rooms):raise ValueError('Spatial layout must cover exactly the existing rooms')
        if positions and set(homes)!=set(self.regions):raise ValueError('Spatial layout must reserve one home per region')
        cells=set()
        for key,position in {**positions,**{f'home:{key}':value for key,value in homes.items()}}.items():
            if not isinstance(position,list) or len(position)!=2 or any(type(v)!=int for v in position):raise ValueError(f'Invalid spatial position: {key}')
            if tuple(position) in cells:raise ValueError(f'Overlapping spatial position: {key}')
            cells.add(tuple(position))
        self.spatial_roads={}
        coordinates={**positions,**{f'home:{key}':value for key,value in homes.items()}}
        expected={frozenset((key,target)) for key,room in self.rooms.items() for target in room.get('exits',{}).values()}
        expected.update(frozenset((f'home:{key}',region['settlement'])) for key,region in self.regions.items())
        for road in self.spatial.get('roads',[]):
            source,target=road['from'],road['to'];points=road.get('points',[])
            if source not in coordinates or target not in coordinates or frozenset((source,target)) not in expected:raise ValueError('Unknown spatial road')
            if len(points)<2 or any(not isinstance(p,list) or len(p)!=2 or any(type(v) not in (int,float) or not float(v).is_integer() and not (float(v)*2).is_integer() for v in p) for p in points):raise ValueError('Invalid spatial road points')
            if points[0]!=[v*4 for v in coordinates[source]] or points[-1]!=[v*4 for v in coordinates[target]]:raise ValueError('Spatial road endpoints disagree')
            if (source,target) in self.spatial_roads:raise ValueError('Duplicate spatial road')
            self.spatial_roads[source,target]=points
            self.spatial_roads[target,source]=list(reversed(points))
        if positions and {frozenset(pair) for pair in self.spatial_roads}!=expected:raise ValueError('Spatial roads must cover every existing connection')
        for region_id,region in self.regions.items():
            for found in region.get('search',{}).get('finds',[]):
                if found.get('item') not in self.items:raise ValueError(f'Unknown search item for {region_id}')
        for quest_id,quest in self.quests.items():
            if quest.get('accept_room') not in self.rooms or not set(quest.get('required_rooms',[])).issubset(self.rooms):raise ValueError(f'Invalid quest rooms {quest_id}')
        for recipe_id,recipe in self.recipes.items():
            if recipe.get('output') not in self.items or not 2<=len(recipe.get('materials',{}))<=3 or type(recipe.get('seals')) is not int or recipe['seals']<0:
                raise ValueError(f'Invalid crafting recipe {recipe_id}')
            if any(item not in self.items or self.items[item].get('kind')!='material' or type(quantity) is not int or quantity<1 for item,quantity in recipe['materials'].items()):
                raise ValueError(f'Invalid crafting materials for {recipe_id}')
        for room_id,station in self.crafting_stations.items():
            npc_id=station.get('npc')
            if station.get('id')!=room_id or room_id not in self.rooms or npc_id not in self.npcs or npc_id not in self.rooms[room_id].get('npcs',[]):
                raise ValueError(f'Invalid crafting station {room_id}')
        for room_id,table in self.fishing.items():
            fish=table.get('fish',[])
            if table.get('id')!=room_id or room_id not in self.rooms or not fish or any(entry.get('item') not in self.items or self.items[entry['item']].get('kind')!='material' for entry in fish):
                raise ValueError(f'Invalid fishing table for {room_id}')

    def __getattr__(self, key):
        if key in TABLES:
            return self.data[key]
        raise AttributeError(key)
