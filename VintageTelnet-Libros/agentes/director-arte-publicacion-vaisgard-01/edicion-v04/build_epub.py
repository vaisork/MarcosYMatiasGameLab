#!/usr/bin/env python3
"""Genera el EPUB 3 de Crónicas de Vaisgard, Libro I, desde edicion-v04/.

Entradas: texto/*.md (orden por nombre), ilustraciones.json, arte/ (JPEG).
Salida: ruta indicada en argv[1].
Solo biblioteca estándar.
"""
import html
import json
import re
import sys
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
TITLE = "Crónicas de Vaisgard"
SUBTITLE = "Libro I: El primer camino"
EDITION = "Edición digital 1.0"
BOOK_ID = "urn:uuid:" + str(uuid.uuid5(uuid.NAMESPACE_URL, "cronicas-vaisgard-libro-1-v04"))

CSS = """@charset "UTF-8";
body{font-family:serif;line-height:1.5;margin:0 5%;hyphens:auto;-webkit-hyphens:auto}
p{margin:0;text-indent:1.3em;orphans:2;widows:2}
h1+p,hr+p,figure+p,.open+p,p.first{text-indent:0}
section{break-before:page}
header.open{margin:3em 0 2.2em;text-align:center}
header.open .num{display:block;font-size:.8em;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.6em}
header.open h1{font-size:1.6em;font-weight:normal;font-style:italic;line-height:1.25;margin:0}
hr.scene{border:0;margin:1.4em 0;text-align:center;height:1.2em}
hr.scene:after{content:"⁂";font-size:1em}
figure{margin:1.6em 0;text-align:center;break-inside:avoid}
figure img{max-width:100%;max-height:85vh;height:auto}
.cover{margin:0;padding:0;text-align:center}
.cover img{max-width:100%;max-height:100vh}
.title{text-align:center;margin-top:20%}
.title h1{font-size:2em;font-weight:normal;letter-spacing:.06em;margin:0 0 .4em}
.title .sub{font-size:1.15em;font-style:italic;margin:0 0 3em;text-indent:0}
.title p,.credits p{text-indent:0}
.credits{font-size:.85em;margin-top:30%;text-align:center}
.credits p{margin-bottom:.8em}
em{font-style:italic}
nav ol{list-style:none;padding:0}
nav li{margin:.4em 0}
nav a{text-decoration:none}
"""


def xhtml(title, body, epub_type=""):
    t = f' epub:type="{epub_type}"' if epub_type else ""
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n'
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" '
        'xml:lang="es" lang="es">\n<head><meta charset="utf-8"/>'
        f"<title>{html.escape(title)}</title>"
        '<link href="../styles.css" rel="stylesheet" type="text/css"/></head>\n'
        f"<body{t}>\n{body}\n</body>\n</html>\n"
    )


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)


def figure(img):
    return (f'<figure><img src="../images/{img["file"]}" '
            f'alt="{html.escape(img["alt"])}"/></figure>')


def chapter(md, sec_id, images):
    lines = [l.rstrip() for l in md.splitlines()]
    heading = next(l for l in lines if l.startswith("# "))[2:]
    if " — " in heading:
        num, name = heading.split(" — ", 1)
    else:
        num, name = "", heading
    parts = []
    pending = [i for i in images]
    para = []

    def flush():
        if not para:
            return
        text = " ".join(para)
        parts.append(f"<p>{inline(text)}</p>")
        for img in list(pending):
            if img["anchor"] in text:
                parts.append(figure(img))
                pending.remove(img)
        para.clear()

    for l in lines:
        if l.startswith("# ") or l.startswith(">"):
            continue
        if l.startswith("## "):
            flush()
            parts.append(f'<hr class="scene"/>')
        elif l.strip() == "***":
            flush()
            parts.append('<hr class="scene"/>')
        elif not l.strip():
            flush()
        else:
            para.append(l.strip())
    flush()
    if pending:
        sys.exit(f"Anclas no encontradas en {sec_id}: {[i['anchor'] for i in pending]}")
    label = f'<span class="num">{html.escape(num)}</span>' if num else ""
    kind = "prologue" if sec_id == "prologo" else "chapter"
    body = (f'<section epub:type="{kind}" role="doc-{kind}" id="{sec_id}" '
            f'aria-labelledby="h-{sec_id}"><header class="open">{label}'
            f'<h1 id="h-{sec_id}">{html.escape(name)}</h1></header>\n' + "\n".join(parts) + "</section>")
    return heading, xhtml(heading, body)


def main(out):
    images = json.loads((BASE / "ilustraciones.json").read_text(encoding="utf-8"))
    cover = images.get("cover")
    by_sec = {}
    for img in images["interior"]:
        by_sec.setdefault(img["section"], []).append(img)
    files = sorted((BASE / "texto").glob("*.md"))
    docs, toc = [], []
    for f in files:
        sec = "prologo" if f.name.startswith("000") else "capitulo-" + f.name[:3]
        heading, doc = chapter(f.read_text(encoding="utf-8"), sec, by_sec.get(sec, []))
        docs.append((sec, doc))
        toc.append((sec, heading))

    title_page = xhtml(TITLE, f'<div class="title"><h1>{TITLE}</h1><p class="sub">{SUBTITLE}</p></div>'
                       f'<div class="credits"><p>{EDITION}. Uso privado.</p>'
                       '<p>Novela ambientada en el universo de Vintage Telnet 2.</p>'
                       '<p>Texto e ilustraciones producidos con asistencia de inteligencia artificial '
                       'bajo dirección editorial del proyecto.</p></div>')
    nav_items = "".join(f'<li><a href="xhtml/{s}.xhtml">{html.escape(h)}</a></li>' for s, h in toc)
    nav = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" '
           'xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="es" lang="es"><head><meta charset="utf-8"/>'
           '<title>Índice</title><link href="styles.css" rel="stylesheet" type="text/css"/></head><body>'
           f'<nav epub:type="toc" role="doc-toc" id="toc"><h1>Índice</h1><ol>{nav_items}</ol></nav>'
           '<nav epub:type="landmarks" hidden=""><ol>'
           + (f'<li><a epub:type="cover" href="xhtml/cubierta.xhtml">Cubierta</a></li>' if cover else "")
           + '<li><a epub:type="titlepage" href="xhtml/portadilla.xhtml">Portadilla</a></li>'
           '<li><a epub:type="toc" href="nav.xhtml">Índice</a></li>'
           '<li><a epub:type="bodymatter" href="xhtml/prologo.xhtml">Comienzo</a></li>'
           '</ol></nav></body></html>\n')

    manifest = ['<item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>',
                '<item id="css" href="styles.css" media-type="text/css"/>',
                '<item id="portadilla" href="xhtml/portadilla.xhtml" media-type="application/xhtml+xml"/>']
    spine = []
    if cover:
        manifest += [f'<item id="cover-img" href="images/{cover["file"]}" properties="cover-image" media-type="image/jpeg"/>',
                     '<item id="cubierta" href="xhtml/cubierta.xhtml" media-type="application/xhtml+xml"/>']
        spine.append('<itemref idref="cubierta" linear="yes"/>')
    spine.append('<itemref idref="portadilla"/>')
    spine.append('<itemref idref="nav"/>')
    for s, _ in docs:
        manifest.append(f'<item id="{s}" href="xhtml/{s}.xhtml" media-type="application/xhtml+xml"/>')
        spine.append(f'<itemref idref="{s}"/>')
    for img in images["interior"]:
        manifest.append(f'<item id="img-{img["id"]}" href="images/{img["file"]}" media-type="image/jpeg"/>')

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    summary = ("Novela con navegación estructurada por capítulos e índice. Todas las ilustraciones "
               "tienen texto alternativo; el texto se puede leer completo sin ellas.")
    opf = ('<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" '
           'unique-identifier="pub-id" xml:lang="es"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'
           f'<dc:identifier id="pub-id">{BOOK_ID}</dc:identifier>'
           f'<dc:title>{TITLE}. {SUBTITLE}</dc:title><dc:language>es</dc:language>'
           '<dc:creator>Matías Game Labs</dc:creator><dc:publisher>Matías Game Labs</dc:publisher>'
           f'<dc:description>{EDITION}. Novela de aventuras para lectores de 10 a 14 años y adultos, '
           'ambientada en el universo de Vintage Telnet 2.</dc:description>'
           f'<meta property="dcterms:modified">{now}</meta>'
           '<meta property="schema:accessMode">textual</meta><meta property="schema:accessMode">visual</meta>'
           '<meta property="schema:accessModeSufficient">textual</meta>'
           '<meta property="schema:accessibilityFeature">alternativeText</meta>'
           '<meta property="schema:accessibilityFeature">readingOrder</meta>'
           '<meta property="schema:accessibilityFeature">structuralNavigation</meta>'
           '<meta property="schema:accessibilityFeature">tableOfContents</meta>'
           '<meta property="schema:accessibilityHazard">none</meta>'
           f'<meta property="schema:accessibilitySummary">{summary}</meta>'
           '<link rel="dcterms:conformsTo" href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"/>'
           '<meta property="a11y:certifiedBy">Revisión interna del proyecto</meta>'
           + (f'<meta name="cover" content="cover-img"/>' if cover else "")
           + "</metadata><manifest>" + "".join(manifest) + "</manifest><spine>" + "".join(spine)
           + "</spine></package>\n")

    container = ('<?xml version="1.0" encoding="UTF-8"?><container version="1.0" '
                 'xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles>'
                 '<rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml"/>'
                 '</rootfiles></container>')
    with zipfile.ZipFile(out, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        z.writestr("META-INF/container.xml", container, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/package.opf", opf, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/nav.xhtml", nav, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/styles.css", CSS, zipfile.ZIP_DEFLATED)
        z.writestr("OEBPS/xhtml/portadilla.xhtml", title_page, zipfile.ZIP_DEFLATED)
        if cover:
            z.writestr("OEBPS/xhtml/cubierta.xhtml", xhtml(TITLE, f'<div class="cover"><img src="../images/{cover["file"]}" '
                       f'role="doc-cover" alt="{html.escape(cover["alt"])}"/></div>'), zipfile.ZIP_DEFLATED)
            z.write(BASE / "arte" / cover["file"], f"OEBPS/images/{cover['file']}", zipfile.ZIP_STORED)
        for s, doc in docs:
            z.writestr(f"OEBPS/xhtml/{s}.xhtml", doc, zipfile.ZIP_DEFLATED)
        for img in images["interior"]:
            z.write(BASE / "arte" / img["file"], f"OEBPS/images/{img['file']}", zipfile.ZIP_STORED)
    print(f"OK {out}: {len(docs)} secciones, {len(images['interior'])} ilustraciones")


if __name__ == "__main__":
    main(sys.argv[1])
