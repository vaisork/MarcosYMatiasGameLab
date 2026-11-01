"""Cosmetic achievements and next steps derived from the character's saved state."""
from . import mechanics as m

ACHIEVEMENTS = [
    ("explore_5", "Primeros pasos", "Visita 5 lugares", "explore", 5),
    ("explore_15", "Rastreador", "Visita 15 lugares", "explore", 15),
    ("explore_30", "Gran caminante", "Visita 30 lugares", "explore", 30),
    ("explore_60", "Viajero de Vaisgard", "Visita 60 lugares", "explore", 60),
    ("regions_2", "Dos horizontes", "Explora 2 regiones", "regions", 2),
    ("regions_4", "Mapa en expansión", "Explora 4 regiones", "regions", 4),
    ("regions_6", "Conoce Vaisgard", "Explora 6 regiones", "regions", 6),
    ("secret_1", "Ojo atento", "Encuentra 1 secreto", "secrets", 1),
    ("secret_3", "Guardián de secretos", "Encuentra 3 secretos", "secrets", 3),
    ("beast_1", "Primera criatura", "Añade una criatura al bestiario", "bestiary", 1),
    ("beast_5", "Observador", "Descubre 5 criaturas", "bestiary", 5),
    ("beast_10", "Naturalista", "Descubre 10 criaturas", "bestiary", 10),
    ("beast_20", "Gran naturalista", "Descubre 20 criaturas", "bestiary", 20),
    ("behavior_1", "Aprendiz de rastreador", "Aprende una conducta del bestiario", "behavior", 1),
    ("behavior_10", "Lector de huellas", "Aprende 10 conductas", "behavior", 10),
    ("behavior_30", "Experto en criaturas", "Aprende 30 conductas", "behavior", 30),
    ("quests_1", "Una mano amiga", "Entrega un encargo", "quests", 1),
    ("quests_3", "Ayudante del pueblo", "Entrega 3 encargos", "quests", 3),
    ("quests_6", "Amigo de los pueblos", "Entrega 6 encargos", "quests", 6),
    ("quests_10", "Gran colaborador", "Entrega 10 encargos", "quests", 10),
    ("story_1", "Una historia comienza", "Cierra una historia", "stories", 1),
    ("story_3", "Tejedor de historias", "Cierra 3 historias", "stories", 3),
    ("numen_1", "Compañía fiel", "Vincula un Númen", "numenes", 1),
    ("numen_2", "Amigos de viaje", "Vincula 2 Númenes", "numenes", 2),
    ("numen_3", "Hogar lleno", "Vincula 3 Númenes", "numenes", 3),
    ("numen_active", "A tu lado", "Viaja con un Númen", "active_numen", 1),
    ("numen_models_3", "Encuentros distintos", "Conoce 3 especies de Númen", "numen_models", 3),
    ("numen_models_6", "Amigo de todos", "Conoce 6 especies de Númen", "numen_models", 6),
    ("social_1", "Hola, compañero", "Comparte una actividad con alguien", "social", 1),
    ("social_3", "Buen compañero", "Comparte 3 actividades", "social", 3),
    ("social_10", "Amigo de aventuras", "Comparte 10 actividades", "social", 10),
    ("social_kinds_2", "Maneras de ayudar", "Prueba 2 acciones sociales distintas", "social_kinds", 2),
    ("social_kinds_4", "Equipo unido", "Prueba 4 acciones sociales distintas", "social_kinds", 4),
    ("victory_1", "Primer triunfo", "Gana un combate", "victories", 1),
    ("victory_5", "Valor sereno", "Gana 5 combates", "victories", 5),
    ("victory_20", "Defensor de caminos", "Gana 20 combates", "victories", 20),
    ("victory_types_3", "Conoce a sus rivales", "Vence 3 tipos de adversario", "victory_types", 3),
    ("level_5", "Aventurero en marcha", "Alcanza el nivel 5", "level", 5),
    ("level_10", "Aventurero experto", "Alcanza el nivel 10", "level", 10),
    ("dragon", "Valor de leyenda", "Participa en la historia del Dragón", "dragon", 1),
]

assert len(ACHIEVEMENTS) == 40


def metrics(state, content, world):
    rooms = getattr(content, "rooms", {})
    visited = set(state.get("visited", []))
    regions = {rooms[room]["region"] for room in visited if room in rooms}
    secrets = sum(1 for entry in getattr(content, "secrets", {}).values()
                  if entry.get("flag") in state.get("flags", []) or
                  "participated:" + str(entry.get("flag")) in state.get("flags", []))
    behaviors = sum(len(entry.get("behavior", [])) for entry in state.get("bestiary", {}).values())
    paid = sum(1 for quest in state.get("quests", {}).values() if quest.get("status") == "paid")
    closed_stories = sum(1 for story in getattr(content, "stories", {}).values()
                         if story.get("steps") and all(step in state.get("flags", [])
                                                       for step in story["steps"]))
    numenes = state.get("numenes", {})
    bonded = numenes.get("bonded", [])
    social = state.get("social_stats", {})
    victories = [flag for flag in state.get("flags", []) if flag.startswith("victoria:")]
    world_flags = set(world.get("flags", []))
    return {
        "explore": len(visited), "regions": len(regions), "secrets": secrets,
        "bestiary": len(state.get("bestiary", {})), "behavior": behaviors,
        "quests": paid, "stories": closed_stories, "numenes": len(bonded),
        "active_numen": int(bool(numenes.get("active"))),
        "numen_models": len({entry.get("model") for entry in bonded}),
        "social": sum(social.values()), "social_kinds": sum(value > 0 for value in social.values()),
        "victories": len(victories), "victory_types": len({flag.rsplit(":", 1)[-1] for flag in victories}),
        "level": state.get("level", 1),
        "dragon": int("dragon_vencido" in state.get("flags", []) or
                       "participated:dragon_vencido" in state.get("flags", []) or
                       ("dragon_vencido" in world_flags and state.get("id") in world.get("dragon_participants", []))),
    }


def update(state, content, world):
    values = metrics(state, content, world)
    unlocked = list(state.get("achievements", []))
    notices = []
    for key, name, description, metric, goal in ACHIEVEMENTS:
        if key in unlocked or values[metric] < goal:
            continue
        unlocked.append(key)
        notices.append({"id": key, "name": name, "description": description})
    if notices:
        state["achievements"] = unlocked
    return notices


def book(state, content, world):
    values = metrics(state, content, world)
    unlocked = set(state.get("achievements", []))
    entries = [{"id": key, "name": name, "description": description,
                "unlocked": key in unlocked, "progress": min(values[metric], goal), "target": goal}
               for key, name, description, metric, goal in ACHIEVEMENTS]
    return {"unlocked": len(unlocked), "total": len(ACHIEVEMENTS), "entries": entries}


def goals(state, content, world):
    accepted = [(qid, quest) for qid, quest in state.get("quests", {}).items()
                if quest.get("status") in ("accepted", "ready")]
    next_quest = next((content.quests[qid] for qid, _ in accepted if qid in content.quests), None)
    room_counts = {}
    for room_id, room in content.rooms.items():
        room_counts[room["region"]] = room_counts.get(room["region"], 0) + 1
    visited_by_region = {}
    for room_id in state.get("visited", []):
        if room_id in content.rooms:
            region = content.rooms[room_id]["region"]
            visited_by_region[region] = visited_by_region.get(region, 0) + 1
    current_region = content.rooms.get(state.get("location"), {}).get("region")
    here = min(room_counts.get(current_region, 0), visited_by_region.get(current_region, 0))
    candidates = [entry for entry in content.creatures if entry not in state.get("bestiary", {})]
    active = m.get_active_numen(state)
    unfinished = [story for story in content.stories.values()
                  if story.get("steps") and not all(step in state.get("flags", [])
                                                     for step in story["steps"])]
    now = ({"title": next_quest["name"], "text": next_quest.get("accept_text", "Continúa tu encargo.")}
           if next_quest else {"title": "Explora este lugar", "text": "Observa las señales y descubre qué puedes hacer aquí."})
    week = {"title": "Completa tu colección", "text": f"Bestiario: {len(state.get('bestiary', {}))} criaturas conocidas."
            if candidates else "Ya conoces todas las criaturas observadas disponibles."}
    if active:
        week = {"title": f"Acompaña a {active['name']}", "text": "Puedes cuidar de tu compañero cuando quieras."}
    grand = {"title": unfinished[0].get("title", "Una historia de Vaisgard"),
             "text": "Sigue los pasos que el mundo ya te ofrece."} if unfinished else {
                 "title": "Explora una nueva región", "text": f"Has visitado {here} lugares de esta región."}
    return [{"period": "Ahora", **now}, {"period": "Esta semana", **week},
            {"period": "Gran aventura", **grand}]
