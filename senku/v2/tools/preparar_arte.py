"""Recorta, empaqueta y verifica el arte propuesto. Sólo requiere Pillow.

Preparar: python3 senku/v2/tools/preparar_arte.py --referencias RUTA --generados RUTA
Verificar: python3 senku/v2/tools/preparar_arte.py --verificar
Los generados de imagegen se reciben como ocho PNG con los nombres del catálogo.
No genera dibujos ni lee/copía assets de Legacy. No modifica las fuentes.
"""

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


ASSETS = Path(__file__).resolve().parents[1] / "assets"
NEAREST = Image.Resampling.NEAREST
FONDOS = {
    "taqueria_ciudad": ("file_00000000f8a481f59ad1c7b09dfe1400.png", (4, 190, 1444, 1000)),
    "desierto": ("file_000000004e7081f5ac339f5b180b72b4.png", (4, 100, 1444, 910)),
    "taqueria_desierto": ("file_0000000033b081f5bfbd5da718d6950d.png", (4, 100, 1444, 910)),
    "camioneta_reja": ("file_0000000054a081f586399164aeac083e.png", (4, 100, 1444, 910)),
}
CAPTURAS = [
    "Screenshot_2026-10-22-04-38-50-489_com.openai.chatgpt.jpg",
    "Screenshot_2026-10-22-04-38-55-870_com.openai.chatgpt.jpg",
    "Screenshot_2026-10-22-04-39-05-728_com.openai.chatgpt-edit.jpg",
]
# Coordenadas de la fuente completa (1200 × 2608), no de la vista reducida.
OBJETOS = {
    "churu": (0, (348, 720, 780, 1960), (96, 256)),
    "lanzador_ratones": (1, (90, 1120, 850, 1510), (320, 160)),
    "raton_proyectil": (1, (880, 1180, 1160, 1370), (128, 96)),
    "botiquin": (2, (86, 1028, 280, 1200), (128, 128)),
    "anclador": (2, (120, 1190, 558, 1384), (256, 128)),
    "garras_escalada": (2, (664, 1050, 1134, 1330), (256, 160)),
}
HOJAS = ["sprite_original", "sprite_rata", "raton_negro", "raton_cafe",
         "hamster_negro", "hamster_cafe"]


def guardar(imagen, ruta):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    if ruta.suffix == ".webp":
        imagen.save(ruta, lossless=True, method=6)
    else:
        imagen.save(ruta, optimize=True)


def quitar_fondo_negro(imagen, semillas=()):
    """Quita sólo negro conectado al exterior o a huecos conocidos del objeto."""
    imagen = imagen.convert("RGBA")
    w, h = imagen.size
    pixeles = imagen.load()
    cola = deque([(x, y) for x in range(w) for y in (0, h - 1)]
                 + [(x, y) for y in range(h) for x in (0, w - 1)] + list(semillas))
    while cola:
        x, y = cola.popleft()
        if not (0 <= x < w and 0 <= y < h):
            continue
        r, g, b, a = pixeles[x, y]
        if not a or max(r, g, b) > 30:
            continue
        pixeles[x, y] = (0, 0, 0, 0)
        cola.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return imagen


def encajar(imagen, tamano, margen=8):
    imagen = imagen.crop(imagen.getbbox())
    factor = min((tamano[0] - 2 * margen) / imagen.width,
                 (tamano[1] - 2 * margen) / imagen.height)
    imagen = imagen.resize((round(imagen.width * factor), round(imagen.height * factor)), NEAREST)
    lienzo = Image.new("RGBA", tamano)
    lienzo.alpha_composite(imagen, ((tamano[0] - imagen.width) // 2,
                                  (tamano[1] - imagen.height) // 2))
    return lienzo


def cuadros(imagen):
    # Alpha binario: elimina ruido casi invisible y evita halos en Canvas.
    imagen = imagen.convert("RGBA")
    imagen.putalpha(imagen.getchannel("A").point(lambda a: 255 if a >= 128 else 0))
    resultado = []
    for fila in range(2):
        banda = imagen.crop((0, round(fila * imagen.height / 2),
                             imagen.width, round((fila + 1) * imagen.height / 2)))
        ocupadas = [x for x in range(banda.width)
                    if banda.getchannel("A").crop((x, 0, x + 1, banda.height)).getbbox()]
        grupos = []
        for x in ocupadas:
            if not grupos or x - grupos[-1][-1] > 12:
                grupos.append([])
            grupos[-1].append(x)
        assert len(grupos) == 4, f"Se esperaban cuatro siluetas separadas en fila {fila}"
        for grupo in grupos:
            recorte = banda.crop((grupo[0], 0, grupo[-1] + 1, banda.height))
            resultado.append(recorte.crop(recorte.getbbox()))
    return resultado


def preparar(referencias, generados):
    for nombre, (fuente, rectangulo) in FONDOS.items():
        imagen = Image.open(referencias / fuente).convert("RGB").crop(rectangulo)
        guardar(imagen.resize((1280, 720), NEAREST), ASSETS / "fondos" / f"{nombre}.webp")
    for nombre, (indice, rectangulo, tamano) in OBJETOS.items():
        imagen = Image.open(referencias / CAPTURAS[indice]).crop(rectangulo)
        # El hueco encerrado por la correa también es fondo, no tinta del rótulo.
        semillas = ((290, 280),) if nombre == "lanzador_ratones" else ()
        imagen = quitar_fondo_negro(imagen, semillas)
        guardar(encajar(imagen, tamano), ASSETS / "objetos" / f"{nombre}.png")
    for nombre in ("menu_original", "menu_rata"):
        imagen = Image.open(generados / f"{nombre}.png").convert("RGBA")
        guardar(imagen.resize((512, 512), NEAREST), ASSETS / "personajes" / f"{nombre}.webp")
    for nombre in HOJAS:
        poses = cuadros(Image.open(generados / f"{nombre}.png"))
        jugador = nombre.startswith("sprite_")
        limite = 84 if jugador else 64
        factor = limite / max(max(pose.size) for pose in poses)
        hoja = Image.new("RGBA", (384, 192))
        for indice, pose in enumerate(poses):
            pose = pose.resize((round(pose.width * factor), round(pose.height * factor)), NEAREST)
            x = (indice % 4) * 96 + (96 - pose.width) // 2
            y = (indice // 4) * 96 + 88 - pose.height
            hoja.alpha_composite(pose, (x, y))
        hoja = hoja.quantize(colors=64, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        carpeta = "personajes" if jugador else "enemigos"
        guardar(hoja, ASSETS / carpeta / f"{nombre}.png")


def verificar():
    esperados = {f"fondos/{n}.webp" for n in FONDOS}
    esperados |= {f"objetos/{n}.png" for n in OBJETOS}
    esperados |= {f"personajes/{n}.webp" for n in ("menu_original", "menu_rata")}
    esperados |= {f"{'personajes' if n.startswith('sprite_') else 'enemigos'}/{n}.png" for n in HOJAS}
    imagenes = {str(p.relative_to(ASSETS)) for p in ASSETS.rglob("*") if p.suffix in (".png", ".webp")}
    assert imagenes == esperados, f"Catálogo distinto: {imagenes ^ esperados}"
    for nombre in sorted(esperados):
        ruta = ASSETS / nombre
        with Image.open(ruta) as original:
            original.load()
            imagen = original.convert("RGBA")
        peso = ruta.stat().st_size
        assert peso < (400_000 if nombre.startswith("fondos/") else 500_000), nombre
        if nombre.startswith("fondos/"):
            assert imagen.size == (1280, 720), nombre
        else:
            assert imagen.getchannel("A").getextrema() == (0, 255), nombre
        if ruta.stem in HOJAS:
            assert imagen.size == (384, 192), nombre
            assert set(imagen.getchannel("A").getdata()) == {0, 255}, nombre
            for fila in range(2):
                distintos = set()
                for col in range(4):
                    celda = imagen.crop((col * 96, fila * 96, (col + 1) * 96, (fila + 1) * 96))
                    caja = celda.getbbox()
                    assert caja and caja[0] >= 4 and caja[1] >= 4 and caja[2] <= 92 and caja[3] == 88, (nombre, fila, col, caja)
                    distintos.add(celda.tobytes())
                assert len(distintos) == 4, (nombre, fila, "poses duplicadas")
        print(f"{nombre}: {imagen.width}x{imagen.height}; {peso} bytes; OK")
    archivos = [p for p in ASSETS.rglob("*") if p.is_file()]
    assert all(p.stat().st_size < 500_000 for p in archivos)
    total = sum(p.stat().st_size for p in archivos)
    assert total < 5_000_000, total
    print(f"OK: {len(esperados)} imágenes; assets completos: {total} bytes (<5 MB).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--referencias", type=Path)
    parser.add_argument("--generados", type=Path)
    parser.add_argument("--verificar", action="store_true")
    args = parser.parse_args()
    if not args.verificar:
        if not args.referencias or not args.generados:
            parser.error("preparar requiere --referencias y --generados")
        preparar(args.referencias, args.generados)
    verificar()
