"""Original 16px RPG sprites. Run with Pillow; no external art inputs.

Sheet contract from client-rpg/rpg.js: 3 columns, 4 rows (S/N/W/E).
Column zero is idle; columns one/two alternate steps. NPCs use cell (0, 0).
"""
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / 'client-rpg' / 'sprites'
PALETTE = {
    '.': (0, 0, 0, 0), 'o': '#242c29', 'h': '#49352b',
    'H': '#79533a', 's': '#cf9970', 'S': '#f0c492', 'e': '#202b29',
    't': '#34606a', 'T': '#568c91', 'c': '#263e4c', 'b': '#775234',
    'B': '#b1844d', 'p': '#ded0a1', 'P': '#faf0c5',
    'g': '#4e5936', 'G': '#7b854b', 'v': '#353e2b',
    'r': '#77623b', 'R': '#b69a58', 'y': '#e1c782',
}

AVATAR = [
    [
        '................', '......oooo......', '.....ohHHho.....',
        '.....hHHHHh.....', '.....sSeSss.....', '......sSSs......',
        '.....occco......', '....otTTTto.....', '....stTTTts.....',
        '....soTbTos.....', '.....obBbo......', '.....occco......',
        '.....ococo......', '.....obobo......', '.....oo.oo......',
        '................',
    ],
    [
        '................', '......oooo......', '.....ohHHho.....',
        '.....hHHHHh.....', '.....hHHHHh.....', '......hhhh......',
        '.....occco......', '....otTTTto.....', '....stTTTts.....',
        '....sotTtos.....', '.....obBbo......', '.....occco......',
        '.....ococo......', '.....obobo......', '.....oo.oo......',
        '................',
    ],
    [
        '................', '......oooo......', '.....ohHHho.....',
        '.....hHHHHho....', '.....eSSshho....', '.....sSSshh.....',
        '......occo......', '.....otTTto.....', '.....tTTTto.....',
        '.....tsTtco.....', '.....osBbo......', '......ccco......',
        '......coco......', '.....obobo......', '.....oo.oo......',
        '................',
    ],
]
LINA = [
    '................', '......oooo......', '.....ohHHho.....',
    '.....hHHHHh.....', '.....sSeSsh.....', '......sSshh.....',
    '.....ogGgho.....', '....ogGGGgo.....', '....sgpppppo....',
    '....soPPpPPo....', '.....oPbbbPo....', '.....oPPpPPo....',
    '.....oggggo.....', '.....oggggo.....', '......obbo......',
    '................',
]
# A low, broad fibrous beast: radial straw spines, root feet, no human torso.
ESPINAJO = [
    '................', '...y....y.......', '...r.y..r..y....',
    '.y.r.R.ry..r....', '..RrgRRrR.R..y..', '...rRGGgRr..R...',
    '.yRrGgGGgRrR....', '..rGGRGGGgRrRy..', '...rGgGgGGgr....',
    '.yRrggGgGggrRy..', '..rvgGggGgvR....', '...vveGgegv.....',
    '..orvggggvro....', '...orvggvro.....', '....oo..oo......',
    '................',
]


def tile(rows):
    assert len(rows) == 16 and all(len(row) == 16 for row in rows)
    im = Image.new('RGBA', (16, 16))
    im.putdata([PALETTE[c] if c == '.' else (*bytes.fromhex(PALETTE[c][1:]), 255)
                for row in rows for c in row])
    return im


def sheet(name, directions, animate=False):
    im = Image.new('RGBA', (48, 64))
    for direction, rows in enumerate(directions):
        base = tile(rows)
        for frame in range(3):
            cell = base.copy()
            if animate and frame:
                # Opposite feet step in turn; silhouette stays inside its cell.
                pixels = cell.load()
                for x in range(5, 10):
                    for y in range(12, 15):
                        pixels[x, y] = (0, 0, 0, 0)
                for x, y in ((5, 12), (6, 12), (8, 13), (9, 13)):
                    if frame == 2:
                        y = 25 - y
                    pixels[x, y] = (119, 82, 52, 255)
                    pixels[x, y + 1] = (36, 44, 41, 255)
            im.paste(cell, (frame * 16, direction * 16))
    im.save(OUT / f'{name}.png', optimize=True)
    assert im.size == (48, 64) and im.getextrema()[3] == (0, 255)
    if animate:
        for y in range(4):
            cells = [im.crop((x*16, y*16, x*16+16, y*16+16)).tobytes() for x in range(3)]
            assert len(set(cells)) == 3


if __name__ == '__main__':
    sheet('avatar', AVATAR + [[row[::-1] for row in AVATAR[2]]], animate=True)
    sheet('lina', [LINA] * 4)
    sheet('espinajo', [ESPINAJO] * 4)
