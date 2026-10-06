"""One-shot port: pull Fig 01/03/04 out of anthropic-computer.html into the ycode page.
Run from anywhere; paths are absolute. Safe to re-run (idempotent inserts)."""
import io, re, sys

SRC = r"D:\experiment-tech\isometric-assets\anthropic-computer.html"
IDX = r"D:\OxaLabs\oxalab.github.io\ycode\index.html"
JS  = r"D:\OxaLabs\oxalab.github.io\ycode\js\figures.js"

with io.open(SRC, encoding="utf-8") as f:
    lines = f.read().split("\n")

# --- Fig 01: the <svg id="stage"> spans lines 268-288; 288 is one giant path line ---
m = re.search(r'<svg id="stage".*?</svg>', "\n".join(lines[267:288]), re.DOTALL)
if not m:
    sys.exit("could not find #stage svg on lines 268-288")
svg_stage = m.group(0)

# --- Fig 01 script (first IIFE of the 314-380 block, before the Fig 02 IIFE) ---
block1 = "\n".join(lines[314:379])  # between <script> (314) and </script> (380), 1-indexed
i0 = block1.index('(() => {')
i1 = block1.index('(() => {  // Fig. 02')
fig01 = block1[i0:i1].rstrip()

# --- Fig 03 / Fig 04 script blocks (whole IIFE each) ---
fig03 = "\n".join(lines[381:752])  # content of <script> 381 .. </script> 753
fig04 = "\n".join(lines[754:1046]) # content of <script> 754 .. </script> 1047

# --- patches: the per-plate readouts were removed from the page ---
fig01 = fig01.replace(
    'const say01 = (t) => { document.getElementById("read-01").textContent = t; };',
    'const say01 = () => {};')
# Fig 01 owns a global keydown listener; on the ycode page it only answers
# while the figure itself holds focus, so typing/space still work elsewhere.
fig01 = fig01.replace(
    'window.addEventListener("keydown", (e) => {\n    if (e.metaKey || e.ctrlKey || e.altKey) return;\n    let k =',
    'window.addEventListener("keydown", (e) => {\n    if (e.metaKey || e.ctrlKey || e.altKey) return;\n'
    '    if (!svg.contains(document.activeElement)) return;\n    let k =')
fig03 = fig03.replace('const read = document.getElementById("read-03");',
                      'const read = document.getElementById("read-03") || { textContent: "" };')
fig04 = fig04.replace('const read = document.getElementById("read-04");',
                      'const read = document.getElementById("read-04") || { textContent: "" };')

for probe in ['const say01 = () => {};', 'activeElement', 'read-03") ||', 'read-04") ||']:
    if probe not in (fig01 + fig03 + fig04):
        sys.exit("patch failed: " + probe)

js_body = """/* Isometric agent figures for the ycode page — ported from
   anthropic-computer.html (Fig. 01 computer, Fig. 03 agent repair loop,
   Fig. 04 context stack). The per-plate readout outputs were removed with
   their plates, so the say/read writes are guarded no-ops where needed. */

"""

with io.open(JS, "w", encoding="utf-8", newline="\n") as f:
    f.write(js_body + fig01 + "\n\n" + fig03.strip() + "\n\n" + fig04.strip() + "\n")

# --- index.html: section below the Hallmark section ---
with io.open(IDX, encoding="utf-8") as f:
    idx = f.read()

if 'id="agent-figures"' not in idx:
    section = (
        '    <div class="divider-gray"></div>\n'
        '\n'
        '    <!-- ===== Agent figures (isometric: computer / repair loop / context stack) ===== -->\n'
        '    <section id="agent-figures" class="relative overflow-hidden" style="width: 100%;">\n'
        '      <div class="af-fig">\n'
        '        ' + svg_stage + '\n'
        '      </div>\n'
        '      <div class="af-fig">\n'
        '        <svg id="rl-fig" viewBox="-330 -150 762 584" role="img" tabindex="0"\n'
        '          aria-label="Isometric figure of an agent repair loop: a crashed application is wired to an agent terminal with a code editor slab and a bank of eight test units. Click the run key or press space to walk the loop — inspect logs, patch the code, rerun tests until the check mark appears; press the app\'s power or r to crash it with a new bug; click any test unit to rerun that suite."><g id="rl-scene"></g></svg>\n'
        '      </div>\n'
        '      <div class="af-fig">\n'
        '        <svg id="cs-fig" viewBox="-338 -105 780 550" role="img" tabindex="0"\n'
        '          aria-label="Isometric figure of a context stack: an agent terminal with three feeder keys pushes snippets of code, logs and file paths along a cable into a glowing stack of context blocks. Click the code, log or path keys, or press c, l or p while the figure is focused, to feed a snippet; click a block to recall it; when the window fills, the oldest blocks tip into the archive tray."><g id="cs-scene"></g></svg>\n'
        '      </div>\n'
        '    </section>\n'
    )
    marker = '    <div class="divider-gray"></div>\n\n    <!-- ===== Journal ===== -->'
    if marker not in idx:
        sys.exit("journal marker not found in index.html")
    idx = idx.replace(marker, section + '\n    <!-- ===== Journal ===== -->', 1)

if './css/figures.css' not in idx:
    idx = idx.replace('<link rel="stylesheet" href="./css/style.css">',
                      '<link rel="stylesheet" href="./css/style.css">\n  <link rel="stylesheet" href="./css/figures.css">', 1)

if './js/figures.js' not in idx:
    idx = idx.replace('<script src="./js/main.js" defer></script>',
                      '<script src="./js/main.js" defer></script>\n  <script src="./js/figures.js" defer></script>', 1)

with io.open(IDX, "w", encoding="utf-8", newline="\n") as f:
    f.write(idx)

print("ok: figures.js written, index.html updated")
