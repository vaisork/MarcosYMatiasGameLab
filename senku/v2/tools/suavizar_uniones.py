#!/usr/bin/env python3
"""Suaviza las uniones verticales del cielo/fondo entre tramos pintados contiguos.

Para cada fila por encima de `ylim`, desplaza el color de las ~48 px a cada lado del borde
hacia el promedio de ambos bordes (corrección que crece hacia la unión), conservando la
textura. Suelo y plataformas (filas >= ylim) no se tocan; hay una transición de 24 filas.

Uso: python3 senku/v2/tools/suavizar_uniones.py [--salida DIR]   (sin --salida sobrescribe;
ya se aplicó el 31/10/2026: no volver a correrlo sobre los tramos ya suavizados)
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parents[1] / 'assets' / 'escenas'
BANDA = 48
TRANSICION = 24
# (escena, tramo izquierdo, tramo derecho, ylim): filas por encima de ylim son fondo.
UNIONES = [
    ('despenadero', 1, 2, 540),  # repisa pintada empieza en x>=75 del tramo 2, y~555
    ('despenadero', 3, 4, 720),  # solo fondo (abismo) a ambos lados
    ('cima', 1, 2, 470),         # rocas pisables desde y~480
]


def suavizar(a, b, ylim):
    a = a.astype(np.float32)
    b = b.astype(np.float32)
    h = a.shape[0]
    borde_a = a[:, -3:, :].mean(axis=1)
    borde_b = b[:, :3, :].mean(axis=1)
    # Suavizado vertical para que la corrección no deje rayas horizontales.
    k = np.exp(-0.5 * (np.arange(-12, 13) / 5.0) ** 2)
    k /= k.sum()
    def suave(c):
        p = np.pad(c, ((12, 12), (0, 0)), mode='edge')
        return np.stack([np.convolve(p[:, i], k, mode='valid') for i in range(c.shape[1])], axis=1)
    borde_a, borde_b = suave(borde_a), suave(borde_b)
    meta = (borde_a + borde_b) / 2
    filas = np.clip((ylim - np.arange(h)) / TRANSICION, 0, 1)[:, None, None]
    rampa = np.linspace(0, 1, BANDA) ** 1.5  # 0 lejos de la unión, 1 en el borde
    a[:, -BANDA:, :] += filas * rampa[None, :, None] * (meta - borde_a)[:, None, :]
    b[:, :BANDA, :] += filas * rampa[::-1][None, :, None] * (meta - borde_b)[:, None, :]
    return np.clip(a, 0, 255).astype(np.uint8), np.clip(b, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--salida', type=Path, default=None)
    args = ap.parse_args()
    for escena, ia, ib, ylim in UNIONES:
        rutas = [RAIZ / escena / f'{n:02d}.webp' for n in (ia, ib)]
        a, b = (np.array(Image.open(r).convert('RGB')) for r in rutas)
        a, b = suavizar(a, b, ylim)
        for ruta, img in zip(rutas, (a, b)):
            destino = (args.salida / escena / ruta.name) if args.salida else ruta
            destino.parent.mkdir(parents=True, exist_ok=True)
            Image.fromarray(img).save(destino, 'WEBP', quality=88, method=6)
            print(destino, destino.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
