# Image prompts (Pronnova art style)

Use these to generate new illustrations that match the landing page (`public/hero/pronnova-swing-crew.png`, `public/hero/piko-portrait.png`) and the role cards (`components/brand/role-illustrations.tsx`). They work in Gemini, ChatGPT/DALL·E, Midjourney or Ideogram. For the closest match, attach `pronnova-swing-crew.png` as a style reference.

## 1. Style block (paste at the start of every prompt)

```
Cute kawaii 2D cartoon illustration for a children's English-learning app. Chubby, rounded characters with big heads, small bodies, happy closed "^ ^" eyes or small dot eyes, rosy round cheeks, wide friendly smiles. Thick, smooth warm dark-brown outlines (#3A2A22) of even width. Flat colours with very soft shading only, no gradients, no texture. Palette: coral #FF594B, soft coral #FF8A7A, orange #FF8A5C, peach #FFE8D6, sunny yellow #FFC93C, sky blue #DFF3FF and #8CCAF2, mint #E3F4DC, cream #F8F1D8, skin #FFD9B8, dark-brown hair #3B2A24. Puffy white clouds with a light-blue outline, small yellow four-point sparkles. Clean, simple, uncluttered composition, lots of breathing room. Characters are South Asian (Pakistani) children and teachers; modest school clothes or shalwar kameez.
```

## 2. Negative / avoid block (paste at the end)

```
Avoid: photorealism, 3D render, anime, sharp angular shapes, thin or sketchy lines, heavy shadows, gradients, busy backgrounds, text or letters (unless asked), logos, watermarks, scary or sad expressions, dark colour schemes.
```

## 3. Output settings

| Use | Size / ratio | Background |
| --- | --- | --- |
| Card pictures (role cards, chapter covers) | 1600 × 1000 (16:10) | Solid peach `#FFE8D6`, sky `#DFF3FF` or mint `#E3F4DC` |
| Avatars and buddy poses | 1024 × 1024 (1:1) | Transparent PNG |
| Empty states and banners | 1600 × 900 (16:9) | Transparent or peach |

Save into `public/` (e.g. `public/chapters/`, `public/avatar/`, `public/empty/`), keep files under ~300 KB (export WebP or compressed PNG), and use `next/image`.

## 4. Ready prompts (style block + one of these + avoid block)

**Student avatars (picker / profile), 1:1**
```
Head-and-shoulders portrait of a cheerful 6-year-old Pakistani girl with two dark hair puffs tied with coral bows, light-blue school shirt, waving. Centered, transparent background.
```
Variants: boy with short dark hair and a coral cap; girl with a white dupatta and braid; boy with round glasses holding a pencil.

**Teacher avatar, 1:1**
```
Head-and-shoulders portrait of a kind young Pakistani female teacher with a dark hair bun, round glasses and a coral cardigan over a cream top, smiling warmly. Transparent background.
```

**Piko the learning buddy, 1:1** (keep him consistent; attach `piko-portrait.png`)
```
Piko, a round coral baby-bird mascot with an orange beak, rosy cheeks and tiny wings, [pose: cheering with both wings up / holding a microphone / reading a book / giving a thumbs up / sleeping on a cloud]. Transparent background.
```

**Chapter covers, 16:10**
- Everyday Words: `A happy boy sitting on a floor cushion holding up picture cards of a cat, sun and apple, cosy room, peach background.`
- Tricky Sounds: `A girl next to an easel showing big letters "A B C" with small sound-wave marks, sky background.`
- Short Phrases: `A girl in shalwar kameez reading a picture book by a window with a plant, mint background.`
- Full Sentences: `A cute bunny teacher pointing at an easel with letters, little toy blocks on the floor, cream background.`

**Practice moments, 16:10**
- Listening: `A child wearing big coral headphones, eyes closed, smiling, small music-note sparkles around.`
- Speaking: `A child singing into a coral microphone with sound-wave arcs and floating letter bubbles "a" and "b".`
- Great job: `Two children jumping and cheering under falling yellow stars and confetti.`
- Try again: `A child giving a determined thumbs up, Piko cheering beside them.`

**Teacher screens, 16:9**
- Dashboard banner: `A teacher at a desk with a laptop showing simple bar charts, a stack of books and a mug, children's drawings on the wall.`
- Upload material: `A teacher dropping a paper sheet into a big friendly folder with an up arrow, sparkles.`
- Classes: `A teacher standing with five happy children of different heights, all waving.`

**Empty states and errors, 16:9, transparent**
- No lessons yet: `Piko sitting on an empty open book, looking curious, small question-mark cloud.`
- Not found (404): `Piko holding a map upside down, looking puzzled but smiling.`
- Offline / error: `Piko tangled in a microphone cable, laughing.`
- Loading: `Piko flying with a tiny paper airplane, motion lines.`

## 5. Consistency tips
- Generate one character first, then reuse it as the reference image for every other pose ("same character as the attached image").
- Keep the outline colour and thickness identical; if a tool drifts, add "outline weight 6 px at 1600 px width".
- Check every picture on the landing page next to `pronnova-swing-crew.png` before adding it.
