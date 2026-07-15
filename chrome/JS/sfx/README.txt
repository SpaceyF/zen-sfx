========================================
 sfx/  -  your changeable sounds and animation
========================================

Put files here with these EXACT names. After changing anything, click the toolbar
speaker button and press "Reload" (or restart Zen).

--------------------------------------------------
TAB EXPLOSION ANIMATION  (plays when you close a tab)
--------------------------------------------------
  explosion.gif
      The GIF that plays where the tab was. Must be named exactly "explosion.gif".
      If this file is missing, the mod falls back to a built-in pixel-particle burst.
      (Display size is 256px; it's cleared after ~0.9s. To change those, edit
       GIF size / timeout in ..\exploding-tabs.uc.js, function "explode".)

--------------------------------------------------
TAB EXPLOSION SOUND  (plays with the explosion)
--------------------------------------------------
  explosion.ogg   OR   explosion.mp3   OR   explosion.wav
      First one found is used, in that order (ogg > mp3 > wav).
      If none exist here, it falls back to ..\boom.wav.

--------------------------------------------------
TAB OPEN SOUND  (optional - off by default; enable it in the panel)
--------------------------------------------------
  tabopen.ogg   OR   tabopen.mp3   OR   tabopen.wav
      First one found is used (ogg > mp3 > wav).

--------------------------------------------------
TYPING SOUNDS
--------------------------------------------------
  Those live in the  keys/  subfolder. See keys/README.txt.

Accepted audio types: .mp3  .wav  .ogg  .m4a
Accepted image type:  .gif  (explosion only)
