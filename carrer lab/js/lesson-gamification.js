/**
 * Phase 5.2 — Lesson Gamification Enhancements
 * - Animated XP progress bar fill on award
 * - Completion streak toast
 * - Reward preview chip on lesson cards
 *
 * Exports: initLessonGamification, animateXpGain, showStreakToast
 * Safe: no global pollution, all IDs preserved
 */
import { $, safe } from "./utils.js";
import { getProgress, getLevelInfo, LEVELS } from "./progress.js";

/* ── XP Bar Animated Fill ── */

/**
 * Animate the XP bar fill from current value to new value.
 * Works on both nav-bar-fill and xp-bar-fill.
 * @param {number} fromPts - points before award
 * @param {number} toPts   - points after award
 */
export function animateXpGain(fromPts, toPts) {
  const lvFrom = getLevelInfo(fromPts);
  const lvTo   = getLevelInfo(toPts);

  // Find next level threshold for range calculation
  const nextLv = LEVELS.find(l => l.level === lvTo.level + 1);
  const base   = lvTo.min;
  const cap    = nextLv ? nextLv.min : lvTo.min + 500;
  const range  = Math.max(1, cap - base);

  const fromPct = Math.max(0, Math.min(100, Math.round(((fromPts - base) / range) * 100)));
  const toPct   = Math.max(0, Math.min(100, Math.round(((toPts  - base) / range) * 100)));

  // Animate both bars
  ["nav-bar-fill", "xp-bar-fill"].forEach(id => {
    const bar = $(id);
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = fromPct + "%";
    // Force reflow
    void bar.offsetWidth;
    bar.style.transition = "width 0.9s cubic-bezier(0.22,1,0.36,1)";
    bar.style.width = toPct + "%";
    bar.classList.add("phase5-xp-pulse");
    setTimeout(() => bar.classList.remove("phase5-xp-pulse"), 1000);
  });

  // Level-up flash if level changed
  if (lvTo.level > lvFrom.level) {
    showLevelUpFlash(lvTo);
  }
}

/**
 * Show a brief level-up flash banner (non-blocking, auto-removes).
 * @param {{icon:string, label:string, level:number}} lv
 */
function showLevelUpFlash(lv) {
  const el = document.createElement("div");
  el.className = "phase5-levelup-flash";
  el.innerHTML = `<span>${lv.icon}</span> Уровень ${lv.level}: ${lv.label}!`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ── Streak Toast ── */

/**
 * Show a streak completion toast.
 * @param {number} streak - current streak count
 */
export function showStreakToast(streak) {
  if (!streak || streak < 2) return;
  const el = document.createElement("div");
  el.className = "phase5-streak-toast";
  el.innerHTML = `🔥 Серия ${streak} дней подряд!`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ── Reward Preview ── */

/**
 * Inject XP reward chip into lesson cards rendered by JS.
 * Looks for .career-path-card elements and appends a chip if not already present.
 */
export function injectRewardPreviews() {
  document.querySelectorAll(".career-path-card").forEach(card => {
    if (card.querySelector(".phase5-reward-chip")) return;
    const chip = document.createElement("div");
    chip.className = "phase5-reward-chip";
    chip.textContent = "⭐ +XP за урок";
    card.appendChild(chip);
  });
}

/* ── Init ── */

/**
 * Initialize lesson gamification layer.
 * Call after initLearningHub() so cards are already in DOM.
 */
export function initLessonGamification() {
  safe(injectRewardPreviews);

  // Re-inject after any hub refresh (MutationObserver on grid)
  const grid = $("career-paths-grid");
  if (grid && window.MutationObserver) {
    const obs = new MutationObserver(() => safe(injectRewardPreviews));
    obs.observe(grid, { childList: true });
  }

  // Streak toast on page load if streak > 1
  const p = getProgress();
  if (p.streak >= 2) {
    setTimeout(() => showStreakToast(p.streak), 1800);
  }
}
