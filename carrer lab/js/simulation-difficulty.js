/**
 * Phase 5.8D — Difficulty Tiers
 * Increases replayability and age progression.
 * Easy, Medium, Pro tiers with hints, timers, and XP multipliers.
 *
 * Exports: initSimulationDifficulty, getDifficultyTier, setDifficultyTier, getXpMultiplier
 * Storage: kl_sim_difficulty (persists across sessions)
 * Safe: pure ES module, additive only
 */

const DIFFICULTY_KEY = "kl_sim_difficulty";

/**
 * Difficulty tier definitions.
 */
const TIERS = {
  easy: {
    id: "easy",
    label: "Легко",
    icon: "🌱",
    hints: true,
    steps: "fewer",
    timer: "relaxed",
    xpMultiplier: 1.0,
    description: "Подсказки включены, больше времени",
  },
  medium: {
    id: "medium",
    label: "Средне",
    icon: "🎯",
    hints: false,
    steps: "standard",
    timer: "normal",
    xpMultiplier: 1.5,
    description: "Стандартный режим, без подсказок",
  },
  pro: {
    id: "pro",
    label: "Профи",
    icon: "⚡",
    hints: false,
    steps: "branching",
    timer: "fast",
    xpMultiplier: 2.0,
    description: "Без подсказок, быстрый таймер, ветвящиеся решения",
  },
};

/**
 * Get current difficulty tier.
 * Defaults to "medium" if not set.
 * @returns {string} Tier ID (easy, medium, pro)
 */
export function getDifficultyTier() {
  const tier = localStorage.getItem(DIFFICULTY_KEY) || "medium";
  return TIERS[tier] ? tier : "medium";
}

/**
 * Set difficulty tier.
 * @param {string} tier - Tier ID (easy, medium, pro)
 */
export function setDifficultyTier(tier) {
  if (TIERS[tier]) {
    localStorage.setItem(DIFFICULTY_KEY, tier);
    document.dispatchEvent(new CustomEvent("phase58:difficultyChanged", { detail: { tier } }));
  }
}

/**
 * Get tier configuration object.
 * @param {string} [tier] - Tier ID, defaults to current
 * @returns {object} Tier config
 */
export function getTierConfig(tier) {
  tier = tier || getDifficultyTier();
  return TIERS[tier] || TIERS.medium;
}

/**
 * Get XP multiplier for current tier.
 * Easy: 1.0x, Medium: 1.5x, Pro: 2.0x
 * @param {string} [tier] - Tier ID, defaults to current
 * @returns {number}
 */
export function getXpMultiplier(tier) {
  return getTierConfig(tier).xpMultiplier;
}

/**
 * Check if hints are enabled for current tier.
 * @returns {boolean}
 */
export function hintsEnabled() {
  return getTierConfig().hints;
}

/**
 * Get timer duration for current tier.
 * @returns {string} Timer type (relaxed, normal, fast)
 */
export function getTimerType() {
  return getTierConfig().timer;
}

/**
 * Get step complexity for current tier.
 * @returns {string} Step type (fewer, standard, branching)
 */
export function getStepComplexity() {
  return getTierConfig().steps;
}

/**
 * Render difficulty selector UI.
 * @param {HTMLElement} container
 */
export function renderDifficultySelector(container) {
  if (!container) return;

  const current = getDifficultyTier();
  container.className = "p58-difficulty-selector";
  container.innerHTML = `
    <div class="p58-diff-label">Уровень сложности:</div>
    <div class="p58-diff-buttons">
      ${Object.values(TIERS).map(t => `
        <button 
          class="p58-diff-btn${current === t.id ? " p58-diff-active" : ""}"
          data-tier="${t.id}"
          title="${t.description}"
        >
          ${t.icon} ${t.label}
        </button>
      `).join("")}
    </div>
  `;

  // Wire buttons
  container.querySelectorAll(".p58-diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tier = btn.dataset.tier;
      setDifficultyTier(tier);
      
      // Update UI
      container.querySelectorAll(".p58-diff-btn").forEach(b => {
        b.classList.remove("p58-diff-active");
      });
      btn.classList.add("p58-diff-active");
    });
  });
}

/**
 * Initialize difficulty system.
 * Safe to call multiple times.
 */
export function initSimulationDifficulty() {
  try {
    document.dispatchEvent(new CustomEvent("phase58:difficultyReady"));
  } catch (e) {
    console.error("[Phase 5.8D] Difficulty init error:", e);
  }
}
