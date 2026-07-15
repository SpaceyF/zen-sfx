# zen sfx 💥

a [zen browser](https://zen-browser.app/) mod that makes closing tabs **EXPLODE**
(gif + sound + screen shake), adds keyboard-clack sounds to the browser ui, and gives
you a lil toolbar button to toggle stuff, set volume, and swap in your own sounds/gif.

## ⚠️ read this first, it's a real tradeoff

this runs custom javascript in the browser chrome using zen's **autoconfig**. to do
that you flip OFF a browser sandbox pref, which lets privileged scripts run at every
launch. that's how *every* userChrome.js mod works, but it IS a genuine security
change, not cosmetic:

- **nothing on the web can see or reach it.** it's only a concern if malware is
  already running on your pc, and at that point it can already grab your browser data
  anyway. so it doesn't really open a new door.
- you're **trusting the scripts** in the loader folder. read them, they're short.
- **fully reversible:** delete the two loader files and restart. gone.

if you're not comfy with that, don't install it. no hard feelings.

## what you get

- close a tab, get an explosion gif + boom + screen shake right where the tab was
  (falls back to a built-in pixel particle burst if you don't add a gif)
- typing clicks in the address bar / search / find bar, a random one per key from a
  folder of sounds, so it feels like a real keyboard
- a **speaker button in the toolbar** that opens a panel to toggle everything, volume
  slider, open the sfx folder, reload
- everything's swappable with your own mp3s + gif, no rebuild

## install

**1. loader** (needs admin, one time). copy `loader/config.js` into your zen install
folder (`C:\Program Files\Zen Browser\`), then create
`C:\Program Files\Zen Browser\defaults\pref\config-prefs.js` containing:

```
pref("general.config.filename", "config.js");
pref("general.config.obscure_value", 0);
pref("general.config.sandbox_enabled", false);
```

**2. mod.** copy this repo's `chrome/` folder into your zen profile at
`%APPDATA%\zen\Profiles\<your-profile>\` (merge with an existing `chrome/` if you have
one). the loader loads `chrome/JS/exploding-tabs.uc.js` by that exact name.

**3.** fully quit zen, reopen, close a tab. 💥

## make it yours

drop files into `chrome/JS/sfx/`:

| what | file |
|---|---|
| explosion animation | `sfx/explosion.gif` |
| explosion sound | `sfx/explosion.mp3` (or `.wav` / `.ogg`) |
| tab-open sound | `sfx/tabopen.mp3` |
| typing sounds | any audio in `sfx/keys/` (random per key) |

then hit **Reload** in the panel (or restart zen). each folder has a README.txt with
the exact names + rules.

## typing sounds inside websites?

by default the typing sounds only fire in the browser's own boxes (url bar, search,
find). making them fire while typing INTO webpages means listening for keystrokes on
every site, so i left it out on purpose. if you add it, keep it **sound-only** and
never capture which key was pressed.

## uninstall

delete `config.js` and `defaults\pref\config-prefs.js` from your zen install folder,
restart zen. done.

## license

[MIT](LICENSE). the default click sounds + `boom.wav` are mine (synthesized), do
whatever with them. don't commit copyrighted game gifs/sounds if you fork this public.
