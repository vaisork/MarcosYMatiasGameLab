#!/usr/bin/env python3
"""Build small 16x16 ground tileset atlas for Edran from Ninja Adventure CC0 pack.

Outputs:
  - client-rpg/sprites/edran-tiles.png (<40 KB, 16x16 tiles)
  - client-rpg/tilesets/edran.json (tileset mapping)
"""
import json
import os
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:
    for p in ('/usr/lib/python3/dist-packages', '/usr/local/lib/python3.14/dist-packages'):
        if p not in sys.path:
            sys.path.append(p)
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = Path(os.environ.get(
    'NINJA_ADVENTURE_DIR',
    Path.home() / 'proyectos' / 'entregas' / 'equipo' / 'assets-rpg' / 'Ninja Adventure - Asset Pack'
))

TILE_DEFS = [
    # (char, filename, (x1, y1, x2, y2), overlay_file_and_crop_or_None)
    ('g', 'Backgrounds/Tilesets/TilesetNature.png', (16, 48, 32, 64), None),
    ('p', 'Backgrounds/Tilesets/TilesetFloor.png', (16, 128, 32, 144), None),
    ('f', 'Backgrounds/Tilesets/TilesetNature.png', (16, 48, 32, 64),
     ('Backgrounds/Tilesets/TilesetElement.png', (0, 32, 16, 48))),
    ('w', 'Backgrounds/Tilesets/TilesetWater.png', (16, 16, 32, 32), None),
    ('c', 'Backgrounds/Tilesets/TilesetField.png', (16, 64, 32, 80), None),
    ('s', 'Backgrounds/Tilesets/TilesetField.png', (16, 16, 32, 32), None),
]


def build_tileset(pack_dir=PACK_DIR, out_sprites=None, out_tileset=None):
    if out_sprites is None:
        out_sprites = ROOT / 'client-rpg' / 'sprites' / 'edran-tiles.png'
    if out_tileset is None:
        out_tileset = ROOT / 'client-rpg' / 'tilesets' / 'edran.json'

    out_sprites.parent.mkdir(parents=True, exist_ok=True)
    out_tileset.parent.mkdir(parents=True, exist_ok=True)

    tiles = []
    tile_map = {}

    for idx, (char, rel_path, crop_box, overlay) in enumerate(TILE_DEFS):
        img_path = pack_dir / rel_path
        if not img_path.is_file():
            raise FileNotFoundError(f"Missing asset in pack: {img_path}")
        src = Image.open(img_path).convert('RGBA')
        tile = src.crop(crop_box)
        if overlay:
            over_path, over_crop = overlay
            over_src = Image.open(pack_dir / over_path).convert('RGBA')
            over_tile = over_src.crop(over_crop)
            tile.paste(over_tile, (0, 0), over_tile)
        tiles.append(tile)
        tile_map[char] = idx

    # Build 16x16 horizontal strip
    atlas_w = len(tiles) * 16
    atlas_h = 16
    atlas = Image.new('RGBA', (atlas_w, atlas_h))
    for idx, tile in enumerate(tiles):
        atlas.paste(tile, (idx * 16, 0))

    atlas.save(out_sprites, format='PNG', optimize=True)
    size_bytes = out_sprites.stat().st_size
    assert size_bytes < 40 * 1024, f"Atlas too large: {size_bytes} bytes"
    assert atlas.width % 16 == 0 and atlas.height % 16 == 0, "Non-16 multiple dimensions"

    metadata = {
        "image": "sprites/edran-tiles.png",
        "tile": 16,
        "map": tile_map,
    }
    out_tileset.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return out_sprites, out_tileset


if __name__ == '__main__':
    sprites_path, json_path = build_tileset()
    print(f"Generated {sprites_path} ({sprites_path.stat().st_size} bytes)")
    print(f"Generated {json_path}")
