"""Daily, no-penalty errands derived from existing regional content."""
from datetime import datetime, timedelta
import hashlib
import random

from . import mechanics


def region_for(engine, character):
    state = character['state']
    if state['location'] == state.get('home'):
        return engine.region_for(character['species'])[0]
    return engine.content.rooms[state['location']]['region']


def _candidates(engine, region):
    content = engine.content
    rooms = sorted((room for room in content.rooms.values() if room['region'] == region), key=lambda room: room['id'])
    candidates = []
    visits = [room for room in rooms if room.get('kind') != 'home']
    if visits:
        candidates.append(('visit', visits))
    if any(room.get('examine') for room in rooms):
        candidates.append(('examine', rooms))
    speakers = sorted({npc for room in rooms for npc in room.get('npcs', []) if npc in content.npcs})
    if speakers:
        candidates.append(('talk', speakers))
    common = sorted({signal['creature'] for room in rooms
                     for signal in [*room.get('signals', []), *room.get('wildlife_pool', [])]
                     if signal['creature'] in mechanics.PROFILES
                     and mechanics.PROFILES[signal['creature']].get('category') in ('favorable', 'comparable')
                     and mechanics.PROFILES[signal['creature']].get('level', 99) <= 4
                     and content.creatures.get(signal['creature'], {}).get('combatant_kind') != 'human'})
    if common:
        candidates.append(('defeat', common))
    return candidates


def generate(engine, date, region):
    candidates = _candidates(engine, region)
    seed = int.from_bytes(hashlib.sha256(f'{date}:{region}'.encode()).digest()[:8], 'big')
    rng = random.Random(seed)
    rng.shuffle(candidates)
    errands = []
    for kind, options in candidates[:3]:
        target = rng.choice(options)
        if kind == 'visit':
            title = f"Visita {target['name']}"
            target_id = target['id']
        elif kind == 'examine':
            title = f"Examina algo en {engine.content.regions[region]['name']}"
            target_id = region
        elif kind == 'talk':
            target_id = target
            title = f"Habla con {engine.content.npcs[target]['name']}"
        else:
            target_id = target
            title = f"Vence a {engine.content.creatures[target]['name']}"
        errands.append({'id': f'{kind}:{target_id}', 'kind': kind, 'target': target_id, 'title': title})
    return errands


def current_date(engine):
    return datetime.fromtimestamp(engine.clock(), engine.timezone).date().isoformat()


def _record(engine, state, region, date):
    record = state.get('daily_errands')
    if not isinstance(record, dict) or record.get('date') != date:
        record = {
            'date': date,
            'region': region,
            'completed': [],
            'streak': state.get('daily_errand_streak', 0),
            'last_complete_date': state.get('daily_errand_last_complete_date'),
        }
        state['daily_errands'] = record
    return record


def snapshot(engine, character):
    state = character['state']
    date = current_date(engine)
    region = region_for(engine, character)
    stored = state.get('daily_errands')
    if isinstance(stored, dict) and stored.get('date') == date:
        region = stored.get('region', region)
    record = stored if isinstance(stored, dict) and stored.get('date') == date else {}
    completed = set(record.get('completed', []))
    errands = generate(engine, date, region)
    last = record.get('last_complete_date', state.get('daily_errand_last_complete_date'))
    streak = record.get('streak', state.get('daily_errand_streak', 0))
    if last and last < date and date != (datetime.fromisoformat(last).date() + timedelta(days=1)).isoformat():
        streak = 0
    return {
        'date': date,
        'region': region,
        'errands': [{**errand, 'completed': errand['id'] in completed, 'reward': mechanics.EXPLORATION_XP['behavior']} for errand in errands],
        'streak': streak,
        'complete': len(errands) == 3 and all(errand['id'] in completed for errand in errands),
    }


def _complete(engine, state, record, errands, errand):
    if errand['id'] in record['completed']:
        return
    record['completed'].append(errand['id'])
    gain = mechanics.EXPLORATION_XP['behavior']
    state['xp'] += gain
    state['events'].append({'kind': 'reward', 'text': f'+{gain} experiencia: recado diario completado.'})
    engine.advance_levels(state)
    if len(errands) == 3 and len(record['completed']) == 3 and record.get('last_complete_date') != record['date']:
        previous = record.get('last_complete_date')
        record['streak'] = record.get('streak', 0) + 1 if previous and record['date'] == (datetime.fromisoformat(previous).date() + timedelta(days=1)).isoformat() else 1
        record['last_complete_date'] = record['date']
        state['daily_errand_streak'] = record['streak']
        state['daily_errand_last_complete_date'] = record['date']


def record_action(engine, character, intent, region_before, combat_before=False):
    if combat_before:
        return
    state = character['state']
    date = current_date(engine)
    record = _record(engine, state, region_before, date)
    errands = generate(engine, date, record['region'])
    action = intent.get('id')
    record.setdefault('completed', [])
    for errand in errands:
        if errand['id'] in record['completed']:
            continue
        matches = (
            errand['kind'] == 'visit' and action == 'mover' and state.get('location') == errand['target']
            or errand['kind'] == 'examine' and region_before == errand['target'] and action in ('examinar', 'examinar_criatura')
            or errand['kind'] == 'talk' and region_before == record['region'] and action == 'hablar' and intent.get('target') == errand['target']
        )
        if matches:
            _complete(engine, state, record, errands, errand)


def record_victory(engine, character, creature, location):
    state = character['state']
    if location not in engine.content.rooms:
        return
    room = engine.content.rooms[location]
    date = current_date(engine)
    record = _record(engine, state, room['region'], date)
    if record['region'] != room['region']:
        return
    errands = generate(engine, date, record['region'])
    record.setdefault('completed', [])
    for errand in errands:
        if errand['kind'] == 'defeat' and errand['target'] == creature:
            _complete(engine, state, record, errands, errand)

