/**
 * Phase 5.8.5 — Simulation Multi-Stage Completion
 * Extends simulations with persistent multi-stage flow, branching events,
 * and dynamic coaching feedback at each stage.
 *
 * Exports: initMultiStageFlow, getSimulationStage, saveSimulationProgress, 
 *          loadSimulationProgress, resetSimulationProgress
 * Storage: kl_sim_progress_* (per simulation)
 * Safe: pure ES module, additive only
 */

const STAGE_STORAGE_PREFIX = "kl_sim_progress_";

/**
 * Multi-stage flow definitions for each simulation.
 * Each stage has: id, name, description, difficulty, coaching hints.
 */
const MULTI_STAGE_FLOWS = {
  pilot: {
    stages: [
      { id: "intro", name: "Intro", type: "briefing", duration: 30 },
      { id: "prep", name: "Preparation", type: "preparation", duration: 60 },
      { id: "flight", name: "Flight", type: "challenge", duration: 120 },
      { id: "event", name: "Emergency", type: "event", duration: 90 },
      { id: "landing", name: "Landing", type: "decision", duration: 60 },
      { id: "debrief", name: "Debrief", type: "debrief", duration: 30 },
    ],
  },
  doctor: {
    stages: [
      { id: "intro", name: "Intro", type: "briefing", duration: 30 },
      { id: "exam", name: "Examination", type: "preparation", duration: 90 },
      { id: "diagnosis", name: "Diagnosis", type: "challenge", duration: 120 },
      { id: "complication", name: "Complication", type: "event", duration: 90 },
      { id: "treatment", name: "Treatment", type: "decision", duration: 60 },
      { id: "followup", name: "Follow-up", type: "debrief", duration: 30 },
    ],
  },
  drone: {
    stages: [
      { id: "intro", name: "Intro", type: "briefing", duration: 30 },
      { id: "preflight", name: "Pre-flight", type: "preparation", duration: 60 },
      { id: "mission", name: "Mission", type: "challenge", duration: 120 },
      { id: "obstacle", name: "Obstacle", type: "event", duration: 90 },
      { id: "landing", name: "Landing", type: "decision", duration: 60 },
      { id: "analysis", name: "Analysis", type: "debrief", duration: 30 },
    ],
  },
  cyber: {
    stages: [
      { id: "intro", name: "Intro", type: "briefing", duration: 30 },
      { id: "scan", name: "Scan", type: "preparation", duration: 60 },
      { id: "threat", name: "Threat", type: "challenge", duration: 120 },
      { id: "attack", name: "Attack", type: "event", duration: 90 },
      { id: "response", name: "Response", type: "decision", duration: 60 },
      { id: "report", name: "Report", type: "debrief", duration: 30 },
    ],
  },
};

/**
 * Get multi-stage flow for a simulation.
 * @param {string} simType - Simulation type (pilot, doctor, drone, cyber)
 * @returns {object} Flow definition
 */
export function getSimulationFlow(simType) {
  return MULTI_STAGE_FLOWS[simType] || null;
}

/**
 * Get current stage progress for a simulation.
 * @param {string} simType - Simulation type
 * @returns {object} Progress object
 */
export function loadSimulationProgress(simType) {
  try {
    const key = STAGE_STORAGE_PREFIX + simType;
    const data = JSON.parse(localStorage.getItem(key)) || {};
    return {
      simType,
      currentStage: data.currentStage || 0,
      completedStages: data.completedStages || [],
      stageScores: data.stageScores || {},
      totalScore: data.totalScore || 0,
      startTime: data.startTime || Date.now(),
      events: data.events || [],
    };
  } catch (e) {
    console.error("[Phase 5.8.5] Load progress error:", e);
    return {
      simType,
      currentStage: 0,
      completedStages: [],
      stageScores: {},
      totalScore: 0,
      startTime: Date.now(),
      events: [],
    };
  }
}

/**
 * Save simulation progress to localStorage.
 * @param {string} simType - Simulation type
 * @param {object} progress - Progress object
 */
export function saveSimulationProgress(simType, progress) {
  try {
    const key = STAGE_STORAGE_PREFIX + simType;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.error("[Phase 5.8.5] Save progress error:", e);
  }
}

/**
 * Reset simulation progress.
 * @param {string} simType - Simulation type
 */
export function resetSimulationProgress(simType) {
  try {
    const key = STAGE_STORAGE_PREFIX + simType;
    localStorage.removeItem(key);
  } catch (e) {
    console.error("[Phase 5.8.5] Reset progress error:", e);
  }
}

/**
 * Get current stage object.
 * @param {string} simType - Simulation type
 * @param {number} stageIdx - Stage index
 * @returns {object} Stage object
 */
export function getSimulationStage(simType, stageIdx) {
  const flow = getSimulationFlow(simType);
  if (!flow || stageIdx < 0 || stageIdx >= flow.stages.length) return null;
  return flow.stages[stageIdx];
}

/**
 * Record stage completion with score.
 * @param {string} simType - Simulation type
 * @param {number} stageIdx - Stage index
 * @param {number} score - Stage score
 * @param {object} [opts] - Options
 */
export function completeSimulationStage(simType, stageIdx, score, opts = {}) {
  const progress = loadSimulationProgress(simType);
  const stage = getSimulationStage(simType, stageIdx);
  
  if (!stage) return;
  
  // Record stage completion
  if (!progress.completedStages.includes(stageIdx)) {
    progress.completedStages.push(stageIdx);
  }
  
  // Record score
  progress.stageScores[stage.id] = score;
  progress.totalScore += score;
  
  // Move to next stage
  progress.currentStage = stageIdx + 1;
  
  // Record event if any
  if (opts.event) {
    progress.events.push({
      stageId: stage.id,
      eventId: opts.event.id,
      timestamp: Date.now(),
    });
  }
  
  saveSimulationProgress(simType, progress);
  
  // Dispatch event for tracking
  document.dispatchEvent(new CustomEvent("phase585:stageComplete", {
    detail: { simType, stageIdx, stage, score, progress }
  }));
}

/**
 * Get stage completion percentage.
 * @param {string} simType - Simulation type
 * @returns {number} Percentage (0-100)
 */
export function getSimulationCompletion(simType) {
  const progress = loadSimulationProgress(simType);
  const flow = getSimulationFlow(simType);
  if (!flow) return 0;
  return Math.round((progress.completedStages.length / flow.stages.length) * 100);
}

/**
 * Get stage-specific coaching feedback.
 * @param {string} simType - Simulation type
 * @param {string} stageId - Stage ID
 * @param {boolean} correct - Whether answer was correct
 * @returns {string} Coaching message
 */
export function getStageCoachingFeedback(simType, stageId, correct) {
  const coachingMap = {
    pilot: {
      prep: correct ? "✅ Отличная подготовка! Ты готов к полёту." : "💡 Проверь все системы перед взлётом!",
      flight: correct ? "✅ Плавный полёт! Ты контролируешь ситуацию." : "💡 Следи за высотой и скоростью!",
      event: correct ? "✅ Отличная реакция на чрезвычайную ситуацию!" : "💡 Сохраняй спокойствие в кризисе!",
      landing: correct ? "✅ Идеальная посадка! Профессионально!" : "💡 Плавное снижение — ключ к безопасности!",
    },
    doctor: {
      exam: correct ? "✅ Тщательный осмотр! Ты внимателен." : "💡 Не пропускай важные симптомы!",
      diagnosis: correct ? "✅ Правильный диагноз! Ты думаешь логично." : "💡 Анализируй все симптомы вместе!",
      complication: correct ? "✅ Быстрая реакция на осложнение!" : "💡 Всегда готовься к неожиданному!",
      treatment: correct ? "✅ Правильное лечение! Пациент выздоровеет." : "💡 Выбирай лечение на основе диагноза!",
    },
    drone: {
      preflight: correct ? "✅ Отличная подготовка! Дрон готов." : "💡 Проверь батарею и датчики!",
      mission: correct ? "✅ Точное выполнение миссии!" : "💡 Следи за маршрутом!",
      obstacle: correct ? "✅ Отличное избежание препятствия!" : "💡 Сканируй окружение!",
      landing: correct ? "✅ Безопасная посадка! Отлично!" : "💡 Плавное снижение важно!",
    },
    cyber: {
      scan: correct ? "✅ Хороший скан системы!" : "💡 Проверь все уязвимости!",
      threat: correct ? "✅ Угроза обнаружена! Ты внимателен." : "💡 Ищи признаки атак!",
      attack: correct ? "✅ Быстрая защита! Отлично!" : "💡 Реагируй быстро на атаки!",
      response: correct ? "✅ Правильный ответ! Система защищена." : "💡 Выбирай правильную защиту!",
    },
  };
  
  return coachingMap[simType]?.[stageId] || (correct ? "✅ Правильно!" : "💡 Попробуй ещё раз!");
}

/**
 * Initialize multi-stage system.
 * Safe to call multiple times.
 */
export function initMultiStageFlow() {
  try {
    document.dispatchEvent(new CustomEvent("phase585:multiStageReady"));
  } catch (e) {
    console.error("[Phase 5.8.5] Multi-stage init error:", e);
  }
}
