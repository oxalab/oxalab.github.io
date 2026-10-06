/* Isometric agent figures for the ycode page — ported from
   anthropic-computer.html (Fig. 01 computer, Fig. 03 agent repair loop,
   Fig. 04 context stack). The per-plate readout outputs were removed with
   their plates, so the say/read writes are guarded no-ops where needed. */

(() => {
  const svg = document.getElementById("stage");
  // the mat under everything is the reference picture's dark platform: the
  // drawing's first three groups after its defs
  const groups = [...svg.querySelectorAll(":scope > g")];
  groups.slice(0, 3).forEach((g) => g.classList.add("desk"));

  const term = document.getElementById("computer-term");
  const cur = document.getElementById("computer-cur");
  const say01 = () => {};
  const prompt = "> ";
  let buf = "";

  function draw() {
    let shown = prompt + buf;
    term.textContent = shown;
    while (term.getComputedTextLength() > 84 && shown.length > prompt.length) {
      shown = prompt + shown.slice(prompt.length + 1);
      term.textContent = shown;
    }
    cur.setAttribute("x", (30 + term.getComputedTextLength() + 0.8).toFixed(1));
  }

  const keys = new Map([...svg.querySelectorAll(".press.key")].map((k) => [k.dataset.key, k]));

  function press(k) {
    const el = keys.get(k);
    if (!el || !svg.classList.contains("on")) return;
    el.classList.add("down");
    setTimeout(() => el.classList.remove("down"), 110);
    if (k === "Backspace") buf = buf.slice(0, -1);
    else if (k === "Enter") buf = "";
    else if (k === "Tab") buf += "  ";
    else if (k.length === 1) buf = (buf + k).slice(-40);
    draw();
    say01("on · " + buf.length + " chars · key " + (k === " " ? "space" : k));
  }

  svg.addEventListener("click", (e) => {
    const key = e.target.closest(".press.key");
    if (key) { press(key.dataset.key); return; }
    if (e.target.closest("#cpu")) {
      const on = svg.classList.toggle("on");
      say01(on ? "on · anthropic" : "off");
      if (!on) { buf = ""; draw(); }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!svg.contains(document.activeElement)) return;
    let k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === " ") k = " ";
    if (keys.has(k)) { if (k === " ") e.preventDefault(); press(k); }
  });

  draw();
})();

/* Fig. 03 — the agent repair loop: a crashed app tower wired to the agent
   terminal (hub), a code slab the agent patches, a bank of eight test suites.
   Run walks crash → logs → edit → tests → done (the check mark); the app's
   power button or "r" crashes it again with the next of three bugs; clicking
   a unit reruns that suite. Keyboard works while the figure holds focus, so
   digits and letters still type on Fig. 01 above. */
(() => {
  /* kernel: one projection, three planes, boxes as three visible faces */
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
  const D = (x, y, z) => [(x - y) * C, (x + y) * S - z];
  const plane = (O, U, V) => { const o = P(...O), u = D(...U), v = D(...V);
    return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`; };
  const TOP   = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
  const FRONT = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
  const SIDE  = (x, y, z) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
  const rect = (t, w, h, r = 0, cls = "face") =>
    `<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;
  const box = (x, y, z, w, d, h, r = 0) =>
    rect(SIDE(x + w, y + d, z + h), d, h, Math.min(r, h / 4)) +
    rect(FRONT(x, y + d, z + h), w, h, Math.min(r, h / 4)) +
    rect(TOP(x, y, z + h), w, d, r, "face top");

  /* static scene, painted back to front */
  const scene = document.getElementById("rl-scene");
  const fig = document.getElementById("rl-fig");
  const read = document.getElementById("read-03") || { textContent: "" };
  let s = `<defs>
    <clipPath id="rl-tc"><rect x="16" y="16" width="132" height="94" rx="6"/></clipPath>
    <clipPath id="rl-ac"><rect x="16" y="16" width="90" height="84" rx="5"/></clipPath>
  </defs>`;

  s += box(0, 0, 0, 460, 340, 14, 5);                                // desk

  /* wires on the desk: app→terminal (cable), terminal→editor, terminal→bank */
  s += `<g transform="${TOP(0, 0, 14)}">
    <path id="rl-wA" class="cable" pathLength="1000" d="M186 92 C214 128, 258 158, 292 142"/>
    <path id="rl-wB" class="wire" pathLength="1000" d="M292 188 C278 200, 264 214, 252 222"/>
    <path id="rl-wC" class="wire" pathLength="1000" d="M340 204 C342 216, 344 228, 352 240"/>
  </g>`;

  /* the broken application */
  s += box(64, 36, 14, 122, 104, 150, 4);
  s += `<g transform="${TOP(64, 36, 164)}">` +
       Array.from({ length: 6 }, (_, i) =>
         `<rect class="detail" x="${16 + i * 18}" y="12" width="3.5" height="16" rx="1.7"/>`).join("") +
       `</g>`;
  s += `<g transform="${SIDE(186, 140, 164)}">` +
       Array.from({ length: 5 }, (_, i) =>
         `<rect class="detail" x="${32 + i * 9}" y="34" width="3.5" height="18" rx="1.7"/>`).join("") +
       Array.from({ length: 3 }, (_, i) =>
         `<rect class="detail" x="${14 + i * 15}" y="118" width="10" height="8" rx="1.5"/>`).join("") +
       `</g>`;
  s += `<g transform="${FRONT(64, 140, 164)}">
    <rect class="face bezel" x="10" y="10" width="102" height="96" rx="7"/>
    <rect class="face glass" x="16" y="16" width="90" height="84" rx="5"/>
    <g clip-path="url(#rl-ac)"><g transform="translate(16 16)">
      <circle class="detail" cx="4" cy="5.5" r="1.7"/><circle class="detail" cx="10" cy="5.5" r="1.7"/>
      <circle class="detail" cx="16" cy="5.5" r="1.7"/>
      <line class="detail" x1="0" x2="90" y1="12" y2="12"/>
      <text class="appwin t" x="24" y="8">app — prod</text>
      <g class="errview">
        <rect class="bnr" x="3" y="17" width="84" height="11" rx="2"/>
        <text id="rl-aw-err" class="appwin h" x="7" y="24.8">✕ 500 — TypeError</text>
        <rect class="detail skel" x="3" y="34" width="70" height="3"/>
        <rect class="detail skel" x="3" y="43" width="54" height="3"/>
        <rect class="detail skel" x="3" y="52" width="64" height="3"/>
        <rect class="detail skel" x="3" y="61" width="40" height="3"/>
        <text id="rl-aw-trace" class="appwin t" x="3" y="78">at sum (cart.js:16)</text>
      </g>
      <g class="okview">
        <rect class="bnr-ok" x="3" y="17" width="84" height="11" rx="2"/>
        <text class="appwin ok" x="7" y="24.8">✓ 200 ok</text>
        <rect class="detail skel" x="3" y="34" width="78" height="3"/>
        <rect class="detail skel" x="3" y="43" width="60" height="3"/>
        <rect class="detail skel" x="3" y="52" width="70" height="3"/>
        <rect class="detail skel" x="3" y="61" width="52" height="3"/>
        <rect class="detail skel" x="3" y="70" width="66" height="3"/>
        <path class="mark-p" d="M28 30 L43 45 L72 14"/>
      </g>
    </g></g>
    <line class="detail" x1="10" x2="112" y1="110" y2="110"/>
    <text class="badge" x="12" y="132" letter-spacing="1.5">APP-01</text>
    <circle id="rl-led-pwr" class="led on" cx="64" cy="127" r="2.8"/>
    <circle id="rl-led-err" cx="78" cy="127" r="2.8"/>
    <circle id="rl-led-net" class="led on" cx="92" cy="127" r="2.8"/>
    <g class="press" data-act="reset">
      <rect class="face cap" x="100" y="115" width="20" height="24" rx="4"/>
      <circle class="detail" cx="110" cy="127" r="4.5"/>
      <line class="detail" x1="110" y1="120.5" x2="110" y2="124.5"/>
    </g>
  </g>`;

  /* the code slab the agent patches */
  s += box(56, 168, 14, 196, 112, 7, 3);
  s += `<g transform="${TOP(56, 168, 21)}" id="rl-editor"></g>`;

  /* the agent terminal: the hub */
  s += box(292, 84, 14, 164, 124, 142, 4);
  s += `<g transform="${TOP(292, 84, 156)}">` +
       Array.from({ length: 7 }, (_, i) =>
         `<rect class="detail" x="${22 + i * 18}" y="8" width="3.5" height="16" rx="1.7"/>`).join("") +
       `</g>`;
  s += `<g transform="${SIDE(456, 208, 156)}">` +
       Array.from({ length: 5 }, (_, i) =>
         `<rect class="detail" x="${30 + i * 9}" y="34" width="3.5" height="18" rx="1.7"/>`).join("") +
       Array.from({ length: 2 }, (_, i) =>
         `<rect class="detail" x="${14 + i * 15}" y="120" width="10" height="8" rx="1.5"/>`).join("") +
       `</g>`;
  s += `<g transform="${FRONT(292, 208, 156)}">
    <rect class="face bezel" x="8" y="8" width="148" height="110" rx="7"/>
    <rect class="face glass" x="16" y="16" width="132" height="94" rx="6"/>
    <g clip-path="url(#rl-tc)"><g transform="translate(16 16)">
      ${Array.from({ length: 12 }, (_, i) =>
        `<line class="scan" x1="2" x2="130" y1="${4 + i * 7.5}" y2="${4 + i * 7.5}"/>`).join("")}
      <g id="rl-t-lines"></g>
    </g></g>
    <circle id="rl-led-ag" class="led on" cx="22" cy="128" r="3"/>
    <text class="badge" x="82" y="131" text-anchor="middle">agent</text>
    <g class="press" data-act="run">
      <rect class="face cap" x="106" y="118" width="40" height="20" rx="4"/>
      <path class="tri" d="M114 125.5 L119 128 L114 130.5 Z"/>
      <text class="klabel" x="135" y="130.5" text-anchor="middle">run</text>
    </g>
  </g>`;

  /* the test bank: eight suite units on a platform */
  s += box(304, 238, 14, 152, 84, 10, 3);
  s += `<g transform="${TOP(304, 238, 24)}">` +
       [[7, 7], [145, 7], [7, 77], [145, 77]].map(([x, y]) =>
         `<circle class="recess" cx="${x}" cy="${y}" r="2"/>` +
         `<line class="detail" x1="${x - 1.4}" y1="${y}" x2="${x + 1.4}" y2="${y}"/>`).join("") +
       `</g>`;
  s += `<g transform="${FRONT(304, 322, 24)}">
    <text class="badge" x="6" y="7" letter-spacing="1.5" style="font-size:5px">TEST BANK · 8 SUITES</text>
  </g>`;
  s += `<g transform="${SIDE(456, 322, 24)}">` +
       Array.from({ length: 2 }, (_, i) =>
         `<rect class="detail" x="${30 + i * 20}" y="2" width="12" height="6" rx="1.5"/>`).join("") +
       `</g>`;

  const SUITES = ["sum", "api", "ui", "net", "io", "pkg", "auth", "cart"];
  const UX = [312, 346, 380, 414], UY = [244, 278];
  SUITES.forEach((suite, i) => {
    const x = UX[i % 4], y = UY[(i / 4) | 0];
    s += `<g class="unit" data-suite="${suite}" id="rl-u-${suite}">` +
         box(x, y, 24, 30, 26, 13, 2) +
         `<g transform="${FRONT(x, y + 26, 37)}">
            <rect class="chip" x="8" y="3" width="14" height="7" rx="2"/>
            <text class="g g-fail" x="15" y="8.8">✕</text>
            <text class="g g-pass" x="15" y="8.8">✓</text>
            <text class="g g-run"  x="15" y="8.8">·</text>
          </g>
          <g transform="${TOP(x, y, 37)}">
            <text class="ulabel" x="15" y="11">${suite}</text>
          </g>
        </g>`;
  });
  scene.innerHTML = s;

  /* the three bugs the loop rotates through */
  const BUGS = [
    { suite: "cart", line: 16, err: "TypeError", msg: "reduce of empty list",
      frame: "at sum (cart.js:16)",
      bad: "return items.reduce((a,b)=>a.price+b.price);",
      fix: "return items.reduce((s,i)=>s+i.price,0);" },
    { suite: "io", line: 9, err: "TypeError", msg: "cart is undefined",
      frame: "at loadCart (io.js:9)",
      bad: "const cart = loadCart();",
      fix: "const cart = loadCart() ?? [];" },
    { suite: "auth", line: 10, err: "RangeError", msg: "invalid tier undefined",
      frame: "at rateFor (auth.js:10)",
      bad: "const tax = rateFor(cart.user);",
      fix: "const tax = rateFor(cart.user ?? guest);" }
  ];
  const BASE = {
    8: "export function checkout(items) {",
    9: "const cart = loadCart();",
    10: "const tax = rateFor(cart.user);",
    11: "const total = sum(items, tax);",
    12: "return { total, tax };",
    13: "}",
    14: "// reconcile with ledger",
    15: "export function sum(items) {",
    16: "return items.reduce((a,b)=>a.price+b.price);",
    17: "}"
  };
  const STAGES = ["crash", "logs", "edit", "tests", "done"];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = { stage: 0, bug: BUGS[0], units: {}, rows: 6, busy: false, crashT: Date.now(), sec: 0 };
  const timers = [];
  const T = (ms, f) => timers.push(setTimeout(f, RM ? 0 : ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const passCount = () => SUITES.filter((u) => state.units[u] === "pass").length;

  function renderEditor() {
    const b = state.bug;
    $("rl-editor").innerHTML =
      `<rect class="detail" x="6" y="6" width="184" height="100" rx="6"/>
       <text class="edhead" x="10" y="12">checkout.js</text>
       <circle class="moddot" cx="188" cy="9.5" r="2"/>
       <text class="modtxt" x="182" y="12" text-anchor="end">M1</text>` +
      Object.keys(BASE).map((n) => {
        const num = +n, i = num - 8, y = 22 + i * 9.5;
        const isBug = num === b.line;
        let out = `<text class="edgut" x="26" y="${y}">${num}</text>`;
        if (isBug) {
          out += `<text class="edmark gut-bad" x="5" y="${y}">−</text>
                  <text class="edmark gut-fix" x="5" y="${y}">+</text>
                  <text class="edtxt txt-bad" x="31" y="${y}">${esc(b.bad)}</text>
                  <text class="edtxt txt-fix" x="31" y="${y}">${esc(b.fix)}</text>
                  <line class="ul-bad" x1="31" x2="151" y1="${y + 1.6}" y2="${y + 1.6}"/>
                  <line class="ul-fix" x1="31" x2="${31 + esc(b.fix).length * 3.3}" y1="${y + 1.6}" y2="${y + 1.6}"/>`;
          if (state.stage === 2)
            out += `<rect class="caret" x="${31 + esc(b.fix).length * 3.3 + 2}" y="${y - 4.6}" width="1.6" height="5.6"/>`;
        } else {
          out += `<text class="edtxt" x="31" y="${y}">${esc(BASE[n])}</text>`;
        }
        return out;
      }).join("");
  }

  function screenRows() {
    const b = state.bug, st = state.stage;
    if (st === 0) return [
      ["$ agent watch ./app", "dim"],
      ["✕ app crashed · pid 4213", "err"],
      [`${b.err}: ${b.msg}`, ""],
      [`failing · ${b.suite} (1/8 suites)`, ""],
      ["", ""],
      ["▸ run — inspect logs", "hint"]];
    if (st === 1) { const r = [
      ["$ agent logs --tail 20", "dim"],
      [`12:04:01 GET /api/${b.suite} → 500`, ""],
      [`12:04:01 ${b.err}: ${b.msg}`, "err"],
      [`  ${b.frame} ◂`, "err"],
      ["  at serve (app.js:102)", "dim"],
      [`bug isolated · ${b.suite}.js:${b.line}`, "ok"]];
      return r.slice(0, state.rows); }
    if (st === 2) { const ctx = BASE[b.line - 1] || ""; return [
      [`$ agent edit ${b.suite}.js`, "dim"],
      [` ${b.line - 1}| ${ctx.slice(0, 22)}`, "dim"],
      [`−${b.line}| …${b.bad.slice(-22)}`, "err"],
      [`+${b.line}| …${b.fix.slice(-22)}`, "ok"],
      ["1 line patched · 0 conflicts", "ok"],
      ["▸ run — rerun tests", "hint"]]; }
    /* st === 3: pairs light as their suites pass */
    const done = (u) => state.units[u] === "pass";
    const pairs = [[0, 1], [2, 3], [4, 5], [6, 7]].map(([a, c]) =>
      [`✓ ${SUITES[a]}${done(SUITES[c]) ? " ✓ " + SUITES[c] : " · " + SUITES[c]}`,
        done(SUITES[a]) && done(SUITES[c]) ? "ok" : "dim"]);
    return [["$ agent test", "dim"], ...pairs,
      [passCount() === 8 ? "8/8 passed · 0 failed" : `running · ${passCount()}/8`,
        passCount() === 8 ? "ok" : ""]];
  }

  function renderScreen() {
    const g = $("rl-t-lines");
    if (state.stage === 4) {
      g.innerHTML =
        `<path class="mark-p" d="M38 34 L57 54 L96 10"/>
         <text class="scr" x="66" y="70" text-anchor="middle" font-size="8" letter-spacing="1">all tests pass</text>
         <text class="scr dim" x="66" y="80" text-anchor="middle" font-size="6">8/8 · ${state.sec}s · ${state.bug.suite} fixed</text>`;
    } else {
      g.innerHTML = screenRows().map(([t, c], i) =>
        `<text class="scr term ${c}" x="5" y="${12 + i * 10}">${esc(t)}</text>`).join("");
    }
  }

  function renderUnits() {
    SUITES.forEach((u) => {
      $("rl-u-" + u).setAttribute("class", "unit " + (state.units[u] || ""));
    });
  }

  function render() {
    const b = state.bug;
    fig.classList.toggle("patched", state.stage >= 2);
    fig.classList.toggle("editing", state.stage === 2);
    fig.classList.toggle("fixed", state.stage === 4);
    $("rl-aw-err").textContent = `✕ 500 — ${b.err}`;
    $("rl-aw-trace").textContent = b.frame;
    renderEditor(); renderScreen(); renderUnits();
    const stat = `app ${state.stage === 4 ? "✓" : "✕"} · ${b.suite} ${state.stage === 4 ? "ok" : "fail"} · ${passCount()}/8 · ${STAGES[state.stage]}`;
    const rs = { 0: `crash · ${b.suite} failing · press run`,
                 1: `logs · ${b.suite}.js:${b.line} · run to edit`,
                 2: `edit · 1 line patched · run to test`,
                 3: `tests · ${passCount()}/8 · running`,
                 4: `fixed · 8/8 · ${state.sec}s · run = new crash` }[state.stage];
    read.textContent = rs;
    $("rl-t-lines").insertAdjacentHTML("beforeend",
      `<line class="scan" x1="0" x2="132" y1="84" y2="84"/>
       <text class="stat" x="5" y="91.5" font-size="5.4">${esc(stat)}</text>`);
  }

  function fire(id) {
    if (RM) return;
    const el = $(id);
    el.classList.remove("go"); void el.getBoundingClientRect();
    el.classList.add("go"); setTimeout(() => el.classList.remove("go"), 650);
  }
  const setUnit = (suite, val) => { state.units[suite] = val; render(); };

  function crash() {
    clearTimers();
    state.bug = BUGS[(BUGS.indexOf(state.bug) + 1) % BUGS.length];
    state.units = {}; SUITES.forEach((u) => state.units[u] = "pass");
    state.units[state.bug.suite] = "fail";
    state.stage = 0; state.rows = 6; state.busy = false; state.crashT = Date.now();
    render();
  }
  function typeRows() {
    state.rows = 1; render();
    for (let i = 2; i <= 6; i++) T(i * 220, () => { state.rows = i; render(); });
  }
  function runTests() {
    const order = SUITES.filter((u) => u !== state.bug.suite).concat([state.bug.suite]);
    order.forEach((u, i) => {
      const d = i === 7 ? 420 : 130;
      T(i * 140, () => setUnit(u, "run"));
      T(i * 140 + d, () => setUnit(u, "pass"));
    });
    T(7 * 140 + 700, () => {
      state.stage = 4; state.busy = false;
      state.sec = Math.max(1, Math.round((Date.now() - state.crashT) / 1000));
      render();
    });
  }
  function run() {
    if (state.busy) return;
    if (state.stage === 4) { crash(); return; }
    if (state.stage === 0) { state.stage = 1; fire("rl-wA"); typeRows(); render(); }
    else if (state.stage === 1) {
      fire("rl-wB"); state.busy = true; render();
      T(420, () => { state.stage = 2; state.busy = false; render(); });
    }
    else if (state.stage === 2) { fire("rl-wC"); state.stage = 3; state.busy = true; render(); runTests(); }
  }

  scene.addEventListener("click", (e) => {
    fig.focus({ preventScroll: true });
    const act = e.target.closest("[data-act]");
    if (act) {
      act.classList.add("down"); setTimeout(() => act.classList.remove("down"), 110);
      if (act.dataset.act === "run") run(); else crash();
      return;
    }
    const unit = e.target.closest(".unit");
    if (unit && !state.busy) {
      const u = unit.dataset.suite;
      setUnit(u, "run");
      T(500, () => setUnit(u, state.stage >= 2 ? "pass" : (u === state.bug.suite ? "fail" : "pass")));
    }
  });

  /* keys land here only while the figure holds focus, capture-phase so Fig. 01
     above doesn't type them on its own keyboard */
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!fig.contains(document.activeElement)) return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); run(); }
    else if (e.key.toLowerCase() === "r") { e.preventDefault(); e.stopPropagation(); crash(); }
  }, true);

  crash();
})();

/* Fig. 04 — the context stack: an agent terminal with three feeder keys
   (code / log / path) pushes snippet tiles along a pulsed cable into an
   8-slot stack of context blocks; blocks cool hot → warm → cold as new
   context arrives, clicking a block recalls it (re-heats it, reverse pulse),
   and when the window fills the two oldest tip into the archive tray.
   Keyboard works while the figure holds focus, so c/l/p still type on
   Fig. 01 above. */
(() => {
  /* kernel: one projection, three planes, boxes as three visible faces */
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
  const D = (x, y, z) => [(x - y) * C, (x + y) * S - z];
  const plane = (O, U, V) => { const o = P(...O), u = D(...U), v = D(...V);
    return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`; };
  const TOP   = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
  const FRONT = (x, y, z) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
  const SIDE  = (x, y, z) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
  const rect = (t, w, h, r = 0, cls = "face") =>
    `<g transform="${t}"><rect class="${cls}" width="${w}" height="${h}" rx="${r}"/></g>`;
  const box = (x, y, z, w, d, h, r = 0) =>
    rect(SIDE(x + w, y + d, z + h), d, h, Math.min(r, h / 4)) +
    rect(FRONT(x, y + d, z + h), w, h, Math.min(r, h / 4)) +
    rect(TOP(x, y, z + h), w, d, r, "face top");

  /* static scene: desk, cable, tile, terminal, dock, archive tray */
  const scene = document.getElementById("cs-scene");
  const fig = document.getElementById("cs-fig");
  const read = document.getElementById("read-04") || { textContent: "" };
  let s = `<defs><clipPath id="cs-tg"><rect x="16" y="16" width="120" height="72" rx="6"/></clipPath></defs>`;

  s += box(0, 0, 0, 470, 350, 14, 5);                                // desk

  s += `<g transform="${TOP(0, 0, 14)}">
    <path id="cs-w1" class="cable" pathLength="1000" d="M202 164 C222 176, 246 184, 268 172"/>
  </g>`;

  s += `<g id="cs-tile">` + box(0, 0, 0, 24, 16, 6, 2) +             // the flying snippet
       `<g transform="${TOP(0, 0, 6)}"><text id="cs-tile-g" class="tglyph" x="12" y="10.5">{}</text></g></g>`;

  /* the source terminal */
  s += box(48, 92, 14, 152, 118, 126, 4);
  s += `<g transform="${TOP(48, 92, 140)}">` +
       Array.from({ length: 6 }, (_, i) =>
         `<rect class="detail" x="${16 + i * 22}" y="10" width="3.5" height="16" rx="1.7"/>`).join("") +
       `</g>`;
  s += `<g transform="${SIDE(200, 210, 140)}">` +
       Array.from({ length: 5 }, (_, i) =>
         `<rect class="detail" x="${32 + i * 9}" y="36" width="3.5" height="18" rx="1.7"/>`).join("") +
       Array.from({ length: 3 }, (_, i) =>
         `<rect class="detail" x="${14 + i * 15}" y="108" width="10" height="8" rx="1.5"/>`).join("") +
       `</g>`;
  s += `<g transform="${FRONT(48, 210, 140)}">
    <rect class="face bezel" x="8" y="8" width="136" height="88" rx="7"/>
    <rect class="face glass" x="16" y="16" width="120" height="72" rx="6"/>
    <g clip-path="url(#cs-tg)"><g transform="translate(16 16)">
      ${Array.from({ length: 9 }, (_, i) =>
        `<line class="scan" x1="2" x2="118" y1="${5 + i * 9}" y2="${5 + i * 9}"/>`).join("")}
      <g id="cs-t-lines"></g>
    </g></g>
    <circle id="cs-tled" class="led on" cx="16" cy="108" r="3"/>
    <g class="press" data-type="code">
      <rect class="face cap" x="22" y="100" width="40" height="19" rx="4"/>
      <text class="klabel" x="42" y="111.5" text-anchor="middle">code</text>
    </g>
    <g class="press" data-type="log">
      <rect class="face cap" x="66" y="100" width="40" height="19" rx="4"/>
      <text class="klabel" x="86" y="111.5" text-anchor="middle">log</text>
    </g>
    <g class="press" data-type="path">
      <rect class="face cap" x="110" y="100" width="40" height="19" rx="4"/>
      <text class="klabel" x="130" y="111.5" text-anchor="middle">path</text>
    </g>
  </g>`;

  /* the context dock: base + aggregate strip */
  s += box(258, 128, 14, 158, 112, 20, 3);
  s += `<g transform="${TOP(258, 128, 34)}">` +
       [[7, 7], [151, 7], [7, 105], [151, 105]].map(([x, y]) =>
         `<circle class="recess" cx="${x}" cy="${y}" r="2"/>` +
         `<line class="detail" x1="${x - 1.4}" y1="${y}" x2="${x + 1.4}" y2="${y}"/>`).join("") +
       `<rect class="detail" x="24" y="18" width="126" height="100" rx="3"/></g>`;
  s += `<g transform="${FRONT(258, 240, 34)}">
    <rect class="face glass" x="6" y="3" width="146" height="14" rx="3"/>
    <g id="cs-strip"></g>
  </g>`;
  s += `<g transform="${SIDE(416, 240, 34)}">` +
       Array.from({ length: 2 }, (_, i) =>
         `<rect class="detail" x="${20 + i * 40}" y="7" width="12" height="6" rx="1.5"/>`).join("") +
       `</g>`;

  /* the archive tray: floor, tiles, low walls */
  s += box(300, 272, 14, 124, 52, 4, 1);
  s += `<g id="cs-arc-tiles"></g>`;
  s += box(300, 272, 18, 124, 5, 14, 1);                             // back wall
  s += box(300, 277, 18, 5, 45, 14, 1);                              // side walls
  s += box(419, 277, 18, 5, 45, 14, 1);
  s += box(300, 319, 18, 124, 5, 10, 1);                             // low front wall
  s += `<g transform="${FRONT(300, 324, 28)}">
    <text class="badge" x="8" y="7" letter-spacing="1.5" style="font-size:5px">ARCHIVE</text>
    <text id="cs-arc-n" class="stript" x="116" y="7" text-anchor="end" style="fill:var(--ink)">0</text>
  </g>`;

  s += `<g id="cs-blocks"></g>`;
  scene.innerHTML = s;

  /* state */
  const POOL = {
    code: { glyph: "{}", tag: "C", rows: ["reduce((s,i)=>s+i.p,0)", "items.filter(i=>i.ok)", "await db.query(q,42)", "const cfg=load(env)", "if(!cart) return 500"], tk: [420, 720] },
    log:  { glyph: "#",  tag: "L", rows: ["GET /api/cart 200", "warn: retry in 2s", "POST /login 401", "job#7 done in 1.2s", "heap 412mb stable"], tk: [60, 140] },
    path: { glyph: "/",  tag: "P", rows: ["src/cart/total.js", "lib/db/pool.js", "test/cart.spec.js", ".agent/config.toml", "app/views/cart.hbs"], tk: [150, 280] }
  };
  const CAP = 8, SLOT_H = 19;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    blocks: [   // index = slot, 0 = bottom = newest; oldest rises to the top
      { type: "code", text: "reduce((s,i)=>s+i.p,0)", tokens: 520, age: 1 },
      { type: "log",  text: "GET /api/cart 200",      tokens: 95,  age: 3 },
      { type: "path", text: "src/cart/total.js",      tokens: 180, age: 5 }
    ],
    arc: 0, busy: false, hist: ["$ ctx feed --watch", "ctx 3/8 · loaded"], last: ""
  };

  const blocksG = document.getElementById("cs-blocks");
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const tok = () => state.blocks.reduce((a, b) => a + b.tokens, 0);
  const ktok = () => (tok() / 1000).toFixed(1) + "k";
  const heat = (a) => a <= 1 ? "hot" : a <= 3 ? "warm" : "";

  /* terminal screen + dock strip */
  function renderScreen() {
    const rows = state.hist.slice(0, 5);
    document.getElementById("cs-t-lines").innerHTML =
      rows.map((t, i) => `<text class="scr term ${i ? "dim" : ""}" x="5" y="${10 + i * 9.5}">${esc(t)}</text>`).join("") +
      `<line class="scan" x1="0" x2="120" y1="55" y2="55"/>` +
      `<text class="stat" x="5" y="65" font-size="5.4">ctx ${state.blocks.length}/${CAP} · ${ktok()} · arc ${state.arc}</text>`;
  }
  function renderStrip() {
    const cells = Array.from({ length: CAP }, (_, i) => {
      const b = state.blocks[i];
      const cls = b ? "scell " + (heat(b.age) || "c") : "scell";
      return `<rect class="${cls}" x="${50 + i * 7}" y="6" width="5" height="8"/>`;
    }).join("");
    document.getElementById("cs-strip").innerHTML =
      `<text class="stript" x="11" y="13">CTX ${state.blocks.length}/${CAP}</text>${cells}` +
      `<text class="strips" x="145" y="13" text-anchor="end">${ktok()} · A${state.arc}</text>`;
    document.getElementById("cs-arc-n").textContent = state.arc;
  }
  function renderTiles() {
    const n = Math.min(state.arc, 4);
    document.getElementById("cs-arc-tiles").innerHTML = Array.from({ length: n }, (_, i) => {
      const x = 312 + (i % 2) * 48, y = 282 + ((i / 2) | 0) * 18;
      return box(x, y, 18, 44, 15, 3, 1) +
             `<g transform="${TOP(x, y, 21)}"><text class="tglyph" x="22" y="10">#</text></g>`;
    }).join("");
  }
  function render() {
    fig.classList.toggle("busy", state.busy);
    renderScreen(); renderStrip(); renderTiles();
    read.textContent = state.busy ? `feeding ${state.last}…`
      : state.last.startsWith("recall") ? state.last
      : `ctx ${state.blocks.length}/${CAP} · ${ktok()} · arc ${state.arc}` +
        (state.last ? ` · ${state.last}` : "");
  }

  /* the blocks: persistent nodes, slot slides, heat */
  function makeNode(b) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "blk");
    g.innerHTML = `<g class="in">` + box(282, 146, 34, 126, 82, 16, 2) +
      `<g transform="${FRONT(282, 228, 50)}">
         <rect class="bhalo" x="3" y="2.5" width="120" height="11" rx="3"/>
         <rect class="bled" x="6" y="5.5" width="9" height="5" rx="2"/>
         <text class="btxt" x="21" y="11.2">${esc(b.text)}</text>
         <text class="btag" x="119" y="11.4">${POOL[b.type].tag}</text>
       </g>
       <g transform="${TOP(282, 146, 50)}"><text class="bglyph" x="63" y="46">${POOL[b.type].glyph}</text></g>
      </g>`;
    return g;
  }
  function syncBlocks() {
    /* paint order: the upper block must paint over the lower one's top face,
       so the DOM runs bottom slot -> top slot. New nodes enter at the front;
       creation walks top -> bottom so the initial three finish bottom-first. */
    [...state.blocks].reverse().forEach((b) => {
      if (!b.node) { b.node = makeNode(b); blocksG.insertBefore(b.node, blocksG.firstChild); }
    });
    state.blocks.forEach((b, i) => {
      b.node.setAttribute("data-i", i);
      b.node.style.transform = `translate(0, ${-i * SLOT_H}px)`;
      b.node.setAttribute("class", `blk ${heat(b.age)}`);
    });
  }

  /* feeding: key → screen row → pulse → tile flight → ingest */
  function fire(cls) {
    if (RM) return;
    const el = document.getElementById("cs-w1");
    el.classList.remove("go", "gor"); void el.getBoundingClientRect();
    el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 600);
  }
  function flyTile(type, done) {
    const tile = document.getElementById("cs-tile");
    document.getElementById("cs-tile-g").textContent = POOL[type].glyph;
    if (RM) { done(); return; }
    const A = P(206, 164, 17), B = P(252, 174, 17);
    tile.classList.add("nt", "fly");
    tile.style.transform = `translate(${A[0]}px, ${A[1]}px)`;
    void tile.getBoundingClientRect();
    tile.classList.remove("nt");
    tile.style.transform = `translate(${B[0]}px, ${B[1]}px)`;
    setTimeout(() => { tile.classList.remove("fly"); done(); }, 620);
  }
  function compact2() {   // the two oldest tip off the top into the archive tray
    const out = [state.blocks.pop(), state.blocks.pop()];
    state.arc += 2;
    state.hist.unshift("· compact −2 → archive");
    out.forEach((b, i) => {
      if (!b || !b.node) return;
      const n = b.node;
      const from = P(345, 187, 42), to = P(362 - i * 8, 292 + i * 14, 26);
      setTimeout(() => {
        n.classList.add("out");
        n.style.transform = `translate(${to[0] - from[0]}px, ${to[1] - from[1]}px)`;
        setTimeout(() => n.remove(), 650);
      }, RM ? 0 : i * 180);
    });
    state.blocks.forEach((b) => b.age++);
  }
  function ingest(type, text, tokens) {
    state.blocks.forEach((b) => b.age++);
    const b = { type, text, tokens, age: 0 };
    state.blocks.unshift(b);
    syncBlocks();
    b.node.classList.add("new");
    setTimeout(() => b.node && b.node.classList.remove("new"), 400);
  }
  function feed(type) {
    if (state.busy) return;
    state.busy = true; state.last = `+${type}`;
    const p = POOL[type];
    const text = p.rows[(Math.random() * p.rows.length) | 0];
    const tokens = Math.round(p.tk[0] + Math.random() * (p.tk[1] - p.tk[0]));
    state.hist.unshift(`> ${type} ${text}`);
    const key = scene.querySelector(`.press[data-type="${type}"]`);
    if (key) { key.classList.add("down"); setTimeout(() => key.classList.remove("down"), 110); }
    render();
    fire("go");
    flyTile(type, () => {
      const full = state.blocks.length >= CAP;
      if (full) compact2();
      setTimeout(() => {
        ingest(type, text, tokens);
        state.busy = false; state.last = `+${type}`;
        render();
      }, RM || !full ? 0 : 350);
    });
  }

  /* recall: click a block, context flows back */
  blocksG.addEventListener("click", (e) => {
    fig.focus({ preventScroll: true });
    const g = e.target.closest(".blk");
    if (!g || state.busy) return;
    const i = +g.dataset.i, b = state.blocks[i];
    if (!b) return;
    b.age = 0;
    state.last = `recall blk${i} · ${b.type} · ${ktok()}`;
    state.hist.unshift(`· blk${i} ${b.type} · fresh`);
    g.classList.add("touched");
    setTimeout(() => g.classList.remove("touched"), 500);
    fire("gor");
    render();
  });

  scene.addEventListener("click", (e) => {
    fig.focus({ preventScroll: true });
    const key = e.target.closest(".press[data-type]");
    if (key) feed(key.dataset.type);
  });
  /* keys land here only while the figure holds focus, capture-phase so
     c/l/p still type on Fig. 01 above */
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!fig.contains(document.activeElement)) return;
    const t = { c: "code", l: "log", p: "path" }[e.key.toLowerCase()];
    if (t) { e.preventDefault(); e.stopPropagation(); feed(t); }
  }, true);

  syncBlocks(); render();
})();
