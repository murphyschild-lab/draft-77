---
name: local-dream
description: >
  Write prompts for Local Dream, the on-phone Stable Diffusion app.
  Use when the user wants a Local Dream prompt, Danbooru or A1111 tags,
  Illustrious, Anima, WAI, SD1.5, SDXL, CyberRealistic, Absolute Reality,
  or DMD2 sampler settings. Follow the token budget, tag order, weight
  syntax, and sampler table below. Do not write a prose image prompt.
---

# Local Dream prompts

Local Dream reads short comma-separated tags, not a paragraph. The text
encoder stops at 77 CLIP tokens, counting the start and end markers, so
the words you write must stay at or under 75. Anything past that is greyed
out in the app and does not affect the picture.

You are writing the slip. You are not generating the image.

## What to return

Return only this card unless the user asked for an explanation:

```
Prompt:
<tags>

Negative:
<tags or (none)>

Model lane: <lane>
Scheduler: <name>
Steps: <n>
CFG: <n.n>
Aspect: <ratio>
Size: <pixels or patch note>
Seed: random
DMD2: <on or off>
```

If they already wrote a prompt, repair it into this card. Keep their subject.
Do not swap in a different person, place, or action.

## Pick the lane

| They named | Lane | Tag style |
|---|---|---|
| Illustrious, Anima, WAI, or "anime SDXL" | Illustrious — SDXL anime | Danbooru tags |
| SD1.5 anime, Anything-style, NPU anime | SD1.5 anime | Danbooru tags |
| CyberRealistic, realistic SDXL, photo SDXL | SDXL photo | Plain words, then a few tags |
| Absolute Reality, realistic SD1.5 | SD1.5 photo | Plain words, then a few tags |
| Unspecified anime | Illustrious | Danbooru tags |
| Unspecified photo or realistic | SDXL photo | Plain words, then a few tags |

Turn DMD2 on only when they say the filename contains `_dmd2` or they ask for the fast model.

## Tag order

Anime lanes, left to right:

1. Quality. Two only: `masterpiece, best quality`. Do not add `newest`, `absurdres`, `highres`, or `very aesthetic` unless they asked.
2. Subject. One: `1girl`, `1boy`, `solo`, `2girls`, `1boy and 1girl`, `no humans`, or a thing (`lighthouse`, `cat`, `guitar`).
3. Their own line, unchanged, if they gave one.
4. At most two features (hair, eyes, glasses, freckles, scar).
5. One expression.
6. One outfit.
7. One pose. A verb, not a paragraph.
8. One place.
9. One light.
10. One camera framing.
11. One medium, last.

Photo lanes: their sentence goes first (`a lighthouse on a cliff`), then one or two of `photorealistic`, `sharp focus`, `raw photo`, `film grain`, `natural colors`, then the same scene tags. Do not open a photo prompt with `masterpiece, best quality`.

Skip expression, clothes, and pose when the subject is not a person.

## Weights

Local Dream uses Automatic1111 weights.

- Plain word when the weight is 1.0. No parentheses.
- Emphasis looks like `(red ribbon:1.1)`.
- Stay between 0.6 and 1.6, in steps of 0.1.
- Weight one or two words, not the whole prompt. Parentheses, colons, and the number each cost tokens.
- A literal parenthesis in a name is escaped: `kafuu chino \(gochiusa\)`.

## Token budget

Count before you answer. If the estimate is over 75, cut from the end: medium, then camera, then extra quality words. Never cut the subject to save a style tag.

Estimate, per prompt and per negative separately:

- Split on spaces after turning parentheses, colons, commas, underscores, periods, and semicolons into spaces.
- A piece of 10 characters or fewer is 1. Up to 16 is 2. Longer pieces are `ceil(length / 7)`.
- Add 1 for every comma, colon, or parenthesis in the original text.
- The budget is 75. Local Dream's own counter is the exact one. Say the estimate only if they ask, or if you had to cut.

## Negatives

Short. A long negative fights the prompt. Pick one:

- Lean: `low quality, blurry, bad anatomy, extra fingers`
- Anime lanes: `low quality, worst quality, bad anatomy, bad hands, extra fingers, extra limbs, watermark, text, jpeg artifacts`
- Photo lanes: `blurry, deformed, extra fingers, plastic skin, watermark, text, oversaturated, cartoon`
- None, if they said they do not want one.

Add `EasyNegative` at the front only when they say that embedding is imported. The trigger is the filename without the extension. Do not invent other embedding names.

## Sampler, steps, CFG

| Lane | DMD2 | Scheduler | Steps | CFG |
|---|---|---|---|---|
| Illustrious | off | Euler | 20 | 5.5 |
| Illustrious | on | Euler | 8 | 1.0 |
| SD1.5 anime | off | DPM++ 2M | 24 | 7.0 |
| SD1.5 anime | on | LCM | 8 | 1.0 |
| SDXL photo | off | DPM++ 2M | 24 | 5.0 |
| SDXL photo | on | LCM | 8 | 1.0 |
| SD1.5 photo | off | DPM++ 2M | 25 | 6.5 |
| SD1.5 photo | on | LCM | 8 | 1.0 |

Illustrious smears on LCM. Even the DMD2 build of that family stays on Euler with CFG 1 and about 8 steps. Other DMD2 files use LCM, CFG 1, 8 steps.

Other schedulers exist (DPM++ 2M SDE, Euler A) but do not switch unless they asked.

## Size

SDXL (Illustrious and SDXL photo) runs at 1024 inside the phone and can take any ratio without a longer wait. Aim for:

- 1:1 → 1024×1024
- 3:4 → 768×1024
- 2:3 → 832×1216
- 4:3 → 1024×768
- 16:9 → 1216×832
- 9:16 → 768×1344

SD1.5 base is 512×512. Portrait needs a 512×768 patch. Landscape needs a 768×512 patch. If they did not mention a patch, tell them 512×512.

Seed stays `random` unless they gave a number.

## Do not

- Do not write a paragraph for an anime lane.
- Do not stack quality spam.
- Do not put the medium before the subject.
- Do not recommend LCM for Illustrious.
- Do not recommend 1024 on an SD1.5 model with no high-res patch.
- Do not make the negative longer than the prompt.
- Do not add tags they did not ask for beyond the one-of-each scene skeleton above.
