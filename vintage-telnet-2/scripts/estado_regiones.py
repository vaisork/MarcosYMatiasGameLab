#!/usr/bin/env python3
"""Imprime un inventario de contenido regional a partir del árbol local de VT2."""

from __future__ import annotations

import argparse
import json
import subprocess
from collections import Counter
from datetime import date
from pathlib import Path


def read_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {} if default is None else default


def git_date(root: Path, path: str, *, added=False):
    args = ["git", "-C", str(root), "log", "--format=%cs"]
    if added:
        args += ["--diff-filter=A", "--follow", "-1"]
    else:
        args += ["-1"]
    args += ["--", path]
    try:
        value = subprocess.run(args, check=True, capture_output=True, text=True).stdout.strip()
        return date.fromisoformat(value) if value else None
    except (OSError, subprocess.CalledProcessError, ValueError):
        return None


def asset_path(root: Path, value: str | None) -> Path | None:
    if not isinstance(value, str) or not value:
        return None
    value = value.removeprefix("/")
    path = (root / value).resolve()
    return path if path.is_relative_to(root.resolve()) else None


def asset_exists(root: Path, value: str | None) -> bool:
    path = asset_path(root, value)
    return bool(path and path.is_file())


def load_world(root: Path):
    return read_json(root / "content/world.json")


def regions(root: Path):
    world = load_world(root)
    creatures = list(world.get("creatures", {}).values())
    room_data = {}
    npc_data = {}
    metadata = {}
    for path in sorted((root / "content/regions").glob("*.json")):
        data = read_json(path)
        for rid, region in data.get("regions", {}).items():
            metadata[rid] = region
        room_data.update(data.get("rooms", {}))
        npc_data.update(data.get("npcs", {}))

    result = []
    for rid, meta in sorted(metadata.items(), key=lambda pair: pair[0]):
        rooms = [room for room in room_data.values() if room.get("region") == rid]
        room_ids = {room.get("id") for room in rooms}
        locals_npc = [npc for npc in npc_data.values()
                      if npc.get("home_room") in room_ids]
        fauna = [creature for creature in creatures
                 if creature.get("region") == rid and creature.get("combatant_kind") != "human"]
        rivals = [creature for creature in creatures
                  if creature.get("region") == rid and creature.get("combatant_kind") == "human"]
        scenes = {}
        for room in rooms:
            scene = read_json(root / "client-rpg/scenes" / f"{room.get('id', '')}.json")
            scenes[room.get("id")] = scene
        backgrounds = {room_id for room_id, scene in scenes.items()
                       if asset_exists(root, "client-rpg/" + scene.get("background", ""))}
        finds = meta.get("search", {}).get("finds", [])
        result.append({
            "id": rid, "name": meta.get("name", rid), "rooms": rooms,
            "backgrounds": backgrounds, "creatures": fauna, "rivals": rivals,
            "npcs": locals_npc, "finds": finds,
        })
    return result


def map_status(root: Path, region_id: str) -> tuple[str, str]:
    illustration = root / "client/art/map/mundo-anime-v1.webp"
    if not illustration.is_file():
        return "sí", "no"
    map_date = git_date(root, "client/art/map/mundo-anime-v1.webp")
    created = git_date(root, f"content/regions/{region_id}.json", added=True)
    if map_date and created and map_date < created:
        return "sí", "revisar a ojo"
    return "sí", "sí"


def count_assets(root: Path, entries: list[dict], field: str):
    present = {id(entry): asset_exists(root, entry.get(field)) for entry in entries}
    return present


def markdown(root: Path) -> str:
    data = regions(root)
    map_path = root / "client/art/map/mundo-anime-v1.webp"
    lines = [
        "# Estado automático de VT2 por región", "",
        f"Generado: {date.today().isoformat()} · Commit: "
        f"{git_commit(root)}", "",
        "| Región | ID | Salas | Con fondo | Criaturas ilustradas / sin | Rivales humanos propios / compartidos / sin | Habitantes con retrato / sin | Hallazgos sin texto | Mapa descubierto (2D/3D) | Mapa ilustrado |",
        "|---|---|---:|---:|---|---|---|---:|---|---|",
    ]
    missing = []
    for region in data:
        rid, name = region["id"], region["name"]
        rooms = region["rooms"]
        creatures = region["creatures"]
        rivals = region["rivals"]
        npcs = region["npcs"]
        creature_assets = count_assets(root, creatures, "illustration")
        no_creatures = [entry for entry in creatures if not creature_assets[id(entry)]]
        rival_assets = count_assets(root, rivals, "illustration")
        image_users = Counter(entry.get("illustration") for entry in rivals
                              if rival_assets[id(entry)])
        shared = {path for path, count in image_users.items() if count > 1}
        own_rivals = [entry for entry in rivals if rival_assets[id(entry)]
                      and entry.get("illustration") not in shared]
        shared_rivals = [entry for entry in rivals if rival_assets[id(entry)]
                         and entry.get("illustration") in shared]
        no_rivals = [entry for entry in rivals if not rival_assets[id(entry)]]
        npc_assets = count_assets(root, npcs, "portrait")
        with_portrait = [npc for npc in npcs if npc_assets[id(npc)]]
        no_portrait = [npc for npc in npcs if not npc_assets[id(npc)]]
        no_text = [find for find in region["finds"]
                   if not isinstance(find, dict) or not str(find.get("text", "")).strip()]
        discovered, illustrated = map_status(root, rid)
        lines.append(
            f"| {name} | `{rid}` | {len(rooms)} | {len(region['backgrounds'])}/{len(rooms)} | "
            f"{len(creatures) - len(no_creatures)} / {len(no_creatures)} | "
            f"{len(own_rivals)} / {len(shared_rivals)} / {len(no_rivals)} | "
            f"{len(with_portrait)} / {len(no_portrait)} | {len(no_text)} | "
            f"{discovered} | {illustrated} |"
        )
        items = []
        for room in rooms:
            if room.get("id") not in region["backgrounds"]:
                items.append(f"sin fondo: {room.get('name', room.get('id'))} (`{room.get('id')}`)")
        items += [f"criatura sin ilustración: {entry.get('name', entry.get('id'))} (`{entry.get('id')}`)"
                  for entry in no_creatures]
        items += [f"rival con imagen compartida: {entry.get('name', entry.get('id'))} (`{entry.get('id')}`)"
                  for entry in shared_rivals]
        items += [f"rival sin imagen propia: {entry.get('name', entry.get('id'))} (`{entry.get('id')}`)"
                  for entry in no_rivals]
        items += [f"habitante sin retrato: {entry.get('name', entry.get('id'))} (`{entry.get('id')}`)"
                  for entry in no_portrait]
        items += [f"hallazgo sin texto: {entry.get('item', 'sin ID')}" if isinstance(entry, dict)
                  else "hallazgo sin texto: entrada no estructurada" for entry in no_text]
        if illustrated == "revisar a ojo":
            items.append("mapa ilustrado: revisar a ojo; el webp precede a la región según git log")
        if items:
            missing.append((name, rid, items))

    lines += ["", "## Faltantes", ""]
    if not missing:
        lines.append("Sin faltantes detectados.")
    else:
        for name, rid, items in missing:
            lines.append(f"### {name} (`{rid}`)")
            lines.extend(f"- {item}" for item in items)
            lines.append("")
    lines += [
        "## Criterios", "",
        "El mapa descubierto aparece como **sí** cuando hay salas regionales en el catálogo; el mapa 2D/3D solo muestra nodos descubiertos por cada personaje.",
        "El mapa ilustrado se infiere del orden de creación de los datos y del webp. Si el webp es anterior, requiere cotejo visual.",
        "Los fondos cuentan cuando la escena RPG declara un archivo existente. Retratos e ilustraciones cuentan si la ruta declarada existe en disco.",
    ]
    return "\n".join(lines) + "\n"


def git_commit(root: Path) -> str:
    try:
        return subprocess.run(["git", "-C", str(root), "rev-parse", "--short", "HEAD"],
                              check=True, capture_output=True, text=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return "no disponible"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1],
                        help="raíz VT2 (predeterminado: carpeta del script)")
    args = parser.parse_args()
    print(markdown(args.root.resolve()), end="")


if __name__ == "__main__":
    main()
