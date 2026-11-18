(() => {
  // ../tmp/draft77/src/catalog.ts
  var ANIME = ["illustrious", "sd15a"];
  var PHOTO = ["sdxlp", "sd15p"];
  var ALL = ["illustrious", "sd15a", "sdxlp", "sd15p"];
  var LANE_INFO = [
    { id: "illustrious", name: "Illustrious", family: "SDXL anime", eg: "Anima, WAI" },
    { id: "sd15a", name: "SD1.5 anime", family: "512 base", eg: "NPU or CPU" },
    { id: "sdxlp", name: "SDXL photo", family: "Realistic", eg: "CyberRealistic" },
    { id: "sd15p", name: "SD1.5 photo", family: "512 base", eg: "Absolute Reality" }
  ];
  var GROUPS = [
    { id: "quality", title: "Quality" },
    { id: "subject", title: "Subject" },
    { id: "feature", title: "Features" },
    { id: "expression", title: "Expression" },
    { id: "wardrobe", title: "Clothes" },
    { id: "pose", title: "Pose" },
    { id: "place", title: "Place" },
    { id: "light", title: "Light" },
    { id: "camera", title: "Camera" },
    { id: "style", title: "Medium" }
  ];
  function familyOf(lane) {
    return lane === "sdxlp" || lane === "sd15p" ? "photo" : "anime";
  }
  function many(group, labels, lanes) {
    return labels.map((label) => ({
      id: `${group}:${label}`,
      label,
      group,
      lanes
    }));
  }
  var SCENERY = [
    "lighthouse",
    "motorcycle",
    "bowl of fruit",
    "guitar",
    "cat",
    "dog",
    "bird",
    "empty street"
  ];
  var NON_PERSON = /* @__PURE__ */ new Set([
    "subject:no humans",
    "subject:no people",
    ...SCENERY.map((label) => `subject:${label}`)
  ]);
  var STARTER_IDS = {
    illustrious: ["quality:masterpiece", "quality:best quality"],
    sd15a: ["quality:masterpiece", "quality:best quality"],
    sdxlp: ["quality:photorealistic", "quality:sharp focus"],
    sd15p: ["quality:photorealistic", "quality:sharp focus"]
  };
  var TAGS = [
    ...many(
      "quality",
      ["masterpiece", "best quality", "newest", "absurdres", "highres", "very aesthetic"],
      ANIME
    ),
    ...many(
      "quality",
      ["photorealistic", "sharp focus", "raw photo", "film grain", "natural colors"],
      PHOTO
    ),
    ...many("subject", ["1girl", "1boy", "solo", "2girls", "1boy and 1girl"], ANIME),
    ...many(
      "subject",
      ["a woman", "a man", "an older woman", "an older man", "a couple"],
      PHOTO
    ),
    ...many("subject", ["no humans"], ANIME),
    ...many("subject", ["no people"], PHOTO),
    ...many("subject", SCENERY, ALL),
    ...many(
      "feature",
      [
        "black hair",
        "brown hair",
        "blonde hair",
        "silver hair",
        "red hair",
        "short hair",
        "long hair",
        "ponytail",
        "braid",
        "messy hair",
        "curly hair",
        "buzz cut",
        "bald",
        "beard",
        "mustache",
        "glasses",
        "freckles",
        "scar",
        "blue eyes",
        "green eyes",
        "brown eyes",
        "amber eyes"
      ],
      ALL
    ),
    ...many(
      "feature",
      ["blue hair", "pink hair", "white hair", "twintails", "bob cut", "hair bun", "red eyes", "cat ears"],
      ANIME
    ),
    ...many("feature", ["natural skin texture", "weathered skin", "stubble"], PHOTO),
    ...many(
      "expression",
      ["smile", "gentle smile", "serious", "looking at viewer", "looking away", "eyes closed", "blush", "calm"],
      ALL
    ),
    ...many(
      "wardrobe",
      [
        "white shirt",
        "knit sweater",
        "hoodie",
        "leather jacket",
        "wool coat",
        "sundress",
        "jeans",
        "scarf",
        "wide-brim hat",
        "kimono",
        "armor",
        "cloak",
        "suit",
        "turtleneck",
        "apron",
        "raincoat",
        "school uniform",
        "yukata",
        "cape",
        "boots"
      ],
      ALL
    ),
    ...many(
      "pose",
      [
        "standing",
        "sitting",
        "walking",
        "running",
        "leaning",
        "arms crossed",
        "hands in pockets",
        "looking back",
        "from behind",
        "from side",
        "reading",
        "holding a cup",
        "playing guitar",
        "mid stride"
      ],
      ALL
    ),
    ...many(
      "place",
      [
        "garden",
        "flower field",
        "forest",
        "mountains",
        "beach",
        "city street",
        "rainy street",
        "rooftop",
        "cafe",
        "library",
        "train interior",
        "kitchen",
        "workshop",
        "shrine",
        "alley",
        "night sky",
        "meadow",
        "snow",
        "classroom",
        "balcony",
        "foggy harbor",
        "desert"
      ],
      ALL
    ),
    ...many(
      "light",
      [
        "sunset",
        "golden hour",
        "moonlight",
        "neon",
        "soft light",
        "rim light",
        "backlight",
        "overcast",
        "candlelight",
        "window light",
        "studio light",
        "morning light",
        "night",
        "fog"
      ],
      ALL
    ),
    ...many(
      "camera",
      ["close-up", "portrait", "upper body", "full body", "wide shot", "from above", "from below", "depth of field"],
      ALL
    ),
    ...many("camera", ["cowboy shot", "dutch angle"], ANIME),
    ...many(
      "camera",
      ["close portrait", "medium shot", "full length", "eye level", "low angle", "high angle", "shallow depth of field", "bokeh"],
      PHOTO
    ),
    ...many(
      "style",
      ["anime style", "cel shading", "illustration", "retro anime", "watercolor", "ink", "sketch", "flat color", "painterly"],
      ANIME
    ),
    ...many(
      "style",
      ["35mm film", "cinematic", "documentary photo", "fashion editorial", "oil painting", "charcoal drawing", "street photography", "studio portrait"],
      PHOTO
    )
  ];
  var seen = /* @__PURE__ */ new Set();
  for (const tag of TAGS) {
    if (seen.has(tag.id)) throw new Error(`Duplicate tag id: ${tag.id}`);
    seen.add(tag.id);
  }
  var TAG_BY_ID = new Map(TAGS.map((tag) => [tag.id, tag]));

  // ../tmp/draft77/src/engine.ts
  var SCHEDULERS = ["DPM++ 2M", "DPM++ 2M SDE", "Euler", "Euler A", "LCM"];
  var ASPECTS = ["1:1", "3:4", "2:3", "4:3", "16:9", "9:16"];
  var NEGATIVE_PRESETS = ["lean", "anime", "photo", "none"];
  var TOKEN_BUDGET = 75;
  var NEGATIVE_TEXT = {
    none: "",
    lean: "low quality, blurry, bad anatomy, extra fingers",
    anime: "low quality, worst quality, bad anatomy, bad hands, extra fingers, extra limbs, watermark, text, jpeg artifacts",
    photo: "blurry, deformed, extra fingers, plastic skin, watermark, text, oversaturated, cartoon"
  };
  function recommended(lane, dmd2) {
    if (dmd2 && lane === "illustrious") {
      return {
        scheduler: "Euler",
        steps: 8,
        cfg: 1,
        note: "Illustrious DMD2 likes Euler, not LCM. Keep CFG at 1 and steps around 8."
      };
    }
    if (dmd2) {
      return {
        scheduler: "LCM",
        steps: 8,
        cfg: 1,
        note: "DMD2 checkpoints want LCM, CFG 1, about 8 steps. Cooler, and roughly four times faster."
      };
    }
    if (lane === "illustrious") {
      return {
        scheduler: "Euler",
        steps: 20,
        cfg: 5.5,
        note: "Illustrious and Anima prefer Euler. CFG around 4\u20136. LCM tends to smear this family."
      };
    }
    if (lane === "sd15a") {
      return {
        scheduler: "DPM++ 2M",
        steps: 24,
        cfg: 7,
        note: "SD1.5 anime: 20\u201330 steps, CFG near 7. 512 square unless the model has a high-res patch."
      };
    }
    if (lane === "sdxlp") {
      return {
        scheduler: "DPM++ 2M",
        steps: 24,
        cfg: 5,
        note: "CyberRealistic and other SDXL photo models. CFG 5\u20137. Use the DMD2 switch if the filename has _dmd2."
      };
    }
    return {
      scheduler: "DPM++ 2M",
      steps: 25,
      cfg: 6.5,
      note: "Absolute Reality and similar SD1.5 photo models. CFG near 6\u20137, 512 square."
    };
  }
  var initial = recommended("illustrious", false);
  var DEFAULT_WORK = {
    lane: "illustrious",
    dmd2: false,
    selected: [],
    weights: {},
    custom: "",
    negativeExtra: "",
    negativePreset: "anime",
    easyNegative: false,
    aspect: "1:1",
    seed: "",
    scheduler: initial.scheduler,
    steps: initial.steps,
    cfg: initial.cfg
  };
  function clampWeight(n) {
    if (!Number.isFinite(n)) return 1;
    const rounded = Math.round(n * 10) / 10;
    return Math.min(1.6, Math.max(0.6, rounded));
  }
  function clampSteps(n) {
    if (!Number.isFinite(n)) return 20;
    return Math.min(40, Math.max(1, Math.round(n)));
  }
  function clampCfg(n) {
    if (!Number.isFinite(n)) return 5.5;
    const rounded = Math.round(n * 2) / 2;
    return Math.min(12, Math.max(1, rounded));
  }
  function cleanPhrase(value) {
    return value.replace(/\s*\n+\s*/g, ", ").replace(/\s+/g, " ").replace(/^(,\s*)+|(\s*,)+$/g, "").trim();
  }
  function formatWeighted(label, weight) {
    const w = clampWeight(weight);
    if (Math.abs(w - 1) < 0.05) return label;
    return `(${label}:${w.toFixed(1)})`;
  }
  function tagsInOrder(work2) {
    const wanted = new Set(work2.selected);
    return TAGS.filter(
      (tag) => wanted.has(tag.id) && tag.lanes.includes(work2.lane)
    );
  }
  function buildPrompt(work2) {
    const photo = familyOf(work2.lane) === "photo";
    const grouped = /* @__PURE__ */ new Map();
    for (const tag of tagsInOrder(work2)) {
      const line = formatWeighted(tag.label, work2.weights[tag.id] ?? 1);
      const list = grouped.get(tag.group) ?? [];
      list.push(line);
      grouped.set(tag.group, list);
    }
    const custom = cleanPhrase(work2.custom);
    const parts = [];
    if (photo && custom) parts.push(custom);
    for (const group of GROUPS) {
      const list = grouped.get(group.id);
      if (list?.length) parts.push(...list);
      if (!photo && group.id === "subject" && custom) parts.push(custom);
    }
    return parts.join(", ");
  }
  function buildNegative(work2) {
    const parts = [];
    if (work2.easyNegative) parts.push("EasyNegative");
    const base = NEGATIVE_TEXT[work2.negativePreset];
    if (base) parts.push(base);
    const extra = cleanPhrase(work2.negativeExtra);
    if (extra) parts.push(extra);
    return parts.join(", ");
  }
  function estimateContentTokens(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const words = trimmed.replace(/[()]/g, " ").replace(/[:_,.;]/g, " ").split(/\s+/).filter(Boolean);
    let count = 0;
    for (const word of words) {
      if (word.length <= 10) count += 1;
      else if (word.length <= 16) count += 2;
      else count += Math.ceil(word.length / 7);
    }
    const punct = (trimmed.match(/[,:()]/g) ?? []).length;
    return count + punct;
  }
  function tokenBudget() {
    return TOKEN_BUDGET;
  }
  function sizeLabel(lane, aspect) {
    const sdxl = lane === "illustrious" || lane === "sdxlp";
    if (sdxl) {
      const map = {
        "1:1": "1024\xD71024",
        "3:4": "768\xD71024",
        "2:3": "832\xD71216",
        "4:3": "1024\xD7768",
        "16:9": "1216\xD7832",
        "9:16": "768\xD71344"
      };
      return map[aspect];
    }
    if (aspect === "1:1") return "512\xD7512";
    if (aspect === "4:3" || aspect === "16:9") return "768\xD7512 patch";
    return "512\xD7768 patch";
  }
  function buildCard(work2) {
    const prompt = buildPrompt(work2);
    const negative = buildNegative(work2);
    const lane = laneName(work2.lane);
    return [
      prompt || "(empty prompt)",
      "",
      "Negative:",
      negative || "(none)",
      "",
      `Model lane: ${lane}`,
      `Scheduler: ${work2.scheduler}`,
      `Steps: ${work2.steps}`,
      `CFG: ${Number.isInteger(work2.cfg) ? work2.cfg.toFixed(1) : work2.cfg}`,
      `Aspect: ${work2.aspect} (${sizeLabel(work2.lane, work2.aspect)})`,
      `Seed: ${work2.seed.trim() || "random"}`,
      `DMD2: ${work2.dmd2 ? "on" : "off"}`
    ].join("\n");
  }
  function laneName(lane) {
    if (lane === "illustrious") return "Illustrious \u2014 SDXL anime";
    if (lane === "sd15a") return "SD1.5 anime";
    if (lane === "sdxlp") return "SDXL photo";
    return "SD1.5 photo";
  }
  function pick(pool2, n) {
    const copy = [...pool2];
    const out = [];
    for (let i = 0; i < n && copy.length > 0; i += 1) {
      const index = Math.floor(Math.random() * copy.length);
      const [tag] = copy.splice(index, 1);
      if (tag) out.push(tag);
    }
    return out;
  }
  function pool(group, lane) {
    return TAGS.filter((tag) => tag.group === group && tag.lanes.includes(lane));
  }
  function shuffleWork(work2) {
    const subject = pick(pool("subject", work2.lane), 1);
    const person = subject[0] ? !NON_PERSON.has(subject[0].id) : false;
    const chosen = [
      ...pick(pool("quality", work2.lane), familyOf(work2.lane) === "anime" ? 2 : 1),
      ...subject,
      ...person ? pick(pool("feature", work2.lane), 2) : [],
      ...person ? pick(pool("expression", work2.lane), 1) : [],
      ...person ? pick(pool("wardrobe", work2.lane), 1) : [],
      ...person ? pick(pool("pose", work2.lane), 1) : [],
      ...pick(pool("place", work2.lane), 1),
      ...pick(pool("light", work2.lane), 1),
      ...pick(pool("camera", work2.lane), 1),
      ...pick(pool("style", work2.lane), 1)
    ];
    return { ...work2, selected: chosen.map((tag) => tag.id), weights: {} };
  }
  function withStarter(work2) {
    const selected = [...work2.selected];
    for (const id of STARTER_IDS[work2.lane]) {
      if (TAG_BY_ID.get(id)?.lanes.includes(work2.lane) && !selected.includes(id)) {
        selected.push(id);
      }
    }
    return { ...work2, selected };
  }
  function applyLane(work2, lane) {
    const rec = recommended(lane, work2.dmd2);
    const familyChanged = familyOf(work2.lane) !== familyOf(lane);
    return {
      ...work2,
      lane,
      selected: work2.selected.filter((id) => TAG_BY_ID.get(id)?.lanes.includes(lane)),
      negativePreset: familyChanged ? familyOf(lane) : work2.negativePreset,
      scheduler: rec.scheduler,
      steps: rec.steps,
      cfg: rec.cfg
    };
  }
  function applyDmd2(work2, dmd2) {
    const rec = recommended(work2.lane, dmd2);
    return {
      ...work2,
      dmd2,
      scheduler: rec.scheduler,
      steps: rec.steps,
      cfg: rec.cfg
    };
  }
  function isLane(value) {
    return value === "illustrious" || value === "sd15a" || value === "sdxlp" || value === "sd15p";
  }
  function sanitize(input) {
    if (!input || typeof input !== "object") return DEFAULT_WORK;
    const raw = input;
    const lane = isLane(raw.lane) ? raw.lane : DEFAULT_WORK.lane;
    const dmd2 = raw.dmd2 === true;
    const selected = Array.isArray(raw.selected) ? raw.selected.filter(
      (id) => typeof id === "string" && !!TAG_BY_ID.get(id)?.lanes.includes(lane)
    ) : [];
    const weights = {};
    if (raw.weights && typeof raw.weights === "object") {
      for (const [key, value] of Object.entries(raw.weights)) {
        if (typeof value === "number" && selected.includes(key)) {
          const next = clampWeight(value);
          if (Math.abs(next - 1) >= 0.05) weights[key] = next;
        }
      }
    }
    const fallback = recommended(lane, dmd2);
    const scheduler = SCHEDULERS.includes(raw.scheduler) ? raw.scheduler : fallback.scheduler;
    const negativePreset = NEGATIVE_PRESETS.includes(raw.negativePreset) ? raw.negativePreset : familyOf(lane);
    const aspect = ASPECTS.includes(raw.aspect) ? raw.aspect : "1:1";
    return {
      lane,
      dmd2,
      selected,
      weights,
      custom: typeof raw.custom === "string" ? raw.custom.slice(0, 800) : "",
      negativeExtra: typeof raw.negativeExtra === "string" ? raw.negativeExtra.slice(0, 400) : "",
      negativePreset,
      easyNegative: raw.easyNegative === true,
      aspect,
      seed: typeof raw.seed === "string" ? raw.seed.replace(/\D/g, "").slice(0, 12) : "",
      scheduler,
      steps: clampSteps(typeof raw.steps === "number" ? raw.steps : fallback.steps),
      cfg: clampCfg(typeof raw.cfg === "number" ? raw.cfg : fallback.cfg)
    };
  }
  function sanitizeSaved(input) {
    if (!Array.isArray(input)) return [];
    const out = [];
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      const raw = item;
      if (typeof raw.id !== "string" || typeof raw.name !== "string") continue;
      out.push({
        id: raw.id.slice(0, 80),
        name: raw.name.slice(0, 60) || "Slip",
        created: typeof raw.created === "number" ? raw.created : Date.now(),
        work: sanitize(raw.work)
      });
    }
    return out.slice(0, 30);
  }
  function suggestName(work2) {
    const custom = cleanPhrase(work2.custom);
    if (custom) return custom.slice(0, 42);
    const labels = tagsInOrder(work2).slice(0, 3).map((tag) => tag.label);
    return labels.join(", ") || "Slip";
  }
  function settingsMatch(work2) {
    const rec = recommended(work2.lane, work2.dmd2);
    return work2.scheduler === rec.scheduler && work2.steps === rec.steps && work2.cfg === rec.cfg;
  }

  // ../tmp/draft77/src/skill.ts
  var LOCAL_DREAM_SKILL = `---
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

\`\`\`
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
\`\`\`

If they already wrote a prompt, repair it into this card. Keep their subject.
Do not swap in a different person, place, or action.

## Pick the lane

| They named | Lane | Tag style |
|---|---|---|
| Illustrious, Anima, WAI, or "anime SDXL" | Illustrious \u2014 SDXL anime | Danbooru tags |
| SD1.5 anime, Anything-style, NPU anime | SD1.5 anime | Danbooru tags |
| CyberRealistic, realistic SDXL, photo SDXL | SDXL photo | Plain words, then a few tags |
| Absolute Reality, realistic SD1.5 | SD1.5 photo | Plain words, then a few tags |
| Unspecified anime | Illustrious | Danbooru tags |
| Unspecified photo or realistic | SDXL photo | Plain words, then a few tags |

Turn DMD2 on only when they say the filename contains \`_dmd2\` or they ask for the fast model.

## Tag order

Anime lanes, left to right:

1. Quality. Two only: \`masterpiece, best quality\`. Do not add \`newest\`, \`absurdres\`, \`highres\`, or \`very aesthetic\` unless they asked.
2. Subject. One: \`1girl\`, \`1boy\`, \`solo\`, \`2girls\`, \`1boy and 1girl\`, \`no humans\`, or a thing (\`lighthouse\`, \`cat\`, \`guitar\`).
3. Their own line, unchanged, if they gave one.
4. At most two features (hair, eyes, glasses, freckles, scar).
5. One expression.
6. One outfit.
7. One pose. A verb, not a paragraph.
8. One place.
9. One light.
10. One camera framing.
11. One medium, last.

Photo lanes: their sentence goes first (\`a lighthouse on a cliff\`), then one or two of \`photorealistic\`, \`sharp focus\`, \`raw photo\`, \`film grain\`, \`natural colors\`, then the same scene tags. Do not open a photo prompt with \`masterpiece, best quality\`.

Skip expression, clothes, and pose when the subject is not a person.

## Weights

Local Dream uses Automatic1111 weights.

- Plain word when the weight is 1.0. No parentheses.
- Emphasis looks like \`(red ribbon:1.1)\`.
- Stay between 0.6 and 1.6, in steps of 0.1.
- Weight one or two words, not the whole prompt. Parentheses, colons, and the number each cost tokens.
- A literal parenthesis in a name is escaped: \`kafuu chino \\(gochiusa\\)\`.

## Token budget

Count before you answer. If the estimate is over 75, cut from the end: medium, then camera, then extra quality words. Never cut the subject to save a style tag.

Estimate, per prompt and per negative separately:

- Split on spaces after turning parentheses, colons, commas, underscores, periods, and semicolons into spaces.
- A piece of 10 characters or fewer is 1. Up to 16 is 2. Longer pieces are \`ceil(length / 7)\`.
- Add 1 for every comma, colon, or parenthesis in the original text.
- The budget is 75. Local Dream's own counter is the exact one. Say the estimate only if they ask, or if you had to cut.

## Negatives

Short. A long negative fights the prompt. Pick one:

- Lean: \`low quality, blurry, bad anatomy, extra fingers\`
- Anime lanes: \`low quality, worst quality, bad anatomy, bad hands, extra fingers, extra limbs, watermark, text, jpeg artifacts\`
- Photo lanes: \`blurry, deformed, extra fingers, plastic skin, watermark, text, oversaturated, cartoon\`
- None, if they said they do not want one.

Add \`EasyNegative\` at the front only when they say that embedding is imported. The trigger is the filename without the extension. Do not invent other embedding names.

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

- 1:1 \u2192 1024\xD71024
- 3:4 \u2192 768\xD71024
- 2:3 \u2192 832\xD71216
- 4:3 \u2192 1024\xD7768
- 16:9 \u2192 1216\xD7832
- 9:16 \u2192 768\xD71344

SD1.5 base is 512\xD7512. Portrait needs a 512\xD7768 patch. Landscape needs a 768\xD7512 patch. If they did not mention a patch, tell them 512\xD7512.

Seed stays \`random\` unless they gave a number.

## Do not

- Do not write a paragraph for an anime lane.
- Do not stack quality spam.
- Do not put the medium before the subject.
- Do not recommend LCM for Illustrious.
- Do not recommend 1024 on an SD1.5 model with no high-res patch.
- Do not make the negative longer than the prompt.
- Do not add tags they did not ask for beyond the one-of-each scene skeleton above.
`;

  // ../tmp/draft77/src/main.ts
  var WORK_KEY = "draft77.work.v1";
  var SAVED_KEY = "draft77.slips.v1";
  var HINT = {
    quality: "Two is enough. Extra quality words eat the budget.",
    subject: "One subject. Name who, or the thing.",
    feature: "A couple of traits. Not a census.",
    expression: "One face.",
    wardrobe: "Name the clothes.",
    pose: "One verb.",
    place: "Where they are.",
    light: "One light.",
    camera: "Framing.",
    style: "Medium last."
  };
  function loadWork() {
    try {
      return sanitize(JSON.parse(localStorage.getItem(WORK_KEY) || "null"));
    } catch {
      return DEFAULT_WORK;
    }
  }
  function loadSaved() {
    try {
      return sanitizeSaved(JSON.parse(localStorage.getItem(SAVED_KEY) || "null"));
    } catch {
      return [];
    }
  }
  var work = loadWork();
  var saved = loadSaved();
  var copied = null;
  var armed = null;
  var copyTimer = 0;
  function persist() {
    localStorage.setItem(WORK_KEY, JSON.stringify(work));
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }
  function esc(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }
  function summary(title, hint = "") {
    const tail = hint ? ` <span>${hint}</span>` : "";
    return `<summary>${title}${tail}</summary>`;
  }
  async function writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  }
  function markCopied(kind) {
    copied = kind;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copied = null;
      draw();
    }, 1400);
    draw();
  }
  function setWork(next) {
    work = next;
    armed = null;
    persist();
    draw();
  }
  function nudge(id, delta) {
    const current = work.weights[id] ?? 1;
    const next = clampWeight(current + delta);
    const weights = { ...work.weights };
    if (Math.abs(next - 1) < 0.05) delete weights[id];
    else weights[id] = next;
    setWork({ ...work, weights });
  }
  function toggleTag(id) {
    const selected = work.selected.includes(id) ? work.selected.filter((item) => item !== id) : [...work.selected, id];
    const weights = { ...work.weights };
    if (!selected.includes(id)) delete weights[id];
    setWork({ ...work, selected, weights });
  }
  function saveSlip() {
    const slip = {
      id: crypto.randomUUID(),
      name: suggestName(work),
      created: Date.now(),
      work
    };
    saved = [slip, ...saved].slice(0, 30);
    persist();
    draw();
  }
  var PRESET_LABEL = {
    lean: "Lean",
    anime: "Anime",
    photo: "Photo",
    none: "None"
  };
  function chips(group, lane) {
    const tags = TAGS.filter((tag) => tag.group === group && tag.lanes.includes(lane));
    if (!tags.length) return "";
    return `
    <section class="group">
      <h3>${esc(GROUPS.find((item) => item.id === group)?.title ?? group)}</h3>
      <p class="hint">${esc(HINT[group])}</p>
      <div class="chips">
        ${tags.map((tag) => {
      const on = work.selected.includes(tag.id);
      return `<button type="button" class="chip" aria-pressed="${on}" data-act="tag" data-id="${esc(tag.id)}">${esc(tag.label)}</button>`;
    }).join("")}
      </div>
    </section>`;
  }
  function draw() {
    const root = document.querySelector("#app");
    if (!root) return;
    const open = new Set(
      [...root.querySelectorAll("details[data-fold]")].filter((item) => item.open).map((item) => item.dataset.fold ?? "")
    );
    const prompt = buildPrompt(work);
    const negative = buildNegative(work);
    const tokens = estimateContentTokens(prompt);
    const budget = tokenBudget();
    const over = tokens > budget;
    const rec = recommended(work.lane, work.dmd2);
    const ordered = tagsInOrder(work);
    const family = familyOf(work.lane);
    root.innerHTML = `
    <header class="top">
      <p class="kicker">Local Dream</p>
      <h1>Draft 77</h1>
      <p class="lede">A prompt desk for the on-phone model. Short tags, a 75-token budget, copy, then paste.</p>
    </header>
    <div class="layout">
      <section class="builder">
        <div class="lanes">
          ${LANE_INFO.map(
      (lane) => `
            <button type="button" class="lane ${work.lane === lane.id ? "on" : ""}" data-act="lane" data-id="${lane.id}">
              <strong>${esc(lane.name)}</strong>
              <span>${esc(lane.family)} \xB7 ${esc(lane.eg)}</span>
            </button>`
    ).join("")}
        </div>
        <label class="switch">
          <input type="checkbox" data-act="dmd2" ${work.dmd2 ? "checked" : ""} />
          <span><strong>DMD2</strong> Fast file. Turn this on when the filename contains _dmd2.</span>
        </label>
        ${GROUPS.map((group) => chips(group.id, work.lane)).join("")}
        <label class="field">
          <span>Your line</span>
          <textarea data-act="custom" rows="3" maxlength="800" placeholder="${family === "photo" ? "A sentence about the subject. It goes first." : "Anything the tags do not cover. It sits after the subject."}">${esc(work.custom)}</textarea>
        </label>
        <div class="row">
          <label class="field grow">
            <span>Aspect</span>
            <select data-act="aspect">
              ${ASPECTS.map((aspect) => `<option value="${aspect}" ${work.aspect === aspect ? "selected" : ""}>${aspect} \xB7 ${esc(sizeLabel(work.lane, aspect))}</option>`).join("")}
            </select>
          </label>
          <label class="field grow">
            <span>Seed</span>
            <input data-act="seed" inputmode="numeric" maxlength="12" value="${esc(work.seed)}" placeholder="random" />
          </label>
        </div>
        <details class="fold" data-fold="neg">
          <summary>Negative <span>${esc(PRESET_LABEL[work.negativePreset])}</span></summary>
          <div class="chips">
            ${NEGATIVE_PRESETS.map(
      (preset) => `<button type="button" class="chip" aria-pressed="${work.negativePreset === preset}" data-act="neg" data-id="${preset}">${PRESET_LABEL[preset]}</button>`
    ).join("")}
          </div>
          <label class="switch">
            <input type="checkbox" data-act="easy" ${work.easyNegative ? "checked" : ""} />
            <span>EasyNegative, only if that embedding is imported.</span>
          </label>
          <label class="field">
            <span>Also avoid</span>
            <input data-act="negx" maxlength="400" value="${esc(work.negativeExtra)}" placeholder="extra words, comma separated" />
          </label>
        </details>
        <details class="fold" data-fold="sched">
          ${summary("Sampler", `${esc(work.scheduler)} \xB7 ${work.steps} \xB7 ${work.cfg}`)}
          <p class="hint">${esc(rec.note)}</p>
          <div class="row">
            <label class="field grow">
              <span>Scheduler</span>
              <select data-act="sched">
                ${SCHEDULERS.map((name) => `<option ${work.scheduler === name ? "selected" : ""}>${esc(name)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Steps</span>
              <input data-act="steps" inputmode="numeric" value="${work.steps}" />
            </label>
            <label class="field">
              <span>CFG</span>
              <input data-act="cfg" inputmode="decimal" value="${work.cfg}" />
            </label>
          </div>
          ${settingsMatch(work) ? "" : `<button type="button" class="ghost" data-act="match">Use the recommended settings</button>`}
        </details>
        <div class="row wrap">
          <button type="button" class="ghost" data-act="starter">Add quality</button>
          <button type="button" class="ghost" data-act="shuffle">Shuffle</button>
          <button type="button" class="ghost" data-act="clear">Clear tags</button>
          <button type="button" class="solid" data-act="save">Save slip</button>
        </div>
        <details class="fold" data-fold="slips">
          ${summary("Saved slips", saved.length ? String(saved.length) : "On this phone")}
          ${saved.length ? `<ul class="slips">${saved.map(
      (slip) => `
                <li>
                  <span>${esc(slip.name)}</span>
                  <button type="button" data-act="load" data-id="${esc(slip.id)}">${armed === `load:${slip.id}` ? "Replace desk?" : "Load"}</button>
                  <button type="button" data-act="del" data-id="${esc(slip.id)}">${armed === `del:${slip.id}` ? "Confirm" : "Delete"}</button>
                </li>`
    ).join("")}</ul>` : `<p class="hint">Nothing saved yet. Save keeps the slip on this phone only.</p>`}
        </details>
        <details class="fold" data-fold="howto">
          ${summary("Paste into Local Dream")}
          <ol class="steps">
            <li>Pick the family that matches the model you downloaded.</li>
            <li>If the file name contains _dmd2, turn the fast switch on.</li>
            <li>Copy the prompt. Paste it into Local Dream\u2019s prompt box.</li>
            <li>Copy the negative. Skip it if you left it empty.</li>
            <li>Match scheduler, steps, and CFG. Weights already use (tag:1.1).</li>
            <li>The GitHub build of Local Dream does not black out images. The Play Store build does. This desk only writes the words.</li>
          </ol>
        </details>
        <details class="fold" data-fold="skill">
          ${summary("Grok skill")}
          <p class="hint">Same rules as this desk. Paste the file into Grok as a custom skill. It writes the slip. It does not generate the picture.</p>
          <button type="button" class="solid" data-act="copy" data-id="skill">${copied === "skill" ? "Skill copied" : "Copy skill"}</button>
        </details>
      </section>
      <aside class="ticket" id="slip">
        <div class="slip-head">
          <h2>Prompt</h2>
          <span>${ordered.length} tags</span>
        </div>
        <p class="galley" id="prompt-output">${prompt ? esc(prompt) : "Tap tags. Quality and subject stay at the front."}</p>
        <div class="meter ${over ? "over" : ""}" role="meter" aria-valuenow="${Math.min(tokens, budget)}" aria-valuemax="${budget}">
          <span style="width:${Math.min(100, tokens / budget * 100)}%"></span>
        </div>
        <p class="count ${over ? "over" : ""}">${tokens} / ${budget}${over ? " \xB7 over the budget, the tail will be ignored" : ""}</p>
        ${ordered.length ? `<ul class="weights">${ordered.map((tag) => {
      const weight = work.weights[tag.id] ?? 1;
      return `<li>
                    <span>${esc(tag.label)}</span>
                    <button type="button" data-act="down" data-id="${esc(tag.id)}" ${weight <= 0.6 ? "disabled" : ""}>\u2212</button>
                    <b>${weight.toFixed(1)}</b>
                    <button type="button" data-act="up" data-id="${esc(tag.id)}" ${weight >= 1.6 ? "disabled" : ""}>+</button>
                    <button type="button" data-act="tag" data-id="${esc(tag.id)}">\xD7</button>
                  </li>`;
    }).join("")}</ul>` : ""}
        <div class="row wrap">
          <button type="button" class="solid" data-act="copy" data-id="prompt">${copied === "prompt" ? "Prompt copied" : "Copy prompt"}</button>
          <button type="button" class="ghost" data-act="copy" data-id="negative" ${negative ? "" : "disabled"}>${copied === "negative" ? "Copied" : "Copy negative"}</button>
          <button type="button" class="ghost" data-act="copy" data-id="card">${copied === "card" ? "Copied" : "Copy card"}</button>
        </div>
        ${negative ? `<p class="neg"><strong>Negative.</strong> ${esc(negative)}</p>` : ""}
      </aside>
    </div>
    <div class="dock">
      <button type="button" class="solid" data-act="copy" data-id="prompt">${copied === "prompt" ? "Copied" : "Copy"}</button>
      <button type="button" class="ghost" data-act="copy" data-id="negative" ${negative ? "" : "disabled"}>${copied === "negative" ? "Copied" : "Negative"}</button>
    </div>
  `;
    for (const fold of open) {
      const item = root.querySelector(`details[data-fold="${fold}"]`);
      if (item) item.open = true;
    }
    const active = document.activeElement;
    if (active instanceof HTMLTextAreaElement && active.dataset.act === "custom") {
      const next = root.querySelector('[data-act="custom"]');
      if (next) {
        const pos = active.selectionStart;
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    }
  }
  function onInput(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const act = target.dataset.act;
    if (target instanceof HTMLTextAreaElement && act === "custom") {
      work = { ...work, custom: target.value };
      persist();
      const prompt = buildPrompt(work);
      const out = document.querySelector("#prompt-output");
      if (out) out.textContent = prompt || "Tap tags. Quality and subject stay at the front.";
      const tokens = estimateContentTokens(prompt);
      const budget = tokenBudget();
      const bar = document.querySelector(".meter span");
      const count = document.querySelector(".count");
      if (bar) bar.style.width = `${Math.min(100, tokens / budget * 100)}%`;
      if (count) count.textContent = `${tokens} / ${budget}${tokens > budget ? " \xB7 over the budget, the tail will be ignored" : ""}`;
      return;
    }
    if (target instanceof HTMLInputElement && act === "negx") {
      work = { ...work, negativeExtra: target.value };
      persist();
      return;
    }
    if (target instanceof HTMLInputElement && act === "seed") {
      work = { ...work, seed: target.value.replace(/\D/g, "").slice(0, 12) };
      persist();
      return;
    }
    if (target instanceof HTMLInputElement && act === "steps") {
      const steps = clampSteps(Number(target.value));
      work = { ...work, steps };
      persist();
      return;
    }
    if (target instanceof HTMLInputElement && act === "cfg") {
      const cfg = clampCfg(Number(target.value));
      work = { ...work, cfg };
      persist();
    }
  }
  function onChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const act = target.dataset.act;
    if (target instanceof HTMLSelectElement && act === "aspect") {
      const aspect = ASPECTS.find((item) => item === target.value) ?? "1:1";
      setWork({ ...work, aspect });
    }
    if (target instanceof HTMLSelectElement && act === "sched") {
      const scheduler = SCHEDULERS.find((item) => item === target.value) ?? work.scheduler;
      setWork({ ...work, scheduler });
    }
    if (target instanceof HTMLInputElement && act === "dmd2") {
      setWork(applyDmd2(work, target.checked));
    }
    if (target instanceof HTMLInputElement && act === "easy") {
      setWork({ ...work, easyNegative: target.checked });
    }
  }
  function onClick(event) {
    const target = event.target?.closest("[data-act]");
    if (!target || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
    const act = target.dataset.act;
    const id = target.dataset.id ?? "";
    if (act === "lane") {
      const lane = LANE_INFO.find((item) => item.id === id)?.id;
      if (lane) setWork(applyLane(work, lane));
      return;
    }
    if (act === "tag") {
      toggleTag(id);
      return;
    }
    if (act === "down") {
      nudge(id, -0.1);
      return;
    }
    if (act === "up") {
      nudge(id, 0.1);
      return;
    }
    if (act === "neg") {
      const preset = NEGATIVE_PRESETS.find((item) => item === id);
      if (preset) setWork({ ...work, negativePreset: preset });
      return;
    }
    if (act === "starter") {
      setWork(withStarter(work));
      return;
    }
    if (act === "shuffle") {
      setWork(shuffleWork(work));
      return;
    }
    if (act === "clear") {
      setWork({ ...work, selected: [], weights: {} });
      return;
    }
    if (act === "match") {
      const rec = recommended(work.lane, work.dmd2);
      setWork({ ...work, scheduler: rec.scheduler, steps: rec.steps, cfg: rec.cfg });
      return;
    }
    if (act === "save") {
      saveSlip();
      return;
    }
    if (act === "load") {
      if (armed !== `load:${id}`) {
        armed = `load:${id}`;
        draw();
        return;
      }
      const slip = saved.find((item) => item.id === id);
      if (slip) setWork(sanitize(slip.work));
      return;
    }
    if (act === "del") {
      if (armed !== `del:${id}`) {
        armed = `del:${id}`;
        draw();
        return;
      }
      saved = saved.filter((item) => item.id !== id);
      armed = null;
      persist();
      draw();
      return;
    }
    if (act === "copy") {
      const text = id === "prompt" ? buildPrompt(work) : id === "negative" ? buildNegative(work) : id === "skill" ? LOCAL_DREAM_SKILL : buildCard(work);
      if (!text) return;
      void writeClipboard(text).then(() => markCopied(id));
    }
  }
  var app = document.querySelector("#app");
  app?.addEventListener("click", onClick);
  app?.addEventListener("input", onInput);
  app?.addEventListener("change", onChange);
  draw();
})();
