/**
 * Phase 5.1 — Ani Click Reaction
 * Adds sparkle/ripple at click point + wave gesture on Ani click.
 * Additive layer: never touches existing initAni() click handler.
 *
 * Exports: initAniClickReaction
 * CSS:     style.css (phase5-ani-click block appended)
 * Safe:    no global pollution, no DOM ID changes
 */
import { $ } from "./utils.js";
import { aniWave, aniSay } from "./ani.js";

/* ── Sparkle particle pool ── */
const COLORS = ["#a78bfa", "#ec4899", "#fbbf24", "#34d399", "#60a5fa", "#fff"];
const WAVE_MESSAGES = [
  "Привет! 👋",
  "Ты молодец! ⭐",
  "Давай учиться! 📚",
  "Я здесь! 😊",
  "Вперёд! 🚀",
];

let _lastWaveTs = 0;

/**
 * Spawn sparkle particles at (x, y) viewport coordinates.
 * Uses CSS animation defined in style.css phase5 block.
 * @param {number} x
 * @param {number} y
 */
function spawnSparkles(x, y) {
  const count = 10;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "phase5-sparkle";
    const delay = i * 18;
    el.style.cssText = `
      left:${x}px; top:${y}px;
      background:${COLORS[i % COLORS.length]};
      --dx:${(Math.random() - 0.5) * 80}px;
      --dy:${-(20 + Math.random() * 60)}px;
      --rot:${Math.random() * 360}deg;
      animation-delay:${delay}ms;
    `;
    document.body.appendChild(el);
    // Remove after animation completes (duration 550ms + delay)
    setTimeout(() => el.remove(), 600 + delay);
  }
}

/**
 * Spawn a ripple ring at (x, y) viewport coordinates.
 * @param {number} x
 * @param {number} y
 */
function spawnRipple(x, y) {
  const el = document.createElement("div");
  el.className = "phase5-ripple";
  el.style.cssText = `left:${x}px; top:${y}px;`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

/**
 * Initialize Ani click reaction.
 * Attaches a second click listener on #ani-char (stacks with initAni's listener).
 * Throttled to once per 600 ms to avoid spam.
 */
export function initAniClickReaction() {
  const char = $("ani-char");
  if (!char) return;

  char.addEventListener("click", e => {
    const now = Date.now();
    if (now - _lastWaveTs < 600) return;
    _lastWaveTs = now;

    const rect = char.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3; // upper-body feel

    spawnSparkles(cx, cy);
    spawnRipple(cx, cy);
    aniWave();

    // Rotate through wave messages
    const msg = WAVE_MESSAGES[Math.floor(Math.random() * WAVE_MESSAGES.length)];
    aniSay(msg, 3000);
  });
}
