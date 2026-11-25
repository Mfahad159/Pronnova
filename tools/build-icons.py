#!/usr/bin/env python3
"""Pronnova icon set generator. Change the palette below and re-run."""
import math, os, subprocess, shutil, json

# ---- Palette (swap in your brand hexes here) ----
PRIMARY = "#FF594B"      # coral (old brand)
ACCENT = "#FF8D28"       # orange (old accent)
PRIMARY_ON_DARK = "#FF8A7F"
ACCENT_ON_DARK = "#FFB25C"
LIGHT_BG = "#FFFFFF"
DARK_BG = "#171312"

OUT = "pronnova-icons"
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + "/png")


def teardrop(cx, cy, L, r, up=True):
    """Teardrop with tip at (cx,cy) and round end L away (up or down)."""
    s = -1 if up else 1
    d = L - r
    p = lambda x, y: f"{cx + x:.2f},{cy + s * y:.2f}"
    sweep = 0 if up else 1
    return (f"M{p(0,0)} C{p(0.30*r,0.30*d)} {p(r,0.50*d)} {p(r,d)} "
            f"A{r:.2f},{r:.2f} 0 0 {sweep} {p(-r,d)} "
            f"C{p(-r,0.50*d)} {p(-0.30*r,0.30*d)} {p(0,0)}Z")


def mark_paths(simple=False):
    if simple == "tiny":
        return tiny_paths()
    """Mark in a 100x100 box centred at 50,50.
    Columns sit on a sphere: x = R*sin(k*a), width ~ cos(k*a)."""
    R = 46.0
    paths = []
    if simple:
        # 5 bold columns for 16-48px: fewer, fatter shapes
        a = math.radians(29)
        ks = range(-2, 3)
        rmax = 9.6
    else:
        a = math.radians(17.5)
        ks = range(-4, 5)
        rmax = 7.0
    for k in ks:
        ang = k * a
        x = 50 + R * math.sin(ang)
        c = math.cos(ang)
        r = rmax * (c ** 1.15)
        L = math.sqrt(max(R**2 - (x - 50) ** 2, 0)) - 0.5
        if abs(k) == 4:  # outermost: plain lens, as in the original
            h, w = R * 0.30, rmax * 0.40
            paths.append(f"M{x:.2f},{50-h:.2f} C{x+w*1.35:.2f},{50-h*0.55:.2f} {x+w*1.35:.2f},{50+h*0.55:.2f} {x:.2f},{50+h:.2f} "
                         f"C{x-w*1.35:.2f},{50+h*0.55:.2f} {x-w*1.35:.2f},{50-h*0.55:.2f} {x:.2f},{50-h:.2f}Z")
            continue
        paths.append(teardrop(x, 50, L, r, True))
        paths.append(teardrop(x, 50, L, r, False))
    return " ".join(paths)


def tiny_paths():
    """3 fat columns for 16px only."""
    out = []
    for x, L, r in ((19, 33, 11), (50, 46, 14.5), (81, 33, 11)):
        out += [teardrop(x, 50, L, r, True), teardrop(x, 50, L, r, False)]
    return " ".join(out)


def svg(simple=False, c1=PRIMARY, c2=ACCENT, bg=None, radius=22, pad=0.0,
        scheme=False):
    d = mark_paths(simple)
    vb = 100 + 2 * pad
    o = -pad
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{o} {o} {vb} {vb}">']
    style = ""
    if scheme:
        style = (f"<style>.a{{stop-color:{c1}}}.b{{stop-color:{c2}}}"
                 f"@media (prefers-color-scheme:dark){{.a{{stop-color:{PRIMARY_ON_DARK}}}"
                 f".b{{stop-color:{ACCENT_ON_DARK}}}}}</style>")
        stops = '<stop offset="0" class="a"/><stop offset="1" class="b"/>'
    else:
        stops = f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/>'
    parts.append(f'{style}<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
                 f'{stops}</linearGradient></defs>')
    if bg:
        parts.append(f'<rect x="{o}" y="{o}" width="{vb}" height="{vb}" rx="{radius}" fill="{bg}"/>')
    parts.append(f'<path fill="url(#g)" d="{d}"/></svg>')
    return "".join(parts)


def write(name, content):
    with open(f"{OUT}/{name}", "w") as f:
        f.write(content + "\n")


JOBS = []
def render(svgname, png, size):
    JOBS.append({"svg": f"{OUT}/{svgname}", "png": f"{OUT}/png/{png}", "size": size})


# ---- SVGs ----
write("pronnova-mark.svg", svg(pad=2))                                   # master, transparent
write("pronnova-mark-16.svg", svg(simple="tiny", pad=1))
write("pronnova-mark-small.svg", svg(simple=True, pad=1))                # simplified for <=48px
write("favicon.svg", svg(simple=True, pad=1, scheme=True))               # auto light/dark
write("pronnova-header.svg", svg(pad=0))                                 # header, icon only
write("pronnova-header-on-dark.svg", svg(c1=PRIMARY_ON_DARK, c2=ACCENT_ON_DARK, pad=0))
write("pronnova-icon-light-bg.svg", svg(bg=LIGHT_BG, pad=18))
write("pronnova-icon-dark-bg.svg", svg(c1=PRIMARY_ON_DARK, c2=ACCENT_ON_DARK, bg=DARK_BG, pad=18))
# full-bleed square tiles (no rounding: iOS/Android apply their own masks)
write("_tile-light.svg", svg(bg=LIGHT_BG, radius=0, pad=22))
write("_maskable.svg", svg(bg=LIGHT_BG, radius=0, pad=38))

# ---- PNGs ----
render("pronnova-mark-16.svg", "favicon-16x16.png", 16)
for s in (32, 48):
    render("pronnova-mark-small.svg", f"favicon-{s}x{s}.png", s)
render("_tile-light.svg", "apple-touch-icon.png", 180)
render("_tile-light.svg", "android-chrome-192x192.png", 192)
render("_tile-light.svg", "android-chrome-512x512.png", 512)
render("_maskable.svg", "maskable-icon-512x512.png", 512)
for s in (192, 512, 1024):
    render("pronnova-mark.svg", f"pronnova-mark-{s}x{s}.png", s)
for s in (512, 1024):
    render("pronnova-icon-light-bg.svg", f"pronnova-icon-light-bg-{s}x{s}.png", s)
    render("pronnova-icon-dark-bg.svg", f"pronnova-icon-dark-bg-{s}x{s}.png", s)
for s in (32, 64, 128):  # header @1x/@2x/@4x for a 32px-tall slot
    render("pronnova-header.svg", f"pronnova-header-{s}.png", s)
    render("pronnova-header-on-dark.svg", f"pronnova-header-on-dark-{s}.png", s)

json.dump(JOBS, open("jobs.json","w"))

# ---- Manifest + snippet ----
manifest = {
    "name": "Pronnova", "short_name": "Pronnova",
    "icons": [
        {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "/maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
    "theme_color": PRIMARY, "background_color": LIGHT_BG, "display": "standalone",
}
write("site.webmanifest", json.dumps(manifest, indent=2))
write("head-snippet.html", f"""<!-- Pronnova icons: put these files in your site root (public/) -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="{PRIMARY}">

<!-- Header logo (icon only, transparent). Swap to the -on-dark file on dark headers. -->
<a href="/" class="logo" aria-label="Pronnova home">
  <img src="/pronnova-header.svg" width="32" height="32" alt="Pronnova">
</a>""")
print("done")
