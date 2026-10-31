from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest

from server.app import create_app
from server import creatures, store, world


class EntryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.config = dict(TESTING=True, SECRET_KEY="test-secret-" * 5,
                           DATA_DIR=self.temp.name, SESSION_COOKIE_SECURE=False)
        self.app = create_app(self.config)
        self.client = self.app.test_client()
        self.path = self.app.config["DATABASE"]

    def tearDown(self):
        self.temp.cleanup()

    def post(self, route, data=None, client=None):
        client = client or self.client
        page = client.get("/").get_data(as_text=True)
        csrf = re.search(r'name="csrf" value="([^"]+)"', page)[1]
        return client.post(route, data={**(data or {}), "csrf": csrf})

    def register(self, username="matias", client=None, name="Matías"):
        return self.post("/register", dict(username=username, name=name, password="una clave de prueba"), client)

    def test_public_p0_has_no_editorial_placeholders(self):
        for room in world.ROOMS.values():
            visible = (room["name"] + " " + room["description"]).lower()
            self.assertNotIn("[placeholder]", visible)
            self.assertNotIn("pendiente", visible)
        for species in world.SPECIES:
            self.assertNotIn("pendiente", species["blurb"].lower())

    def test_location_art_is_structured_and_served_without_session_cookie(self):
        room = world.describe_room("valdren_centro", [])
        self.assertEqual(room["art"]["src"], "/assets/locations/valdren.webp")
        response = self.client.get(room["art"]["src"])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/webp")
        self.assertNotIn("Set-Cookie", response.headers)

    def test_rooms_sharing_a_visual_context_keep_the_same_art(self):
        centro = world.describe_room("valdren_centro", [])
        mercado = world.describe_room("valdren_mercado", [])
        self.assertEqual(centro["visual_context_id"], "zone.valdren")
        self.assertEqual(mercado["visual_context_id"], "zone.valdren")
        self.assertEqual(mercado["art"], centro["art"])

    def test_forja_has_its_own_approved_art_distinct_from_the_town(self):
        centro = world.describe_room("valdren_centro", [])
        forja = world.describe_room("valdren_forja", [])
        self.assertEqual(forja["visual_context_id"], "zone.valdren.forja_daro")
        self.assertNotEqual(forja["visual_context_id"], centro["visual_context_id"])
        self.assertNotEqual(forja["art"], centro["art"])
        response = self.client.get(forja["art"]["src"])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/webp")

    def test_visual_context_changes_at_the_town_boundary(self):
        sendero = world.describe_room("valdren_sendero", [])
        lindero = world.describe_room("valdren_camino_lindero", [])
        self.assertEqual(sendero["visual_context_id"], "zone.edran.valdren_outskirts")
        self.assertEqual(sendero["visual_context_id"], lindero["visual_context_id"])
        self.assertNotEqual(sendero["visual_context_id"], "zone.valdren")

    def test_context_without_an_approved_asset_falls_back_to_no_art(self):
        # Un contexto todavía sin paisaje aprobado conserva el marco neutro.
        room = world.describe_room("piedra_pared_partida", [])
        self.assertIsNone(room["visual_context_id"])
        self.assertIsNone(room["art"])
        for town in ("valdren_centro", "khariel_centro", "brumak_centro", "narevia_centro",
                     "velmora_centro", "vaisgard"):
            self.assertIsNotNone(world.describe_room(town, [])["art"], town)

    def test_every_room_resolves_a_visual_context_id_without_parsing_prose(self):
        for room_id in world.ROOMS:
            room = world.describe_room(room_id, [])
            self.assertIn("visual_context_id", room)
            self.assertEqual(room["visual_context_id"], world.get_visual_context_id(room_id))

    def test_persists_after_new_app_and_new_device(self):
        self.assertEqual(self.register().status_code, 303)
        first = self.client.get("/api/me").json["player"]
        cookie = self.client.get_cookie("vt_session").value
        app2 = create_app(self.config)
        resumed = app2.test_client()
        resumed.set_cookie("vt_session", cookie)
        self.assertEqual(resumed.get("/api/me").json["player"]["id"], first["id"])
        device = app2.test_client()
        self.assertEqual(device.get("/api/me").status_code, 401)
        self.assertEqual(self.post("/login", dict(username="MATIAS", password="una clave de prueba"), device).status_code, 303)
        second = device.get("/api/me").json["player"]
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(first["player_number"], second["player_number"])
        self.assertEqual(first["created_at"], second["created_at"])
        self.assertGreater(second["last_access_at"], first["last_access_at"])
        with store.connect(self.path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM players").fetchone()[0], 1)
            self.assertEqual(db.execute("SELECT count(*) FROM access_events").fetchone()[0], 2)
            hashed = db.execute("SELECT password_hash FROM accounts").fetchone()[0]
            self.assertTrue(hashed.startswith("scrypt:"))
            self.assertNotIn("una clave de prueba", hashed)

    def test_wrong_password_duplicate_and_unique_numbers(self):
        self.register()
        before = self.client.get("/api/me").json["player"]["last_access_at"]
        self.assertEqual(self.register("MATIAS").status_code, 409)
        self.assertEqual(self.post("/login", dict(username="matias", password="wrong")).status_code, 401)
        self.assertEqual(self.client.get("/api/me").json["player"]["last_access_at"], before)
        # El nombre de personaje es único en todo el mundo (sin importar acentos).
        self.assertEqual(self.register("javier", name="matias").status_code, 409)
        self.register("javier", name="Javier")
        self.assertEqual(self.client.get("/api/me").json["player"]["player_number"], 2)
        with store.connect(self.path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM access_events").fetchone()[0], 2)

    def test_csrf_logout_revocation_and_expiry(self):
        self.assertEqual(self.client.post("/register", data={}).status_code, 400)
        self.register()
        stolen_cookie = self.client.get_cookie("vt_session").value
        self.assertEqual(self.post("/logout").status_code, 303)
        self.client.set_cookie("vt_session", stolen_cookie)
        self.assertEqual(self.client.get("/api/me").status_code, 401)
        self.post("/login", dict(username="matias", password="una clave de prueba"))
        with store.connect(self.path) as db:
            db.execute("UPDATE sessions SET expires_at = ?", (int(time.time()) - 1,))
        self.assertEqual(self.client.get("/api/me").status_code, 401)

    def test_validation_escaping_hosts_and_no_static_repository(self):
        self.assertEqual(self.post("/register", dict(username="abc", name="A", password="short")).status_code, 400)
        self.register(name="<script>alert(1)</script>")
        html = self.client.get("/").get_data(as_text=True)
        self.assertNotIn("<script>alert", html)
        self.assertIn("&lt;script&gt;", html)
        self.assertEqual(self.client.get("/", headers={"Host": "evil.example"}).status_code, 400)
        for path in ("/SECRETS.md", "/vintage.sqlite3", "/static/SECRETS.md", "/players"):
            self.assertEqual(self.client.get(path).status_code, 404)
        response = self.client.get("/healthz")
        self.assertEqual(response.json, dict(status="ok", schema_version=store.SCHEMA_VERSION))
        self.assertNotIn("Set-Cookie", response.headers)

    def test_ui_foundation_map_rest_help_and_no_dead_combat_controls(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)

        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-open="mapDialog"', html)
        self.assertIn('id="mapDialog"', html)
        self.assertIn('fetch("/api/map"', html)
        self.assertIn('name="text" value="descansar"', html)

        for heading in (
            "1. Muévete",
            "2. Investiga",
            "3. Combate",
            "4. Recupérate y consulta",
            "5. Habla",
        ):
            self.assertIn(heading, html)

        # En Valdren no hay encuentro: no se revelan controles de combate muertos.
        self.assertNotIn(">Atacar</button>", html)
        self.assertNotIn('aria-label="Huir"', html)

        map_response = self.client.get("/api/map")
        self.assertEqual(map_response.status_code, 200)
        self.assertIn("visited_rooms", map_response.json)
        self.assertIn("traversed_routes", map_response.json)
        # Issue #120: rumbo autoritativo -- null hasta el primer movimiento
        # aceptado, luego la direccion cardinal exacta que el servidor uso.
        self.assertIsNone(map_response.json["current_heading"])

        # Salir del hogar hacia Valdren
        self.assertEqual(self.post("/move", {"direction": "south"}).status_code, 303)
        state_in_valdren = self.client.get("/api/map").json
        self.assertIn("valdren_centro", state_in_valdren["visited_rooms"])
        self.assertEqual(state_in_valdren["current_heading"], "south")

        self.assertEqual(self.post("/move", {"direction": "north"}).status_code, 303)
        state_after_move = self.client.get("/api/map").json
        self.assertEqual(state_after_move["current_heading"], "north")

    def test_rest_button_uses_authoritative_command_intent(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)

        with store.connect(self.path) as db:
            db.execute("UPDATE players SET fatigue = 20 WHERE username = ?", ("matias",))

        response = self.post("/command", {"text": "descansar"})
        self.assertEqual(response.status_code, 200)
        player = self.client.get("/api/character").json
        self.assertEqual(player["fatigue"], 0)

    def test_android_install_manifest_and_icon_are_same_origin(self):
        page = self.client.get("/")
        html = page.get_data(as_text=True)
        self.assertIn('rel="manifest" href="/vintage-telnet.webmanifest"', html)
        self.assertIn('rel="icon" type="image/webp" href="/assets/app-icon/vintage-telnet.webp"', html)

        manifest = self.client.get("/vintage-telnet.webmanifest")
        self.assertEqual(manifest.status_code, 200)
        self.assertEqual(manifest.mimetype, "application/manifest+json")
        data = manifest.json
        self.assertEqual(data["name"], "Vintage Telnet")
        self.assertEqual(data["short_name"], "Vintage Telnet")
        self.assertEqual(data["start_url"], "/")
        self.assertEqual(data["scope"], "/")
        self.assertEqual(data["display"], "standalone")
        self.assertEqual(data["theme_color"], "#141c28")
        self.assertEqual(data["background_color"], "#0a0e15")
        self.assertEqual(data["icons"], [{
            "src": "/assets/app-icon/vintage-telnet.webp",
            "sizes": "192x192",
            "type": "image/webp",
            "purpose": "any",
        }])

        icon = self.client.get("/assets/app-icon/vintage-telnet.webp")
        self.assertEqual(icon.status_code, 200)
        self.assertEqual(icon.mimetype, "image/webp")
        self.assertGreater(len(icon.data), 1000)

    def test_regional_map_asset_is_served_same_origin_with_correct_mime(self):
        # Issue #120: el mapa regional aprobado (assets/vintage-telnet/maps/)
        # debe poder pedirse desde el mismo origen del servidor, con MIME
        # WebP correcto, sin abrir el resto del arbol de assets/.
        response = self.client.get("/assets/maps/region-inicial.webp")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/webp")
        self.assertGreater(len(response.data), 1000)

    def test_regional_map_route_rejects_paths_outside_its_own_folder(self):
        for attempt in (
            "/assets/maps/../server/app.py",
            "/assets/maps/..%2Fserver%2Fapp.py",
            "/assets/maps/no-existe.webp",
        ):
            self.assertEqual(self.client.get(attempt).status_code, 404)

    def test_guest_onboarding_guides_login_and_registration_without_two_visible_forms(self):
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-onboarding', html)
        self.assertIn('data-onboarding-view="welcome"', html)
        self.assertIn('data-onboarding-view="login" hidden', html)
        self.assertIn('data-onboarding-view="register" hidden', html)
        self.assertIn("Un mundo de fantasía que se descubre leyendo, explorando y tomando decisiones.", html)
        self.assertIn("Cómo empezar", html)
        self.assertIn("Ya tengo una cuenta y quiero continuar mi viaje.", html)
        self.assertIn("Soy nuevo y quiero preparar mi entrada al mundo.", html)
        self.assertEqual(html.count('action="/login"'), 1)
        self.assertEqual(html.count('action="/register"'), 1)
        self.assertIn('min-height:44px', html)
        self.assertIn('data-view="welcome" aria-labelledby="welcome-title"', html)
        self.assertIn('const title = target && target.querySelector("h1,[id$=\'-title\']");', html)
        self.assertIn("onboarding.setAttribute(\"aria-labelledby\", title.id);", html)
        self.assertIn('target.querySelector(\'input:not([type="hidden"]),button\') || title', html)
        self.assertIn("focusTarget.tabIndex = -1;", html)

        login_html = self.client.get("/?view=login").get_data(as_text=True)
        self.assertIn('data-view="login" aria-labelledby="login-title"', login_html)
        register_html = self.client.get("/?view=register").get_data(as_text=True)
        self.assertIn('data-view="register" aria-labelledby="register-title"', register_html)

    def test_pending_player_gets_process_state_copy(self):
        self.assertEqual(self.register().status_code, 303)
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn("Tu entrada está siendo preparada", html)
        self.assertIn("fue recibido. El Dungeon Master debe aprobar a cada personaje", html)
        self.assertIn("Cuando tu entrada esté habilitada, podrás continuar con la elección de especie.", html)
        self.assertNotIn('data-onboarding-view="login"', html)

    def test_approved_player_species_screen_uses_canonical_compact_cards(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn("Tu viaje puede comenzar", html)
        self.assertIn("ninguna decide por ti qué camino seguirás", html)
        self.assertEqual(html.count('class="species-card"'), 5)
        # Fichas aprobadas publicadas en assets/vintage-telnet/species/.
        self.assertNotIn("Retrato pendiente de asset aprobado", html)
        self.assertEqual(html.count('class="species-art"'), 5)
        for species_id in world.SPECIES_IDS:
            self.assertIn(f'src="/assets/species/{species_id}.webp"', html)
            response = self.client.get(f"/assets/species/{species_id}.webp")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.mimetype, "image/webp")
            self.assertEqual(response.headers["Cache-Control"], "public, max-age=86400")
        for text in (
            "Fisiología generalista",
            "pelaje fino, orejas y cola felinas",
            "zonas dérmicas de aspecto mineral",
            "escamas parciales",
            "ambientes de poca luz",
        ):
            self.assertIn(text, html)
        self.assertNotIn("/assets/locations/valdren.webp", html)
        self.assertNotIn("/assets/locations/vaisgard.webp", html)
        # Issue #548: comparativa de tamaño/proporciones, sin sustituir las
        # cinco fichas individuales verificadas arriba.
        self.assertIn('src="/assets/species/comparativa-especies.webp"', html)
        response = self.client.get("/assets/species/comparativa-especies.webp")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/webp")
        response.close()

    def test_ui_v2_mobile_map_help_and_clean_controls(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        self.assertIn("Mapa y orientación", html)
        self.assertIn('data-map-tab="general"', html)
        self.assertIn('data-map-tab="heading"', html)
        self.assertIn("Dirección actual no registrada", html)
        self.assertIn("El rumbo se muestra únicamente cuando lo confirma el servidor.", html)
        self.assertIn('data-help-tab="kids"', html)
        self.assertIn("Explícamelo fácil", html)
        self.assertIn("Los atributos ayudan, no juegan por ti", html)

        # Accesibilidad de superficies secundarias: cada dialog tiene nombre
        # accesible y los tabs enlazan explícitamente con su tabpanel.
        self.assertIn('<dialog id="characterDialog" aria-labelledby="characterDialogTitle">', html)
        self.assertIn('<strong id="characterDialogTitle">Personaje</strong>', html)
        self.assertIn('id="mapTabGeneral" type="button" role="tab" aria-selected="true" aria-controls="mapPanelGeneral"', html)
        self.assertIn('id="mapPanelGeneral" role="tabpanel" aria-labelledby="mapTabGeneral"', html)
        self.assertIn('id="mapTabHeading" type="button" role="tab" aria-selected="false" aria-controls="mapPanelHeading"', html)
        self.assertIn('id="mapPanelHeading" role="tabpanel" aria-labelledby="mapTabHeading"', html)
        self.assertIn('id="helpTabQuick" type="button" role="tab" aria-selected="true" aria-controls="helpPanelQuick"', html)
        self.assertIn('id="helpPanelQuick" role="tabpanel" aria-labelledby="helpTabQuick"', html)
        self.assertIn('id="helpTabKids" type="button" role="tab" aria-selected="false" aria-controls="helpPanelKids"', html)
        self.assertIn('id="helpPanelKids" role="tabpanel" aria-labelledby="helpTabKids"', html)
        self.assertIn('.segment:hover{border-color:#8a6d47}', html)
        self.assertIn('.segment:focus-visible{outline:3px solid #f0d18c;outline-offset:2px}', html)
        self.assertIn('event.key === "ArrowRight" || event.key === "ArrowDown"', html)
        self.assertIn('event.key === "Home"', html)
        self.assertIn('other.tabIndex = selected ? 0 : -1', html)
        self.assertIn('const dialogInvokers = new WeakMap();', html)
        self.assertIn('dialogInvokers.set(d, button);', html)
        self.assertIn('if (invoker && invoker.isConnected) invoker.focus();', html)
        self.assertIn('dialogInvokers.delete(d);', html)

        # En móvil los controles interactivos principales conservan objetivos
        # táctiles de al menos 44 px; el modo compacto no debe volver a 32–38 px.
        self.assertIn('@media(max-width:640px){\n      .action{min-height:44px', html)
        self.assertIn('.context-actions .action{min-height:44px}', html)
        self.assertIn('.npc-card .action{width:auto;min-width:100px;min-height:44px;justify-content:center}', html)
        self.assertIn('.btn{min-height:44px}', html)
        self.assertIn('.dpad{grid-template-columns:repeat(3,44px);grid-template-rows:repeat(3,44px)}', html)
        self.assertIn('.commandbar input{min-height:44px}', html)
        self.assertIn('.combat-row.defenses .action{min-height:44px}', html)
        self.assertNotIn('.context-actions .action{min-height:34px}', html)
        self.assertNotIn('.combat-row.defenses .action{min-height:32px}', html)

        self.assertIn(".art-neutral{height:100%;background:#0d131c}", html)
        self.assertNotIn(".location-art-fallback", html)
        self.assertNotIn("btn-art btn-flee", html)
        self.assertNotIn("button-huir-danger.png", html)
        self.assertIn(".action-danger{", html)
        self.assertIn('placeholder="> norte, mirar, examinar…"', html)

        self.assertIn('sessionStorage.getItem("vt:last-room-text")', html)
        self.assertIn("}, 26);", html)
        self.assertNotIn('class="log" aria-live="polite"', html)

    def test_ui_v2_renders_server_authorized_actions_only(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        # Sin encuentro, el servidor solo autoriza descanso.
        self.assertIn('name="text" value="descansar"', html)
        self.assertNotIn('action="/dodge"', html)
        self.assertNotIn('action="/resist"', html)
        self.assertNotIn('action="/block"', html)

    def test_main_screen_mockup_exploration_and_combat_states(self):
        """Issue #135: barra de lugar, ilustración, terminal y controles del
        contexto; en combate, barra roja, Atacar/Huir/Evaluar y banda de
        condición cualitativa, nunca HP numérico del enemigo (GAMEPLAY 31)."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        self.post("/move", {"direction": "south"})
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('class="place-bar"', html)
        self.assertIn('<strong id="placeTitle">VALDREN', html)
        self.assertIn('href="#icon-pin"', html)
        self.assertIn('class="dpad"', html)
        self.assertIn('>Mirar</button>', html)
        self.assertIn('data-prefill="examinar "', html)
        self.assertIn('>Descansar</button>', html)
        self.assertIn('id="headingCardLabel"', html)
        self.assertIn('<b>Estás en:</b>', html)
        self.assertNotIn("¡COMBATE!", html)
        self.assertNotIn('action="/attack"', html)

        # Entra al encuentro con Mordelinde (sendero -> parcela).
        self.post("/move", {"direction": "north"})
        self.post("/move", {"direction": "north"})
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('class="place-bar combat"', html)
        self.assertIn("¡COMBATE!", html)
        self.assertIn('class="action action-attack"', html)
        self.assertIn('action="/flee"', html)
        self.assertIn('action="/evaluate"', html)
        self.assertIn('class="condition-bar"', html)
        self.assertEqual(html.count('<i class="on"></i>'), 4)  # criatura entera
        self.assertIn("entero / apenas afectado", html)
        self.assertIn('data-location-art src="/assets/creatures/mordelinde.webp"', html)
        self.assertNotIn('class="dpad"', html)
        self.assertNotIn(">Descansar</button>", html)
        self.assertNotRegex(html, r"HP:\s*\d+/\d+")

    def test_mobile_forge_tool_updates_after_ajax_navigation(self):
        """#551: al entrar en la forja se actualiza también la herramienta
        de tienda, fuera de la región de controles que se intercambia."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        self.post("/move", {"direction": "south"})
        plaza = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-swap="tools"', plaza)
        self.assertIn('"controls", "tools", "side"', plaza)
        self.assertNotIn('data-open="shopDialog" data-shop-open', plaza)

        self.post("/move", {"direction": "west"})
        forge = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-swap="tools"', forge)
        self.assertIn('data-open="shopDialog" data-shop-open', forge)
        self.assertIn('data-prefill="hablar daro_herrero ', forge)
        self.assertIn('class="mobile-account-menu"', forge)

    def test_creature_without_approved_art_keeps_neutral_frame(self):
        """Issue #244: sin asset aprobado no hay placeholder, texto de error
        ni imagen rota; combate, estado y controles permanecen visibles."""
        from unittest.mock import patch

        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        self.post("/move", {"direction": "south"})
        self.post("/move", {"direction": "north"})
        self.post("/move", {"direction": "north"})

        with patch.dict(creatures.CREATURE_ART, {}, clear=True):
            html = self.client.get("/").get_data(as_text=True)

        self.assertIn('class="place-bar combat"', html)
        self.assertIn("¡COMBATE!", html)
        art_frame = re.search(r'<figure class="location-art no-art".*?</figure>', html, re.S)
        self.assertIsNotNone(art_frame)
        art_html = art_frame.group(0)
        self.assertIn('data-art-src=""', art_html)
        self.assertIn('class="art-neutral" aria-hidden="true"', art_html)
        self.assertNotIn("data-location-art", art_html)
        self.assertNotIn("/assets/creatures/", art_html)
        self.assertNotIn("La ilustración contextual no está disponible", html)
        self.assertNotIn("art-placeholder", art_html)
        self.assertIn('class="enemy-name"', html)
        self.assertIn('class="condition-bar"', html)
        self.assertIn('class="action action-attack"', html)
        self.assertIn('action="/flee"', html)

    def test_failed_art_image_degrades_to_neutral_frame_without_error_text(self):
        """Un asset publicado que falle al cargar se reemplaza por el mismo
        marco neutral; el navegador no deja icono roto ni texto placeholder."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        self.assertIn('neutral.className = "art-neutral"', html)
        self.assertIn("img.replaceWith(neutral);", html)
        self.assertNotIn("La ilustración contextual no está disponible", html)
        self.assertNotIn(".location-art-fallback", html)

    def test_ambient_shows_shared_time_of_day_and_regional_weather(self):
        """Issue #138 / GAMEPLAY §37: el servidor expone `ambient` y la barra de lugar
        muestra time_of_day (reloj global) y weather (clima regional compartido)."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        room = self.client.get("/api/room").json["room"]
        self.assertIsNotNone(room["ambient"]["weather"])
        self.assertIn(room["ambient"]["weather"]["label"], ("Despejado", "Nublado", "Lluvia", "Niebla", "Tormenta", "Viento"))
        self.assertIn(room["ambient"]["time_of_day"]["label"], ("Amanecer", "Día", "Atardecer", "Noche"))
        self.assertIn('class="ambient-chip"', self.client.get("/").get_data(as_text=True))

        from unittest.mock import patch
        ambient = {"time_of_day": {"label": "Mañana", "icon": "sol"},
                   "weather": {"label": "Niebla", "icon": "icono-que-no-existe"}}
        with patch.object(world, "get_ambient", return_value=ambient):
            html = self.client.get("/").get_data(as_text=True)
        self.assertEqual(html.count('class="ambient-chip"'), 2)
        self.assertIn('href="#icon-amb-sol"/></svg>Mañana</span>', html)
        self.assertIn('<span class="ambient-chip">Niebla</span>', html)  # icono desconocido: solo texto
        for icon in world.AMBIENT_ICONS:
            self.assertIn(f'id="icon-amb-{icon}"', html)

    def test_ui_v2_consumes_served_regional_map_and_authoritative_heading(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        self.assertIn('src="/assets/maps/region-inicial.webp"', html)
        self.assertIn('id="headingStatus"', html)
        self.assertIn('data-heading="north"', html)
        self.assertIn('data-heading="south"', html)
        self.assertIn('data-heading="east"', html)
        self.assertIn('data-heading="west"', html)
        self.assertIn("renderHeading(data.current_heading)", html)
        self.assertIn('"Caminando hacia: " + headingLabels[heading]', html)
        self.assertIn("Dirección actual no registrada.", html)

        response = self.client.get("/assets/maps/region-inicial.webp")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "image/webp")

    def test_ui_v2_standard_svg_signage_keeps_visible_labels(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        for symbol in (
            "icon-user",
            "icon-map",
            "icon-help",
            "icon-swords",
            "icon-exit",
            "icon-eye",
            "icon-compass",
            "icon-send",
        ):
            self.assertIn(f'id="{symbol}"', html)

        self.assertIn("<span>Personaje</span>", html)
        for label in ("Mapa", "Ayuda", "Enviar"):
            self.assertIn(f">{label}</button>", html)

        self.assertNotIn("button-huir-danger.png", html)
        self.assertNotIn("btn-art btn-flee", html)

    def test_ajax_swapped_controls_keep_dialogs_and_prefill_interactive(self):
        """#135: los controles dentro de game-shell se reemplazan por fetch;
        sus acciones JS deben usar delegación o resolver nodos actuales, nunca
        listeners/referencias capturados solo al cargar la página."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        self.assertIn('event.target.closest("[data-open]")', html)
        self.assertIn("document.getElementById(button.dataset.open)", html)
        self.assertNotIn('document.querySelectorAll("[data-open]").forEach', html)

        self.assertIn('event.target.closest(\'[data-open="characterDialog"]\')', html)
        self.assertIn('event.target.closest("[data-inventory-open]")', html)
        self.assertIn('event.target.closest("[data-map-open]")', html)

        self.assertIn('const commandInput = document.getElementById("commandInput");', html)
        self.assertNotIn('const inventoryButton = document.querySelector("[data-inventory-open]");', html)
        self.assertNotIn('const mapButton = document.querySelector("[data-map-open]");', html)

        # Si una acción sustituye el bloque de controles por AJAX, el botón
        # enfocado desaparece del DOM. Junior 2 conserva el foco en el control
        # equivalente o, si cambia el estado, en el nuevo grupo de controles.
        self.assertIn('const actionFocusHint = (form, submitter) => {', html)
        self.assertIn('document.activeElement !== submitter', html)
        self.assertIn('const restoreActionFocus = hint => {', html)
        self.assertIn('if (document.querySelector("[data-death-event]")) return;', html)
        self.assertIn('const focusHint = actionFocusHint(form, event.submitter);', html)
        self.assertIn('button.focus({preventScroll: true});', html)
        self.assertIn('controls.focus({preventScroll: true});', html)
        self.assertIn('restoreActionFocus(focusHint);', html)
        self.assertIn('id="gameLiveStatus" role="status" aria-live="polite" aria-atomic="true"', html)
        self.assertIn('const announceGameState = () => {', html)
        self.assertIn('"Ubicación: " + place.textContent.trim() + "." + combat', html)
        self.assertIn('announceGameState();', html)
        self.assertIn('let cancelActiveReveal = null;', html)
        self.assertIn('if (cancelActiveReveal) {', html)
        self.assertIn('cancelActiveReveal = stopReveal;', html)
        self.assertIn('revealLog.removeEventListener("click", revealAll);', html)

    def test_controls_swap_region_is_single_in_exploration_and_nearby_fauna(self):
        """#463: fauna cercana y controles de exploración pueden coexistir,
        pero deben vivir dentro de una sola región AJAX autoritativa."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)

        html = self.client.get("/").get_data(as_text=True)
        control_regions = re.findall(r'<[^>]+data-swap="controls"[^>]*>', html)
        self.assertEqual(len(control_regions), 1)
        self.assertIn('class="controls-swap" data-swap="controls"', control_regions[0])

        # Parcela con Mordelinde no-engaged: reproduce de forma
        # determinista el caso que antes rendereaba dos regiones simultáneas,
        # "Fauna cercana" + "Controles principales".
        player_id = self.client.get("/api/me").json["player"]["id"]
        store.move_player(self.path, player_id, "valdren_camino_parcela")
        store.start_encounter(
            self.path, player_id, "valdren_camino_parcela",
            "mordelinde", 30, engaged=False,
        )
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn("Fauna cercana", html)
        self.assertIn('aria-label="Controles principales"', html)
        control_regions = re.findall(r'<[^>]+data-swap="controls"[^>]*>', html)
        self.assertEqual(len(control_regions), 1)

        # Defensa adicional: si una sesión vieja ya arrastra duplicados,
        # swapFrom conserva el primero y elimina copias obsoletas.
        self.assertIn("const currentMatches = [...document.querySelectorAll(", html)
        self.assertIn("currentMatches.slice(1).forEach(extra => extra.remove())", html)
        self.assertIn("removeStaleCopies();", html)

    def test_room_activity_polling_uses_authoritative_api_without_cross_room_updates(self):
        """#376: presencia/chat idle se refrescan desde /api/room; la UI no
        inventa TTL ni aplica una respuesta si pertenece a otra sala."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)

        self.assertIn('data-room-presence aria-live="polite"', html)
        self.assertIn('data-room-chat data-room-id=', html)
        self.assertIn('const refreshRoomActivity = async () => {', html)
        self.assertIn('document.hidden || actionInFlight', html)
        self.assertIn('fetch("/api/room"', html)
        self.assertIn('currentHost.dataset.roomId !== expectedRoomId', html)
        self.assertIn('window.setInterval(refreshRoomActivity, 5000)', html)
        self.assertIn('window.addEventListener("focus", refreshRoomActivity)', html)
        self.assertIn('if (snapshot === roomPresenceSnapshot) return;', html)

    def test_explicit_room_exit_disappears_from_other_players_next_authoritative_read(self):
        """#376: el movimiento explícito ya es inmediato en servidor; este
        test bloquea la regresión mientras backend añade fallback de TTL."""
        other = self.app.test_client()

        def ready(client, username, name):
            self.assertEqual(self.register(username, client, name).status_code, 303)
            store.set_status(self.path, username, "approved")
            self.assertEqual(self.post("/species", {"species": "humano"}, client).status_code, 303)
            self.assertEqual(self.post("/class", {"player_class": "sombra"}, client).status_code, 303)
            self.assertIn(self.post("/move", {"direction": "south"}, client).status_code, (200, 303))

        ready(self.client, "matias", "Matías")
        ready(other, "marcos", "Marcos")

        room_a = self.client.get("/api/room").json["room"]
        self.assertEqual(room_a["id"], "valdren_centro")
        self.assertIn("Marcos", room_a["others_present"])

        self.assertIn(self.post("/move", {"direction": "west"}, other).status_code, (200, 303))
        room_a_after = self.client.get("/api/room").json["room"]
        self.assertNotIn("Marcos", room_a_after["others_present"])

    def test_inventory_ui_consumes_authoritative_api_without_local_rules(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)

        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-open="inventoryDialog"', html)
        self.assertIn('id="inventoryDialog"', html)
        self.assertIn('fetch("/api/inventory"', html)
        self.assertIn("Inventario y equipo", html)
        self.assertIn("Arma activa", html)
        self.assertIn("Armadura activa", html)
        self.assertIn("Protección total", html)
        self.assertIn("Carga física", html)
        self.assertIn('(item.equipped ? "desequipar " : "equipar ") + item.name', html)
        inventory_commands = html.split("const commandFormFor = (item, inSalvageMarket) => {", 1)[1].split(
            "const renderInventory = data => {", 1
        )[0].lower()
        self.assertIn('"vender material " + item.id', inventory_commands)
        self.assertIn('item.category === "material" && !insalvagemarket', inventory_commands)
        self.assertNotIn("vender arma", inventory_commands)
        self.assertNotIn("soltar", inventory_commands)
        self.assertNotIn("durabilidad", html.lower())

    def test_character_panel_spends_pa_only_through_server_with_confirmation(self):
        """GAMEPLAY.md 25.4/25.5: el panel Personaje lee costes del servidor,
        pide confirmación explícita y envía el valor visto como
        `current_value`; no calcula costes ni aplica el +1 por su cuenta."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('id="paPanel"', html)
        self.assertIn("Mejorar atributos", html)
        self.assertIn('fetch("/api/character"', html)
        self.assertIn('fetch("/api/character/attributes"', html)
        self.assertIn("current_value: request.current_value", html)
        self.assertIn("data.attribute_costs", html)
        self.assertIn("data.in_combat", html)
        self.assertIn('id="paConfirm"', html)
        self.assertIn("Después de confirmar no se puede deshacer.", html)
        self.assertNotIn("todavía no tiene pantalla propia", html)
        # El cliente nunca fija costes propios de §19.
        self.assertNotIn("attribute_cost(", html)
        self.assertNotIn("deshacer gasto", html.lower())

    def test_character_tool_shows_persistent_unspent_point_badge_and_callout(self):
        """#370: PA/PP sin gastar deben ser visibles sin abrir Personaje y
        mantenerse sincronizables después de swaps AJAX."""
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        player_id = self.client.get("/api/me").json["player"]["id"]
        with store.connect(self.path) as db:
            db.execute("UPDATE players SET pa_unspent = 2, pp_unspent = 1 WHERE id = ?", (player_id,))

        html = self.client.get("/").get_data(as_text=True)
        self.assertIn('data-character-tool', html)
        self.assertIn('data-point-badge', html)
        self.assertIn('2 PA · 1 PP', html)
        self.assertIn('aria-label="Personaje, 2 PA y 1 PP disponibles"', html)
        self.assertIn('id="pointsCallout"', html)
        self.assertIn("Tienes 2 PA y 1 PP disponibles.", html)
        self.assertIn("PP sin gastar 1", html)

        # El saldo se actualiza tanto al abrir Personaje como al recibir una
        # respuesta HTML autoritativa tras cualquier acción AJAX.
        self.assertIn("const syncPointIndicators = (paValue, ppValue) => {", html)
        self.assertIn('const incomingBadge = next.querySelector("[data-point-badge]");', html)
        self.assertIn("syncPointIndicators(match && match[1] ? Number(match[1]) : 0", html)

    def test_character_tool_hides_point_badge_when_no_points_are_pending(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        html = self.client.get("/").get_data(as_text=True)
        self.assertRegex(html, r'<span class="point-badge" data-point-badge hidden>')
        self.assertRegex(html, r'id="pointsCallout" hidden')

    def test_inventory_api_fields_renderable_by_ui(self):
        self.assertEqual(self.register().status_code, 303)
        store.set_status(self.path, "matias", "approved")
        self.assertEqual(self.post("/species", {"species": "humano"}).status_code, 303)
        self.assertEqual(self.post("/class", {"player_class": "sombra"}).status_code, 303)
        player_id = self.client.get("/api/me").json["player"]["id"]
        store.grant_item(self.path, player_id, "espada_juramento")
        store.grant_item(self.path, player_id, "cota_cinco_rutas")

        data = self.client.get("/api/inventory").json
        self.assertIn("items", data)
        self.assertIn("equipped", data)
        self.assertIn("armor_reduction_total", data)
        self.assertIn("carga_multiplier", data)
        self.assertEqual({row["name"] for row in data["items"]},
                         {"Puñal de camino", "Espada de juramento", "Cota de las Cinco Rutas"})
        for row in data["items"]:
            for key in ("name", "category", "forge_required", "forge_validated", "equipped"):
                self.assertIn(key, row)

    def test_rate_limit_survives_restart(self):
        for _ in range(20):
            self.assertTrue(store.allow_attempt(self.path, "local-test"))
        create_app(self.config)
        self.assertFalse(store.allow_attempt(self.path, "local-test"))
        with store.connect(self.path) as db:
            db.execute("UPDATE auth_limits SET window_start = 0")
        self.assertTrue(store.allow_attempt(self.path, "local-test"))

    def test_concurrent_registration_is_atomic(self):
        def attempt(_):
            try:
                return store.register(self.path, "same_user", "Nombre", "test-only-hash")
            except (sqlite3.IntegrityError, store.UsernameTaken):
                return None
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(attempt, range(4)))
        self.assertEqual(sum(result is not None for result in results), 1)
        with store.connect(self.path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM players").fetchone()[0], 1)
            self.assertEqual(db.execute("SELECT count(*) FROM access_events").fetchone()[0], 1)
            self.assertEqual(db.execute("SELECT count(*) FROM sessions").fetchone()[0], 1)

    def test_backup_and_inspection(self):
        self.register()
        command = [sys.executable, "-m", "server.admin", "--data-dir", self.temp.name]
        subprocess.run(command + ["check"], check=True, capture_output=True)
        listing = subprocess.run(command + ["players"], check=True, capture_output=True, text=True)
        self.assertNotIn("password_hash", listing.stdout)
        backup = Path(self.temp.name) / "backup.sqlite3"
        subprocess.run(command + ["backup", str(backup)], check=True, capture_output=True)
        with store.connect(backup) as db:
            self.assertEqual(db.execute("SELECT username FROM players").fetchone()[0], "matias")
        duplicate = subprocess.run(command + ["backup", str(backup)], capture_output=True)
        self.assertNotEqual(duplicate.returncode, 0)

    def test_unknown_schema_and_missing_configuration_fail_closed(self):
        with self.assertRaises(RuntimeError):
            create_app({**self.config, "SECRET_KEY": "short"})
        with self.assertRaises(RuntimeError):
            create_app({**self.config, "DATA_DIR": "relative"})
        with store.connect(self.path) as db:
            db.execute(f"PRAGMA user_version = {store.SCHEMA_VERSION + 1}")
        with self.assertRaises(RuntimeError):
            create_app(self.config)


class AmbientClockTests(unittest.TestCase):
    """Reloj global de hora del día (Issue #138, handoff de Jugabilidad):
    amanecer -> día -> atardecer -> noche, ciclo de 4h reales/60 min por
    estado, función pura del tiempo real inyectable para pruebas."""

    def test_cycle_boundaries_and_order(self):
        hour = 60 * 60
        self.assertEqual(world._current_time_of_day(0)["label"], "Amanecer")
        self.assertEqual(world._current_time_of_day(hour - 1)["label"], "Amanecer")
        self.assertEqual(world._current_time_of_day(hour)["label"], "Día")
        self.assertEqual(world._current_time_of_day(2 * hour)["label"], "Atardecer")
        self.assertEqual(world._current_time_of_day(3 * hour)["label"], "Noche")
        self.assertEqual(world._current_time_of_day(4 * hour)["label"], "Amanecer")  # el ciclo se repite

    def test_same_now_gives_same_state_reproducible(self):
        self.assertEqual(world._current_time_of_day(12345), world._current_time_of_day(12345))

    def test_restart_does_not_reset_the_day_arbitrarily(self):
        # Es función pura de `now`: sin `now`, dos llamadas casi simultáneas
        # (equivalente a un reinicio del servidor) devuelven el mismo estado.
        self.assertEqual(world.get_ambient("cualquier-sala"), world.get_ambient("cualquier-sala"))

    def test_get_ambient_uses_the_shared_clock_and_regional_weather(self):
        ambient = world.get_ambient("cualquier-sala", now=0)
        self.assertEqual(
            ambient,
            {
                "time_of_day": {"label": "Amanecer", "icon": "amanecer"},
                "weather": {"label": "Despejado", "icon": "sol", "key": "despejado"},
            },
        )

    def test_every_state_uses_a_known_icon(self):
        for state in world._TIME_OF_DAY_STATES:
            self.assertIn(state["icon"], world.AMBIENT_ICONS)


if __name__ == "__main__":
    unittest.main()
