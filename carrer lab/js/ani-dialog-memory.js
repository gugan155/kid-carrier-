/**
 * Phase 5.8A — Ani No-Repeat Dialogue Memory
 * Prevents Ani from repeating the same lines every 2nd/3rd visit.
 * Stores recent spoken dialogue keys and uses weighted random selection.
 *
 * Exports: initAniDialogMemory, getNextGreeting
 * Storage: kl_ani_recent_lines (max 5 entries)
 * Safe: pure ES module, no DOM pollution
 */

const RECENT_LINES_KEY = "kl_ani_recent_lines";
const MAX_RECENT = 5;

/**
 * Dialogue pool with keys and text.
 * Keys are used for deduplication; text is what Ani says.
 */
const DIALOGUE_POOL = [
  { key: "welcome_back", text: "Рад тебя видеть! Готов к новому вызову? 🎯" },
  { key: "retry_mission", text: "Твоя миссия ждёт! Давай попробуем ещё раз 🚀" },
  { key: "career_progress", text: "Ты уже близко к новой профессии! Продолжай 💪" },
  { key: "streak_push", text: "Твоя серия растёт! Не прерывай её 🔥" },
  { key: "great_job", text: "Отлично! Ты становишься лучше каждый день ⭐" },
  { key: "explore_more", text: "Исследуй новые профессии! Кто знает, что тебе понравится 🔭" },
  { key: "sim_ready", text: "Симуляция готова! Покажи, на что ты способен 🎮" },
  { key: "daily_lesson", text: "Не забудь про урок дня! Новые знания ждут 📚" },
];

/**
 * Get recent dialogue keys from localStorage.
 * @returns {string[]}
 */
function getRecentLines() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_LINES_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Save recent dialogue keys to localStorage.
 * @param {string[]} lines
 */
function saveRecentLines(lines) {
  localStorage.setItem(RECENT_LINES_KEY, JSON.stringify(lines.slice(-MAX_RECENT)));
}

/**
 * Add a dialogue key to recent history.
 * @param {string} key
 */
function recordLine(key) {
  const recent = getRecentLines();
  recent.push(key);
  saveRecentLines(recent);
}

/**
 * Select next greeting, avoiding recent lines.
 * Uses weighted random: lines not in recent pool get higher weight.
 * Falls back to full pool if all are exhausted.
 * @returns {string} Dialogue text
 */
export function getNextGreeting() {
  const recent = getRecentLines();
  
  // Filter pool: exclude recent lines
  let available = DIALOGUE_POOL.filter(d => !recent.includes(d.key));
  
  // Fallback: if all lines are recent, use full pool
  if (available.length === 0) {
    available = DIALOGUE_POOL;
  }
  
  // Weighted random: lines not in recent get 2x weight
  const weighted = [];
  available.forEach(d => {
    weighted.push(d);
    if (!recent.includes(d.key)) {
      weighted.push(d); // Double weight for non-recent
    }
  });
  
  const selected = weighted[Math.floor(Math.random() * weighted.length)];
  recordLine(selected.key);
  
  return selected.text;
}

/**
 * Initialize Ani dialogue memory.
 * Hooks into Ani's greeting system.
 * Safe to call multiple times.
 */
export function initAniDialogMemory() {
  try {
    // Dispatch event for script.js to wire up
    document.dispatchEvent(new CustomEvent("phase58:aniDialogMemoryReady"));
  } catch (e) {
    console.error("[Phase 5.8A] Ani Dialog Memory init error:", e);
  }
}
