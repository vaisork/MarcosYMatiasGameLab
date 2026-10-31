"""Regresión del ingreso de Valdren: rutas, antifarmeo horario y cooldown de 24h tras cobrar."""
import re
import tempfile
import unittest
from unittest.mock import patch

from server.app import create_app
from server import errands, store


class PaidErrandsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.app = create_app({"TESTING": True, "SECRET_KEY": "errands-test-secret" * 4,
                               "DATA_DIR": self.temp.name, "SESSION_COOKIE_SECURE": False})
        self.client = self.app.test_client()
        self.path = self.app.config["DATABASE"]
        self.post("/register", {"username": "errandtester", "name": "Errand Tester", "password": "password123"})
        dm = self.app.test_client()
        with patch.dict("os.environ", {"VT_DM_PASSWORD": "dm-secret-value"}):
            self.post("/dm/login", {"dm_password": "dm-secret-value"}, dm, "/dm")
            self.post("/dm/approve", {"username": "errandtester"}, dm, "/dm")
        self.post("/species", {"species": "humano"})
        self.player_id = self.client.get("/api/me").json["player"]["id"]
        store.set_player_class(self.path, self.player_id, "juramentado", "espada_juramento")
        store.move_player(self.path, self.player_id, errands.MARKET)

    def tearDown(self):
        self.temp.cleanup()

    def post(self, route, data, client=None, csrf_path="/"):
        client = client or self.client
        html = client.get(csrf_path).get_data(as_text=True)
        token = re.search(r'name="csrf" value="([^"]+)"', html)
        return client.post(route, data={**data, "csrf": token[1] if token else ""})

    def test_three_contracts_pay_once_and_share_hourly_counter(self):
        expected = (("valdren_recado_forja", 6), ("valdren_revision_cobertizos", 10),
                    ("valdren_estado_vado", 14))
        for contract_id, payout in expected:
            destination = errands.CONTRACTS[contract_id][0]
            self.assertTrue(errands.act(self.path, self.player_id, errands.MARKET, contract_id, "accept")[0])
            self.assertFalse(errands.act(self.path, self.player_id, errands.MARKET, contract_id, "claim")[0])
            self.assertFalse(errands.act(self.path, self.player_id, errands.MARKET, contract_id, "record")[0])
            self.assertTrue(errands.act(self.path, self.player_id, destination, contract_id, "record")[0])
            ok, _message, extra = errands.act(self.path, self.player_id, errands.MARKET, contract_id, "claim")
            self.assertTrue(ok)
            self.assertEqual(extra["payout"], payout)
            self.assertFalse(errands.act(self.path, self.player_id, errands.MARKET, contract_id, "claim")[0])
        self.assertEqual(errands.list_contracts(self.path, self.player_id)[0]["state"], "available_tomorrow")
        with store.connect(self.path) as db:
            ledger = db.execute("SELECT delta FROM economy_ledger WHERE reason_code = ? ORDER BY id", (errands.FAMILY,)).fetchall()
        self.assertEqual([row["delta"] for row in ledger], [6, 10, 14])

    def test_terminal_intent_accepts_and_reports_contracts(self):
        listing = self.client.post("/api/intent", json={"text": "encargos", "csrf": self._csrf()})
        self.assertEqual(len(listing.json["contracts"]), 3)
        response = self.client.post("/api/intent", json={"text": "aceptar encargo valdren_recado_forja", "csrf": self._csrf()})
        self.assertTrue(response.json["accepted"])
        self.assertEqual(response.json["contracts"][0]["state"], "accepted")

    def test_player_can_complete_local_errand_from_visible_actions(self):
        market = self.client.get("/").get_data(as_text=True)
        self.assertIn("Puesto de encargos", market)
        self.assertIn("Aceptar", market)
        self.post("/command", {"text": "aceptar encargo valdren_recado_forja"})
        self.assertIn("En curso", self.client.get("/").get_data(as_text=True))
        store.move_player(self.path, self.player_id, "valdren_forja")
        forge = self.client.get("/").get_data(as_text=True)
        self.assertIn("Registrar trabajo", forge)
        self.assertIn("Taller de Daro", forge)
        self.post("/command", {"text": "registrar encargo valdren_recado_forja"})
        store.move_player(self.path, self.player_id, errands.MARKET)
        self.assertIn("Cobrar", self.client.get("/").get_data(as_text=True))
        self.post("/command", {"text": "cobrar encargo valdren_recado_forja"})
        self.assertEqual(store.character_by_player_id(self.path, self.player_id)["sellos"], 26)

    def test_cooldown_blocks_repeat_for_24h_then_resets(self):
        key = "valdren_recado_forja"
        now = 10000
        self.assertTrue(errands.act(self.path, self.player_id, errands.MARKET, key, "accept", now=now)[0])
        self.assertTrue(errands.act(self.path, self.player_id, "valdren_forja", key, "record", now=now)[0])
        ok, _message, result = errands.act(self.path, self.player_id, errands.MARKET, key, "claim", now=now)
        self.assertTrue(ok)
        self.assertEqual(result["payout"], 6)
        self.assertEqual(result["state"], "available_tomorrow")

        soon = now + 3600
        self.assertEqual(errands.list_contracts(self.path, self.player_id, now=soon)[0]["state"], "available_tomorrow")
        ok, message, _extra = errands.act(self.path, self.player_id, errands.MARKET, key, "accept", now=soon)
        self.assertFalse(ok)
        self.assertIn("hora", message)

        after_cooldown = now + 86400 + 1
        self.assertEqual(errands.list_contracts(self.path, self.player_id, now=after_cooldown)[0]["state"], "available")
        self.assertTrue(errands.act(self.path, self.player_id, errands.MARKET, key, "accept", now=after_cooldown)[0])

    def test_record_during_cooldown_is_rejected_not_silently_advanced(self):
        key = "valdren_recado_forja"
        now = 10000
        self.assertTrue(errands.act(self.path, self.player_id, errands.MARKET, key, "accept", now=now)[0])
        self.assertTrue(errands.act(self.path, self.player_id, "valdren_forja", key, "record", now=now)[0])
        self.assertTrue(errands.act(self.path, self.player_id, errands.MARKET, key, "claim", now=now)[0])
        # Encargo en cooldown (valor 3): "registrar" directo en el destino, sin
        # volver a "accept", no debe avanzar el estado ni abrir una vía para
        # cobrar de nuevo antes de que termine el cooldown.
        ok, message, _extra = errands.act(self.path, self.player_id, "valdren_forja", key, "record", now=now + 10)
        self.assertFalse(ok)
        self.assertIn("Acepta primero", message)

    def _csrf(self):
        html = self.client.get("/").get_data(as_text=True)
        return re.search(r'name="csrf" value="([^"]+)"', html)[1]


if __name__ == "__main__":
    unittest.main()
