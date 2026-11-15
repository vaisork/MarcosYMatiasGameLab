#!/usr/bin/env python3
"""Create compact game assets from the authorized Terrarium tiles and CC0 textures."""
from pathlib import Path
from PIL import Image
import argparse
import math
import struct

BASE = Path(__file__).resolve().parents[1]
SOURCES = Path('/home/jdiaz/proyectos/entregas/equipo/volando-vaisork/fuentes')
W, H = 512, 768


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fuentes', type=Path, default=SOURCES)
    parser.add_argument('--salida', type=Path, default=BASE / 'assets')
    args = parser.parse_args()
    args.salida.mkdir(parents=True, exist_ok=True)

    mosaico = Image.new('RGB', (1024, 1536))
    for x in range(819, 823):
        for y in range(1721, 1727):
            mosaico.paste(Image.open(args.fuentes / 'terreno' / f'12_{x}_{y}.png').convert('RGB'),
                          ((x - 819) * 256, (y - 1721) * 256))

    r, g, b = mosaico.split()
    alturas = Image.new('F', mosaico.size)
    alturas.putdata([((rr * 256 + gg + bb / 256) - 32768) for rr, gg, bb in zip(r.get_flattened_data(), g.get_flattened_data(), b.get_flattened_data())])
    alturas = alturas.resize((W, H), Image.Resampling.BILINEAR)
    valores = [max(0, min(65535, round(v))) for v in alturas.get_flattened_data()]
    (args.salida / 'terreno-u16.bin').write_bytes(struct.pack('<' + 'H' * len(valores), *valores))

    elevations = alturas.get_flattened_data()
    pixels = []
    for y in range(H):
      for x in range(W):
        i = y * W + x
        z = elevations[i]
        gx = elevations[y * W + min(W - 1, x + 1)] - elevations[y * W + max(0, x - 1)]
        gy = elevations[min(H - 1, y + 1) * W + x] - elevations[max(0, y - 1) * W + x]
        slope = math.hypot(gx, gy) / 76
        if z < 760:
            color = (37, 108, 112)
        elif slope > 0.42:
            color = (138 + int(min(36, slope * 8)), 71, 55)
        elif z > 1650:
            color = (49, 86, 56)
        elif z > 1200:
            color = (96, 111, 68)
        else:
            color = (176, 135, 91)
        shade = max(.70, min(1.24, .88 + (z - 1400) / 9000 - slope * .12))
        pixels.append(tuple(max(0, min(255, int(c * shade))) for c in color))
    terrain = Image.new('RGB', (W, H))
    terrain.putdata(pixels)
    terrain.save(args.salida / 'barranca.webp', 'WEBP', quality=84, method=6)

    for name in ('cliff_side_diff_1k.jpg', 'aerial_rocks_02_diff_1k.jpg'):
        im = Image.open(args.fuentes / name).convert('RGB')
        im.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        im.save(args.salida / (name.removesuffix('.jpg') + '.webp'), 'WEBP', quality=82, method=6)
    sky = Image.open(args.fuentes / 'cielo-2k.webp').convert('RGB')
    sky.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    sky.save(args.salida / 'cielo.webp', 'WEBP', quality=82, method=6)
    for p in sorted(args.salida.iterdir()):
        print(f'{p.name}: {p.stat().st_size / 1024:.1f} KiB')


if __name__ == '__main__':
    main()
