# Icon tools

Regenerate the logo + favicon set (e.g. to change colours). Shapes come from the original Pronnova icon pack; colours are set at the top of `build-icons.py` (`PRIMARY`, `ACCENT`, `*_ON_DARK`, `DARK_BG`).

Run from a scratch folder (not the repo root):

1. `python D:\FYP_1F\tools\build-icons.py` → writes `pronnova-icons/*.svg`, `site.webmanifest` and `jobs.json`.
2. `node D:\FYP_1F\tools\render-icons.mjs .` → renders all PNGs with Playwright's Chromium (`npx playwright install chromium` once).
3. Build `favicon.ico` from the 16/32/48 PNGs (Pillow):
   `python -c "from PIL import Image; i=[Image.open(f'pronnova-icons/png/favicon-{s}x{s}.png') for s in (16,32,48)]; i[2].save('pronnova-icons/favicon.ico', sizes=[(16,16),(32,32),(48,48)], append_images=i[:2])"`
4. Copy into `public/`: `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `maskable-icon-512x512.png`, `site.webmanifest`; `pronnova-header.svg` → `public/icons/pronnova-mark.svg` (and `-on-dark`).
5. Update `themeColor` in `app/layout.tsx` to match `PRIMARY`.

Current colours: coral `#FF594B` → orange `#FF8D28` (dark mode `#FF8A7F` → `#FFB25C`), matching the app theme in `app/globals.css`.
