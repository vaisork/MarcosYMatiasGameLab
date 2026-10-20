#!/usr/bin/env python3
"""Convert between Tiled JSON maps (.tmj) and Vaisgard RPG scene format (.json).

Round-trip lossless conversion:
  - Tile layers: 'ground', 'solid'
  - Object groups: 'spawn', 'exits', 'npcs', 'creatures'
"""
import argparse
import json
from pathlib import Path
import re

BACKGROUND_PATH_RE = re.compile(r'^backgrounds/[a-z0-9_]+(-front)?\.webp$')


def validate_background_actions(actions):
    if not isinstance(actions, dict):
        raise ValueError(f"background_actions must be a dict, got {type(actions).__name__}")
    for act_id, path in actions.items():
        if not isinstance(act_id, str) or not act_id:
            raise ValueError(f"background_actions action ID must be a non-empty string, got {act_id!r}")
        if not isinstance(path, str) or not BACKGROUND_PATH_RE.match(path):
            raise ValueError(f"Invalid background_actions path for {act_id!r}: {path!r}")

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TILESETS_DIR = ROOT / 'client-rpg' / 'tilesets'
DEFAULT_SCENES_DIR = ROOT / 'client-rpg' / 'scenes'
DEFAULT_TILED_DIR = ROOT / 'client-rpg' / 'tiled'


def load_tileset_map(tileset_name, tilesets_dir=DEFAULT_TILESETS_DIR):
    path = tilesets_dir / f'{tileset_name}.json'
    if not path.is_file():
        raise FileNotFoundError(f"Tileset file not found: {path}")
    data = json.loads(path.read_text(encoding='utf-8'))
    char_map = data['map']
    reverse_map = {idx: char for char, idx in char_map.items()}
    return data, char_map, reverse_map


def scene_to_tiled(scene, tilesets_dir=DEFAULT_TILESETS_DIR):
    width, height = scene['size']
    tile = scene['tile']
    tileset_name = scene.get('tileset', 'edran')
    tileset_data, char_map, _ = load_tileset_map(tileset_name, tilesets_dir)

    # 1. Ground data (1-based GID)
    ground_data = []
    for row in scene['layers']['ground']:
        for char in row:
            if char not in char_map:
                raise ValueError(f"Ground char '{char}' not in tileset '{tileset_name}'")
            ground_data.append(1 + char_map[char])

    # 2. Solid data (1 for solid, 0 for empty)
    solid_data = []
    for row in scene['layers']['solid']:
        for char in row:
            solid_data.append(1 if char == '1' else 0)

    # 3. Spawn objects
    spawn_objects = []
    obj_id = 1
    for name, (sx, sy) in scene['spawn'].items():
        spawn_objects.append({
            'id': obj_id,
            'name': name,
            'type': 'spawn',
            'point': True,
            'x': sx * tile,
            'y': sy * tile,
            'width': 0,
            'height': 0,
            'rotation': 0,
            'visible': True,
        })
        obj_id += 1

    # 4. Exit objects
    exit_objects = []
    for ex in scene['exits']:
        rx, ry, rw, rh = ex['rect']
        exit_objects.append({
            'id': obj_id,
            'name': ex['direction'],
            'type': 'exit',
            'x': rx * tile,
            'y': ry * tile,
            'width': rw * tile,
            'height': rh * tile,
            'rotation': 0,
            'visible': True,
            'properties': [{'name': 'direction', 'type': 'string', 'value': ex['direction']}],
        })
        obj_id += 1

    # 5. NPC objects
    npc_objects = []
    for npc in scene.get('npcs', []):
        nx, ny = npc['at']
        npc_objects.append({
            'id': obj_id,
            'name': npc['id'],
            'type': 'npc',
            'point': True,
            'x': nx * tile,
            'y': ny * tile,
            'width': 0,
            'height': 0,
            'rotation': 0,
            'visible': True,
            'properties': [{'name': 'id', 'type': 'string', 'value': npc['id']}],
        })
        obj_id += 1

    # 6. Creature objects
    creature_objects = []
    for creature in scene.get('creatures', []):
        cx, cy = creature['at']
        creature_objects.append({
            'id': obj_id,
            'name': creature['id'],
            'type': 'creature',
            'point': True,
            'x': cx * tile,
            'y': cy * tile,
            'width': 0,
            'height': 0,
            'rotation': 0,
            'visible': True,
            'properties': [{'name': 'id', 'type': 'string', 'value': creature['id']}],
        })
        obj_id += 1

    sprite_rel = tileset_data.get('image', f'sprites/{tileset_name}-tiles.png').split('/')[-1]

    tmj = {
        'compressionlevel': -1,
        'height': height,
        'infinite': False,
        'layers': [
            {'id': 1, 'name': 'ground', 'type': 'tilelayer', 'width': width, 'height': height,
             'x': 0, 'y': 0, 'visible': True, 'opacity': 1, 'data': ground_data},
            {'id': 2, 'name': 'solid', 'type': 'tilelayer', 'width': width, 'height': height,
             'x': 0, 'y': 0, 'visible': True, 'opacity': 1, 'data': solid_data},
            {'id': 3, 'name': 'spawn', 'type': 'objectgroup', 'visible': True, 'opacity': 1,
             'x': 0, 'y': 0, 'objects': spawn_objects},
            {'id': 4, 'name': 'exits', 'type': 'objectgroup', 'visible': True, 'opacity': 1,
             'x': 0, 'y': 0, 'objects': exit_objects},
            {'id': 5, 'name': 'npcs', 'type': 'objectgroup', 'visible': True, 'opacity': 1,
             'x': 0, 'y': 0, 'objects': npc_objects},
            {'id': 6, 'name': 'creatures', 'type': 'objectgroup', 'visible': True, 'opacity': 1,
             'x': 0, 'y': 0, 'objects': creature_objects},
        ],
        'nextlayerid': 7,
        'nextobjectid': obj_id,
        'orientation': 'orthogonal',
        'renderorder': 'right-down',
        'tileheight': tile,
        'tilewidth': tile,
        'type': 'map',
        'version': '1.10',
        'width': width,
        'properties': [
            {'name': 'room', 'type': 'string', 'value': scene['room']},
            {'name': 'tileset', 'type': 'string', 'value': tileset_name},
        ],
        'tilesets': [
            {
                'firstgid': 1,
                'image': f'../sprites/{sprite_rel}',
                'imageheight': 16,
                'imagewidth': len(char_map) * 16,
                'margin': 0,
                'name': tileset_name,
                'spacing': 0,
                'tilecount': len(char_map),
                'tileheight': tile,
                'tilewidth': tile,
            }
        ],
    }
    tmj['properties'].extend({'name': key, 'type': 'string', 'value': scene[key]}
                             for key in ('background', 'foreground') if key in scene)
    if 'background_actions' in scene:
        validate_background_actions(scene['background_actions'])
        tmj['properties'].append({
            'name': 'background_actions',
            'type': 'string',
            'value': json.dumps(scene['background_actions'], ensure_ascii=False, sort_keys=True),
        })
    return tmj


def tiled_to_scene(tmj, tilesets_dir=DEFAULT_TILESETS_DIR, room_fallback=''):
    props = {p['name']: p['value'] for p in tmj.get('properties', [])}
    width = tmj['width']
    height = tmj['height']
    tile = tmj.get('tilewidth', 16)

    tileset_name = props.get('tileset') or (tmj.get('tilesets') and tmj['tilesets'][0].get('name')) or 'edran'
    _, _, reverse_map = load_tileset_map(tileset_name, tilesets_dir)
    firstgid = tmj.get('tilesets', [{}])[0].get('firstgid', 1)

    layer_map = {l['name']: l for l in tmj.get('layers', [])}

    # Ground
    ground_rows = []
    g_data = layer_map['ground']['data']
    for y in range(height):
        row = ''.join(reverse_map[g_data[y * width + x] - firstgid] for x in range(width))
        ground_rows.append(row)

    # Solid
    solid_rows = []
    s_data = layer_map['solid']['data']
    for y in range(height):
        row = ''.join('1' if s_data[y * width + x] != 0 else '.' for x in range(width))
        solid_rows.append(row)

    # Spawn
    spawn = {}
    if 'spawn' in layer_map:
        for obj in layer_map['spawn'].get('objects', []):
            spawn[obj['name']] = [int(round(obj['x'] / tile)), int(round(obj['y'] / tile))]

    # Exits
    exits = []
    if 'exits' in layer_map:
        for obj in layer_map['exits'].get('objects', []):
            direction = obj.get('name') or next(
                (p['value'] for p in obj.get('properties', []) if p['name'] == 'direction'), ''
            )
            exits.append({
                'direction': direction,
                'rect': [
                    int(round(obj['x'] / tile)),
                    int(round(obj['y'] / tile)),
                    int(round(obj['width'] / tile)),
                    int(round(obj['height'] / tile)),
                ],
            })

    # NPCs
    npcs = []
    if 'npcs' in layer_map:
        for obj in layer_map['npcs'].get('objects', []):
            npc_id = obj.get('name') or next(
                (p['value'] for p in obj.get('properties', []) if p['name'] == 'id'), ''
            )
            npcs.append({
                'id': npc_id,
                'at': [int(round(obj['x'] / tile)), int(round(obj['y'] / tile))],
            })

    # Creatures
    creatures = []
    if 'creatures' in layer_map:
        for obj in layer_map['creatures'].get('objects', []):
            c_id = obj.get('name') or next(
                (p['value'] for p in obj.get('properties', []) if p['name'] == 'id'), ''
            )
            creatures.append({
                'id': c_id,
                'at': [int(round(obj['x'] / tile)), int(round(obj['y'] / tile))],
            })

    res = {
        **{key: props[key] for key in ('background', 'foreground') if key in props},
        'room': props.get('room', room_fallback),
        'tile': tile,
        'size': [width, height],
        'tileset': tileset_name,
        'layers': {
            'ground': ground_rows,
            'solid': solid_rows,
        },
        'spawn': spawn,
        'exits': exits,
        'npcs': npcs,
        'creatures': creatures,
    }
    if 'background_actions' in props:
        bg_actions_val = props['background_actions']
        if isinstance(bg_actions_val, str):
            try:
                bg_actions = json.loads(bg_actions_val)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON in background_actions property: {exc}") from exc
        elif isinstance(bg_actions_val, dict):
            bg_actions = bg_actions_val
        else:
            raise ValueError(f"background_actions property must be a string or dict, got {type(bg_actions_val).__name__}")
        validate_background_actions(bg_actions)
        res['background_actions'] = bg_actions
    return res


def main():
    parser = argparse.ArgumentParser(description="Convert between Tiled .tmj and RPG scene .json")
    parser.add_argument('--all', action='store_true', help="Generate .tmj files for all scenes")
    parser.add_argument('input', nargs='?', help="Input file (.json or .tmj)")
    parser.add_argument('-o', '--output', help="Output file path")
    args = parser.parse_args()

    if args.all:
        DEFAULT_TILED_DIR.mkdir(parents=True, exist_ok=True)
        for scene_file in sorted(DEFAULT_SCENES_DIR.glob('*.json')):
            scene = json.loads(scene_file.read_text(encoding='utf-8'))
            tmj = scene_to_tiled(scene)
            out_file = DEFAULT_TILED_DIR / f'{scene_file.stem}.tmj'
            out_file.write_text(json.dumps(tmj, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
            print(f"Wrote {out_file}")
        return

    if not args.input:
        parser.print_help()
        return

    in_path = Path(args.input)
    if in_path.suffix.lower() == '.tmj':
        tmj = json.loads(in_path.read_text(encoding='utf-8'))
        scene = tiled_to_scene(tmj, room_fallback=in_path.stem)
        out_path = Path(args.output) if args.output else in_path.with_suffix('.json')
        out_path.write_text(json.dumps(scene, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        print(f"Wrote {out_path}")
    else:
        scene = json.loads(in_path.read_text(encoding='utf-8'))
        tmj = scene_to_tiled(scene)
        out_path = Path(args.output) if args.output else in_path.with_suffix('.tmj')
        out_path.write_text(json.dumps(tmj, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        print(f"Wrote {out_path}")


if __name__ == '__main__':
    main()
