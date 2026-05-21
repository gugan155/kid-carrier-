/**
 * Phase 5.6 — Ani Memory Layer
 * Persists: weakest skills, favorite career, streak, last mission.
 * Drives personalized Ani speech on page load.
 *
 * Storage keys (all namespaced kl_ani_*):
 *   kl_ani_weak_skill    — string: weakest skill category
 *   kl_ani_fav_career    — string: most-visited career id
 *   kl_ani_last_mission  — string: last mission id attempted
 *   kl_ani_visit_counts  — JSON: { [careerId]: number }
 *   kl_ani_greeted_day   — number: dayOfYear of last personalized greeting
 *
 * Exports: initAniMemory, recordCareerVisit, recordMissionAttempt,
 *          getAniMemory, buildPersonalizedGreeting
 * Safe:    read-only access to existing kl_progress, no overwrites
 */
import { dayOfYear } from "./utils.js";
import { getProgress } from "./progress.js";
import { aniSay, aniWave, aniThinkThenSay } from "./ani.js";

/* ── Keys ── */
const K = {
  weakSkill:    "kl_ani_weak_skill",
  favCareer:    "kl_ani_fav_career",
  lastMission:  "kl_ani_last_mission",
  visitCounts:  "kl_ani_visit_counts",
  greetedDay:   "kl_ani_greeted_day",
};

/* ── Read / Write helpers ── */
function get(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function set(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ── Public API ── */

/**
 * Record a career page visit. Updates visit counts + favorite career.
 * @param {string} careerId - e.g. "drone", "cyber", "space"
 */
export function recordCareerVisit(careerId) {
  if (!careerId) return;
  const counts = get(K.visitCounts, {});
  counts[careerId] = (counts[careerId] || 0) + 1;
  set(K.visitCounts, counts);

  // Update favorite (most visited)
  const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  if (fav) set(K.favCareer, fav);
}

/**
 * Record a mission attempt.
 * @param {string} missionId
 */
export function recordMissionAttempt(missionId) {
  if (missionId) set(K.lastMission, missionId);
}

/**
 * Sync weak skill from progress.weakAreas into memory.
 * Call after any lesson/quiz completion.
 */
export function syncWeakSkill() {
  const p = getProgress();
  const entries = Object.entries(p.weakAreas || {}).sort((a, b) => b[1] - a[1]);
  const weak = entries[0]?.[0] || null;
  if (weak) set(K.weakSkill, weak);
}

/**
 * Get current Ani memory snapshot.
 * @returns {{weakSkill, favCareer, lastMission, visitCounts, streak, points}}
 */
export function getAniMemory() {
  const p = getProgress();
  return {
    weakSkill:   get(K.weakSkill),
    favCareer:   get(K.favCareer),
    lastMission: get(K.lastMission),
    visitCounts: get(K.visitCounts, {}),
    streak:      p.streak,
    points:      p.points,
  };
}

/* ── Career display names ── */
const CAREER_NAMES = {
  drone:  "пилота дрона 🚁",
  cyber:  "кибер-защитника 🛡️",
  space:  "исследователя космоса 🌌",
  robot:  "инженера-робота 🤖",
  game:   "гейм-дизайнера 🎮",
};

/* ── Mission display names ── */
const MISSION_NAMES = {
  m_explore_drone:  "изучение профессии пилота",
  m_quiz_today:     "тест дня",
  m_sim_unlock:     "разблокировку симуляции",
  m_streak_3:       "серию 3 дней",
  m_career_explore: "исследование профессий",
};

/**
 * Build a personalized greeting string based on memory.
 * @param {string} [name] - user name
 * @returns {string}
 */
export function buildPersonalizedGreeting(name = "друг") {
  const mem = getAniMemory();
  const greetings = [];

  if (mem.streak >= 3) {
    greetings.push(`🔥 Серия ${mem.streak} дней! Ты настоящий чемпион, ${name}!`);
  }
  if (mem.weakSkill) {
    greetings.push(`💪 Давай потренируем тему «${mem.weakSkill}» — ты почти там!`);
  }
  if (mem.favCareer && CAREER_NAMES[mem.favCareer]) {
    greetings.push(`🎯 Вижу, тебе нравится профессия ${CAREER_NAMES[mem.favCareer]}. Продолжим?`);
  }
  if (mem.lastMission && MISSION_NAMES[mem.lastMission]) {
    greetings.push(`🚀 Давай вернёмся к миссии: ${MISSION_NAMES[mem.lastMission]}!`);
  }
  if (!greetings.length) {
    greetings.push(`Привет, ${name}! 😊 Готов к новым открытиям?`);
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/* ── Auto-detect career from current page ── */
function detectCurrentCareer() {
  const path = window.location.pathname.split("/").pop() || "";
  const map = {
    "drone-pilot.html":        "drone",
    "cyber-defender.html":     "cyber",
    "space-explorer.html":     "space",
    "robotics-engineer.html":  "robot",
    "game-designer.html":      "game",
  };
  return map[path] || null;
}

/* ── Init ── */

/**
 * Initialize Ani memory layer.
 * - Syncs weak skill from progress
 * - Records current career page visit
 * - Fires personalized greeting once per day (after 1.4s delay)
 */
export function initAniMemory() {
  syncWeakSkill();

  const career = detectCurrentCareer();
  if (career) recordCareerVisit(career);

  // Personalized greeting — once per day, only after onboarding is complete
  const onboardingDone = localStorage.getItem("kl_ani_intro_done") === "true";
  if (!onboardingDone) return; // onboarding will handle the greeting

  const today = dayOfYear();
  const lastGreeted = get(K.greetedDay, -1);
  if (lastGreeted !== today) {
    set(K.greetedDay, today);
    const name = localStorage.getItem("kl_name") || "друг";
    const greeting = buildPersonalizedGreeting(name);
    // Delay enough to let initAni + initAniOnboarding settle (both fire < 1s)
    setTimeout(() => {
      aniWave();
      aniThinkThenSay(greeting, 600);
    }, 2800);
  }
}
