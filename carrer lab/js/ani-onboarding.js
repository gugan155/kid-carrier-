/* Premium Ani Onboarding (extension layer on top of js/ani.js) */
import { $ } from "./utils.js";
import { aniWave, aniSay } from "./ani.js";

const INTRO_KEY = "kl_ani_intro_done";
const NAME_KEY = "kl_name";

function isDone() {
  return localStorage.getItem(INTRO_KEY) === "true";
}

function markDone() {
  localStorage.setItem(INTRO_KEY, "true");
}

function getName() {
  return (localStorage.getItem(NAME_KEY) || "").trim();
}

function setName(v) {
  localStorage.setItem(NAME_KEY, String(v || "").trim());
}

function ensureOnboardingStyles() {
  if (document.getElementById("ani-onboarding-style")) return;
  const st = document.createElement("style");
  st.id = "ani-onboarding-style";
  st.textContent = `
/* Ani onboarding overlay (additive) */
.ani-onboarding-overlay{
  position:fixed; inset:0;
  background:rgba(10,12,20,.55);
  backdrop-filter: blur(8px);
  display:flex; align-items:center; justify-content:center;
  z-index: 99998;
  opacity:0;
  transition: opacity 260ms ease;
}
.ani-onboarding-overlay.show{ opacity:1; }
.ani-onboarding-card{
  width:min(420px, calc(100vw - 32px));
  background: rgba(255,255,255,.10);
  border:1px solid rgba(255,255,255,.18);
  border-radius: 18px;
  padding: 18px 18px 16px;
  box-shadow: 0 24px 90px rgba(0,0,0,.45);
  color: rgba(255,255,255,.92);
}
.ani-onboarding-title{ font-weight: 700; font-size: 18px; margin: 0 0 10px; }
.ani-onboarding-row{ display:flex; gap:10px; align-items:center; }
.ani-onboarding-input{
  flex:1;
  background: rgba(0,0,0,.25);
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 12px;
  padding: 10px 12px;
  color: rgba(255,255,255,.95);
  outline: none;
}
.ani-onboarding-input:focus{
  border-color: rgba(255,255,255,.35);
  box-shadow: 0 0 0 3px rgba(124,58,237,.22);
}
.ani-onboarding-btn{
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(124,58,237,.95), rgba(236,72,153,.92));
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.ani-onboarding-btn:active{ transform: translateY(1px); }
`;
  document.head.appendChild(st);
}

function createNameModal() {
  ensureOnboardingStyles();
  if (document.getElementById("ani-onboarding-overlay")) return null; // prevent duplicates

  const overlay = document.createElement("div");
  overlay.id = "ani-onboarding-overlay";
  overlay.className = "ani-onboarding-overlay";
  overlay.innerHTML = `
    <div class="ani-onboarding-card" role="dialog" aria-label="Ani onboarding name">
      <p class="ani-onboarding-title">Как тебя зовут?</p>
      <div class="ani-onboarding-row">
        <input class="ani-onboarding-input" id="ani-onboarding-name" type="text" maxlength="20"
          placeholder="Например: Алиса" autocomplete="given-name" />
        <button class="ani-onboarding-btn" id="ani-onboarding-submit">Ок</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  // fade in next tick
  requestAnimationFrame(() => overlay.classList.add("show"));

  return overlay;
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function flipAnimate(fromRect, toRect, el, opts = {}) {
  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  const dur = opts.duration || 520;
  const easing = opts.easing || "cubic-bezier(0.2, 0.9, 0.2, 1)";
  const fromScale = opts.fromScale ?? 0.92;
  const fromOpacity = opts.fromOpacity ?? 0;
  return el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${fromScale})`, opacity: fromOpacity },
      { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
    ],
    { duration: dur, easing, fill: "both" }
  );
}

async function promptForName() {
  const overlay = createNameModal();
  if (!overlay) return null;

  const input = overlay.querySelector("#ani-onboarding-name");
  const btn = overlay.querySelector("#ani-onboarding-submit");
  if (!input || !btn) return null;

  input.focus();

  const submit = () => {
    const v = String(input.value || "").trim();
    if (!v) return;
    setName(v);
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 280);
  };

  btn.addEventListener("click", submit);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") submit();
  });

  // wait for name set (or overlay removed)
  for (let i = 0; i < 300; i++) {
    const name = getName();
    if (name) return name;
    if (!document.body.contains(overlay)) break;
    // eslint-disable-next-line no-await-in-loop
    await wait(50);
  }
  return getName() || null;
}

/**
 * Premium Ani onboarding.
 * Additive layer: never creates duplicate Ani DOM nodes.
 * Runs once per browser via localStorage key `kl_ani_intro_done`.
 */
export async function initAniOnboarding() {
  try {
    if (isDone()) return;
    // Guard against double-run in same session
    if (window.__klAniOnboardingRunning) return;
    window.__klAniOnboardingRunning = true;

    const wrap = $("ani-wrapper");
    if (!wrap) return;

    // Capture current dock rect (current CSS position)
    const dockRect = wrap.getBoundingClientRect();

    // Move to center via inline styles (still direct body child, same node)
    const prev = {
      position: wrap.style.position,
      left: wrap.style.left,
      top: wrap.style.top,
      right: wrap.style.right,
      bottom: wrap.style.bottom,
      transform: wrap.style.transform,
      zIndex: wrap.style.zIndex,
    };
    wrap.style.position = "fixed";
    wrap.style.left = "50%";
    wrap.style.top = "50%";
    wrap.style.right = "";
    wrap.style.bottom = "";
    wrap.style.transform = "translate(-50%, -50%)";
    wrap.style.zIndex = "99999";

    const centerRect = wrap.getBoundingClientRect();
    const enter = flipAnimate(dockRect, centerRect, wrap, { duration: 520, fromScale: 0.90, fromOpacity: 0 });
    await enter.finished.catch(() => {});

    // Intro line + wave
    aniWave();
    const existingName = getName();
    if (existingName) {
      aniSay(`Hi, ${existingName}! 👋`, 5200);
      await wait(1100);
    } else {
      aniSay("Hi! I'm Ani 👋 What's your name?", 5200);
      await wait(900);
      await promptForName();
    }

    markDone();

    // Dock back to normal: clear inline overrides and FLIP animate into place
    const fromRect = wrap.getBoundingClientRect();
    wrap.style.position = prev.position;
    wrap.style.left = prev.left;
    wrap.style.top = prev.top;
    wrap.style.right = prev.right;
    wrap.style.bottom = prev.bottom;
    wrap.style.transform = prev.transform;
    wrap.style.zIndex = prev.zIndex;

    // Force layout after style reset
    void wrap.offsetWidth;
    const toRect = wrap.getBoundingClientRect();
    const exit = flipAnimate(fromRect, toRect, wrap, { duration: 520, fromScale: 1, fromOpacity: 1 });
    await exit.finished.catch(() => {});
  } catch (e) {
    // Fail gracefully: do nothing; normal Ani remains functional.
    try {
      console.warn("[CL] Ani onboarding failed:", e);
    } catch {}
  } finally {
    window.__klAniOnboardingRunning = false;
  }
}

