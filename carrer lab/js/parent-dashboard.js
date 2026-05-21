/**
 * Phase 5.5 — Parent Dashboard (Lite)
 * Displays child name, streak, XP, badges, weakest area.
 * Optional upgrade CTA.
 *
 * Exports: initParentDashboard, renderParentDashboard
 * Storage: reads kl_progress, kl_name (existing keys, read-only)
 * Safe:    additive DOM, no ID conflicts, no writes to existing keys
 */
import { escHtml } from "./utils.js";
import { getProgress, getLevelInfo, BADGE_DEFS } from "./progress.js";

/**
 * Render parent dashboard into a container element.
 * @param {HTMLElement} container
 * @param {{showUpgradeCta?: boolean}} [opts]
 */
export function renderParentDashboard(container, opts = {}) {
  if (!container) return;

  const p    = getProgress();
  const name = localStorage.getItem("kl_name") || "Ребёнок";
  const lv   = getLevelInfo(p.points);

  // Weakest area
  const weakEntries = Object.entries(p.weakAreas || {}).sort((a, b) => b[1] - a[1]);
  const weakArea    = weakEntries[0]?.[0] || null;

  // Earned badges
  const earnedBadges = BADGE_DEFS.filter(b => (p.badges || []).includes(b.id));

  // Lessons completed count
  const lessonsCount = Object.keys(p.lessonsCompleted || {}).length;

  container.className = "phase5-parent-dash";
  container.innerHTML = `
    <div class="phase5-pd-header">
      <div class="phase5-pd-avatar">👤</div>
      <div class="phase5-pd-info">
        <div class="phase5-pd-name">${escHtml(name)}</div>
        <div class="phase5-pd-level">${lv.icon} ${escHtml(lv.label)}</div>
      </div>
    </div>

    <div class="phase5-pd-stats">
      <div class="phase5-pd-stat">
        <span class="phase5-pd-stat-icon">⭐</span>
        <span class="phase5-pd-stat-val">${p.points}</span>
        <span class="phase5-pd-stat-label">XP</span>
      </div>
      <div class="phase5-pd-stat">
        <span class="phase5-pd-stat-icon">🔥</span>
        <span class="phase5-pd-stat-val">${p.streak}</span>
        <span class="phase5-pd-stat-label">Серия</span>
      </div>
      <div class="phase5-pd-stat">
        <span class="phase5-pd-stat-icon">📖</span>
        <span class="phase5-pd-stat-val">${lessonsCount}</span>
        <span class="phase5-pd-stat-label">Уроков</span>
      </div>
      <div class="phase5-pd-stat">
        <span class="phase5-pd-stat-icon">🏆</span>
        <span class="phase5-pd-stat-val">${earnedBadges.length}</span>
        <span class="phase5-pd-stat-label">Значков</span>
      </div>
    </div>

    ${earnedBadges.length ? `
      <div class="phase5-pd-badges">
        <div class="phase5-pd-section-label">Значки</div>
        <div class="phase5-pd-badge-row">
          ${earnedBadges.map(b => `
            <span class="phase5-pd-badge" title="${escHtml(b.label)}">${b.emoji}</span>
          `).join("")}
        </div>
      </div>` : ""}

    ${weakArea ? `
      <div class="phase5-pd-weak">
        <div class="phase5-pd-section-label">Слабая тема</div>
        <div class="phase5-pd-weak-area">
          <span>⚠️</span>
          <span>${escHtml(weakArea)}</span>
          <a href="learn.html" class="phase5-pd-weak-link">Потренироваться →</a>
        </div>
      </div>` : ""}

    ${opts.showUpgradeCta !== false ? `
      <div class="phase5-pd-cta">
        <p class="phase5-pd-cta-text">Хотите расширенную аналитику и персональный план?</p>
        <button class="phase5-pd-cta-btn" id="phase5-upgrade-btn">
          🚀 Узнать о Premium
        </button>
      </div>` : ""}
  `;

  // Upgrade CTA handler
  const upgradeBtn = container.querySelector("#phase5-upgrade-btn");
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      // Hook: dispatch custom event for future subscription integration
      document.dispatchEvent(new CustomEvent("phase5:upgradeClick", { detail: { name, points: p.points } }));
      upgradeBtn.textContent = "✅ Спасибо за интерес!";
      upgradeBtn.disabled = true;
    });
  }
}

/**
 * Initialize parent dashboard.
 * Renders into #phase5-parent-dashboard if present on page.
 */
export function initParentDashboard() {
  const container = document.getElementById("phase5-parent-dashboard");
  if (!container) return;
  renderParentDashboard(container, { showUpgradeCta: true });
}
