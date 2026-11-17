import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGIONS = ROOT / 'content' / 'regions'
SCENES = ROOT / 'client-rpg' / 'scenes'


class RegionBackgroundTests(unittest.TestCase):
    def test_every_room_in_every_region_has_an_existing_background(self):
        for region_path in sorted(REGIONS.glob('*.json')):
            region = json.loads(region_path.read_text(encoding='utf-8'))
            for room_id in region['rooms']:
                with self.subTest(region=region_path.stem, room=room_id):
                    scene_path = SCENES / f'{room_id}.json'
                    self.assertTrue(scene_path.is_file(), f'missing scene: {scene_path}')
                    scene = json.loads(scene_path.read_text(encoding='utf-8'))
                    background = scene.get('background')
                    self.assertTrue(background, f'{room_id} has no background mapping')
                    background_path = ROOT / 'client-rpg' / background
                    self.assertTrue(
                        background_path.is_file(),
                        f'{room_id} background does not exist: {background_path}',
                    )


if __name__ == '__main__':
    unittest.main()
