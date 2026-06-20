// Subscription removed — all students have full free access.
// This module keeps its exported interface so other files don't break.

export function initSubscriptionPreview() {}
export function getSubscriptionStatus() { return 'premium'; }
export function setSubscriptionStatus() {}
export function getSubscriptionStart() { return null; }
export function setSubscriptionStart() {}
export function getRemainingPreviewDays() { return 999; }
export function getTrialActivated() { return null; }
export function getRemainingTrialDays() { return 0; }
export function activateTrial() { return true; }
export function isPremiumFeature() { return false; }
export function lockPremiumSimulation() { return false; }
export function showUpgradeCTA() {}
export function blurLockedRewards() {}
export function renderPreviewTimerCard() {}
export function lockArenaEliteStages(e) { return e; }
export function lockCareerEliteChallenges(e) { return e; }
