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
    ('g', 'Backgrounds/Tilesets/TilesetFloor.png', (176, 192, 192, 208), None),
    ('p', 'Backgrounds/Tilesets/TilesetFloor.png', (16, 128, 32, 144), None),
    ('f', 'Backgrounds/Tilesets/TilesetFloor.png', (176, 192, 192, 208),
     ('Backgrounds/Tilesets/TilesetNature.png', (16, 160, 32, 176))),
    ('w', 'Backgrounds/Tilesets/TilesetWater.png', (16, 16, 32, 32), None),
    ('c', 'Backgrounds/Tilesets/TilesetRelief.png', (80, 96, 96, 112),
     ('Backgrounds/Tilesets/TilesetFloorDetail.png', (96, 32, 112, 48))),
    ('s', 'Backgrounds/Tilesets/TilesetRelief.png', (80, 96, 96, 112), None),
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


def render_previews(preview_dir, sprites_path=None, json_path=None, scenes_dir=None, scale=3):
    if scenes_dir is None:
        scenes_dir = ROOT / 'client-rpg' / 'scenes'
    if sprites_path is None:
        sprites_path = ROOT / 'client-rpg' / 'sprites' / 'edran-tiles.png'
    if json_path is None:
        json_path = ROOT / 'client-rpg' / 'tilesets' / 'edran.json'

    preview_dir = Path(preview_dir)
    preview_dir.mkdir(parents=True, exist_ok=True)

    tileset_meta = json.loads(Path(json_path).read_text(encoding='utf-8'))
    tile_map = tileset_meta['map']
    atlas = Image.open(sprites_path).convert('RGBA')

    tile_size = tileset_meta.get('tile', 16)
    tiles = {}
    for char, idx in tile_map.items():
        tiles[char] = atlas.crop((idx * tile_size, 0, (idx + 1) * tile_size, tile_size))

    resample_mode = getattr(getattr(Image, 'Resampling', Image), 'NEAREST')
    generated = []

    for scene_file in sorted(Path(scenes_dir).glob('*.json')):
        scene_data = json.loads(scene_file.read_text(encoding='utf-8'))
        width, height = scene_data['size']
        scene_img = Image.new('RGBA', (width * tile_size, height * tile_size))
        for y, row in enumerate(scene_data['layers']['ground']):
            for x, char in enumerate(row):
                if char in tiles:
                    scene_img.paste(tiles[char], (x * tile_size, y * tile_size))

        if scale > 1:
            scene_img = scene_img.resize((width * tile_size * scale, height * tile_size * scale), resample=resample_mode)

        out_file = preview_dir / f"{scene_file.stem}.png"
        scene_img.save(out_file, format='PNG')
        generated.append(out_file)

    return generated


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Build Edran RPG tileset and optional scene previews.")
    parser.add_argument('--preview', metavar='DIR', type=Path, default=None,
                        help="Render each scene to PNG (scale x3) in DIR")
    parser.add_argument('--pack-dir', type=Path, default=PACK_DIR,
                        help="Path to Ninja Adventure pack")
    args = parser.parse_args()

    if args.preview:
        # Preview renders the committed atlas; it never needs the pack nor rewrites repo files.
        for p in render_previews(args.preview, scale=3):
            print(f"Generated preview {p} ({p.stat().st_size} bytes)")
    else:
        sprites_path, json_path = build_tileset(pack_dir=args.pack_dir)
        print(f"Generated {sprites_path} ({sprites_path.stat().st_size} bytes)")
        print(f"Generated {json_path}")
