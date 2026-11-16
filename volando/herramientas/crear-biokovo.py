#!/usr/bin/env python3
"""Build compact local Terrarium heightmaps for Biokovo from authorized tiles."""
from pathlib import Path
import json
import math
import struct
from PIL import Image

BASE = Path(__file__).resolve().parents[1]
SOURCE = Path('/home/jdiaz/proyectos/entregas/equipo/volando-vaisork/fuentes/biokovo')
LAUNCH = (43.3425, 17.0569)


def tile(lat, lon, zoom):
    n = 2**zoom
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def heights(image):
    channels = image.convert('RGB').split()
    return [max(0, min(65535, round(r * 256 + g + b / 256 - 32768)))
            for r, g, b in zip(*(c.get_flattened_data() for c in channels))]


def main():
    out = BASE / 'assets'
    out.mkdir(exist_ok=True)
    tx, ty = tile(*LAUNCH, 14)
    detail_x, detail_y, detail_tiles = 8966, 5998, (4, 5)
    detail = Image.new('RGB', (detail_tiles[0] * 256, detail_tiles[1] * 256))
    for x in range(detail_x, detail_x + detail_tiles[0]):
        for y in range(detail_y, detail_y + detail_tiles[1]):
            detail.paste(Image.open(SOURCE / f'14_{x}_{y}.png').convert('RGB'),
                         ((x - detail_x) * 256, (y - detail_y) * 256))
    detail = detail.resize((1024, 1280), Image.Resampling.BILINEAR)
    detail_values = heights(detail)
    (out / 'biokovo-z14-u16.bin').write_bytes(struct.pack('<' + 'H' * len(detail_values), *detail_values))

    far_x, far_y, far_tiles = 2239, 1498, (6, 4)
    far = Image.new('RGB', (far_tiles[0] * 256, far_tiles[1] * 256))
    for x in range(far_x, far_x + far_tiles[0]):
        for y in range(far_y, far_y + far_tiles[1]):
            far.paste(Image.open(SOURCE / f'12_{x}_{y}.png').convert('RGB'),
                      ((x - far_x) * 256, (y - far_y) * 256))
    far = far.resize((512, 342), Image.Resampling.BILINEAR)
    far_values = heights(far)
    (out / 'biokovo-z12-u16.bin').write_bytes(struct.pack('<' + 'H' * len(far_values), *far_values))
    metadata = {
        'launch': {'lat': LAUNCH[0], 'lon': LAUNCH[1], 'tileX14': tx, 'tileY14': ty},
        'detail': {'x': detail_x, 'y': detail_y, 'tilesX': 4, 'tilesY': 5, 'width': 1024, 'height': 1280},
        'far': {'x': far_x, 'y': far_y, 'tilesX': 6, 'tilesY': 4, 'width': 512, 'height': 342},
    }
    (out / 'biokovo.json').write_text(json.dumps(metadata, separators=(',', ':')))
    for p in sorted(out.glob('biokovo*')):
        print(f'{p.name}: {p.stat().st_size / 1024:.1f} KiB')


if __name__ == '__main__':
    main()
