/* Ani character system (Career Lab refactor step 3) */
import { $, shrinkBubble } from "./utils.js";

const _deps = {
  speak(text) {},
  getPageContext() {
    return { page: "home", greeting: "", hints: [], fallback: "" };
  },
  getWeakestArea() {
    return null;
  },
  getProgress() {
    return { points: 0 };
  },
};

/**
 * Inject optional dependencies from script.js (voice, page context, progress).
 * Safe to call multiple times; later calls override earlier ones.
 */
export function setAniDeps(d = {}) {
  if (typeof d.speak === "function") _deps.speak = d.speak;
  if (typeof d.getPageContext === "function") _deps.getPageContext = d.getPageContext;
  if (typeof d.getWeakestArea === "function") _deps.getWeakestArea = d.getWeakestArea;
  if (typeof d.getProgress === "function") _deps.getProgress = d.getProgress;
}

const ANI_HINTS = [
  () => "Попробуй пройти тест и узнай свою профессию! 🧠",
  () => {
    const w = _deps.getWeakestArea();
    return w ? "Потренируй тему: " + w + " 💪" : "Ты молодец! ⭐";
  },
  () => "Каждый день - новый шаг к мечте! 🌟",
  () => "Попробуй симуляцию! 🎮",
  () => "Не забудь проверить ежедневный урок! 📚",
  () => "Ты уже заработал " + (_deps.getProgress()?.points || 0) + " очков! 🏆",
  () => "Исследуй все профессии! 🔭",
];

let aniTimer = null;

/**
 * All gesture class names — used to clear before applying a new one.
 */
const ANI_GESTURE_CLASSES = [
  "ani-excited",
  "ani-happy",
  "ani-think",
  "ani-wave",
  "ani-point",
  "ani-celebrate",
  "ani-nod",
  "ani-shake-head",
];

/**
 * Apply a gesture class to Ani, removing it after the animation ends.
 * Also sets a mood glow on the wrapper.
 * @param {string} gesture - CSS class name
 * @param {number} duration - ms to hold the class
 * @param {string} [mood] - mood class for wrapper glow
 */
export function aniGesture(gesture, duration, mood) {
  const c = $("ani-char"),
    w = $("ani-wrapper");
  if (!c) return;
  c.classList.remove(...ANI_GESTURE_CLASSES);
  void c.offsetWidth;
  c.classList.add(gesture);
  if (w) {
    w.classList.remove("mood-happy", "mood-excited", "mood-think", "mood-sad");
    if (mood) w.classList.add(mood);
  }
  setTimeout(() => {
    c.classList.remove(gesture);
    if (w) w.classList.remove("mood-happy", "mood-excited", "mood-think", "mood-sad");
  }, duration);
}

/** Trigger excited CSS animation on Ani character */
export function aniExcited() {
  aniGesture("ani-excited", 800, "mood-excited");
}

/** Trigger happy bounce animation on Ani character */
export function aniHappy() {
  aniGesture("ani-happy", 1000, "mood-happy");
}

/** Trigger thinking tilt animation on Ani character */
export function aniThink() {
  aniGesture("ani-think", 1200, "mood-think");
}

/** Wave greeting gesture */
export function aniWave() {
  aniGesture("ani-wave", 900, "mood-happy");
}

/** Point-to-task gesture */
export function aniPoint() {
  aniGesture("ani-point", 1000, "mood-excited");
}

/** Full celebration gesture */
export function aniCelebrate() {
  aniGesture("ani-celebrate", 1100, "mood-excited");
}

/** Gentle nod — agreement */
export function aniNod() {
  aniGesture("ani-nod", 800, "mood-happy");
}

/** Shake head — gentle disagreement */
export function aniShakeHead() {
  aniGesture("ani-shake-head", 900, "mood-sad");
}

/**
 * Auto-pick a gesture based on message content sentiment.
 * @param {string} text
 */
export function aniAutoGesture(text) {
  const t = String(text || "").toLowerCase();
  if (
    t.includes("🎉") ||
    t.includes("🏆") ||
    t.includes("ура") ||
    t.includes("побед") ||
    t.includes("отлично") ||
    t.includes("молодец")
  ) {
    aniCelebrate();
  } else if (t.includes("правильно") || t.includes("умница") || t.includes("хорошо") || t.includes("💪")) {
    aniHappy();
  } else if (t.includes("привет") || t.includes("здравствуй")) {
    aniWave();
  } else if (t.includes("задание") || t.includes("попробуй") || t.includes("смотри") || t.includes("💡")) {
    aniPoint();
  } else if (t.includes("хм") || t.includes("подумай") || t.includes("🤔")) {
    aniThink();
  } else if (t.includes("не совсем") || t.includes("неверно") || t.includes("ошибка")) {
    aniShakeHead();
  } else {
    aniNod();
  }
}

/**
 * Show a speech bubble with text, auto-gesture, and optionally speak it.
 * @param {string} text - Message to display
 * @param {number} [duration=5000] - How long before bubble shrinks
 */
export function aniSay(text, duration = 5000) {
  const bubble = $("ani-bubble"),
    span = $("ani-text");
  if (!bubble || !span) return;
  span.textContent = text;
  bubble.classList.remove("small");
  bubble.classList.add("ani-pop");
  bubble.style.display = "block";
  setTimeout(() => bubble.classList.remove("ani-pop"), 400);
  _deps.speak(text);
  aniAutoGesture(text);
  clearTimeout(aniTimer);
  aniTimer = setTimeout(() => shrinkBubble(), duration);
}

/**
 * Show typing dots in bubble (Ani is "thinking"), then reveal message.
 * @param {string} text - Final message to show
 * @param {number} [delay=900] - ms to show dots before message
 */
export function aniThinkThenSay(text, delay = 900) {
  const bubble = $("ani-bubble"),
    span = $("ani-text");
  if (!bubble || !span) return;
  span.innerHTML = "<span class='ani-typing-dots'><span></span><span></span><span></span></span>";
  bubble.classList.remove("small");
  bubble.style.display = "block";
  aniThink();
  setTimeout(() => aniSay(text), delay);
}

export function initAni() {
  const char = $("ani-char"),
    bubble = $("ani-bubble");
  if (!char) return;
  // Click: random hint with auto-gesture
  char.addEventListener("click", () => {
    const ctx = _deps.getPageContext();
    const hintPool =
      ctx.hints && ctx.hints.length ? ctx.hints.map(h => (typeof h === "function" ? h : () => h)) : ANI_HINTS;
    const hint = hintPool[Math.floor(Math.random() * hintPool.length)]();
    aniSay(hint);
  });
  if (bubble) bubble.addEventListener("click", () => shrinkBubble());
  // Wave greeting after a short delay
  setTimeout(() => {
    aniWave();
  }, 600);
}

export function initIdleMessages() {
  let idleT;
  const ctx = _deps.getPageContext();
  // Use page-specific hints if available, else fall back to ANI_HINTS
  const hintPool = ctx.hints && ctx.hints.length ? ctx.hints.map(h => (typeof h === "function" ? h : () => h)) : ANI_HINTS;
  const reset = () => {
    clearTimeout(idleT);
    idleT = setTimeout(() => {
      const hint = hintPool[Math.floor(Math.random() * hintPool.length)]();
      aniSay(hint);
      reset();
    }, 8000 + Math.random() * 4000);
  };
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(ev =>
    document.addEventListener(ev, reset, { passive: true })
  );
  reset();
}

export function initScrollReactions() {
  const sections = document.querySelectorAll("[data-ani-msg]");
  if (!sections.length) return;
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const msg = e.target.getAttribute("data-ani-msg");
          if (msg) {
            aniSay(msg);
            aniHappy();
          }
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => obs.observe(s));
}

