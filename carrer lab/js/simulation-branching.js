/**
 * Phase 5.8E — Branching Micro Scenarios
 * Makes simulations feel real and replayable.
 * Each simulation gets 2-3 random micro events that affect outcome.
 *
 * Exports: initSimulationBranching, getRandomEvent, applyEventEffect
 * Storage: kl_sim_events (session-based, cleared on new sim)
 * Safe: pure ES module, stateless event generation
 */

/**
 * Micro events database by simulation type.
 * Each event has: id, name, description, difficulty, effect on score/time.
 */
const EVENTS_DB = {
  pilot: [
    {
      id: "runway_issue",
      name: "Проблема с взлётной полосой",
      desc: "Часть взлётной полосы закрыта! Нужно выбрать альтернативный маршрут.",
      difficulty: "medium",
      scoreEffect: -10,
      timeEffect: 15,
    },
    {
      id: "passenger_panic",
      name: "Паника пассажира",
      desc: "Один из пассажиров нервничает. Нужно его успокоить перед взлётом.",
      difficulty: "easy",
      scoreEffect: -5,
      timeEffect: 10,
    },
    {
      id: "weather_change",
      name: "Изменение погоды",
      desc: "Внезапно появились грозовые облака! Нужно пересчитать маршрут.",
      difficulty: "hard",
      scoreEffect: -15,
      timeEffect: 20,
    },
    {
      id: "engine_warning",
      name: "Предупреждение двигателя",
      desc: "Датчик показывает аномалию. Нужно провести диагностику.",
      difficulty: "hard",
      scoreEffect: -20,
      timeEffect: 25,
    },
  ],
  doctor: [
    {
      id: "allergy_conflict",
      name: "Конфликт аллергии",
      desc: "Пациент аллергичен на стандартное лекарство! Нужно найти альтернативу.",
      difficulty: "hard",
      scoreEffect: -15,
      timeEffect: 10,
    },
    {
      id: "emergency_symptom",
      name: "Экстренный симптом",
      desc: "Появился новый опасный симптом! Нужно срочно переоценить диагноз.",
      difficulty: "hard",
      scoreEffect: -20,
      timeEffect: 15,
    },
    {
      id: "time_sensitive",
      name: "Срочный диагноз",
      desc: "Состояние пациента ухудшается. Нужно быстро принять решение!",
      difficulty: "hard",
      scoreEffect: -10,
      timeEffect: 5,
    },
    {
      id: "medication_interaction",
      name: "Взаимодействие лекарств",
      desc: "Пациент уже принимает другое лекарство. Нужно проверить совместимость.",
      difficulty: "medium",
      scoreEffect: -10,
      timeEffect: 8,
    },
  ],
  drone: [
    {
      id: "wind_burst",
      name: "Порыв ветра",
      desc: "Неожиданный порыв ветра! Нужно стабилизировать дрон.",
      difficulty: "medium",
      scoreEffect: -10,
      timeEffect: 5,
    },
    {
      id: "obstacle_move",
      name: "Движущееся препятствие",
      desc: "Препятствие переместилось! Нужно пересчитать траекторию полёта.",
      difficulty: "hard",
      scoreEffect: -15,
      timeEffect: 10,
    },
    {
      id: "battery_drain",
      name: "Утечка батареи",
      desc: "Батарея разряжается быстрее, чем ожидалось! Нужно ускориться.",
      difficulty: "hard",
      scoreEffect: -20,
      timeEffect: 0,
    },
    {
      id: "signal_loss",
      name: "Потеря сигнала",
      desc: "Сигнал управления прерывается! Дрон переходит в автопилот.",
      difficulty: "hard",
      scoreEffect: -25,
      timeEffect: 15,
    },
  ],
  cyber: [
    {
      id: "malware_detected",
      name: "Обнаружена вредоносная программа",
      desc: "Антивирус обнаружил угрозу! Нужно срочно её удалить.",
      difficulty: "hard",
      scoreEffect: -20,
      timeEffect: 10,
    },
    {
      id: "phishing_attempt",
      name: "Попытка фишинга",
      desc: "Подозрительное письмо в почте! Нужно определить, это фишинг или нет.",
      difficulty: "medium",
      scoreEffect: -10,
      timeEffect: 5,
    },
    {
      id: "ddos_attack",
      name: "DDoS атака",
      desc: "Сервер подвергается DDoS атаке! Нужно активировать защиту.",
      difficulty: "hard",
      scoreEffect: -25,
      timeEffect: 15,
    },
    {
      id: "zero_day",
      name: "Уязвимость нулевого дня",
      desc: "Обнаружена неизвестная уязвимость! Нужно срочно обновить систему.",
      difficulty: "hard",
      scoreEffect: -30,
      timeEffect: 20,
    },
  ],
};

/**
 * Get random events for a simulation.
 * Returns 2-3 random events from the pool.
 * @param {string} simType - Simulation type (pilot, doctor, drone, cyber)
 * @returns {array} Array of event objects
 */
export function getRandomEvents(simType) {
  const pool = EVENTS_DB[simType] || [];
  if (pool.length === 0) return [];

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  
  // Pick 2-3 random events
  const count = Math.random() < 0.5 ? 2 : 3;
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Get a single random event.
 * @param {string} simType - Simulation type
 * @returns {object | null} Event object or null
 */
export function getRandomEvent(simType) {
  const events = getRandomEvents(simType);
  return events.length > 0 ? events[0] : null;
}

/**
 * Apply event effect to score and time.
 * @param {object} event - Event object
 * @returns {{scoreEffect: number, timeEffect: number}}
 */
export function applyEventEffect(event) {
  if (!event) return { scoreEffect: 0, timeEffect: 0 };
  return {
    scoreEffect: event.scoreEffect || 0,
    timeEffect: event.timeEffect || 0,
  };
}

/**
 * Display event notification to user.
 * @param {object} event - Event object
 */
export function showEventNotification(event) {
  if (!event) return;

  try {
    const notif = document.createElement("div");
    notif.className = "p58-event-notif";
    notif.innerHTML = `
      <div class="p58-event-icon">⚠️</div>
      <div class="p58-event-content">
        <div class="p58-event-name">${event.name}</div>
        <div class="p58-event-desc">${event.desc}</div>
      </div>
    `;
    
    document.body.appendChild(notif);
    
    // Animate in
    setTimeout(() => notif.classList.add("p58-event-show"), 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      notif.classList.remove("p58-event-show");
      setTimeout(() => notif.remove(), 300);
    }, 4000);
    
  } catch (e) {
    console.error("[Phase 5.8E] Event notification error:", e);
  }
}

/**
 * Initialize branching scenario system.
 * Safe to call multiple times.
 */
export function initSimulationBranching() {
  try {
    document.dispatchEvent(new CustomEvent("phase58:branchingReady"));
  } catch (e) {
    console.error("[Phase 5.8E] Branching init error:", e);
  }
}
