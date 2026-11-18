export type LaneId = "illustrious" | "sd15a" | "sdxlp" | "sd15p";

export type GroupId =
  | "quality"
  | "subject"
  | "feature"
  | "expression"
  | "wardrobe"
  | "pose"
  | "place"
  | "light"
  | "camera"
  | "style";

export type Tag = {
  id: string;
  label: string;
  group: GroupId;
  lanes: LaneId[];
};

export const ANIME: LaneId[] = ["illustrious", "sd15a"];
export const PHOTO: LaneId[] = ["sdxlp", "sd15p"];
export const ALL: LaneId[] = ["illustrious", "sd15a", "sdxlp", "sd15p"];

export const LANE_INFO: { id: LaneId; name: string; family: string; eg: string }[] = [
  { id: "illustrious", name: "Illustrious", family: "SDXL anime", eg: "Anima, WAI" },
  { id: "sd15a", name: "SD1.5 anime", family: "512 base", eg: "NPU or CPU" },
  { id: "sdxlp", name: "SDXL photo", family: "Realistic", eg: "CyberRealistic" },
  { id: "sd15p", name: "SD1.5 photo", family: "512 base", eg: "Absolute Reality" },
];

export const GROUPS: { id: GroupId; title: string }[] = [
  { id: "quality", title: "Quality" },
  { id: "subject", title: "Subject" },
  { id: "feature", title: "Features" },
  { id: "expression", title: "Expression" },
  { id: "wardrobe", title: "Clothes" },
  { id: "pose", title: "Pose" },
  { id: "place", title: "Place" },
  { id: "light", title: "Light" },
  { id: "camera", title: "Camera" },
  { id: "style", title: "Medium" },
];

export function familyOf(lane: LaneId): "anime" | "photo" {
  return lane === "sdxlp" || lane === "sd15p" ? "photo" : "anime";
}

function many(group: GroupId, labels: string[], lanes: LaneId[]): Tag[] {
  return labels.map((label) => ({
    id: `${group}:${label}`,
    label,
    group,
    lanes,
  }));
}

const SCENERY = [
  "lighthouse",
  "motorcycle",
  "bowl of fruit",
  "guitar",
  "cat",
  "dog",
  "bird",
  "empty street",
];

export const NON_PERSON = new Set<string>([
  "subject:no humans",
  "subject:no people",
  ...SCENERY.map((label) => `subject:${label}`),
]);

export const STARTER_IDS: Record<LaneId, string[]> = {
  illustrious: ["quality:masterpiece", "quality:best quality"],
  sd15a: ["quality:masterpiece", "quality:best quality"],
  sdxlp: ["quality:photorealistic", "quality:sharp focus"],
  sd15p: ["quality:photorealistic", "quality:sharp focus"],
};

export const TAGS: Tag[] = [
  ...many(
    "quality",
    ["masterpiece", "best quality", "newest", "absurdres", "highres", "very aesthetic"],
    ANIME,
  ),
  ...many(
    "quality",
    ["photorealistic", "sharp focus", "raw photo", "film grain", "natural colors"],
    PHOTO,
  ),
  ...many("subject", ["1girl", "1boy", "solo", "2girls", "1boy and 1girl"], ANIME),
  ...many(
    "subject",
    ["a woman", "a man", "an older woman", "an older man", "a couple"],
    PHOTO,
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
      "amber eyes",
    ],
    ALL,
  ),
  ...many(
    "feature",
    ["blue hair", "pink hair", "white hair", "twintails", "bob cut", "hair bun", "red eyes", "cat ears"],
    ANIME,
  ),
  ...many("feature", ["natural skin texture", "weathered skin", "stubble"], PHOTO),
  ...many(
    "expression",
    ["smile", "gentle smile", "serious", "looking at viewer", "looking away", "eyes closed", "blush", "calm"],
    ALL,
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
      "boots",
    ],
    ALL,
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
      "mid stride",
    ],
    ALL,
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
      "desert",
    ],
    ALL,
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
      "fog",
    ],
    ALL,
  ),
  ...many(
    "camera",
    ["close-up", "portrait", "upper body", "full body", "wide shot", "from above", "from below", "depth of field"],
    ALL,
  ),
  ...many("camera", ["cowboy shot", "dutch angle"], ANIME),
  ...many(
    "camera",
    ["close portrait", "medium shot", "full length", "eye level", "low angle", "high angle", "shallow depth of field", "bokeh"],
    PHOTO,
  ),
  ...many(
    "style",
    ["anime style", "cel shading", "illustration", "retro anime", "watercolor", "ink", "sketch", "flat color", "painterly"],
    ANIME,
  ),
  ...many(
    "style",
    ["35mm film", "cinematic", "documentary photo", "fashion editorial", "oil painting", "charcoal drawing", "street photography", "studio portrait"],
    PHOTO,
  ),
];

const seen = new Set<string>();
for (const tag of TAGS) {
  if (seen.has(tag.id)) throw new Error(`Duplicate tag id: ${tag.id}`);
  seen.add(tag.id);
}

export const TAG_BY_ID = new Map(TAGS.map((tag) => [tag.id, tag]));
