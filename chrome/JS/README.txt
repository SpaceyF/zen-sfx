========================================
 Zen SFX  -  browser sound effects + exploding tabs
========================================

WHAT'S IN THIS FOLDER
  exploding-tabs.uc.js   The mod itself. (Don't rename it - the loader in the Zen
                         install folder loads this exact filename.)
  boom.wav               Last-resort explosion sound if no explosion sound is found
                         in sfx/. You can replace it, keep the name "boom.wav".
  zen-sfx-config.json    Your settings. Created/updated automatically by the toolbar
                         panel (Enabled, Typing, Explosion, Tab-open, Volume).
                         Delete it to reset to defaults.
  sfx/                   >>> This is where you put your own sounds and GIF. <<<
                         See sfx/README.txt.

APPLYING CHANGES
  After adding or swapping files, click the speaker button in the toolbar and press
  "Reload" (or fully restart Zen). New key sounds and swapped explosion/tab-open
  files are picked up then.

THE TOOLBAR BUTTON (speaker icon)
  Enabled ............ master on/off
  Typing sounds ...... clicks in the address bar / search / find bar
  Tab explosion ...... boom + animation when you close a tab
  Tab open sound ..... sound when you open a tab (off by default)
  Volume ............. 0-100
  Open SFX folder .... opens the sfx/ folder
  Reload ............. re-scan files + reload settings

ACCEPTED AUDIO TYPES everywhere: .mp3  .wav  .ogg  .m4a
ACCEPTED IMAGE TYPE for the explosion: .gif

TO TURN THE WHOLE THING OFF
  Use the panel's "Enabled" toggle, or delete both files from the Zen install folder
  (config.js and defaults/pref/config-prefs.js) and restart Zen.
