/**
 * Phase 5.8.5 — Career Progression Unlock Logic
 * Manages career mastery levels, elite challenges, and progression unlocks.
 * Maps: Level 1 → Level 2 → Level 3 → Elite Challenge
 *
 * Exports: initCareerProgression, getCareerLevel, unlockCareerLevel,
 *          getEliteChallenge, completeEliteChallenge
 * Storage: kl_career_progression_* (per career)
 * Safe: pure ES module, additive only
 */

const CAREER_PROGRESSION_KEY = "kl_career_progression";

/**
 * Career progression definitions.
 * Each career has 3 levels + 1 elite challenge.
 */
const CAREER_LEVELS = {
  pilot: {
    name: "✈️ Пилот дрона",
    levels: [
      {
        level: 1,
        name: "Новичок",
        xpRequired: 0,
        badge: "🌱",
        description: "Основы управления дроном",
        unlocks: ["pilot_sim"],
      },
      {
        level: 2,
        name: "Опытный",
        xpRequired: 100,
        badge: "📈",
        description: "Продвинутые маневры",
        unlocks: ["pilot_advanced"],
      },
      {
        level: 3,
        name: "Эксперт",
        xpRequired: 250,
        badge: "⭐",
        description: "Профессиональные миссии",
        unlocks: ["pilot_expert"],
      },
    ],
    elite: {
      name: "Элитный пилот",
      xpRequired: 400,
      badge: "🏆",
      description: "Экстремальные условия",
      reward: 100,
    },
  },
  doctor: {
    name: "🏥 Врач",
    levels: [
      {
        level: 1,
        name: "Стажер",
        xpRequired: 0,
        badge: "🌱",
        description: "Основы диагностики",
        unlocks: ["doctor_sim"],
      },
      {
        level: 2,
        name: "Практикант",
        xpRequired: 100,
        badge: "📈",
        description: "Сложные случаи",
        unlocks: ["doctor_advanced"],
      },
      {
        level: 3,
        name: "Врач",
        xpRequired: 250,
        badge: "⭐",
        description: "Критические ситуации",
        unlocks: ["doctor_expert"],
      },
    ],
    elite: {
      name: "Главный врач",
      xpRequired: 400,
      badge: "🏆",
      description: "Редкие заболевания",
      reward: 100,
    },
  },
  drone: {
    name: "🚁 Инженер дронов",
    levels: [
      {
        level: 1,
        name: "Техник",
        xpRequired: 0,
        badge: "🌱",
        description: "Основы конструкции",
        unlocks: ["drone_sim"],
      },
      {
        level: 2,
        name: "Инженер",
        xpRequired: 100,
        badge: "📈",
        description: "Оптимизация систем",
        unlocks: ["drone_advanced"],
      },
      {
        level: 3,
        name: "Главный инженер",
        xpRequired: 250,
        badge: "⭐",
        description: "Инновационные проекты",
        unlocks: ["drone_expert"],
      },
    ],
    elite: {
      name: "Архитектор дронов",
      xpRequired: 400,
      badge: "🏆",
      description: "Проектирование с нуля",
      reward: 100,
    },
  },
  cyber: {
    name: "🔐 Кибер-защитник",
    levels: [
      {
        level: 1,
        name: "Аналитик",
        xpRequired: 0,
        badge: "🌱",
        description: "Основы безопасности",
        unlocks: ["cyber_sim"],
      },
      {
        level: 2,
        name: "Специалист",
        xpRequired: 100,
        badge: "📈",
        description: "Продвинутая защита",
        unlocks: ["cyber_advanced"],
      },
      {
        level: 3,
        name: "Эксперт",
        xpRequired: 250,
        badge: "⭐",
        description: "Критическая инфраструктура",
        unlocks: ["cyber_expert"],
      },
    ],
    elite: {
      name: "Главный защитник",
      xpRequired: 400,
      badge: "🏆",
      description: "Защита от APT",
      reward: 100,
    },
  },
};

/**
 * Get career progression data.
 * @returns {object}
 */
function getCareerProgressionData() {
  try {
    return JSON.parse(localStorage.getItem(CAREER_PROGRESSION_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Save career progression data.
 * @param {object} data
 */
function saveCareerProgressionData(data) {
  try {
    localStorage.setItem(CAREER_PROGRESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("[Phase 5.8.5] Save career progression error:", e);
  }
}

/**
 * Get current level for a career.
 * @param {string} careerType - Career type (pilot, doctor, drone, cyber)
 * @returns {number} Current level (1-3)
 */
export function getCareerLevel(careerType) {
  const data = getCareerProgressionData();
  return data[careerType]?.level || 1;
}

/**
 * Get career progression info.
 * @param {string} careerType - Career type
 * @returns {object} Career info
 */
export function getCareerInfo(careerType) {
  return CAREER_LEVELS[careerType] || null;
}

/**
 * Check if career level is unlocked.
 * @param {string} careerType - Career type
 * @param {number} level - Level to check (1-3)
 * @param {number} currentXp - Current XP
 * @returns {boolean}
 */
export function isCareerLevelUnlocked(careerType, level, currentXp) {
  const career = CAREER_LEVELS[careerType];
  if (!career) return false;
  
  const levelDef = career.levels.find(l => l.level === level);
  if (!levelDef) return false;
  
  return currentXp >= levelDef.xpRequired;
}

/**
 * Unlock next career level.
 * @param {string} careerType - Career type
 * @param {number} xpEarned - XP earned
 * @returns {object | null} Unlock info or null
 */
export function unlockCareerLevel(careerType, xpEarned) {
  const data = getCareerProgressionData();
  const career = CAREER_LEVELS[careerType];
  
  if (!career) return null;
  
  const currentLevel = data[careerType]?.level || 1;
  const currentXp = data[careerType]?.xp || 0;
  const newXp = currentXp + xpEarned;
  
  // Check if next level is unlocked
  const nextLevel = currentLevel + 1;
  const nextLevelDef = career.levels.find(l => l.level === nextLevel);
  
  if (nextLevelDef && newXp >= nextLevelDef.xpRequired && currentLevel < 3) {
    // Unlock next level
    data[careerType] = {
      level: nextLevel,
      xp: newXp,
      unlockedAt: Date.now(),
      badge: nextLevelDef.badge,
    };
    
    saveCareerProgressionData(data);
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent("phase585:careerLevelUnlocked", {
      detail: {
        careerType,
        level: nextLevel,
        levelDef: nextLevelDef,
        career,
      }
    }));
    
    return {
      careerType,
      level: nextLevel,
      levelDef,
      career,
    };
  }
  
  // Update XP
  if (!data[careerType]) {
    data[careerType] = { level: 1, xp: 0 };
  }
  data[careerType].xp = newXp;
  saveCareerProgressionData(data);
  
  return null;
}

/**
 * Check if elite challenge is unlocked.
 * @param {string} careerType - Career type
 * @param {number} currentXp - Current XP
 * @returns {boolean}
 */
export function isEliteChallengeUnlocked(careerType, currentXp) {
  const career = CAREER_LEVELS[careerType];
  if (!career) return false;
  
  return currentXp >= career.elite.xpRequired;
}

/**
 * Get elite challenge info.
 * @param {string} careerType - Career type
 * @returns {object} Elite challenge info
 */
export function getEliteChallenge(careerType) {
  const career = CAREER_LEVELS[careerType];
  if (!career) return null;
  
  return {
    careerType,
    ...career.elite,
    career,
  };
}

/**
 * Complete elite challenge.
 * @param {string} careerType - Career type
 * @param {boolean} won - Whether challenge was won
 * @returns {object} Completion info
 */
export function completeEliteChallenge(careerType, won) {
  const data = getCareerProgressionData();
  const elite = getEliteChallenge(careerType);
  
  if (!elite) return null;
  
  if (!data[careerType]) {
    data[careerType] = { level: 1, xp: 0 };
  }
  
  data[careerType].eliteCompleted = won;
  data[careerType].eliteCompletedAt = Date.now();
  
  saveCareerProgressionData(data);
  
  // Dispatch event
  document.dispatchEvent(new CustomEvent("phase585:eliteChallengeComplete", {
    detail: {
      careerType,
      won,
      reward: won ? elite.reward : 0,
      elite,
    }
  }));
  
  return {
    careerType,
    won,
    reward: won ? elite.reward : 0,
    elite,
  };
}

/**
 * Render career progression card.
 * @param {string} careerType - Career type
 * @param {HTMLElement} container
 * @param {number} currentXp - Current XP
 */
export function renderCareerProgressionCard(careerType, container, currentXp) {
  if (!container) return;

  const career = CAREER_LEVELS[careerType];
  if (!career) return;

  const currentLevel = getCareerLevel(careerType);
  const nextLevel = currentLevel + 1;
  const nextLevelDef = career.levels.find(l => l.level === nextLevel);
  
  const eliteUnlocked = isEliteChallengeUnlocked(careerType, currentXp);
  const elite = career.elite;
  
  let progressHtml = "";
  if (nextLevelDef) {
    const xpNeeded = nextLevelDef.xpRequired;
    const xpProgress = Math.min(currentXp, xpNeeded);
    const pct = Math.round((xpProgress / xpNeeded) * 100);
    
    progressHtml = `
      <div class="p585-progress-bar">
        <div class="p585-progress-fill" style="width: ${pct}%"></div>
      </div>
      <div class="p585-progress-text">
        ${xpProgress} / ${xpNeeded} XP до уровня ${nextLevel}
      </div>
    `;
  }

  container.className = "p585-career-progression-card";
  container.innerHTML = `
    <div class="p585-career-header">
      <div class="p585-career-title">${career.name}</div>
      <div class="p585-career-level">Уровень ${currentLevel}</div>
    </div>
    
    <div class="p585-level-badges">
      ${career.levels.map((l, i) => `
        <div class="p585-level-badge ${i < currentLevel ? "p585-completed" : i === currentLevel ? "p585-current" : ""}">
          <span class="p585-badge-icon">${l.badge}</span>
          <span class="p585-badge-name">${l.name}</span>
        </div>
      `).join("")}
    </div>
    
    ${progressHtml}
    
    ${eliteUnlocked ? `
      <div class="p585-elite-unlock">
        <div class="p585-elite-icon">${elite.badge}</div>
        <div class="p585-elite-text">
          <div class="p585-elite-name">${elite.name}</div>
          <div class="p585-elite-desc">${elite.description}</div>
        </div>
        <button class="p585-elite-btn" id="p585-elite-btn">Начать вызов</button>
      </div>
    ` : ""}
  `;

  // Wire elite button
  const eliteBtn = container.querySelector("#p585-elite-btn");
  if (eliteBtn) {
    eliteBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("phase585:eliteChallengeStart", {
        detail: { careerType }
      }));
    });
  }
}

/**
 * Initialize career progression system.
 * Safe to call multiple times.
 */
export function initCareerProgression() {
  try {
    // Listen for XP awards to check for level unlocks
    document.addEventListener("phase5:pointsAwarded", (e) => {
      const xpEarned = e.detail?.points || 0;
      // Try to unlock levels for each career
      ["pilot", "doctor", "drone", "cyber"].forEach(career => {
        unlockCareerLevel(career, xpEarned);
      });
    });

    document.dispatchEvent(new CustomEvent("phase585:careerProgressionReady"));
  } catch (e) {
    console.error("[Phase 5.8.5] Career progression init error:", e);
  }
}
