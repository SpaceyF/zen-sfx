// Exploding Zen Tabs - autoconfig loader.
// Injects chrome/JS/exploding-tabs.uc.js into every browser window.
try {
  const Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;
  let Services = globalThis.Services;
  if (!Services) { try { Services = ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs").Services; } catch (e) {} }
  if (!Services) { try { Services = Cu.import("resource://gre/modules/Services.jsm").Services; } catch (e) {} }

  const profile = Services.dirsvc.get("ProfD", Ci.nsIFile);
  function fileURI(...parts) {
    let f = profile.clone();
    for (const p of parts) f.append(p);
    return Services.io.newFileURI(f).spec;
  }
  const scriptURL = fileURI("chrome", "JS", "exploding-tabs.uc.js");
  const soundURL  = fileURI("chrome", "JS", "boom.wav");

  const loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);

  function inject(win) {
    try {
      if (win.__explodingTabs) return;
      win.__zenBoomSound = soundURL;
      loader.loadSubScript(scriptURL, win);
    } catch (e) { Cu.reportError(e); }
  }

  function maybeInject(win) {
    win.addEventListener("load", function onload() {
      win.removeEventListener("load", onload);
      const href = win.location && win.location.href;
      if (href === "chrome://browser/content/browser.xhtml" ||
          href === "chrome://browser/content/browser.xul") {
        inject(win);
      }
    }, { once: true });
  }

  const listener = {
    onOpenWindow(aWin) {
      let win = aWin.docShell && aWin.docShell.domWindow;
      if (!win) { try { win = aWin.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow); } catch (e) {} }
      if (win) maybeInject(win);
    },
    onCloseWindow() {}, onWindowTitleChange() {},
  };
  Services.wm.addListener(listener);

  const en = Services.wm.getEnumerator("navigator:browser");
  while (en.hasMoreElements()) {
    const w = en.getNext();
    if (w.document && w.document.readyState === "complete") inject(w);
    else maybeInject(w);
  }
} catch (e) {
  try { Components.utils.reportError(e); } catch (_) {}
}
