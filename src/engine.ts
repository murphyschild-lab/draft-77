import {
  familyOf,
  GROUPS,
  NON_PERSON,
  STARTER_IDS,
  TAG_BY_ID,
  TAGS,
  type GroupId,
  type LaneId,
  type Tag,
} from "./catalog";

export const SCHEDULERS = ["DPM++ 2M", "DPM++ 2M SDE", "Euler", "Euler A", "LCM"] as const;
export type Scheduler = (typeof SCHEDULERS)[number];

export const ASPECTS = ["1:1", "3:4", "2:3", "4:3", "16:9", "9:16"] as const;
export type Aspect = (typeof ASPECTS)[number];

export const NEGATIVE_PRESETS = ["lean", "anime", "photo", "none"] as const;
export type NegativePreset = (typeof NEGATIVE_PRESETS)[number];

export type Work = {
  lane: LaneId;
  dmd2: boolean;
  selected: string[];
  weights: Record<string, number>;
  custom: string;
  negativeExtra: string;
  negativePreset: NegativePreset;
  easyNegative: boolean;
  aspect: Aspect;
  seed: string;
  scheduler: Scheduler;
  steps: number;
  cfg: number;
};

export type SavedSlip = {
  id: string;
  name: string;
  created: number;
  work: Work;
};

const TOKEN_BUDGET = 75;

const NEGATIVE_TEXT: Record<NegativePreset, string> = {
  none: "",
  lean: "low quality, blurry, bad anatomy, extra fingers",
  anime:
    "low quality, worst quality, bad anatomy, bad hands, extra fingers, extra limbs, watermark, text, jpeg artifacts",
  photo: "blurry, deformed, extra fingers, plastic skin, watermark, text, oversaturated, cartoon",
};

export function recommended(lane: LaneId, dmd2: boolean): {
  scheduler: Scheduler;
  steps: number;
  cfg: number;
  note: string;
} {
  if (dmd2 && lane === "illustrious") {
    return {
      scheduler: "Euler",
      steps: 8,
      cfg: 1,
      note: "Illustrious DMD2 likes Euler, not LCM. Keep CFG at 1 and steps around 8.",
    };
  }
  if (dmd2) {
    return {
      scheduler: "LCM",
      steps: 8,
      cfg: 1,
      note: "DMD2 checkpoints want LCM, CFG 1, about 8 steps. Cooler, and roughly four times faster.",
    };
  }
  if (lane === "illustrious") {
    return {
      scheduler: "Euler",
      steps: 20,
      cfg: 5.5,
      note: "Illustrious and Anima prefer Euler. CFG around 4–6. LCM tends to smear this family.",
    };
  }
  if (lane === "sd15a") {
    return {
      scheduler: "DPM++ 2M",
      steps: 24,
      cfg: 7,
      note: "SD1.5 anime: 20–30 steps, CFG near 7. 512 square unless the model has a high-res patch.",
    };
  }
  if (lane === "sdxlp") {
    return {
      scheduler: "DPM++ 2M",
      steps: 24,
      cfg: 5,
      note: "CyberRealistic and other SDXL photo models. CFG 5–7. Use the DMD2 switch if the filename has _dmd2.",
    };
  }
  return {
    scheduler: "DPM++ 2M",
    steps: 25,
    cfg: 6.5,
    note: "Absolute Reality and similar SD1.5 photo models. CFG near 6–7, 512 square.",
  };
}

const initial = recommended("illustrious", false);

export const DEFAULT_WORK: Work = {
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
  cfg: initial.cfg,
};

export function clampWeight(n: number): number {
  if (!Number.isFinite(n)) return 1;
  const rounded = Math.round(n * 10) / 10;
  return Math.min(1.6, Math.max(0.6, rounded));
}

export function clampSteps(n: number): number {
  if (!Number.isFinite(n)) return 20;
  return Math.min(40, Math.max(1, Math.round(n)));
}

export function clampCfg(n: number): number {
  if (!Number.isFinite(n)) return 5.5;
  const rounded = Math.round(n * 2) / 2;
  return Math.min(12, Math.max(1, rounded));
}

export function cleanPhrase(value: string): string {
  return value
    .replace(/\s*\n+\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^(,\s*)+|(\s*,)+$/g, "")
    .trim();
}

export function formatWeighted(label: string, weight: number): string {
  const w = clampWeight(weight);
  if (Math.abs(w - 1) < 0.05) return label;
  return `(${label}:${w.toFixed(1)})`;
}

export function tagsInOrder(work: Work): Tag[] {
  const wanted = new Set(work.selected);
  return TAGS.filter(
    (tag) => wanted.has(tag.id) && tag.lanes.includes(work.lane),
  );
}

export function buildPrompt(work: Work): string {
  const photo = familyOf(work.lane) === "photo";
  const grouped = new Map<GroupId, string[]>();
  for (const tag of tagsInOrder(work)) {
    const line = formatWeighted(tag.label, work.weights[tag.id] ?? 1);
    const list = grouped.get(tag.group) ?? [];
    list.push(line);
    grouped.set(tag.group, list);
  }
  const custom = cleanPhrase(work.custom);
  const parts: string[] = [];
  if (photo && custom) parts.push(custom);
  for (const group of GROUPS) {
    const list = grouped.get(group.id);
    if (list?.length) parts.push(...list);
    if (!photo && group.id === "subject" && custom) parts.push(custom);
  }
  return parts.join(", ");
}

export function buildNegative(work: Work): string {
  const parts: string[] = [];
  if (work.easyNegative) parts.push("EasyNegative");
  const base = NEGATIVE_TEXT[work.negativePreset];
  if (base) parts.push(base);
  const extra = cleanPhrase(work.negativeExtra);
  if (extra) parts.push(extra);
  return parts.join(", ");
}

export function estimateContentTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed
    .replace(/[()]/g, " ")
    .replace(/[:_,.;]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let count = 0;
  for (const word of words) {
    if (word.length <= 10) count += 1;
    else if (word.length <= 16) count += 2;
    else count += Math.ceil(word.length / 7);
  }
  const punct = (trimmed.match(/[,:()]/g) ?? []).length;
  return count + punct;
}

export function tokenBudget(): number {
  return TOKEN_BUDGET;
}

export function sizeLabel(lane: LaneId, aspect: Aspect): string {
  const sdxl = lane === "illustrious" || lane === "sdxlp";
  if (sdxl) {
    const map: Record<Aspect, string> = {
      "1:1": "1024×1024",
      "3:4": "768×1024",
      "2:3": "832×1216",
      "4:3": "1024×768",
      "16:9": "1216×832",
      "9:16": "768×1344",
    };
    return map[aspect];
  }
  if (aspect === "1:1") return "512×512";
  if (aspect === "4:3" || aspect === "16:9") return "768×512 patch";
  return "512×768 patch";
}

export function buildCard(work: Work): string {
  const prompt = buildPrompt(work);
  const negative = buildNegative(work);
  const lane = laneName(work.lane);
  return [
    prompt || "(empty prompt)",
    "",
    "Negative:",
    negative || "(none)",
    "",
    `Model lane: ${lane}`,
    `Scheduler: ${work.scheduler}`,
    `Steps: ${work.steps}`,
    `CFG: ${Number.isInteger(work.cfg) ? work.cfg.toFixed(1) : work.cfg}`,
    `Aspect: ${work.aspect} (${sizeLabel(work.lane, work.aspect)})`,
    `Seed: ${work.seed.trim() || "random"}`,
    `DMD2: ${work.dmd2 ? "on" : "off"}`,
  ].join("\n");
}

export function laneName(lane: LaneId): string {
  if (lane === "illustrious") return "Illustrious — SDXL anime";
  if (lane === "sd15a") return "SD1.5 anime";
  if (lane === "sdxlp") return "SDXL photo";
  return "SD1.5 photo";
}

function pick(pool: Tag[], n: number): Tag[] {
  const copy = [...pool];
  const out: Tag[] = [];
  for (let i = 0; i < n && copy.length > 0; i += 1) {
    const index = Math.floor(Math.random() * copy.length);
    const [tag] = copy.splice(index, 1);
    if (tag) out.push(tag);
  }
  return out;
}

function pool(group: GroupId, lane: LaneId): Tag[] {
  return TAGS.filter((tag) => tag.group === group && tag.lanes.includes(lane));
}

export function shuffleWork(work: Work): Work {
  const subject = pick(pool("subject", work.lane), 1);
  const person = subject[0] ? !NON_PERSON.has(subject[0].id) : false;
  const chosen = [
    ...pick(pool("quality", work.lane), familyOf(work.lane) === "anime" ? 2 : 1),
    ...subject,
    ...(person ? pick(pool("feature", work.lane), 2) : []),
    ...(person ? pick(pool("expression", work.lane), 1) : []),
    ...(person ? pick(pool("wardrobe", work.lane), 1) : []),
    ...(person ? pick(pool("pose", work.lane), 1) : []),
    ...pick(pool("place", work.lane), 1),
    ...pick(pool("light", work.lane), 1),
    ...pick(pool("camera", work.lane), 1),
    ...pick(pool("style", work.lane), 1),
  ];
  return { ...work, selected: chosen.map((tag) => tag.id), weights: {} };
}

export function withStarter(work: Work): Work {
  const selected = [...work.selected];
  for (const id of STARTER_IDS[work.lane]) {
    if (TAG_BY_ID.get(id)?.lanes.includes(work.lane) && !selected.includes(id)) {
      selected.push(id);
    }
  }
  return { ...work, selected };
}

export function applyLane(work: Work, lane: LaneId): Work {
  const rec = recommended(lane, work.dmd2);
  const familyChanged = familyOf(work.lane) !== familyOf(lane);
  return {
    ...work,
    lane,
    selected: work.selected.filter((id) => TAG_BY_ID.get(id)?.lanes.includes(lane)),
    negativePreset: familyChanged ? familyOf(lane) : work.negativePreset,
    scheduler: rec.scheduler,
    steps: rec.steps,
    cfg: rec.cfg,
  };
}

export function applyDmd2(work: Work, dmd2: boolean): Work {
  const rec = recommended(work.lane, dmd2);
  return {
    ...work,
    dmd2,
    scheduler: rec.scheduler,
    steps: rec.steps,
    cfg: rec.cfg,
  };
}

function isLane(value: unknown): value is LaneId {
  return value === "illustrious" || value === "sd15a" || value === "sdxlp" || value === "sd15p";
}

export function sanitize(input: unknown): Work {
  if (!input || typeof input !== "object") return DEFAULT_WORK;
  const raw = input as Record<string, unknown>;
  const lane = isLane(raw.lane) ? raw.lane : DEFAULT_WORK.lane;
  const dmd2 = raw.dmd2 === true;
  const selected = Array.isArray(raw.selected)
    ? raw.selected.filter(
        (id): id is string =>
          typeof id === "string" && !!TAG_BY_ID.get(id)?.lanes.includes(lane),
      )
    : [];
  const weights: Record<string, number> = {};
  if (raw.weights && typeof raw.weights === "object") {
    for (const [key, value] of Object.entries(raw.weights as Record<string, unknown>)) {
      if (typeof value === "number" && selected.includes(key)) {
        const next = clampWeight(value);
        if (Math.abs(next - 1) >= 0.05) weights[key] = next;
      }
    }
  }
  const fallback = recommended(lane, dmd2);
  const scheduler = SCHEDULERS.includes(raw.scheduler as Scheduler)
    ? (raw.scheduler as Scheduler)
    : fallback.scheduler;
  const negativePreset = NEGATIVE_PRESETS.includes(raw.negativePreset as NegativePreset)
    ? (raw.negativePreset as NegativePreset)
    : familyOf(lane);
  const aspect = ASPECTS.includes(raw.aspect as Aspect) ? (raw.aspect as Aspect) : "1:1";
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
    cfg: clampCfg(typeof raw.cfg === "number" ? raw.cfg : fallback.cfg),
  };
}

export function sanitizeSaved(input: unknown): SavedSlip[] {
  if (!Array.isArray(input)) return [];
  const out: SavedSlip[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    if (typeof raw.id !== "string" || typeof raw.name !== "string") continue;
    out.push({
      id: raw.id.slice(0, 80),
      name: raw.name.slice(0, 60) || "Slip",
      created: typeof raw.created === "number" ? raw.created : Date.now(),
      work: sanitize(raw.work),
    });
  }
  return out.slice(0, 30);
}

export function suggestName(work: Work): string {
  const custom = cleanPhrase(work.custom);
  if (custom) return custom.slice(0, 42);
  const labels = tagsInOrder(work).slice(0, 3).map((tag) => tag.label);
  return labels.join(", ") || "Slip";
}

export function settingsMatch(work: Work): boolean {
  const rec = recommended(work.lane, work.dmd2);
  return work.scheduler === rec.scheduler && work.steps === rec.steps && work.cfg === rec.cfg;
}
