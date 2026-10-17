"""Original seeded pixel terrain and a non-humanoid straw/root battle creature.
Run with the shared VT2 Python (Pillow). No downloaded assets.
"""
from pathlib import Path
from random import Random
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / 'client-rpg' / 'sprites'
rng = Random(731)
atlas = Image.new('RGB', (7 * 32, 32))
colors = ['#718456', '#b5a077', '#677744', '#8b704e', '#427e83', '#c1b28a', '#394f3e']
for index, color in enumerate(colors):
    tile = Image.new('RGB', (32, 32), color)
    d = ImageDraw.Draw(tile)
    for _ in range(38):
        x, y = rng.randrange(32), rng.randrange(32)
        shade = rng.choice(['#7d8d57', '#62734a']) if index in (0, 2) else rng.choice(['#9c8761', '#c3ae84'])
        if index == 4:
            shade = rng.choice(['#569897', '#37676d', '#7ab0a4'])
        if index == 6:
            shade = rng.choice(['#4b6547', '#293f35', '#688058'])
        d.line((x, y, x + rng.randrange(1, 5), y), fill=shade)
    if index in (2, 3):
        for y in (5, 17, 29):
            d.line((0, y, 31, y), fill='#5b5137', width=2)
            for x in range(3, 32, 8):
                d.line((x, y-1, x-2, y-6), fill='#a6ad66', width=2)
                d.point((x-2, y-7), fill='#d2c77c')
    if index == 6:
        d.rectangle((3, 7, 7, 27), fill='#67553e')
        d.rectangle((0, 11, 31, 14), fill='#a59160')
        d.rectangle((0, 22, 31, 24), fill='#7c704b')
        for x in (5, 21):
            d.ellipse((x-7, -8, x+9, 9), fill='#2e493a')
            d.line((x-5, 2, x+5, 2), fill='#59724c', width=2)
    atlas.paste(tile, (index * 32, 0))
atlas.save(OUT / 'terrain.png', optimize=True)

im = Image.new('RGBA', (96, 96))
d = ImageDraw.Draw(im)
# Ground-hugging tangled root mass, radial stalks, four hooked root feet.
for x in (18, 32, 62, 76):
    d.line((48, 63, x, 78, x-8, 83), fill='#293b31', width=7)
    d.line((48, 63, x, 77, x-8, 81), fill='#937849', width=3)
for _ in range(70):
    x, y = rng.randrange(23, 75), rng.randrange(27, 68)
    tipx = max(3, min(92, x + rng.randrange(-20, 21)))
    tipy = max(3, min(88, y + rng.randrange(-29, 15)))
    d.line((x, y, tipx, tipy), fill='#303d2b', width=3)
    d.line((x, y, tipx, tipy), fill=rng.choice(['#c8b575', '#aa8f50', '#e3cf85']), width=1)
d.ellipse((22, 32, 76, 76), fill='#293d31')
d.ellipse((25, 30, 72, 70), fill='#687448')
for _ in range(110):
    x, y = rng.randrange(28, 70), rng.randrange(34, 68)
    d.line((x, y, x-3, y+5), fill=rng.choice(['#899053', '#a79d60', '#455b3b', '#c0ae71']), width=2)
d.polygon([(29, 59), (41, 56), (45, 65), (34, 67)], fill='#23372e')
d.polygon([(53, 61), (67, 55), (65, 65), (55, 68)], fill='#23372e')
d.rectangle((35, 60, 39, 62), fill='#e8ca78')
d.rectangle((57, 60, 61, 62), fill='#e8ca78')
im.save(OUT / 'espinajo-battle.png', optimize=True)
