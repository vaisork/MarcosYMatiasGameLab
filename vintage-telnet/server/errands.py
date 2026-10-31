"""Tres encargos pagados de Valdren (#409), con estado y pago autoritativos.

Cooldown diario: commit `22e6ead` (Javier, directo a `main`, "per user
request") sustituyó la repetición inmediata de GAMEPLAY.md §43 por un
cooldown de 24h tras cobrar. Esa implementación reutilizaba el valor 1 de
`player_story_flags` para dos estados distintos — "aceptado, en curso" y
"cobrado, en cooldown" — por lo que `list_contracts` reportaba
`available_tomorrow` para un encargo recién aceptado, y `record` aceptaba
el paso de registro durante el cooldown sin volver a exigir `accept`,
saltándose el cooldown por completo. Aquí se conserva el cooldown de 24h
tal como fue decidido, separando el estado de cobro en un valor propio (3)
para que no choque con "aceptado" (1).

GAMEPLAY.md §43 sigue documentando la repetición inmediata con ventana
móvil de 60 min; ya no coincide con el cooldown diario que corre en
`main`. Reconciliar el documento (o revertir el cooldown) es decisión de
Jugabilidad/Javier, no de este módulo — ver HANDOFF.md.
"""
import math
import time

from . import store


MARKET = "valdren_mercado"
CONTRACTS = {
    "valdren_recado_forja": ("valdren_forja", 6, "Daro recibe el recado y deja constancia de que llegó."),
    "valdren_revision_cobertizos": ("valdren_cobertizos_viejos", 10, "Compruebas el estado de los cobertizos viejos."),
    "valdren_estado_vado": ("valdren_vado_menor", 24, "Observas el estado del paso, las piedras y el agua."),
}
FAMILY = "valdren_paid_errands"
COOLDOWN_SECONDS = 86400


def list_contracts(path, player_id, now=None):
    now = time.time() if now is None else now
    with store.connect(path) as db:
        rows = db.execute(
            "SELECT flag, value, created_at FROM player_story_flags WHERE player_id = ? AND flag LIKE 'errand:%'",
            (player_id,),
        ).fetchall()
        flags = {r["flag"]: (r["value"], r["created_at"]) for r in rows}

    contracts = []
    for key, (dest, payout, _text) in CONTRACTS.items():
        flag = f"errand:{key}"
        value, created_at = flags.get(flag, (0, None))
        if value == 1:
            state = "accepted"
        elif value == 2:
            state = "ready_to_claim"
        elif value == 3 and created_at is not None and now < created_at + COOLDOWN_SECONDS:
            state = "available_tomorrow"
        else:
            state = "available"
        contracts.append({"contract_id": key, "destination": dest, "base_payout": payout, "state": state})
    return contracts


def act(path, player_id, room_id, contract_id, action, now=None):
    if contract_id not in CONTRACTS or action not in ("accept", "record", "claim"):
        return False, "Encargo o acción desconocidos.", None
    now = time.time() if now is None else now
    destination, base, progress_text = CONTRACTS[contract_id]
    flag = f"errand:{contract_id}"
    with store.connect(path) as db:
        db.execute("BEGIN IMMEDIATE")
        player = db.execute("SELECT sellos FROM players WHERE id = ?", (player_id,)).fetchone()
        if not player:
            return False, "Personaje no encontrado.", None
        if db.execute("SELECT 1 FROM room_encounters WHERE player_id = ? AND room_id = ?",
                      (player_id, room_id)).fetchone():
            return False, "Termina el encuentro antes de ocuparte del encargo.", None
        row = db.execute("SELECT value, created_at FROM player_story_flags WHERE player_id = ? AND flag = ?",
                         (player_id, flag)).fetchone()
        state = row["value"] if row else 0
        expected_room = MARKET if action in ("accept", "claim") else destination
        if room_id != expected_room:
            return False, "Debes estar en el lugar indicado para este paso.", None
        if action == "accept":
            if state in (1, 2):
                return False, "Ya tienes este encargo en curso.", None
            if state == 3:
                cooldown_expiry = row["created_at"] + COOLDOWN_SECONDS
                if now < cooldown_expiry:
                    hours_left = int((cooldown_expiry - now) / 3600)
                    return False, f"Este encargo estará disponible en {hours_left} hora(s).", None
            # La clave de cobro deriva de esta marca. Debe avanzar incluso con reloj fijo.
            accepted_at = max(now, row["created_at"] + 0.000001) if row else now
            db.execute("""INSERT INTO player_story_flags(player_id, flag, value, created_at)
                          VALUES (?, ?, 1, ?)
                          ON CONFLICT(player_id, flag) DO UPDATE SET value = 1, created_at = excluded.created_at""",
                       (player_id, flag, accepted_at))
            return True, "Tomas el encargo. Regresa al puesto tras registrar el trabajo.", {"state": "accepted"}
        if action == "record":
            if state != 1:
                return False, "Acepta primero el encargo en el mercado.", None
            db.execute("UPDATE player_story_flags SET value = 2 WHERE player_id = ? AND flag = ?", (player_id, flag))
            return True, progress_text, {"state": "ready_to_claim"}
        if state != 2:
            return False, "Aún no has registrado el trabajo de este encargo.", None
        source = f"errand:{contract_id}:{row['created_at']}"
        if db.execute("SELECT 1 FROM economy_ledger WHERE player_id = ? AND source_key = ?",
                      (player_id, source)).fetchone():
            return False, "Este encargo ya fue cobrado.", None
        count = db.execute("""SELECT COUNT(*) AS n FROM economy_ledger
                              WHERE player_id = ? AND reason_code = ? AND created_at > ?""",
                           (player_id, FAMILY, now - 3600)).fetchone()["n"]
        multiplier = 1.0 if count < 2 else 0.6 if count < 4 else 0.3
        payout = math.floor(base * multiplier)
        balance = player["sellos"] + payout
        db.execute("UPDATE players SET sellos = ? WHERE id = ?", (balance, player_id))
        db.execute("""INSERT INTO economy_ledger(player_id, delta, balance_after, reason_code, source_key, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)""", (player_id, payout, balance, FAMILY, source, now))
        db.execute("UPDATE player_story_flags SET value = 3, created_at = ? WHERE player_id = ? AND flag = ?",
                   (now, player_id, flag))
        return True, f"Trabajo hecho. Recibes {payout} sellos.", {"state": "available_tomorrow", "payout": payout, "balance": balance}
