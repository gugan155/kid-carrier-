/**
 * Progress, XP, streaks, badges, level band, dashboard / navbar / sidebar XP UI.
 * Depends on script.js for Ani/toasts via setProgressGamificationDeps (injected after those exist).
 */
import { db, doc, setDoc, timestamp } from "../firebase.js";
import { $, dayOfYear } from "./utils.js";

/* ── Injected callbacks (filled by script.js after ani / sim unlock helpers exist) ── */
const _deps = {
  showPointsToast(pts, reason) {},
  showBadgeToast(label) {},
  showLevelUp(lv) {},
  checkStreakReward(p) {},
  getUnlockedSimulationsCount() { return 0; },
  onPointsAwarded(prevPts, newPts, streak) {},
};

/**
 * @param {object} d
 * @param {function(number,string):void} [d.showPointsToast]
 * @param {function(string):void} [d.showBadgeToast]
 * @param {function(object):void} [d.showLevelUp]
 * @param {function(object):void} [d.checkStreakReward]
 * @param {function():number} [d.getUnlockedSimulationsCount]
 */
export function setProgressGamificationDeps(d) {
  if (d.showPointsToast) _deps.showPointsToast = d.showPointsToast;
  if (d.showBadgeToast) _deps.showBadgeToast = d.showBadgeToast;
  if (d.showLevelUp) _deps.showLevelUp = d.showLevelUp;
  if (d.checkStreakReward) _deps.checkStreakReward = d.checkStreakReward;
  if (d.getUnlockedSimulationsCount) _deps.getUnlockedSimulationsCount = d.getUnlockedSimulationsCount;
  if (typeof d.onPointsAwarded === "function") _deps.onPointsAwarded = d.onPointsAwarded;
}

/* ── USER ID (progress / sync) ── */
export function getUserId() {
  let uid = localStorage.getItem("kl_uid");
  if (!uid) {
    uid = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    localStorage.setItem("kl_uid", uid);
  }
  return uid;
}

/* ── PROGRESS ── */
const PROGRESS_KEY = "kl_progress";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

export function getProgress() {
  const p = loadProgress();
  return {
    points: p.points || 0,
    streak: p.streak || 0,
    lastDay: p.lastDay || 0,
    quizDone: p.quizDone || 0,
    simDone: p.simDone || 0,
    dailyDone: p.dailyDone || [],
    weakAreas: p.weakAreas || {},
    badges: p.badges || [],
    careerPagesVisited: p.careerPagesVisited || 0,
    microQuizDone: p.microQuizDone || 0,
    chatMessages: p.chatMessages || 0,
    streakRewarded: p.streakRewarded || [],
    lessonsCompleted: p.lessonsCompleted || {},
    quizPassed: p.quizPassed || {},
  };
}

export const BADGE_DEFS = [
  { id: "first_quiz", emoji: "\uD83C\uDFC5", label: "First Quiz", cond: p => p.quizDone >= 1 },
  { id: "quiz_master", emoji: "\uD83E\uDD47", label: "Quiz Master", cond: p => p.quizDone >= 5 },
  { id: "sim_pilot", emoji: "\u2708\uFE0F", label: "Pilot", cond: p => p.simDone >= 1 },
  { id: "streak_3", emoji: "\uD83D\uDD25", label: "3-Day Streak", cond: p => p.streak >= 3 },
  { id: "streak_7", emoji: "\uD83C\uDF1F", label: "7-Day Streak", cond: p => p.streak >= 7 },
  { id: "pts_100", emoji: "\uD83D\uDCAF", label: "100 Points", cond: p => p.points >= 100 },
  { id: "pts_500", emoji: "\uD83D\uDE80", label: "500 Points", cond: p => p.points >= 500 },
  { id: "pts_1000", emoji: "\uD83D\uDC51", label: "1000 Points", cond: p => p.points >= 1000 },
  {
    id: "career_explorer",
    emoji: "\uD83D\uDD2D",
    label: "\u041A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C",
    cond: p => (p.careerPagesVisited || 0) >= 3,
  },
  {
    id: "micro_master",
    emoji: "\uD83C\uDFAF",
    label: "\u041C\u0430\u0441\u0442\u0435\u0440 \u041C\u0438\u043D\u0438-\u0437\u0430\u0434\u0430\u043D\u0438\u0439",
    cond: p => (p.microQuizDone || 0) >= 3,
  },
  {
    id: "drone_expert",
    emoji: "\uD83D\uDE81",
    label: "\u042D\u043A\u0441\u043F\u0435\u0440\u0442 \u0414\u0440\u043E\u043D\u043E\u0432",
    cond: p => (p.simDone || 0) >= 2,
  },
  {
    id: "lesson_master",
    emoji: "\uD83D\uDCDA",
    label: "\u041C\u0430\u0441\u0442\u0435\u0440 \u0423\u0440\u043E\u043A\u043E\u0432",
    cond: p => Object.keys(p.lessonsCompleted || {}).length >= 3,
  },
  {
    id: "quiz_champion",
    emoji: "\uD83E\uDDE0",
    label: "\u0427\u0435\u043C\u043F\u0438\u043E\u043D \u0422\u0435\u0441\u0442\u043E\u0432",
    cond: p => Object.keys(p.quizPassed || {}).length >= 3,
  },
  {
    id: "mission_ready",
    emoji: "\uD83D\uDE80",
    label: "\u0413\u043E\u0442\u043E\u0432 \u043A \u041C\u0438\u0441\u0441\u0438\u0438",
    cond: p => Object.keys(p.quizPassed || {}).length >= 1,
  },
];

export function checkBadges(p) {
  BADGE_DEFS.forEach(r => {
    if (r.cond(p) && !p.badges.includes(r.id)) {
      p.badges.push(r.id);
      _deps.showBadgeToast(r.emoji + " " + r.label);
    }
  });
}

export async function syncProgress(p) {
  try {
    await setDoc(
      doc(db, "users", getUserId()),
      {
        name: localStorage.getItem("kl_name") || "",
        points: p.points,
        streak: p.streak,
        badges: p.badges,
        quizDone: p.quizDone,
        simDone: p.simDone,
        updated: timestamp(),
      },
      { merge: true }
    );
  } catch (e) {}
}

/** Update all dashboard stat elements and XP bar */
export function updateDashboard() {
  const p = getProgress();
  const dp = $("dp-points"),
    ds = $("dp-streak"),
    dq = $("dp-quizzes"),
    dsim = $("dp-sims");
  if (dp) dp.textContent = p.points;
  if (ds) ds.textContent = p.streak;
  if (dq) dq.textContent = p.quizDone;
  if (dsim) dsim.textContent = p.simDone;
  const dash = $("progress-dashboard");
  if (dash && p.points > 0) dash.style.display = "";
  const db2 = $("dash-badges");
  if (db2)
    db2.innerHTML = BADGE_DEFS.filter(r => p.badges.includes(r.id))
      .map(r => "<span class='dash-badge' title='" + r.label + "'>" + r.emoji + "</span>")
      .join("");
  updateXpBar();
}

/**
 * Award points to the user, update streak, check badges, sync to Firebase.
 * @param {number} pts - Points to award
 * @param {string} reason - Reason label shown in toast
 */
export function awardPoints(pts, reason) {
  const p = getProgress();
  const prevPts = p.points;
  const prevLevel = getLevelInfo(prevPts).level;
  p.points += pts;
  const today = dayOfYear();
  if (p.lastDay !== today) {
    p.streak = p.lastDay === today - 1 ? p.streak + 1 : 1;
    p.lastDay = today;
  }
  checkBadges(p);
  saveProgress(p);
  syncProgress(p);
  _deps.showPointsToast(pts, reason);
  const newLevel = getLevelInfo(p.points).level;
  if (newLevel > prevLevel) _deps.showLevelUp(getLevelInfo(p.points));
  _deps.checkStreakReward(p);
  if (typeof _deps.onPointsAwarded === "function") {
    try { _deps.onPointsAwarded(prevPts, p.points, p.streak); } catch {}
  }
  updateDashboard();
  updateNavXpBar();
  updateSidebarProgress();
}

/* ── LEVEL SYSTEM ── */
export const LEVELS = [
  { level: 1, min: 0, max: 50, label: "\u041D\u043E\u0432\u0438\u0447\u043E\u043A", icon: "\uD83C\uDF31" },
  { level: 2, min: 50, max: 150, label: "\u0423\u0447\u0435\u043D\u0438\u043A", icon: "\uD83D\uDCDA" },
  { level: 3, min: 150, max: 300, label: "\u0417\u043D\u0430\u0442\u043E\u043A", icon: "\uD83D\uDD2D" },
  { level: 4, min: 300, max: 500, label: "\u042D\u043A\u0441\u043F\u0435\u0440\u0442", icon: "\uD83C\uDFC6" },
  { level: 5, min: 500, max: 1000, label: "\u041C\u0430\u0441\u0442\u0435\u0440", icon: "\uD83D\uDE80" },
  { level: 6, min: 1000, max: 9999, label: "\u041B\u0435\u0433\u0435\u043D\u0434\u0430", icon: "\uD83D\uDC51" },
];

/** Get level info object for a given points total */
export function getLevelInfo(pts) {
  return LEVELS.find(l => pts >= l.min && pts < l.max) || LEVELS[LEVELS.length - 1];
}

/** Update the XP top bar display */
export function updateXpBar() {
  const p = getProgress(),
    lv = getLevelInfo(p.points);
  const pct = Math.min(100, Math.round(((p.points - lv.min) / (lv.max - lv.min)) * 100));
  const badge = $("xp-level-badge"),
    fill = $("xp-bar-fill"),
    label = $("xp-label"),
    topbar = $("xp-topbar");
  if (badge) badge.textContent = lv.icon + " \u0423\u0440. " + lv.level + " " + lv.label;
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = p.points + " XP";
  if (topbar && p.points > 0) topbar.style.display = "flex";
}

/**
 * Update the top navbar XP bar (nav-level-badge, nav-bar-fill, nav-xp-label).
 * Works on any page that has the .app-navbar element.
 */
export function updateNavXpBar() {
  const p = getProgress();
  const lv = getLevelInfo(p.points);
  const pct = Math.min(100, Math.round(((p.points - lv.min) / (lv.max - lv.min)) * 100));
  const badge = $("nav-level-badge");
  const fill = $("nav-bar-fill");
  const label = $("nav-xp-label");
  if (badge) badge.textContent = lv.icon + " Ур." + lv.level + " " + lv.label;
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = p.points + " XP";
}

/** Update sidebar progress counters. */
export function updateSidebarProgress() {
  const p = getProgress();
  const sbL = $("sb-lessons");
  const sbS = $("sb-sims");
  const sbX = $("sb-xp");
  if (sbL) sbL.textContent = Object.keys(p.lessonsCompleted || {}).length;
  if (sbS) sbS.textContent = _deps.getUnlockedSimulationsCount ? _deps.getUnlockedSimulationsCount() : 0;
  if (sbX) sbX.textContent = p.points;
}
