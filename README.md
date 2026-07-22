[![forthebadge](https://forthebadge.com/badges/powered-by-black-magic.svg)](https://forthebadge.com) [![forthebadge]([/badges/made-with-javascript.svg](https://forthebadge.com/badges/made-with-javascript.svg))](https://forthebadge.com)
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

## install (windows)

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

## install (linux / kubuntu)

same deal, different paths. **first check how zen got installed:**

```bash
readlink -f "$(which zen)" 2>/dev/null || flatpak list | grep -i zen
```

- binary in `/opt/zen-browser`, `/usr/lib/zen`, `~/.local/share/zen` = you're good, keep going
- **flatpak = sorry, this won't work.** flatpak's app dir is read-only so you can't drop
  `config.js` next to the binary. reinstall zen from the official tarball if you want this.

**1. find your profile** (linux uses `~/.zen`, not `%APPDATA%`):

```bash
cat ~/.zen/profiles.ini
ls ~/.zen/
```

**2. drop the mod in** (merge if you already have a `chrome/` folder, don't nuke your themes):

```bash
PROFILE="$HOME/.zen/xxxxxxxx.Default (release)"   # <-- your actual one
cp -r chrome "$PROFILE/"
```

**3. loader into zen's app dir** (needs sudo):

```bash
ZEN_DIR=/opt/zen-browser        # <-- whatever step 0 printed

sudo cp loader/config.js "$ZEN_DIR/"
sudo mkdir -p "$ZEN_DIR/defaults/pref"
sudo tee "$ZEN_DIR/defaults/pref/config-prefs.js" > /dev/null <<'EOF'
pref("general.config.filename", "config.js");
pref("general.config.obscure_value", 0);
pref("general.config.sandbox_enabled", false);
EOF
```

**4.** fully quit zen (`pkill zen` if it hangs around), reopen, close a tab. 💥

**your own sounds/gif:** `cp explosion.gif explosion.mp3 "$PROFILE/chrome/JS/sfx/"` then hit
Reload in the panel.

**uninstall:** `sudo rm "$ZEN_DIR/config.js" "$ZEN_DIR/defaults/pref/config-prefs.js"` and restart.

heads up: zen updates on linux replace the whole app dir, so an update wipes `config.js`.
just redo step 3 when that happens.

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
