"""Felicitaciones públicas temporales, guardadas fuera de la base del mundo."""
import json
import threading
from pathlib import Path

FILE = Path(__file__).resolve().parents[1] / 'runtime' / 'felicitaciones.jsonl'
LIFETIME = 72 * 60 * 60
_lock = threading.Lock()


def _read():
    try:
        lines = FILE.read_text(encoding='utf-8').splitlines()
    except FileNotFoundError:
        return []
    entries = []
    for line in lines:
        try:
            entry = json.loads(line)
        except ValueError:
            continue
        if isinstance(entry, dict) and isinstance(entry.get('at'), (int, float)):
            entries.append(entry)
    return entries


def record(character, achievement_id, achievement, now):
    """Append one achievement per player, including achievements that have expired."""
    FILE.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        entries = _read()
        if any(item.get('character_id') == character['id'] and item.get('achievement_id') == achievement_id
               for item in entries):
            return False
        entry = {'character_id': character['id'], 'name': character['name'],
                 'achievement_id': achievement_id, 'achievement': achievement, 'at': now}
        with FILE.open('a', encoding='utf-8') as handle:
            handle.write(json.dumps(entry, ensure_ascii=False) + '\n')
    return True


def active(now):
    current = [(index, entry) for index, entry in enumerate(_read())
               if now - entry['at'] < LIFETIME]
    current.sort(key=lambda pair: (pair[1]['at'], pair[0]), reverse=True)
    return [entry for _, entry in current[:3]]
