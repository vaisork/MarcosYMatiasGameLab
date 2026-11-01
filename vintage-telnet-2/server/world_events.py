"""Small server-calendar events shared by every player."""
from datetime import datetime
from zoneinfo import ZoneInfo

EVENTS = {
    'feria': {
        'name': 'Feria del pueblo',
        'announcement': 'Hoy hay feria en los pueblos. Los puestos tienen más colores, música y precios 10% menores.',
        'scene': 'La feria llena el pueblo de puestos, música y juegos tranquilos.',
        'room_kinds': ['settlement'],
        'schedule': 'saturday', 'start': 10, 'end': 16,
    },
    'lluvia_estrellas': {
        'name': 'Lluvia de estrellas',
        'announcement': 'Esta noche habrá una lluvia de estrellas. Puedes observarla desde cualquier lugar abierto.',
        'scene': 'Varias estrellas fugaces cruzan el cielo y dejan trazos plateados.',
        'room_kinds': ['settlement', 'road', 'landmark', 'wilderness'],
        'schedule': 'monthly', 'day': 15, 'start': 21, 'end': 23,
    },
}


def scheduled_event(now, timezone):
    local = datetime.fromtimestamp(now, ZoneInfo(timezone))
    for event_id, definition in EVENTS.items():
        if definition['schedule'] == 'saturday':
            matches = local.weekday() == 5 and definition['start'] <= local.hour < definition['end']
            occurrence = local.date().isoformat()
        else:
            matches = local.day == definition['day'] and definition['start'] <= local.hour < definition['end']
            occurrence = local.strftime('%Y-%m')
        if matches:
            start = local.replace(hour=definition['start'], minute=0, second=0, microsecond=0)
            end = local.replace(hour=definition['end'], minute=0, second=0, microsecond=0)
            return {**{k: definition[k] for k in ('name', 'announcement', 'scene', 'room_kinds')},
                    'id': f'{event_id}:{occurrence}', 'event_id': event_id,
                    'starts_at': start.timestamp(), 'ends_at': end.timestamp(), 'source': 'calendar'}
    return None


def update(world, now, timezone):
    active = world.get('active_event')
    if active and active.get('source') == 'manual':
        if active.get('ends_at', 0) > now:
            return False
        world.pop('active_event', None)
    calendar = scheduled_event(now, timezone)
    if (active or {}).get('id') == (calendar or {}).get('id'):
        return False
    if calendar:
        world['active_event'] = calendar
    else:
        world.pop('active_event', None)
    return True


def activate(world, event_id, now, duration):
    if event_id not in EVENTS:
        raise ValueError('Elige un evento disponible.')
    if type(duration) is not int or not 1 <= duration <= 12:
        raise ValueError('La duración debe ser de 1 a 12 horas.')
    definition = EVENTS[event_id]
    ends_at = now + duration * 3600
    world['active_event'] = {**{k: definition[k] for k in ('name', 'announcement', 'scene', 'room_kinds')},
                             'id': f"{event_id}:manual:{int(now)}:{int(ends_at)}", 'event_id': event_id,
                             'starts_at': now, 'ends_at': ends_at,
                             'source': 'manual'}
