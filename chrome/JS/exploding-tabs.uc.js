// ============================================================================
//  Zen SFX  -  sound effects for the browser UI + exploding tabs + a toolbar control.
//
//  Typing sounds here fire for the browser's OWN inputs (address bar, search,
//  find bar, etc.). They do NOT listen to keystrokes inside web pages.
//  (A separate opt-in adds site-wide typing sound; it is sound-only and never
//  records or transmits which keys are pressed.)
//
//  Assets:  chrome/JS/sfx/
//    keys/*.mp3|wav|ogg    -> typing sounds (a random one per keypress)
//    explosion.gif         -> tab-close animation (falls back to pixel particles)
//    explosion.mp3|wav|ogg -> tab-close sound      (falls back to boom.wav)
//    tabopen.mp3|wav|ogg   -> tab-open sound        (off by default)
//  Settings: chrome/JS/zen-sfx-config.json  (edited by the toolbar button)
// ============================================================================
(function () {
  const HTML = "http://www.w3.org/1999/xhtml";
  const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
  let Services = window.Services;
  if (!Services) { try { Services = ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs").Services; } catch (e) {} }

  const G = Services.__ZenSFX || (Services.__ZenSFX = {
    init: false,
    cfg: { enabled: true, volume: 0.5, typing: true, explode: true, tabopen: false, ignoreRepeat: true },
    keyFiles: [], explodeGif: null, explodeSound: null, tabopenSound: null, dirs: {}, live: 0,
  });

  function toURI(p) { try { return PathUtils.toFileURI(p); } catch (e) { return null; } }
  function uriToPath(u) { try { return Services.io.newURI(u).QueryInterface(Ci.nsIFileURL).file.path; } catch (e) { return null; } }
  async function exists(p) { try { return p && await IOUtils.exists(p); } catch (e) { return false; } }
  async function firstOf(dir, names) { for (const n of names) { const p = PathUtils.join(dir, n); if (await exists(p)) return toURI(p); } return null; }

  function computeDirs() {
    const boom = window.__zenBoomSound || "";
    const boomPath = uriToPath(boom);
    if (!boomPath) return null;
    const js = PathUtils.parent(boomPath);
    return { boomURI: boom, js, sfx: PathUtils.join(js, "sfx"), keys: PathUtils.join(js, "sfx", "keys"), cfg: PathUtils.join(js, "zen-sfx-config.json") };
  }

  async function scan() {
    const d = G.dirs; G.keyFiles = [];
    try { if (await exists(d.keys)) { const kids = await IOUtils.getChildren(d.keys); G.keyFiles = kids.filter(p => /\.(mp3|wav|ogg|m4a)$/i.test(p)).map(toURI).filter(Boolean); } } catch (e) {}
    G.explodeGif = await firstOf(d.sfx, ["explosion.gif"]);
    G.explodeSound = await firstOf(d.sfx, ["explosion.ogg", "explosion.mp3", "explosion.wav"]);
    G.tabopenSound = await firstOf(d.sfx, ["tabopen.ogg", "tabopen.mp3", "tabopen.wav"]);
  }
  async function loadCfg() { try { if (await exists(G.dirs.cfg)) Object.assign(G.cfg, await IOUtils.readJSON(G.dirs.cfg)); } catch (e) {} }
  async function saveCfg() { try { await IOUtils.writeJSON(G.dirs.cfg, G.cfg); } catch (e) {} }

  function play(url, vol) {
    if (!url || !G.cfg.enabled) return;
    if (G.live > 24) return;
    const win = Services.wm.getMostRecentWindow("navigator:browser");
    if (!win || !win.document) return;
    try {
      const a = win.document.createElementNS(HTML, "audio");
      a.src = url; a.volume = Math.max(0, Math.min(1, vol == null ? G.cfg.volume : vol));
      G.live++; const done = () => { G.live--; a.remove(); };
      a.addEventListener("ended", done); a.addEventListener("error", done);
      win.document.documentElement.appendChild(a); a.play().catch(() => {});
    } catch (e) {}
  }
  function playKey() { if (G.cfg.enabled && G.cfg.typing && G.keyFiles.length) play(G.keyFiles[(Math.random() * G.keyFiles.length) | 0]); }
  const MODS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Fn", "Dead"]);

  function shake(win) {
    const doc = win.document, el = doc.getElementById("browser") || doc.getElementById("appcontent") || doc.documentElement;
    if (!el) return;
    const prev = el.style.transform; let t = 0;
    const iv = win.setInterval(() => { t++; const m = Math.max(0, 10 - t); el.style.transform = `translate(${(Math.random() - 0.5) * m * 2}px, ${(Math.random() - 0.5) * m * 2}px)`; if (t > 10) { win.clearInterval(iv); el.style.transform = prev; } }, 16);
  }
  function particles(win, cx, cy) {
    const doc = win.document, dpr = win.devicePixelRatio || 1, W = win.innerWidth, H = win.innerHeight;
    const canvas = doc.createElementNS(HTML, "canvas"); canvas.width = W * dpr; canvas.height = H * dpr;
    Object.assign(canvas.style, { position: "fixed", left: "0", top: "0", width: W + "px", height: H + "px", pointerEvents: "none", zIndex: "2147483647" });
    doc.documentElement.appendChild(canvas); const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    const pal = ["#f2f2f2", "#c8c8c8", "#8a8a8a", "#5a5a5a", "#ffd24a", "#ff9a3c", "#ff5555", "#7a4a2a"], parts = [];
    for (let i = 0; i < 110; i++) { const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 11; parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, size: 2 + Math.random() * 6, life: 1, decay: 0.01 + Math.random() * 0.018, color: pal[(Math.random() * pal.length) | 0], rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.5 }); }
    let flash = 1;
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      if (flash > 0) { ctx.globalAlpha = flash * 0.6; ctx.fillStyle = "#fff2b0"; ctx.beginPath(); ctx.arc(cx, cy, (1 - flash) * 90 + 8, 0, Math.PI * 2); ctx.fill(); flash -= 0.12; }
      let alive = false;
      for (const p of parts) { if (p.life <= 0) continue; alive = true; p.vy += 0.5; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay; ctx.globalAlpha = Math.max(0, p.life); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore(); }
      if (alive || flash > 0) win.requestAnimationFrame(frame); else canvas.remove();
    })();
  }
  function explode(win, cx, cy) {
    if (!G.cfg.enabled || !G.cfg.explode) return;
    shake(win); play(G.explodeSound || G.dirs.boomURI);
    if (G.explodeGif) {
      const doc = win.document, SIZE = 256, img = doc.createElementNS(HTML, "img");
      img.src = G.explodeGif + "?t=" + Date.now();
      Object.assign(img.style, { position: "fixed", left: (cx - SIZE / 2) + "px", top: (cy - SIZE / 2) + "px", width: SIZE + "px", height: "auto", pointerEvents: "none", zIndex: "2147483647" });
      let failed = false; img.addEventListener("error", () => { failed = true; img.remove(); particles(win, cx, cy); });
      doc.documentElement.appendChild(img); win.setTimeout(() => { if (!failed) img.remove(); }, 900);
    } else { particles(win, cx, cy); }
  }

  const ICON = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path fill='context-fill' fill-opacity='context-fill-opacity' d='M3 6v4h2l3 3V3L5 6H3zm8.5 2a2.5 2.5 0 0 0-1.5-2.3v4.6A2.5 2.5 0 0 0 11.5 8zM10 2.1v1.6a4 4 0 0 1 0 8.6v1.6a5.5 5.5 0 0 0 0-11.8z'/></svg>`);

  function injectDomButton(win) {
    try {
      const doc = win.document;
      if (doc.getElementById("zen-sfx-dombutton")) return true;
      const host =
        doc.getElementById("nav-bar-customization-target") ||
        doc.getElementById("nav-bar") ||
        doc.getElementById("zen-appcontent-navbar-container") ||
        doc.querySelector("#urlbar-container") ||
        doc.querySelector("toolbar");
      if (!host) return false;
      const b = doc.createXULElement("toolbarbutton");
      b.id = "zen-sfx-dombutton";
      b.className = "toolbarbutton-1 chromeclass-toolbar-additional";
      b.setAttribute("label", "Zen SFX");
      b.setAttribute("tooltiptext", "Zen SFX settings");
      b.style.listStyleImage = `url("${ICON}")`;
      b.style.MozBoxAlign = "center";
      b.addEventListener("command", () => openPanel(win, b));
      b.addEventListener("click", () => openPanel(win, b));
      host.appendChild(b);
      return true;
    } catch (e) { Cu.reportError(e); return false; }
  }

  function ensureButton(win) {
    // Use the browser window's already-loaded CustomizableUI (importing the
    // module directly from this context fails in Zen). Fall back to a plain
    // toolbarbutton injected into the nav bar if that is unavailable.
    try {
      const CUI = win.CustomizableUI;
      if (CUI && CUI.createWidget) {
        const existing = CUI.getWidget && CUI.getWidget("zen-sfx-button");
        if (!(existing && existing.provider === "api")) {
          CUI.createWidget({
            id: "zen-sfx-button", label: "Zen SFX", tooltiptext: "Zen SFX settings", removable: true,
            defaultArea: CUI.AREA_NAVBAR,
            onCreated(node) { node.style.listStyleImage = `url("${ICON}")`; },
            onCommand(ev) { const n = ev.target; openPanel(n.ownerGlobal || (n.ownerDocument && n.ownerDocument.defaultView), n); },
          });
        }
        // If it didn't end up in the visible bar, add a direct one too.
        win.setTimeout(() => {
          try {
            const n = win.document.getElementById("zen-sfx-button");
            if (!n || !n.getBoundingClientRect().width) injectDomButton(win);
          } catch (e) { injectDomButton(win); }
        }, 1500);
        return;
      }
    } catch (e) { Cu.reportError(e); }
    injectDomButton(win);
  }
  function css(el, o) { try { Object.assign(el.style, o); } catch (e) {} return el; }
  function label(doc, text) { const l = doc.createElementNS(HTML, "span"); l.textContent = text; return css(l, { flex: "1" }); }
  function toggle(doc, text, key) {
    const wrap = css(doc.createElementNS(HTML, "label"), { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", margin: "7px 0", cursor: "pointer" });
    const cb = doc.createElementNS(HTML, "input"); cb.type = "checkbox"; cb.checked = !!G.cfg[key];
    cb.addEventListener("change", () => { G.cfg[key] = cb.checked; saveCfg(); });
    wrap.append(label(doc, text), cb); return wrap;
  }
  function btn(doc, text, fn) {
    const b = doc.createElementNS(HTML, "button"); b.textContent = text;
    css(b, { flex: "1", padding: "6px 8px", marginTop: "4px", background: "#3a3742", color: "#eee", border: "1px solid #16141c", borderRadius: "5px", cursor: "pointer" });
    b.addEventListener("click", fn); return b;
  }
  function openPanel(win, anchor) {
    try {
      if (!win) win = Services.wm.getMostRecentWindow("navigator:browser");
      if (!win || !win.document) return;
      if (!anchor) anchor = win.document.getElementById("zen-sfx-button") || win.document.getElementById("zen-sfx-dombutton");
      const now = Date.now();
      if (win.__zenSFXts && now - win.__zenSFXts < 450) return;  // ignore the click+command double-fire
      win.__zenSFXts = now;
      const doc = win.document;
      let panel = doc.getElementById("zen-sfx-panel");
      if (panel && panel.state === "open") { panel.hidePopup(); return; }  // toggle
      if (!panel) {
        panel = doc.createXULElement("panel");
        panel.id = "zen-sfx-panel";
        panel.setAttribute("type", "arrow");
        panel.setAttribute("noautofocus", "true");
        const box = css(doc.createElementNS(HTML, "div"), { padding: "14px 16px", minWidth: "230px", font: "13px system-ui", color: "#e8e4ec", background: "#221d2a" });
        const title = css(doc.createElementNS(HTML, "div"), { fontWeight: "700", fontSize: "16px", color: "#ffcc44", marginBottom: "8px" });
        title.textContent = "Zen SFX"; box.appendChild(title);
        box.appendChild(toggle(doc, "Enabled", "enabled"));
        box.appendChild(toggle(doc, "Typing sounds (UI)", "typing"));
        box.appendChild(toggle(doc, "Tab explosion", "explode"));
        box.appendChild(toggle(doc, "Tab open sound", "tabopen"));
        const vrow = css(doc.createElementNS(HTML, "div"), { display: "flex", alignItems: "center", gap: "10px", margin: "9px 0" });
        const slider = doc.createElementNS(HTML, "input");
        slider.type = "range"; slider.min = "0"; slider.max = "100"; slider.value = String(Math.round(G.cfg.volume * 100)); css(slider, { flex: "1" });
        slider.addEventListener("input", () => { G.cfg.volume = slider.value / 100; });
        slider.addEventListener("change", () => { saveCfg(); if (G.keyFiles[0]) play(G.keyFiles[0]); });
        vrow.append(label(doc, "Volume"), slider); box.appendChild(vrow);
        const brow = css(doc.createElementNS(HTML, "div"), { display: "flex", gap: "8px", marginTop: "8px" });
        brow.appendChild(btn(doc, "Open SFX folder", () => { try { const f = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile); f.initWithPath(G.dirs.sfx); f.reveal(); } catch (e) {} }));
        brow.appendChild(btn(doc, "Reload", async () => { await loadCfg(); await scan(); }));
        box.appendChild(brow);
        const hint = css(doc.createElementNS(HTML, "div"), { marginTop: "8px", opacity: ".6", fontSize: "11px" });
        hint.textContent = `${G.keyFiles.length} key sound(s) loaded`; box.appendChild(hint);
        const sndLink = css(doc.createElementNS(HTML, "a"), { display: "block", marginTop: "10px", color: "#7fd0ff", cursor: "pointer", fontSize: "12px", textDecoration: "underline" });
        sndLink.textContent = "sound";
        sndLink.addEventListener("click", () => {
          try { win.openTrustedLinkIn("https://www.youtube.com/watch?v=BuKft9LpL_0", "tab"); } catch (e) {}
          try { const p = doc.getElementById("zen-sfx-panel"); if (p) p.hidePopup(); } catch (e) {}
        });
        box.appendChild(sndLink);
        panel.appendChild(box);
        (doc.getElementById("mainPopupSet") || doc.documentElement).appendChild(panel);
      }
      panel.openPopup(anchor, "bottomcenter topright", 0, 0, false, false);
    } catch (e) { Cu.reportError(e); }
  }

  function wireWindow(win) {
    if (win.__zenSFXWired) return; win.__zenSFXWired = true;
    // Browser UI inputs only (address bar, search, find bar). Not web-page content.
    win.addEventListener("keydown", (e) => { if (!(G.cfg.ignoreRepeat && e.repeat) && !MODS.has(e.key)) playKey(); }, true);
    try {
      if (win.gBrowser && win.gBrowser.tabContainer) {
        win.gBrowser.tabContainer.addEventListener("TabClose", (e) => { const r = e.target.getBoundingClientRect(); if (r && r.width) explode(win, r.left + r.width / 2, r.top + r.height / 2); });
        win.gBrowser.tabContainer.addEventListener("TabOpen", () => { if (G.cfg.tabopen) play(G.tabopenSound); });
      }
    } catch (e) {}
    ensureButton(win);
  }
  async function globalInit() {
    if (G.init) return; G.init = true;
    const d = computeDirs(); if (!d) { G.init = false; return; }
    G.dirs = d;
    try { await IOUtils.makeDirectory(d.keys, { ignoreExisting: true, createAncestors: true }); } catch (e) {}
    await loadCfg(); await scan();
  }
  (async () => { try { await globalInit(); } catch (e) {} wireWindow(window); })();
})();
