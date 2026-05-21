/**
 * Phase 5.8F — Parent Insight Preview
 * Increases subscription value by showing simulation analytics.
 * Tracks retry count, reaction speed, weak decisions, career fit hints.
 *
 * Exports: initSimulationParentInsights, renderSimulationInsights, trackSimulationMetric
 * Storage: kl_sim_insights (aggregated metrics)
 * Safe: pure ES module, read-only parent dashboard integration
 */

const INSIGHTS_KEY = "kl_sim_insights";

/**
 * Get simulation insights from localStorage.
 * @returns {object}
 */
function getInsights() {
  try {
    return JSON.parse(localStorage.getItem(INSIGHTS_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Save simulation insights to localStorage.
 * @param {object} insights
 */
function saveInsights(insights) {
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
}

/**
 * Track a simulation metric.
 * @param {string} simType - Simulation type (pilot, doctor, drone, cyber)
 * @param {string} metric - Metric name (retries, reactionTime, weakDecisions, etc.)
 * @param {number} value - Value to add/record
 */
export function trackSimulationMetric(simType, metric, value) {
  const insights = getInsights();
  
  if (!insights[simType]) {
    insights[simType] = {
      attempts: 0,
      retries: 0,
      reactionTimes: [],
      weakDecisions: 0,
      avgScore: 0,
      totalScore: 0,
      wins: 0,
    };
  }
  
  const sim = insights[simType];
  
  switch (metric) {
    case "attempt":
      sim.attempts++;
      break;
    case "retry":
      sim.retries++;
      break;
    case "reactionTime":
      sim.reactionTimes.push(value);
      break;
    case "weakDecision":
      sim.weakDecisions++;
      break;
    case "score":
      sim.totalScore += value;
      sim.avgScore = Math.round(sim.totalScore / sim.attempts);
      break;
    case "win":
      sim.wins++;
      break;
  }
  
  saveInsights(insights);
}

/**
 * Get simulation strengths (high accuracy, fast reaction, etc.).
 * @returns {array} Array of strength strings
 */
export function getSimulationStrengths() {
  const insights = getInsights();
  const strengths = [];
  
  Object.entries(insights).forEach(([simType, data]) => {
    if (data.attempts < 2) return; // Need at least 2 attempts
    
    const winRate = data.wins / data.attempts;
    if (winRate >= 0.8) {
      strengths.push(`Высокая точность в ${simType} (${Math.round(winRate * 100)}%)`);
    }
    
    if (data.reactionTimes.length > 0) {
      const avgReaction = Math.round(
        data.reactionTimes.reduce((a, b) => a + b, 0) / data.reactionTimes.length
      );
      if (avgReaction < 2000) {
        strengths.push(`Быстрая реакция в ${simType} (${avgReaction}мс)`);
      }
    }
  });
  
  return strengths;
}

/**
 * Get simulation growth areas (low accuracy, slow reaction, etc.).
 * @returns {array} Array of growth area strings
 */
export function getSimulationGrowthAreas() {
  const insights = getInsights();
  const areas = [];
  
  Object.entries(insights).forEach(([simType, data]) => {
    if (data.attempts < 2) return;
    
    const winRate = data.wins / data.attempts;
    if (winRate < 0.5) {
      areas.push(`Нужна практика в ${simType} (${Math.round(winRate * 100)}% побед)`);
    }
    
    if (data.weakDecisions > data.attempts * 0.3) {
      areas.push(`Слабые решения в ${simType} (${data.weakDecisions} ошибок)`);
    }
  });
  
  return areas;
}

/**
 * Get suggested career path based on simulation performance.
 * @returns {string} Career suggestion
 */
export function getSuggestedCareerPath() {
  const insights = getInsights();
  let bestSim = null;
  let bestWinRate = 0;
  
  Object.entries(insights).forEach(([simType, data]) => {
    if (data.attempts < 2) return;
    const winRate = data.wins / data.attempts;
    if (winRate > bestWinRate) {
      bestWinRate = winRate;
      bestSim = simType;
    }
  });
  
  const careerMap = {
    pilot: "✈️ Пилот дрона",
    doctor: "🏥 Врач",
    drone: "🚁 Инженер дронов",
    cyber: "🔐 Кибербезопасность",
  };
  
  return bestSim ? careerMap[bestSim] || "Исследователь" : "Исследователь";
}

/**
 * Render simulation insights into a container.
 * Shows strengths, growth areas, and career suggestion.
 * @param {HTMLElement} container
 */
export function renderSimulationInsights(container) {
  if (!container) return;

  const insights = getInsights();
  const totalAttempts = Object.values(insights).reduce((sum, s) => sum + (s.attempts || 0), 0);
  
  // Show empty state if not enough data
  if (totalAttempts < 2) {
    container.className = "p58-sim-insights";
    container.innerHTML = `
      <div class="p58-insights-empty">
        <div class="p58-insights-icon">📊</div>
        <div class="p58-insights-text">
          Пройди 2+ симуляции, чтобы увидеть аналитику
        </div>
      </div>
    `;
    return;
  }

  const strengths = getSimulationStrengths();
  const growthAreas = getSimulationGrowthAreas();
  const careerPath = getSuggestedCareerPath();

  container.className = "p58-sim-insights";
  container.innerHTML = `
    <div class="p58-insights-header">
      <div class="p58-insights-title">📊 Аналитика симуляций</div>
      <div class="p58-insights-subtitle">Основано на ${totalAttempts} попытках</div>
    </div>

    ${strengths.length ? `
      <div class="p58-insights-section">
        <div class="p58-insights-section-title">💪 Сильные стороны</div>
        <div class="p58-insights-list">
          ${strengths.map(s => `<div class="p58-insights-item">✅ ${s}</div>`).join("")}
        </div>
      </div>
    ` : ""}

    ${growthAreas.length ? `
      <div class="p58-insights-section">
        <div class="p58-insights-section-title">🌱 Области роста</div>
        <div class="p58-insights-list">
          ${growthAreas.map(a => `<div class="p58-insights-item">📈 ${a}</div>`).join("")}
        </div>
      </div>
    ` : ""}

    <div class="p58-insights-section">
      <div class="p58-insights-section-title">🎯 Рекомендуемая карьера</div>
      <div class="p58-insights-career">${careerPath}</div>
    </div>

    <div class="p58-insights-cta">
      <p class="p58-insights-cta-text">Хотите полную аналитику и персональный план развития?</p>
      <button class="p58-insights-cta-btn" id="p58-insights-upgrade-btn">
        🚀 Узнать о Premium
      </button>
    </div>
  `;

  // Upgrade button handler
  const upgradeBtn = container.querySelector("#p58-insights-upgrade-btn");
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("phase58:insightsUpgradeClick", {
        detail: { strengths, growthAreas, careerPath }
      }));
      upgradeBtn.textContent = "✅ Спасибо за интерес!";
      upgradeBtn.disabled = true;
    });
  }
}

/**
 * Initialize parent insights system.
 * Renders into #phase5-sim-insights if present on page.
 * Safe to call multiple times.
 */
export function initSimulationParentInsights() {
  try {
    const container = document.getElementById("phase5-sim-insights");
    if (container) {
      renderSimulationInsights(container);
    }
    document.dispatchEvent(new CustomEvent("phase58:parentInsightsReady"));
  } catch (e) {
    console.error("[Phase 5.8F] Parent Insights init error:", e);
  }
}
