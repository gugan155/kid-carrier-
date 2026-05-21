/**
 * Phase 5.8.5 — Parent Dashboard Intelligence v2
 * Extends parent insights with weekly trends, performance graphs,
 * weak skill timeline, and career recommendations.
 *
 * Exports: initParentInsightsV2, renderWeeklyTrends, renderPerformanceGraph,
 *          renderWeakSkillTimeline, getSuggestedNextCareer
 * Storage: kl_parent_insights_v2_* (aggregated analytics)
 * Safe: pure ES module, additive only
 */

const INSIGHTS_V2_KEY = "kl_parent_insights_v2";
const WEEKLY_HISTORY_KEY = "kl_weekly_history";

/**
 * Get or initialize parent insights v2 data.
 * @returns {object}
 */
function getInsightsV2() {
  try {
    return JSON.parse(localStorage.getItem(INSIGHTS_V2_KEY)) || {
      weeklyGrowth: [],
      careerPerformance: {},
      weakSkillTimeline: [],
      lastUpdated: Date.now(),
    };
  } catch {
    return {
      weeklyGrowth: [],
      careerPerformance: {},
      weakSkillTimeline: [],
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Save insights v2 data.
 * @param {object} data
 */
function saveInsightsV2(data) {
  try {
    localStorage.setItem(INSIGHTS_V2_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[Phase 5.8.5] Save insights v2 error:", e);
  }
}

/**
 * Track weekly growth (called on mission/simulation completion).
 * @param {number} pointsGained - Points earned this session
 */
export function trackWeeklyGrowth(pointsGained) {
  const data = getInsightsV2();
  const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  // Find or create today's entry
  let todayEntry = data.weeklyGrowth.find(e => e.day === today);
  if (!todayEntry) {
    todayEntry = { day: today, points: 0, activities: 0 };
    data.weeklyGrowth.push(todayEntry);
  }
  
  todayEntry.points += pointsGained;
  todayEntry.activities++;
  
  // Keep only last 30 days
  data.weeklyGrowth = data.weeklyGrowth.slice(-30);
  data.lastUpdated = Date.now();
  
  saveInsightsV2(data);
}

/**
 * Track career-specific performance.
 * @param {string} careerType - Career type (pilot, doctor, drone, cyber)
 * @param {number} score - Score achieved
 * @param {boolean} won - Whether simulation was won
 */
export function trackCareerPerformance(careerType, score, won) {
  const data = getInsightsV2();
  
  if (!data.careerPerformance[careerType]) {
    data.careerPerformance[careerType] = {
      attempts: 0,
      wins: 0,
      totalScore: 0,
      avgScore: 0,
      trend: [],
    };
  }
  
  const career = data.careerPerformance[careerType];
  career.attempts++;
  if (won) career.wins++;
  career.totalScore += score;
  career.avgScore = Math.round(career.totalScore / career.attempts);
  
  // Track trend (last 10 attempts)
  career.trend.push(score);
  if (career.trend.length > 10) career.trend.shift();
  
  data.lastUpdated = Date.now();
  saveInsightsV2(data);
}

/**
 * Track weak skill with timestamp.
 * @param {string} skill - Skill name
 */
export function trackWeakSkill(skill) {
  const data = getInsightsV2();
  
  const entry = {
    skill,
    timestamp: Date.now(),
    count: 1,
  };
  
  // Check if skill already in timeline
  const existing = data.weakSkillTimeline.find(e => e.skill === skill);
  if (existing) {
    existing.count++;
    existing.timestamp = Date.now();
  } else {
    data.weakSkillTimeline.push(entry);
  }
  
  // Keep only top 10 weak skills
  data.weakSkillTimeline.sort((a, b) => b.count - a.count);
  data.weakSkillTimeline = data.weakSkillTimeline.slice(0, 10);
  
  data.lastUpdated = Date.now();
  saveInsightsV2(data);
}

/**
 * Render weekly growth chart.
 * @param {HTMLElement} container
 */
export function renderWeeklyTrends(container) {
  if (!container) return;

  const data = getInsightsV2();
  const growth = data.weeklyGrowth.slice(-7); // Last 7 days
  
  if (growth.length === 0) {
    container.innerHTML = `
      <div class="p585-empty-state">
        <div class="p585-empty-icon">📊</div>
        <div class="p585-empty-text">Нет данных за неделю. Начни с миссии!</div>
      </div>
    `;
    return;
  }

  const maxPoints = Math.max(...growth.map(g => g.points), 1);
  const bars = growth.map((g, i) => {
    const pct = (g.points / maxPoints) * 100;
    const dayName = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i % 7];
    return `
      <div class="p585-bar-item">
        <div class="p585-bar-label">${dayName}</div>
        <div class="p585-bar-container">
          <div class="p585-bar-fill" style="height: ${pct}%"></div>
        </div>
        <div class="p585-bar-value">${g.points}pt</div>
      </div>
    `;
  }).join("");

  container.className = "p585-weekly-trends";
  container.innerHTML = `
    <div class="p585-section-title">📈 Еженедельный рост</div>
    <div class="p585-bars-grid">
      ${bars}
    </div>
  `;
}

/**
 * Render career performance graph.
 * @param {HTMLElement} container
 */
export function renderPerformanceGraph(container) {
  if (!container) return;

  const data = getInsightsV2();
  const careers = Object.entries(data.careerPerformance);
  
  if (careers.length === 0) {
    container.innerHTML = `
      <div class="p585-empty-state">
        <div class="p585-empty-icon">🎯</div>
        <div class="p585-empty-text">Пройди симуляцию, чтобы увидеть результаты</div>
      </div>
    `;
    return;
  }

  const careerMap = {
    pilot: "✈️ Пилот",
    doctor: "🏥 Врач",
    drone: "🚁 Дрон",
    cyber: "🔐 Кибер",
  };

  const cards = careers.map(([type, stats]) => {
    const winRate = Math.round((stats.wins / stats.attempts) * 100);
    const trend = stats.trend.length > 0 ? stats.trend[stats.trend.length - 1] : 0;
    const improving = stats.trend.length > 1 && trend > stats.trend[stats.trend.length - 2];
    
    return `
      <div class="p585-career-card">
        <div class="p585-career-header">
          <span class="p585-career-name">${careerMap[type] || type}</span>
          <span class="p585-career-winrate">${winRate}% побед</span>
        </div>
        <div class="p585-career-stats">
          <div class="p585-stat">
            <span class="p585-stat-label">Попыток</span>
            <span class="p585-stat-value">${stats.attempts}</span>
          </div>
          <div class="p585-stat">
            <span class="p585-stat-label">Средний балл</span>
            <span class="p585-stat-value">${stats.avgScore}</span>
          </div>
          <div class="p585-stat">
            <span class="p585-stat-label">Тренд</span>
            <span class="p585-stat-value ${improving ? "p585-improving" : ""}">
              ${improving ? "📈" : "📉"} ${trend}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.className = "p585-performance-graph";
  container.innerHTML = `
    <div class="p585-section-title">🎯 Результаты по карьерам</div>
    <div class="p585-careers-grid">
      ${cards}
    </div>
  `;
}

/**
 * Render weak skill timeline.
 * @param {HTMLElement} container
 */
export function renderWeakSkillTimeline(container) {
  if (!container) return;

  const data = getInsightsV2();
  const skills = data.weakSkillTimeline;
  
  if (skills.length === 0) {
    container.innerHTML = `
      <div class="p585-empty-state">
        <div class="p585-empty-icon">💪</div>
        <div class="p585-empty-text">Отличная работа! Нет слабых навыков</div>
      </div>
    `;
    return;
  }

  const items = skills.map((s, i) => {
    const daysAgo = Math.floor((Date.now() - s.timestamp) / (1000 * 60 * 60 * 24));
    const timeStr = daysAgo === 0 ? "Сегодня" : `${daysAgo}д назад`;
    
    return `
      <div class="p585-timeline-item">
        <div class="p585-timeline-dot"></div>
        <div class="p585-timeline-content">
          <div class="p585-timeline-skill">${s.skill}</div>
          <div class="p585-timeline-meta">
            <span class="p585-timeline-count">${s.count} ошибок</span>
            <span class="p585-timeline-time">${timeStr}</span>
          </div>
        </div>
        <a href="learn.html" class="p585-timeline-link">Потренироваться →</a>
      </div>
    `;
  }).join("");

  container.className = "p585-weak-skill-timeline";
  container.innerHTML = `
    <div class="p585-section-title">🌱 Области для развития</div>
    <div class="p585-timeline">
      ${items}
    </div>
  `;
}

/**
 * Get suggested next career based on performance.
 * @returns {object} Suggestion object
 */
export function getSuggestedNextCareer() {
  const data = getInsightsV2();
  const careers = Object.entries(data.careerPerformance);
  
  if (careers.length === 0) {
    return {
      career: "pilot",
      reason: "Начни с пилота дрона — это отличное введение!",
      icon: "✈️",
    };
  }

  // Find career with lowest win rate
  let weakestCareer = null;
  let lowestWinRate = 100;
  
  careers.forEach(([type, stats]) => {
    const winRate = (stats.wins / stats.attempts) * 100;
    if (winRate < lowestWinRate) {
      lowestWinRate = winRate;
      weakestCareer = type;
    }
  });

  const careerMap = {
    pilot: { icon: "✈️", name: "Пилот дрона" },
    doctor: { icon: "🏥", name: "Врач" },
    drone: { icon: "🚁", name: "Инженер дронов" },
    cyber: { icon: "🔐", name: "Кибер-защитник" },
  };

  const career = careerMap[weakestCareer];
  return {
    career: weakestCareer,
    reason: `Потренируйся в ${career.name} — это поможет улучшить навыки!`,
    icon: career.icon,
  };
}

/**
 * Render full parent insights v2 dashboard.
 * @param {HTMLElement} container
 */
export function renderParentInsightsV2(container) {
  if (!container) return;

  container.className = "p585-parent-insights-v2";
  container.innerHTML = `
    <div class="p585-insights-header">
      <h2 class="p585-insights-title">📊 Аналитика развития</h2>
      <p class="p585-insights-subtitle">Полный обзор прогресса ребёнка</p>
    </div>
    
    <div class="p585-insights-section" id="p585-weekly"></div>
    <div class="p585-insights-section" id="p585-performance"></div>
    <div class="p585-insights-section" id="p585-skills"></div>
    
    <div class="p585-insights-cta">
      <p class="p585-cta-text">Хотите расширенную аналитику и персональный план развития?</p>
      <button class="p585-cta-btn" id="p585-upgrade-btn">🚀 Узнать о Premium</button>
    </div>
  `;

  // Render sub-sections
  renderWeeklyTrends(container.querySelector("#p585-weekly"));
  renderPerformanceGraph(container.querySelector("#p585-performance"));
  renderWeakSkillTimeline(container.querySelector("#p585-skills"));

  // Wire upgrade button
  const upgradeBtn = container.querySelector("#p585-upgrade-btn");
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("phase585:upgradeClick"));
      upgradeBtn.textContent = "✅ Спасибо за интерес!";
      upgradeBtn.disabled = true;
    });
  }
}

/**
 * Initialize parent insights v2.
 * Safe to call multiple times.
 */
export function initParentInsightsV2() {
  try {
    document.dispatchEvent(new CustomEvent("phase585:parentInsightsV2Ready"));
  } catch (e) {
    console.error("[Phase 5.8.5] Parent insights v2 init error:", e);
  }
}
