import tempfile
import unittest
from pathlib import Path

from server import felicitaciones, mechanics as m, social
from server.content import Content
from server.engine import Engine


ROOT = Path(__file__).resolve().parents[1]


class FelicitacionesTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old_file = felicitaciones.FILE
        felicitaciones.FILE = Path(self.tmp.name) / 'felicitaciones.jsonl'
        self.now = 100_000
        self.engine = Engine(Content(ROOT / 'content'), lambda: self.now)
        self.world = {'version': 0, 'flags': [], 'deaths': {}, 'encounters': {},
                      'creature_states': {}, 'presence': {}}
        state = m.new_state('humano', 'arcano', 'test-home', self.now)
        self.player = {'id': 1, 'name': 'Aventurera', 'species': 'humano', 'class_id': 'arcano',
                       'status': 'approved', 'state': state}

    def tearDown(self):
        felicitaciones.FILE = self.old_file
        self.tmp.cleanup()

    def test_boss_victory_is_recorded(self):
        self.player['state']['location'] = 'veyra_plaza_rutas'
        combat = {'creature': 'dragon_aguas_antiguas', 'profile': dict(m.PROFILES['dragon_aguas_antiguas'])}
        self.player['state']['combat'] = combat
        self.engine.victory(self.player, self.world, combat, m.PROFILES['dragon_aguas_antiguas'])
        entry, = felicitaciones.active(self.now)
        self.assertEqual(entry['achievement_id'], 'jefe:dragon_aguas_antiguas')

    def test_bastion_completion_is_recorded(self):
        self.player['state']['location'] = 'veyra_mazmorra_boveda_guardian'
        combat = {'creature': 'dragon_aguas_antiguas', 'profile': dict(m.PROFILES['dragon_aguas_antiguas'])}
        self.player['state']['combat'] = combat
        self.engine.victory(self.player, self.world, combat, m.PROFILES['dragon_aguas_antiguas'])
        entry, = felicitaciones.active(self.now)
        self.assertEqual(entry['achievement_id'], 'mazmorra:bastion_aguas')

    def test_level_milestone_is_recorded_and_duplicate_is_ignored(self):
        state = self.player['state']
        state['level'] = 4
        state['xp'] = m.xp_next(4)
        self.engine.advance_levels(state, self.player)
        self.engine.advance_levels(state, self.player)
        self.assertFalse(felicitaciones.record(self.player, 'nivel:5', 'Alcanzó el nivel 5', self.now))
        entry, = felicitaciones.active(self.now)
        self.assertEqual(entry['achievement_id'], 'nivel:5')

    def test_entries_expire_after_72_hours(self):
        felicitaciones.record(self.player, 'nivel:5', 'Alcanzó el nivel 5', self.now)
        self.assertEqual(len(felicitaciones.active(self.now + felicitaciones.LIFETIME - 1)), 1)
        self.assertEqual(felicitaciones.active(self.now + felicitaciones.LIFETIME), [])

    def test_snapshot_keeps_only_three_newest_and_ignores_partial_line(self):
        for index in range(4):
            player = {**self.player, 'id': index, 'name': f'Jugador {index}'}
            felicitaciones.record(player, f'jefe:{index}', f'Jefe {index}', self.now + index)
        with felicitaciones.FILE.open('a', encoding='utf-8') as handle:
            handle.write('{parcial')
        self.assertEqual([entry['name'] for entry in felicitaciones.active(self.now + 4)],
                         ['Jugador 3', 'Jugador 2', 'Jugador 1'])

    def test_snapshot_shows_other_players_achievement_on_plaza_honor_board(self):
        felicitaciones.record(self.player, 'jefe:test', 'Venció al jefe', self.now)
        visitor = {**self.player, 'id': 2, 'name': 'Visitante',
                   'state': {**self.player['state'], 'location': 'veyra_plaza_rutas'}}
        room = self.engine.snapshot(visitor, self.world)['room']
        shared = social.snapshot(None, self.world, visitor, self.engine, self.now)['felicitaciones']
        self.assertEqual(room['id'], 'veyra_plaza_rutas')
        self.assertEqual(shared[0]['name'], 'Aventurera')
        client = (ROOT / 'client' / 'app.js').read_text(encoding='utf-8')
        self.assertIn("location==='veyra_plaza_rutas'", client)
        self.assertIn('Placa de honor', client)


if __name__ == '__main__':
    unittest.main()
