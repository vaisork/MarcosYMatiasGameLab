#!/usr/bin/env python3
"""Compose stable costume layers over Senku's original 24-frame animation sheet."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PERSONAJES = ROOT / "assets/personajes"
ORIGINAL = Image.open(PERSONAJES / "sprite_original.png").convert("RGBA")
NOMBRES = {
    "explorador": "Explorador", "vaquero": "Vaquero", "ninja": "Ninja",
    "magico": "Mágico", "especial": "Especial", "chef": "Chef",
    "mexicano": "Mexicano", "espacial": "Espacial", "dinosaurio": "Dinosaurio",
    "playa": "Playa", "sigilo": "Sigilo", "punk": "Punk",
}
PALETAS = {
    "explorador": ("#72834a", "#d5b879", "#a83d36"),
    "vaquero": ("#804b32", "#c18b4e", "#e2b53b"),
    "ninja": ("#252638", "#47485e", "#a8343b"),
    "magico": ("#273d7a", "#4c64a8", "#f2c951"),
    "especial": ("#a93035", "#e6c54e", "#f3e9d1"),
    "chef": ("#f1eee5", "#d7d4ce", "#a53a32"),
    "mexicano": ("#317d68", "#d39e3e", "#d34d3e"),
    "espacial": ("#e9edf0", "#8ca5b3", "#d34c42"),
    "dinosaurio": ("#5f9a4b", "#80b95d", "#e5c64d"),
    "playa": ("#52aeb4", "#edcf77", "#ef795d"),
    "sigilo": ("#25242e", "#464653", "#6d627c"),
    "punk": ("#29232d", "#a6323b", "#e2bc4a"),
}
DETALLES = {
    "explorador": "sombrero safari beige, mochila verde olivo, chaleco caqui y paliacate rojo",
    "vaquero": "sombrero vaquero café, chaleco del oeste y paliacate rojo",
    "ninja": "atuendo ninja azul oscuro, banda gris y cintas rojas",
    "magico": "túnica y sombrero azul con estrellas, ribete dorado y varita mágica",
    "especial": "capa roja con cuello blanco afelpado y corona dorada",
    "chef": "uniforme blanco de chef con botones, paliacate rojo y gorro alto",
    "mexicano": "sombrero mexicano bordado y sarape colorido",
    "espacial": "traje acolchado blanco de astronauta, casco transparente redondo, mochila y parches",
    "dinosaurio": "disfraz verde de dinosaurio con capucha amable y púas amarillas",
    "playa": "camisa tropical turquesa, sombrero de paja y lentes oscuros redondos",
    "sigilo": "atuendo negro de sigilo con capucha que deja visible la cara",
    "punk": "cresta roja corta y chaleco negro con pequeñas tachuelas doradas",
}


def _eye_components(frame: Image.Image) -> list[list[tuple[int, int]]]:
    """Return compact blue iris components, excluding long animation effects."""
    px = frame.load()
    remaining = {(x, y) for y in range(96) for x in range(96)
                 if px[x, y][3] > 0 and px[x, y][2] > px[x, y][0] * 1.14
                 and px[x, y][2] > px[x, y][1] * 1.04}
    components = []
    while remaining:
        stack = [remaining.pop()]
        component = []
        while stack:
            x, y = stack.pop()
            component.append((x, y))
            for point in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                if point in remaining:
                    remaining.remove(point)
                    stack.append(point)
        xs = [x for x, _ in component]
        ys = [y for _, y in component]
        if (8 <= len(component) <= 40 and max(xs)-min(xs) <= 12
                and max(ys)-min(ys) <= 12 and 30 <= sum(xs)/len(xs) <= 90):
            components.append(component)
    return components


def _eye_pixels(frame: Image.Image) -> list[tuple[int, int]]:
    components = _eye_components(frame)
    pairs = [(a, b) for i, a in enumerate(components) for b in components[i+1:]
             if 8 <= abs(sum(x for x, _ in a)/len(a) - sum(x for x, _ in b)/len(b)) <= 28
             and abs(sum(y for _, y in a)/len(a) - sum(y for _, y in b)/len(b)) <= 12]
    if pairs:
        a, b = max(pairs, key=lambda pair: len(pair[0]) + len(pair[1]))
        return a + b
    return max(components, key=len) if components else []


def _eye_anchor(frame: Image.Image) -> tuple[int, int]:
    pts = _eye_pixels(frame)
    if not pts:
        return 48, 42
    return round(sum(x for x, _ in pts) / len(pts)), round(sum(y for _, y in pts) / len(pts))


def _costume_layer(frame: Image.Image, costume: str,
                   anchor: tuple[int, int] | None = None) -> Image.Image:
    eye_x, eye_y = anchor or _eye_anchor(frame)
    dark, main, accent = PALETAS[costume]
    layer = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Outfit sits below the face. Its clip is the original cat silhouette, so
    # neither the poses nor the foot pixels can shift.
    torso = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    t = ImageDraw.Draw(torso)
    y = eye_y + 13
    half = 17 if costume not in ("espacial", "dinosaurio") else 19
    t.polygon([(eye_x-half, y+2), (eye_x-10, y), (eye_x+11, y),
               (eye_x+half, y+5), (eye_x+13, y+23), (eye_x-13, y+23)],
              fill=main, outline=dark, width=2)
    t.line([(eye_x, y+3), (eye_x-1, y+21)], fill=accent, width=3)
    if costume in ("explorador", "vaquero", "chef", "mexicano", "punk"):
        t.line([(eye_x-11, y+5), (eye_x+11, y+17)], fill=accent, width=3)
    if costume in ("explorador", "espacial"):
        t.rectangle((eye_x-13, y+9, eye_x-6, y+16), fill=dark, outline=accent)
        t.rectangle((eye_x+6, y+9, eye_x+13, y+16), fill=dark, outline=accent)
    if costume == "mexicano":
        for stripe_y in (y+7, y+13, y+19):
            t.line([(eye_x-12, stripe_y), (eye_x+12, stripe_y)], fill=accent, width=2)
    if costume == "dinosaurio":
        for sx in (-10, 0, 10):
            t.polygon([(eye_x+sx-4, y+2), (eye_x+sx, y-5), (eye_x+sx+4, y+2)], fill=accent, outline=dark)
    if costume == "especial":
        # Short red cape panel, visible at both shoulders and behind the torso.
        t.polygon([(eye_x-14, y+2), (eye_x-22, y+8), (eye_x-18, y+21),
                   (eye_x-12, y+18)], fill=dark, outline=accent)

    alpha = frame.getchannel("A")
    torso.putalpha(Image.composite(torso.getchannel("A"), Image.new("L", (96, 96)), alpha))
    layer.alpha_composite(torso)
    d = ImageDraw.Draw(layer)

    # Stable head anchors are derived independently per frame from the eyes.
    hx = eye_x
    hy = eye_y - 30
    if costume in ("explorador", "vaquero", "playa"):
        brim = "#8c6139" if costume == "vaquero" else ("#b18a4e" if costume == "explorador" else "#907443")
        crown = "#c9a05d" if costume != "vaquero" else "#9a623b"
        d.ellipse((hx-27, hy+7, hx+27, hy+16), fill=brim, outline=dark, width=2)
        d.rectangle((hx-13, hy-5, hx+13, hy+10), fill=crown, outline=dark, width=2)
        d.line((hx-10, hy+4, hx+10, hy+4), fill=accent, width=2)
        if costume == "playa":
            d.ellipse((hx-12, eye_y-4, hx-2, eye_y+3), fill="#1d232a", outline=accent, width=1)
            d.ellipse((hx+2, eye_y-4, hx+12, eye_y+3), fill="#1d232a", outline=accent, width=1)
    elif costume == "especial":
        d.polygon([(hx-15, hy+7), (hx-13, hy-7), (hx-5, hy+1), (hx, hy-9),
                   (hx+5, hy+1), (hx+13, hy-7), (hx+15, hy+7)], fill=accent, outline=dark)
        d.rectangle((hx-15, hy+6, hx+15, hy+12), fill=accent, outline=dark)
    elif costume == "chef":
        d.rounded_rectangle((hx-17, hy-5, hx+17, hy+12), radius=5, fill="#f5f1e9", outline=dark, width=2)
        d.ellipse((hx-14, hy-13, hx-1, hy+4), fill="#fffaf0", outline=dark, width=2)
        d.ellipse((hx-5, hy-17, hx+10, hy+4), fill="#fffaf0", outline=dark, width=2)
        d.ellipse((hx+4, hy-12, hx+16, hy+4), fill="#fffaf0", outline=dark, width=2)
    elif costume == "ninja":
        d.rectangle((hx-25, eye_y-16, hx+25, eye_y-11), fill=main, outline=dark, width=1)
        d.rectangle((hx-4, eye_y-15, hx+8, eye_y-12), fill=accent)
        d.polygon([(hx+21, eye_y-14), (hx+34, eye_y-9), (hx+22, eye_y-4)], fill=accent, outline=dark)
    elif costume == "magico":
        d.polygon([(hx-25, hy+9), (hx+2, hy-22), (hx+27, hy+9)], fill=main, outline=dark)
        d.ellipse((hx-29, hy+6, hx+29, hy+15), fill=dark, outline=accent, width=2)
        d.polygon([(hx+2, hy-13), (hx+5, hy-7), (hx+12, hy-7),
                   (hx+7, hy-2), (hx+9, hy+4), (hx+2, hy+1), (hx-3, hy+5),
                   (hx-2, hy-2), (hx-8, hy-6), (hx-1, hy-7)], fill=accent)
    elif costume == "dinosaurio":
        d.pieslice((hx-25, hy-16, hx+25, eye_y+9), 180, 360, fill=main, outline=dark, width=2)
        for sx in (-17, -6, 6, 17):
            d.polygon([(hx+sx-4, hy+3), (hx+sx, hy-5), (hx+sx+4, hy+3)], fill=accent, outline=dark)
    elif costume == "sigilo":
        d.pieslice((hx-28, hy-11, hx+28, eye_y+12), 180, 360, fill=dark, outline=main, width=2)
    elif costume == "punk":
        for sx, top in [(-14, hy-9), (-7, hy-17), (0, hy-20), (7, hy-17), (14, hy-9)]:
            d.polygon([(hx+sx-4, hy+5), (hx+sx, top), (hx+sx+4, hy+5)], fill=accent, outline=dark)
    elif costume == "espacial":
        # Helmet rim and side pads; leave the eyes and muzzle unobscured.
        d.arc((hx-30, eye_y-27, hx+30, eye_y+26), 185, 355, fill=accent, width=3)
        d.ellipse((hx-29, eye_y-4, hx-22, eye_y+7), fill=main, outline=dark, width=2)
        d.ellipse((hx+22, eye_y-4, hx+29, eye_y+7), fill=main, outline=dark, width=2)
    elif costume == "mexicano":
        d.ellipse((hx-31, hy+7, hx+31, hy+17), fill="#c99038", outline=dark, width=2)
        d.ellipse((hx-15, hy-1, hx+15, hy+12), fill="#dca74a", outline=dark, width=2)
        d.line((hx-23, hy+12, hx+23, hy+12), fill="#d94a43", width=3)

    # Recolor only blue pixels in the compact eye region, leaving the cyan
    # attack effects in frames 17-18 untouched.
    px = frame.load()
    for y0 in range(max(0, eye_y-9), min(96, eye_y+9)):
        for x0 in range(max(0, eye_x-15), min(96, eye_x+17)):
            r, g, b, a = px[x0, y0]
            if a and b > r * 1.14 and b > g * 1.04:
                px[x0, y0] = (min(255, r+115), min(255, g+55), max(0, b-85), a)
    frame.alpha_composite(layer)
    return frame


def generate() -> None:
    entries = []
    anchors = [_eye_anchor(ORIGINAL.crop(((i % 8) * 96, (i // 8) * 96,
                                         (i % 8 + 1) * 96, (i // 8 + 1) * 96)))
               for i in range(24)]
    for closed, reference in {1: 0, 3: 2, 6: 5, 22: 21, 23: 21}.items():
        if not _eye_pixels(ORIGINAL.crop(((closed % 8) * 96, (closed // 8) * 96,
                                          (closed % 8 + 1) * 96, (closed // 8 + 1) * 96))):
            anchors[closed] = anchors[reference]
    for costume, name in NOMBRES.items():
        sheet = Image.new("RGBA", (768, 288), (0, 0, 0, 0))
        for i in range(24):
            x, y = (i % 8) * 96, (i // 8) * 96
            frame = ORIGINAL.crop((x, y, x+96, y+96))
            sheet.alpha_composite(_costume_layer(frame, costume, anchors[i]), (x, y))
        sprite_name = f"sprite_{costume}.png"
        sheet.save(PERSONAJES / sprite_name, optimize=True)
        entries.append({
            "id": costume,
            "nombre": name,
            "archivos": {"menu": f"assets/personajes/menu_{costume}.webp", "sprite": f"assets/personajes/{sprite_name}"},
            "método": {"menu": "generado", "sprite": "compuesto"},
            "prompt": f"Retrato pixel-art de Senku, gato blanco y negro de ojos amarillos, con {DETALLES[costume]} según el catálogo de referencia; misma pose sentada, escala y encuadre del menú original, fondo transparente, sin texto."
        })
    (PERSONAJES / "trajes.json").write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")


def verify() -> None:
    errors = []
    originals = []
    for i in range(24):
        x, y = (i % 8) * 96, (i // 8) * 96
        originals.append(ORIGINAL.crop((x, y, x+96, y+96)))
    for costume in NOMBRES:
        menu = Image.open(PERSONAJES / f"menu_{costume}.webp")
        sheet = Image.open(PERSONAJES / f"sprite_{costume}.png").convert("RGBA")
        if menu.size != (512, 512): errors.append(f"menu_{costume}: tamaño {menu.size}")
        if sheet.size != (768, 288): errors.append(f"sprite_{costume}: tamaño {sheet.size}")
        for label, path in (("menu", PERSONAJES/f"menu_{costume}.webp"), ("sprite", PERSONAJES/f"sprite_{costume}.png")):
            if path.stat().st_size >= 400_000: errors.append(f"{path.name}: {path.stat().st_size} bytes")
        if menu.mode != "RGBA" and "A" not in menu.getbands(): errors.append(f"menu_{costume}: falta canal alpha")
        if sheet.getchannel("A").getextrema()[0] != 0: errors.append(f"sprite_{costume}: fondo opaco")
        for i, original in enumerate(originals):
            x, y = (i % 8) * 96, (i // 8) * 96
            current = sheet.crop((x, y, x+96, y+96))
            # Foot box is the opaque component in the bottom 24 px, where no
            # costume layer is drawn. Compare all four edges within 3 px.
            a = original.crop((0, 72, 96, 96)).getchannel("A").getbbox()
            b = current.crop((0, 72, 96, 96)).getchannel("A").getbbox()
            if a is None or b is None or any(abs(u-v) > 3 for u, v in zip(a, b)):
                errors.append(f"sprite_{costume} cuadro {i}: caja de pies {a} != {b}")
    if errors:
        raise SystemExit("\n".join(errors))
    print("OK: 12 menús y hojas (512x512 / 768x288), transparencia, <400 KB y caja de pies ±3 px en 24 cuadros por traje.")


if __name__ == "__main__":
    import sys
    if sys.argv[1:] == ["verify"]:
        verify()
    else:
        generate()
