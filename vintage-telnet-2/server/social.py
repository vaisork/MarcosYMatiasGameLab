"""Child-safe, in-game social actions for approved characters."""
import json


ONLINE_SECONDS = 45
WHISPER_WINDOW = 60
WHISPER_LIMIT = 5
GIFT_SECONDS = 60


def _name(value):
    return " ".join(str(value).casefold().split())


def _online(world, now):
    presence = world.setdefault('presence', {})
    return {int(cid): entry for cid, entry in presence.items()
            if str(cid).isdigit() and now - entry.get('at', 0) <= ONLINE_SECONDS}


def _available_player(db, character_id):
    row = db.execute('''SELECT c.status,c.state,a.username FROM characters c
                        JOIN accounts a ON a.id=c.account_id WHERE c.id=?''', (character_id,)).fetchone()
    return bool(row and row['status'] == 'approved' and row['username'].casefold() != 'vaisork'
                and not json.loads(row['state']).get('vaisork'))


def snapshot(db, world, character, engine, now):
    online = _online(world, now)
    people = []
    for cid, entry in online.items():
        if cid == character['id']:
            continue
        if not _available_player(db, cid):
            continue
        room = engine.content.rooms.get(entry.get('room'), {})
        people.append({'id': cid, 'name': entry['name'], 'room': entry.get('room'),
                       'region': room.get('region', '')})
    people.sort(key=lambda p: p['name'].casefold())
    data = world.setdefault('social', {})
    groups = data.setdefault('groups', {})
    invitations = data.setdefault('invitations', {})
    followers = data.setdefault('followers', {})
    pending = data.setdefault('gifts', {})
    cid = str(character['id'])
    group_ids = {int(member) for members in groups.values() if cid in members for member in members} or {character['id']}
    inbox = [dict(m) for m in data.setdefault('whispers', {}).get(cid, []) if now-m['at'] < 300]
    invitations[cid] = [v for v in invitations.get(cid, [])
                        if now-v.get('at', 0) < 120 and int(v['from']) in online]
    gift = pending.get(cid)
    if gift:
        target = next((p for p in people if p['id'] == gift['to']), None)
        item = next((i for i in character['state'].get('inventory', []) if i.get('id') == gift['item_id']), None)
        gift = {'to': target['name'] if target else 'jugador', 'item': item.get('name') if item else 'objeto'}
    return {'online_players': people,
            'group': [p for p in [{'id': character['id'], 'name': character['name']}]+people
                      if p['id'] in group_ids],
            'following': int(followers[cid]) if cid in followers else None,
            'invites': [int(v['from']) for v in invitations.get(cid, [])],
            'gift_pending': gift, 'whispers': inbox}


def _player(db, world, name, actor, now, same_room=False):
    matches = [p for p in _online(world, now).values()
               if p['id'] != actor['id'] and _name(p['name']) == _name(name)]
    if len(matches) != 1:
        raise ValueError('No hay un jugador conectado con ese nombre.')
    target = matches[0]
    if not _available_player(db, target['id']):
        raise ValueError('Ese personaje no está disponible.')
    row = db.execute('SELECT * FROM characters WHERE id=?', (target['id'],)).fetchone()
    target = dict(row)
    target['state'] = json.loads(target['state'])
    if same_room and target['state'].get('location') != actor['state'].get('location'):
        raise ValueError('Para hacer eso deben estar en el mismo lugar.')
    return target


def run(db, world, actor, engine, command, now):
    """Run a social command. Return False for non-social text."""
    text = str(command or '').strip()
    low = text.casefold()
    data = world.setdefault('social', {})
    followers = data.setdefault('followers', {})
    groups = data.setdefault('groups', {})
    invitations = data.setdefault('invitations', {})
    pending = data.setdefault('gifts', {})
    actor_id = str(actor['id'])
    state = actor['state']

    rate = data.setdefault('activity', {}).setdefault(actor_id, [])
    rate[:] = [at for at in rate if now-at < WHISPER_WINDOW]
    if low not in ('grupo', 'quien', 'quién', 'quienes', 'quiénes') and len(rate) >= 15:
        raise ValueError('Espera un poco antes de usar más acciones sociales.')

    def event(msg):
        state.setdefault('events', []).append({'kind': 'action', 'text': msg})

    def named_target_and_rest(value):
        candidates = sorted((p for p in _online(world, now).values() if p['id'] != actor['id']),
                            key=lambda p: len(p['name']), reverse=True)
        for person in candidates:
            name = person['name']
            if value.casefold().startswith(name.casefold() + ' '):
                return name, value[len(name):].strip()
        return None, None

    if low in ('quien', 'quién', 'quienes', 'quiénes'):
        names = [p['name'] for p in snapshot(db, world, actor, engine, now)['online_players']]
        event('Conectados: ' + (', '.join(names) if names else 'estás jugando a solas por ahora.') + '.')
    elif low == 'grupo':
        event('En tu grupo: ' + ', '.join(p['name'] for p in snapshot(db, world, actor, engine, now)['group']) + '.')
    elif low in ('grupo salir', 'salir grupo'):
        for leader, members in list(groups.items()):
            if actor_id in members:
                members.remove(actor_id)
                if len(members) < 2: groups.pop(leader, None)
        event('Saliste del grupo.')
    elif low in ('grupo aceptar', 'aceptar grupo'):
        invite = next((i for i in invitations.get(actor_id, [])
                       if now-i.get('at', 0) < 120 and int(i['from']) in _online(world, now)), None)
        if not invite: raise ValueError('No tienes una invitación de grupo pendiente.')
        leader = str(invite.get('leader', invite['from'])); members = groups.setdefault(leader, [leader])
        if actor_id not in members: members.append(actor_id)
        invitations[actor_id].remove(invite)
        event('Te uniste al grupo.')
    elif low.startswith('grupo invitar ') or low.startswith('invitar '):
        name = text.split(' ', 2)[-1] if low.startswith('grupo invitar ') else text[8:]
        target = _player(db, world, name, actor, now, same_room=True)
        group_leader = next((leader for leader, members in groups.items() if actor_id in members), actor_id)
        invite = {'from': actor['id'], 'leader': int(group_leader), 'at': now}
        target_invites = invitations.setdefault(str(target['id']), [])
        target_invites[:] = [entry for entry in target_invites if now-entry.get('at', 0) < 120]
        if not any(entry['leader'] == invite['leader'] for entry in target_invites):target_invites.append(invite)
        event(f'Invitaste a {target["name"]} a tu grupo.')
    elif low.startswith('seguir '):
        target = _player(db, world, text[7:], actor, now, same_room=True)
        followers[actor_id] = target['id']
        event(f'Ahora sigues a {target["name"]}.')
    elif low in ('dejar de seguir', 'dejar seguir'):
        followers.pop(actor_id, None); event('Dejaste de seguir.')
    elif low.startswith('susurrar '):
        target_name, message = named_target_and_rest(text[9:].strip())
        if not target_name or not message or len(message) > 240:
            raise ValueError('Escribe «susurrar jugador mensaje» (máximo 240 caracteres).')
        target = _player(db, world, target_name, actor, now)
        whispers = data.setdefault('whispers', {})
        sent_data = data.setdefault('whisper_sent', {})
        sent = [at for at in sent_data.get(actor_id, []) if now-at < WHISPER_WINDOW]
        if len(sent) >= WHISPER_LIMIT: raise ValueError('Espera un poco antes de enviar más susurros.')
        sent.append(now)
        sent_data[actor_id] = sent
        inbox = whispers.setdefault(str(target['id']), [])
        inbox.append({'at': now, 'from': actor['name'], 'text': message})
        whispers[str(target['id'])] = [m for m in inbox if now-m['at'] < 300][-10:]
        event(f'Susurraste a {target["name"]}.')
    elif low.startswith('dar '):
        tail = text[4:].strip(); target_name = None; item_name = None
        for person in sorted((p for p in _online(world, now).values() if p['id'] != actor['id']),
                             key=lambda p: len(p['name']), reverse=True):
            suffix = ' a ' + person['name']
            if tail.casefold().endswith(suffix.casefold()):
                item_name = tail[:-len(suffix)].strip(); target_name = person['name']; break
        if not target_name or not item_name: raise ValueError('Escribe «dar objeto a jugador».')
        target = _player(db, world, target_name, actor, now, same_room=True)
        query = _name(item_name)
        inventory = state.get('inventory', [])
        item = next((i for i in inventory if _name(i.get('name')) == query and
                     i.get('id') not in (state.get('equipment') or {}).values()), None)
        if not item: raise ValueError('No tienes ese objeto libre para entregar.')
        pending[actor_id] = {'to': target['id'], 'item_id': item['id'], 'at': now}
        event(f'¿Confirmas entregar {item["name"]} a {target["name"]}? Usa el botón «Confirmar regalo».')
    elif low in ('confirmar regalo', 'confirmar dar'):
        gift = pending.get(actor_id)
        if not gift or now-gift['at'] > GIFT_SECONDS: raise ValueError('El regalo venció. Vuelve a elegirlo.')
        row = db.execute("SELECT * FROM characters WHERE id=? AND status='approved'", (gift['to'],)).fetchone()
        if not row: raise ValueError('Ese jugador ya no está disponible.')
        recipient = dict(row); recipient['state'] = json.loads(row['state'])
        if recipient['state'].get('location') != state.get('location') or int(gift['to']) not in _online(world, now):
            raise ValueError('Deben seguir conectados y en el mismo lugar para entregar el regalo.')
        item = next((i for i in state.get('inventory', []) if i.get('id') == gift['item_id']), None)
        if not item: raise ValueError('El objeto ya no está en tu mochila.')
        if item.get('id') in (state.get('equipment') or {}).values(): raise ValueError('Guarda el objeto antes de regalarlo.')
        state['inventory'].remove(item); recipient['state'].setdefault('inventory', []).append(item)
        recipient['state'].setdefault('events', []).append({'kind':'action','text':f'{actor["name"]} te regaló {item["name"]}.'})
        db.execute('UPDATE characters SET state=? WHERE id=?', (json.dumps(recipient['state'], ensure_ascii=False), recipient['id']))
        pending.pop(actor_id, None)
        event(f'Entregaste {item["name"]} a {recipient["name"]}.')
    elif low.startswith('susurrar') or low.startswith('dar') or low.startswith('grupo ') or low.startswith('seguir'):
        raise ValueError('Revisa el formato. Usa «seguir jugador», «grupo invitar jugador», «dar objeto a jugador» o «susurrar jugador mensaje».')
    else:
        return False
    if low not in ('grupo', 'quien', 'quién', 'quienes', 'quiénes'):
        rate.append(now)
    return True


def follow_move(db, world, leader, engine):
    """Move online followers with the leader after an authoritative move."""
    followers = world.setdefault('social', {}).setdefault('followers', {})
    for row in db.execute("SELECT * FROM characters WHERE status='approved'").fetchall():
        follower = int(row['id'])
        if followers.get(str(follower)) != leader['id']:
            continue
        online = world.get('presence', {}).get(str(follower), {})
        if engine.clock()-online.get('at', 0) > ONLINE_SECONDS:
            continue
        import json
        char = dict(row); char['state'] = json.loads(row['state'])
        if char['state'].get('combat') or char['state'].get('location') == leader['state'].get('location'):
            continue
        engine.visit(char['state'], leader['state']['location'])
        char['state'].setdefault('events', []).append({'kind':'action','text':f'Sigues a {leader["name"]}.'})
        char['state']['events'].extend(engine.narrative(char, world))
        engine.observe(char['state'], engine.room(char, world), world)
        db.execute('UPDATE characters SET state=? WHERE id=?', (json.dumps(char['state'], ensure_ascii=False), follower))
        world.setdefault('presence', {})[str(follower)].update(room=char['state']['location'], at=engine.clock())


def stop_following(world, character_id):
    world.setdefault('social', {}).setdefault('followers', {}).pop(str(character_id), None)
