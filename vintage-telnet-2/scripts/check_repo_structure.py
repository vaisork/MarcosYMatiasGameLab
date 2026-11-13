"""Check migration boundaries, preserved evidence, links and legacy entry points."""
from pathlib import Path
import hashlib,json,re,os

ROOT=Path(__file__).resolve().parents[2]

def main():
 inventory=json.loads((ROOT/'docs/shared/REORGANIZATION_INVENTORY.json').read_text())
 for old,new in inventory['moves'].items():
  assert (ROOT/new).is_file(),f'Missing moved file: {new}'
 for new,digest in inventory['evidence_hashes'].items():
  assert hashlib.sha256((ROOT/new).read_bytes()).hexdigest()==digest,f'Evidence bytes changed: {new}'
 for path in ['AGENTS.md','REPO_STRUCTURE.md','MIGRATION_REPORT.md','vintage-telnet-2/AGENTS.md','vintage-telnet/AGENTS.md','senku/legacy/AGENTS.md','senku/v2/AGENTS.md']:
  assert (ROOT/path).is_file(),f'Missing boundary: {path}'
 for p in ROOT.rglob('*.md'):
  if '.git' in p.parts:continue
  if '.claude' in p.parts or 'engine-reference' in p.parts:continue  # docs de terceros (CCGS) con código en markdown
  for link in re.findall(r'!?\[[^\]\n]*\]\(([^\s)]+)',p.read_text()):
   if re.match(r'(?:[a-zA-Z]+:|/|#)',link):continue
   assert (p.parent/link.split('#')[0]).exists(),f'Broken link: {p.relative_to(ROOT)}: {link}'
 assert 'url=legacy/' in (ROOT/'senku/index.html').read_text()
 assert 'url=legacy/juego.html' in (ROOT/'senku/juego.html').read_text()
 for manifest in ['senku/legacy/senku.webmanifest','senku.webmanifest','matiasgamelab.webmanifest']:
  p=ROOT/manifest;m=json.loads(p.read_text())
  for icon in m['icons']:assert (p.parent/icon['src']).is_file(),f'Missing icon: {manifest}'
  assert (p.parent/m['start_url']).exists(),f'Missing start URL: {manifest}'
 assert not list((ROOT/'vintage-telnet-2/docs').glob('*.pdf')),'Private source PDF must not be published'
 print(f"PASS: {len(inventory['moves'])} moved files, {len(inventory['evidence_hashes'])} evidence hashes, Markdown links, agent boundaries and Senku/portal manifests.")

if __name__=='__main__':main()
