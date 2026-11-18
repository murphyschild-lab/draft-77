import {
  LANE_INFO,
  GROUPS,
  TAGS,
  familyOf,
  type GroupId,
  type LaneId,
} from "./catalog";
import {
  ASPECTS,
  DEFAULT_WORK,
  NEGATIVE_PRESETS,
  SCHEDULERS,
  applyDmd2,
  applyLane,
  buildCard,
  buildNegative,
  buildPrompt,
  clampCfg,
  clampSteps,
  clampWeight,
  estimateContentTokens,
  recommended,
  sanitize,
  sanitizeSaved,
  settingsMatch,
  shuffleWork,
  sizeLabel,
  suggestName,
  tagsInOrder,
  tokenBudget,
  withStarter,
  type NegativePreset,
  type SavedSlip,
  type Work,
} from "./engine";
import { LOCAL_DREAM_SKILL } from "./skill";

const WORK_KEY = "draft77.work.v1";
const SAVED_KEY = "draft77.slips.v1";

const HINT: Record<GroupId, string> = {
  quality: "Two is enough. Extra quality words eat the budget.",
  subject: "One subject. Name who, or the thing.",
  feature: "A couple of traits. Not a census.",
  expression: "One face.",
  wardrobe: "Name the clothes.",
  pose: "One verb.",
  place: "Where they are.",
  light: "One light.",
  camera: "Framing.",
  style: "Medium last.",
};

function loadWork(): Work {
  try {
    return sanitize(JSON.parse(localStorage.getItem(WORK_KEY) || "null"));
  } catch {
    return DEFAULT_WORK;
  }
}

function loadSaved(): SavedSlip[] {
  try {
    return sanitizeSaved(JSON.parse(localStorage.getItem(SAVED_KEY) || "null"));
  } catch {
    return [];
  }
}

let work = loadWork();
let saved = loadSaved();
let copied: string | null = null;
let armed: string | null = null;
let copyTimer = 0;

function persist() {
  localStorage.setItem(WORK_KEY, JSON.stringify(work));
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}

function summary(title: string, hint = ""): string {
  const tail = hint ? ` <span>${hint}</span>` : "";
  return "<" + `summary>${title}${tail}</` + "summary>";
}

async function writeClipboard(text: string) {
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

function markCopied(kind: string) {
  copied = kind;
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    copied = null;
    draw();
  }, 1400);
  draw();
}

function setWork(next: Work) {
  work = next;
  armed = null;
  persist();
  draw();
}

function nudge(id: string, delta: number) {
  const current = work.weights[id] ?? 1;
  const next = clampWeight(current + delta);
  const weights = { ...work.weights };
  if (Math.abs(next - 1) < 0.05) delete weights[id];
  else weights[id] = next;
  setWork({ ...work, weights });
}

function toggleTag(id: string) {
  const selected = work.selected.includes(id)
    ? work.selected.filter((item) => item !== id)
    : [...work.selected, id];
  const weights = { ...work.weights };
  if (!selected.includes(id)) delete weights[id];
  setWork({ ...work, selected, weights });
}

function saveSlip() {
  const slip: SavedSlip = {
    id: crypto.randomUUID(),
    name: suggestName(work),
    created: Date.now(),
    work,
  };
  saved = [slip, ...saved].slice(0, 30);
  persist();
  draw();
}

const PRESET_LABEL: Record<NegativePreset, string> = {
  lean: "Lean",
  anime: "Anime",
  photo: "Photo",
  none: "None",
};

function chips(group: GroupId, lane: LaneId): string {
  const tags = TAGS.filter((tag) => tag.group === group && tag.lanes.includes(lane));
  if (!tags.length) return "";
  return `
    <section class="group">
      <h3>${esc(GROUPS.find((item) => item.id === group)?.title ?? group)}</h3>
      <p class="hint">${esc(HINT[group])}</p>
      <div class="chips">
        ${tags
          .map((tag) => {
            const on = work.selected.includes(tag.id);
            return `<button type="button" class="chip" aria-pressed="${on}" data-act="tag" data-id="${esc(tag.id)}">${esc(tag.label)}</button>`;
          })
          .join("")}
      </div>
    </section>`;
}

function draw() {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) return;
  const open = new Set(
    [...root.querySelectorAll<HTMLDetailsElement>("details[data-fold]")]
      .filter((item) => item.open)
      .map((item) => item.dataset.fold ?? ""),
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
              <span>${esc(lane.family)} · ${esc(lane.eg)}</span>
            </button>`,
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
              ${ASPECTS.map((aspect) => `<option value="${aspect}" ${work.aspect === aspect ? "selected" : ""}>${aspect} · ${esc(sizeLabel(work.lane, aspect))}</option>`).join("")}
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
              (preset) =>
                `<button type="button" class="chip" aria-pressed="${work.negativePreset === preset}" data-act="neg" data-id="${preset}">${PRESET_LABEL[preset]}</button>`,
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
          ${summary("Sampler", `${esc(work.scheduler)} · ${work.steps} · ${work.cfg}`)}
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
          ${
            settingsMatch(work)
              ? ""
              : `<button type="button" class="ghost" data-act="match">Use the recommended settings</button>`
          }
        </details>
        <div class="row wrap">
          <button type="button" class="ghost" data-act="starter">Add quality</button>
          <button type="button" class="ghost" data-act="shuffle">Shuffle</button>
          <button type="button" class="ghost" data-act="clear">Clear tags</button>
          <button type="button" class="solid" data-act="save">Save slip</button>
        </div>
        <details class="fold" data-fold="slips">
          ${summary("Saved slips", saved.length ? String(saved.length) : "On this phone")}
          ${
            saved.length
              ? `<ul class="slips">${saved
                  .map(
                    (slip) => `
                <li>
                  <span>${esc(slip.name)}</span>
                  <button type="button" data-act="load" data-id="${esc(slip.id)}">${armed === `load:${slip.id}` ? "Replace desk?" : "Load"}</button>
                  <button type="button" data-act="del" data-id="${esc(slip.id)}">${armed === `del:${slip.id}` ? "Confirm" : "Delete"}</button>
                </li>`,
                  )
                  .join("")}</ul>`
              : `<p class="hint">Nothing saved yet. Save keeps the slip on this phone only.</p>`
          }
        </details>
        <details class="fold" data-fold="howto">
          ${summary("Paste into Local Dream")}
          <ol class="steps">
            <li>Pick the family that matches the model you downloaded.</li>
            <li>If the file name contains _dmd2, turn the fast switch on.</li>
            <li>Copy the prompt. Paste it into Local Dream’s prompt box.</li>
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
          <span style="width:${Math.min(100, (tokens / budget) * 100)}%"></span>
        </div>
        <p class="count ${over ? "over" : ""}">${tokens} / ${budget}${over ? " · over the budget, the tail will be ignored" : ""}</p>
        ${
          ordered.length
            ? `<ul class="weights">${ordered
                .map((tag) => {
                  const weight = work.weights[tag.id] ?? 1;
                  return `<li>
                    <span>${esc(tag.label)}</span>
                    <button type="button" data-act="down" data-id="${esc(tag.id)}" ${weight <= 0.6 ? "disabled" : ""}>−</button>
                    <b>${weight.toFixed(1)}</b>
                    <button type="button" data-act="up" data-id="${esc(tag.id)}" ${weight >= 1.6 ? "disabled" : ""}>+</button>
                    <button type="button" data-act="tag" data-id="${esc(tag.id)}">×</button>
                  </li>`;
                })
                .join("")}</ul>`
            : ""
        }
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
    const item = root.querySelector<HTMLDetailsElement>(`details[data-fold="${fold}"]`);
    if (item) item.open = true;
  }

  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement && active.dataset.act === "custom") {
    const next = root.querySelector<HTMLTextAreaElement>('[data-act="custom"]');
    if (next) {
      const pos = active.selectionStart;
      next.focus();
      next.setSelectionRange(pos, pos);
    }
  }
}

function onInput(event: Event) {
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
    const bar = document.querySelector<HTMLElement>(".meter span");
    const count = document.querySelector(".count");
    if (bar) bar.style.width = `${Math.min(100, (tokens / budget) * 100)}%`;
    if (count) count.textContent = `${tokens} / ${budget}${tokens > budget ? " · over the budget, the tail will be ignored" : ""}`;
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

function onChange(event: Event) {
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

function onClick(event: Event) {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-act]");
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
    const text =
      id === "prompt"
        ? buildPrompt(work)
        : id === "negative"
          ? buildNegative(work)
          : id === "skill"
            ? LOCAL_DREAM_SKILL
            : buildCard(work);
    if (!text) return;
    void writeClipboard(text).then(() => markCopied(id));
  }
}

const app = document.querySelector("#app");
app?.addEventListener("click", onClick);
app?.addEventListener("input", onInput);
app?.addEventListener("change", onChange);
draw();
