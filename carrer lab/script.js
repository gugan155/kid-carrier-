/* CAREER LAB script.js v5.0 */
import { db, collection, doc, addDoc, setDoc, getDocs, deleteDoc, query, orderBy, timestamp } from "./firebase.js";
import { $, safe, escHtml, shrinkBubble, dayOfYear, computePageContext } from "./js/utils.js";
import {
  getProgress,
  saveProgress,
  BADGE_DEFS,
  checkBadges,
  awardPoints,
  LEVELS,
  getLevelInfo,
  updateXpBar,
  updateDashboard,
  updateNavXpBar,
  updateSidebarProgress,
  setProgressGamificationDeps,
} from "./js/progress.js";
import {
  setAniDeps,
  initAni,
  aniSay,
  aniGesture,
  aniExcited,
  aniHappy,
  aniThink,
  aniWave,
  aniPoint,
  aniCelebrate,
  aniNod,
  aniShakeHead,
  aniAutoGesture,
  aniThinkThenSay,
  initIdleMessages,
  initScrollReactions,
} from "./js/ani.js";
import { initAniOnboarding } from "./js/ani-onboarding.js";
import { initAniMouseFollow } from "./js/ani-mouse-follow.js";
/* ── PHASE 5 MODULES ── */
import { initAniClickReaction } from "./js/ani-click-reaction.js";
import { initLessonGamification, animateXpGain, showStreakToast } from "./js/lesson-gamification.js";
import { initMissionEngine } from "./js/mission-engine.js";
import { initAchieverEngine } from "./js/achiever-engine.js";
import { initParentDashboard } from "./js/parent-dashboard.js";
import { initAniMemory, recordCareerVisit, recordMissionAttempt, syncWeakSkill } from "./js/ani-memory.js";

/* ── PHASE 5.8 MODULES ── */
import { initAniDialogMemory, getNextGreeting } from "./js/ani-dialog-memory.js";
import { initSimulationCoach, showSimulationCoachFeedback } from "./js/simulation-coach.js";
import { initSimulationDifficulty, getDifficultyTier, setDifficultyTier, getXpMultiplier, getTierConfig, hintsEnabled, getTimerType, getStepComplexity, renderDifficultySelector } from "./js/simulation-difficulty.js";
import { initSimulationBranching, getRandomEvents, getRandomEvent, applyEventEffect, showEventNotification } from "./js/simulation-branching.js";
import { initSimulationParentInsights, renderSimulationInsights, trackSimulationMetric, getSimulationStrengths, getSimulationGrowthAreas, getSuggestedCareerPath } from "./js/simulation-parent-insights.js";

/* ── PHASE 5.8.5 MODULES ── */
import { initMultiStageFlow, getSimulationFlow, loadSimulationProgress, saveSimulationProgress, resetSimulationProgress, getSimulationStage, completeSimulationStage, getSimulationCompletion, getStageCoachingFeedback } from "./js/simulation-multi-stage.js";
import { initParentInsightsV2, renderWeeklyTrends, renderPerformanceGraph, renderWeakSkillTimeline, getSuggestedNextCareer, trackWeeklyGrowth, trackCareerPerformance, trackWeakSkill, renderParentInsightsV2 } from "./js/parent-insights-v2.js";
import { initNextActionEngine, getNextRecommendedAction, renderNextActionHint, dismissNextActionHint } from "./js/next-action-engine.js";
import { initCareerProgression, getCareerLevel, getCareerInfo, isCareerLevelUnlocked, unlockCareerLevel, isEliteChallengeUnlocked, getEliteChallenge, completeEliteChallenge, renderCareerProgressionCard } from "./js/career-progression.js";

/* ── PHASE 5.9 MODULES ── */
import { initArena, startArenaSimulation, exitArena, getArenaState, loadArenaStage, completeArenaStage, showAniMessage, aniGestureArena } from "./js/arena-arena.js";
import { initArenaVisuals, highlightElement, showFeedback, animatePanel, updateParallax, createFloatingAnimation, createPulseAnimation, createRippleEffect, animateTextReveal, highlightBranchingEvent, createSuccessAnimation } from "./js/arena-visuals.js";
import { initArenaSimulationHook, hookSimulationToArena, dispatchActionFeedback, getArenaSimulationContext, triggerArenaCoaching, triggerArenaBranchingEvent } from "./js/arena-simulation-hook.js";

/* ── PHASE 6 MONETIZATION MVP ── */
import { 
  initSubscriptionPreview,
  getSubscriptionStatus,
  getRemainingPreviewDays,
  isPremiumFeature,
  lockPremiumSimulation,
  showUpgradeCTA,
  activateTrial,
  blurLockedRewards,
  renderPreviewTimerCard,
  lockArenaEliteStages,
  lockCareerEliteChallenges
} from "./js/subscription-preview.js";

import {
  initPremiumParentDashboard,
  renderWeeklyHeatmap,
  renderSkillRadar,
  getRetryIntelligence,
  renderRetryIntelligence,
  getConfidenceGrowthScore,
  renderConfidenceScore,
  getActivityRecommendations,
  renderActivityRecommendations,
  getSchoolReadinessPreview,
  renderSchoolReadinessPreview,
  generateProgressSnapshot
} from "./js/premium-parent-dashboard.js";

import {
  initMissionEconomy,
  getWallet,
  getCoins,
  getGems,
  awardCoins,
  spendCoins,
  awardGems,
  getInventory,
  unlockAccessory,
  equipAccessory,
  getEquippedAccessory,
  upgradeAni,
  getAniUpgrades,
  getStreakBooster,
  incrementStreak,
  resetStreak,
  canSpinToday,
  spinDailyReward,
  getPremiumRewardTrack,
  awardPremiumPoints,
  calculateMissionReward,
  renderWalletDisplay,
  renderInventoryPanel,
  renderDailySpinWheel
} from "./js/mission-economy.js";

/* ── USER IDENTITY ── */
function getUserName(){return localStorage.getItem("kl_name")||"";}
function saveUserName(n){localStorage.setItem("kl_name",n);}

/* ── ROLE SYSTEM ── */
/** Get current role: "admin" or "user" (default "user") */
function getRole(){ return localStorage.getItem("kl_role") || "user"; }
/** Set role */
function setRole(r){ localStorage.setItem("kl_role", r === "admin" ? "admin" : "user"); }
/** Is current user admin? */
function isAdmin(){ return getRole() === "admin"; }

function showPointsToast(pts,reason){const t=document.createElement("div");t.className="points-toast";t.textContent="+"+pts+" pts"+(reason?" - "+reason:"");document.body.appendChild(t);setTimeout(()=>t.remove(),2800);}
function showBadgeToast(label){
  const t=document.createElement("div");t.className="badge-toast";t.textContent="\uD83C\uDFC6 "+label;document.body.appendChild(t);setTimeout(()=>t.remove(),3800);
  // Ani reacts to badge with voice + celebration
  setTimeout(()=>{aniCelebrate();aniSay("\uD83C\uDFC6 Новый значок: "+label+"! Ты молодец!");},400);
}
function recordWeakArea(cat){const p=getProgress();p.weakAreas[cat]=(p.weakAreas[cat]||0)+1;saveProgress(p);}
function recordStrongArea(cat){const p=getProgress();if(p.weakAreas[cat]>0)p.weakAreas[cat]--;saveProgress(p);}
function getWeakestArea(){const w=getProgress().weakAreas;return Object.entries(w).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;}

/* ── LEVEL UP CELEBRATION ── */
/** Show a full-screen level-up overlay with confetti */
function showLevelUp(lv){
  launchConfetti();
  const overlay=document.createElement("div");
  overlay.className="levelup-overlay";
  overlay.innerHTML="<div class='levelup-card'><div class='levelup-icon'>"+lv.icon+"</div><div class='levelup-title'>Новый уровень!</div><div class='levelup-name'>"+escHtml(lv.label)+"</div></div>";
  document.body.appendChild(overlay);
  aniCelebrate();
  aniSay("\uD83C\uDF89 Уровень "+lv.level+"! "+lv.label+"! Молодец!");
  setTimeout(()=>overlay.remove(),2400);
}

/* ── OFFLINE QUEUE ── */
const QUEUE_KEY="kl_offline_queue";
function enqueueOffline(item){const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");q.push(item);localStorage.setItem(QUEUE_KEY,JSON.stringify(q));}
async function flushOfflineQueue(){const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");if(!q.length)return;const rem=[];for(const item of q){try{if(item.type==="feedback")await addDoc(collection(db,"feedback"),{name:item.name,msg:item.msg,date:timestamp()});}catch{rem.push(item);}}localStorage.setItem(QUEUE_KEY,JSON.stringify(rem));}
window.addEventListener("online",()=>flushOfflineQueue().catch(()=>{}));

/* ── VOICE (TTS) ── */
let voices = [], voiceOn = localStorage.getItem("kl_voice") !== "off";
let isSpeaking = false; // true while TTS is playing — STT pauses during this

function loadVoices(){ voices = speechSynthesis.getVoices(); }
if(speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

/** Unlock AudioContext on first user gesture (required by browsers) */
let _audioUnlocked = false;
function unlockAudio(){
  if(_audioUnlocked) return;
  _audioUnlocked = true;
  // Speak a silent utterance to prime the audio pipeline
  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  speechSynthesis.speak(u);
}
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

/**
 * Strip emoji characters and map common ones to Russian words for natural TTS.
 * @param {string} text
 * @returns {string}
 */
function prepareForTts(text){
  const emojiMap={
    "\uD83C\uDF89":"Ура!","\uD83C\uDF1F":"Отлично!","\uD83D\uDE80":"Вперёд!",
    "\uD83E\uDD14":"Хм...","\uD83D\uDCAA":"Молодец!","\uD83C\uDFC6":"Победа!",
    "\u2705":"Правильно!","\u274C":"Неверно.","\uD83D\uDCA1":"Подсказка:",
    "\uD83D\uDE0A":"Отлично!","\uD83D\uDE04":"Здорово!","\uD83D\uDE22":"Не расстраивайся.",
    "\uD83D\uDD25":"Серия!","\u2B50":"Звезда!","\uD83D\uDCDA":"Учись!",
    "\uD83E\uDDE9":"Логика!","\uD83C\uDFA8":"Творчество!","\uD83D\uDD2C":"Наука!",
    "\uD83E\uDD1D":"Общение!","\uD83D\uDCBB":"Компьютер.","\uD83D\uDE81":"Дрон.",
    "\uD83C\uDF0C":"Космос.","\uD83E\uDD16":"Робот.","\uD83D\uDEE1\uFE0F":"Защита.",
    "\uD83C\uDFAE":"Игра.","\uD83D\uDD2D":"Исследование.","\uD83C\uDF10":"Интернет.",
  };
  let out=text;
  Object.entries(emojiMap).forEach(([em,word])=>{ out=out.split(em).join(" "+word+" "); });
  // Remove any remaining emoji (unicode ranges)
  out=out.replace(/[\u{1F300}-\u{1FFFF}]/gu," ").replace(/[\u{2600}-\u{27BF}]/gu," ");
  return out.replace(/\s{2,}/g," ").trim();
}

/**
 * Speak text using Web Speech API (ru-RU) with emoji-to-word conversion.
 * Sets isSpeaking=true while playing so STT pauses automatically.
 * @param {string} text - Text to speak
 * @param {{pitch?:number, rate?:number}} [opts] - Optional pitch/rate overrides
 */
function speak(text, opts={}){
  if(!voiceOn || !text) return;
  speechSynthesis.cancel();
  const clean = prepareForTts(text);
  if(!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ru-RU";
  // Prefer female Russian voice for friendlier tone
  const rv = voices.find(v => v.lang === "ru-RU" && /female|woman|girl|Milena|Irina|Katya|Alena/i.test(v.name))
          || voices.find(v => v.lang === "ru-RU")
          || voices.find(v => v.lang.startsWith("ru"))
          || null;
  if(rv) u.voice = rv;
  u.rate  = opts.rate  || 0.88;  // slightly slower = more natural
  u.pitch = opts.pitch || 1.1;   // gentle pitch, not too high
  u.volume = 1;
  const bubble = $("ani-bubble");
  isSpeaking = true;
  u.onstart = () => {
    isSpeaking = true;
    if(sttRec) try{ sttRec.stop(); }catch(e){}
    if(bubble) bubble.classList.add("talking");
  };
  u.onend = u.onerror = () => {
    isSpeaking = false;
    if(bubble) bubble.classList.remove("talking");
  };
  speechSynthesis.speak(u);
}

/**
 * Speak long text in natural chunks (split by sentence) with small delays.
 * Falls back to speak() for short text.
 * @param {string} text
 */
function speakChunked(text){
  if(!voiceOn || !text) return;
  const clean = prepareForTts(text);
  if(!clean) return;
  // Split on sentence boundaries
  const chunks = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  if(chunks.length <= 1){ speak(text); return; }
  speechSynthesis.cancel();
  let delay = 0;
  chunks.forEach((chunk, i) => {
    const trimmed = chunk.trim();
    if(!trimmed) return;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(trimmed);
      u.lang = "ru-RU";
      const rv = voices.find(v => v.lang === "ru-RU") || voices.find(v => v.lang.startsWith("ru")) || null;
      if(rv) u.voice = rv;
      u.rate = 0.92; u.pitch = 1.15;
      const bubble = $("ani-bubble");
      if(i === 0){ isSpeaking = true; if(sttRec) try{ sttRec.stop(); }catch(e){} }
      u.onstart = () => { isSpeaking = true; if(bubble) bubble.classList.add("talking"); };
      u.onend = u.onerror = () => {
        if(i === chunks.length - 1){
          isSpeaking = false;
          if(bubble) bubble.classList.remove("talking");
        }
      };
      speechSynthesis.speak(u);
    }, delay);
    delay += 200; // small gap between sentences
  });
}

// Wire Ani to voice + context + progress (module extracted in Step 3)
setAniDeps({
  speak,
  getPageContext,
  getWeakestArea,
  getProgress,
});

function initVoiceToggle(){
  const btn=$("voice-toggle"); if(!btn)return;
  // 🔊 = on, 🔇 = off
  btn.textContent=voiceOn?"\uD83D\uDD0A":"\uD83D\uDD07";
  btn.classList.toggle("active",voiceOn);
  btn.addEventListener("click",()=>{
    unlockAudio();
    voiceOn=!voiceOn;
    localStorage.setItem("kl_voice",voiceOn?"on":"off");
    btn.textContent=voiceOn?"\uD83D\uDD0A":"\uD83D\uDD07";
    btn.classList.toggle("active",voiceOn);
    if(voiceOn) speak("\u0417\u0432\u0443\u043a \u0432\u043a\u043b\u044e\u0447\u0451\u043d!");
    else speechSynthesis.cancel();
  });
}

/* ── STT (Speech-to-Text) ── */
/**
 * Initialize the microphone STT button.
 * Recognized commands: "тест"/"квиз" → quiz.html, "прогресс" → scroll dashboard,
 * "симуляция" → open IT sim, "пилот" → open pilot sim.
 */
let sttRec = null; // exposed so speak() can stop it when TTS starts
function initStt(){
  const btn=$("stt-btn"); if(!btn)return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){btn.style.display="none";return;}
  const rec=new SR();
  sttRec=rec;
  rec.lang="ru-RU"; rec.interimResults=false; rec.maxAlternatives=1;
  let active=false;
  btn.addEventListener("click",()=>{
    if(isSpeaking){ aniSay("\u041f\u043e\u0434\u043e\u0436\u0434\u0438, \u044f \u0435\u0449\u0451 \u0433\u043e\u0432\u043e\u0440\u044e!"); return; }
    if(active){rec.stop();return;}
    try{rec.start();}catch(e){}
  });
  rec.onstart=()=>{
    active=true;btn.classList.add("listening");
    aniThink();
    aniSay("\uD83C\uDFA4 \u0421\u043B\u0443\u0448\u0430\u044e... \u0413\u043e\u0432\u043e\u0440\u0438 \u0441\u043c\u0435\u043b\u043e!");
  };
  rec.onend=()=>{active=false;btn.classList.remove("listening");};
  rec.onerror=e=>{
    active=false;btn.classList.remove("listening");
    if(e.error==="no-speech")aniSay("\u041d\u0435 \u0443\u0441\u043b\u044b\u0448\u0430\u043b\u0430... \uD83E\uDD14 \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437!");
    else if(e.error==="not-allowed")aniSay("\uD83C\uDFA4 \u0420\u0430\u0437\u0440\u0435\u0448\u0438 \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435!");
  };
  rec.onresult=e=>{
    const cmd=(e.results[0][0].transcript||"").toLowerCase().trim();
    aniNod();
    handleVoiceCommand(cmd);
  };
}

/** Route a recognized voice command string to the appropriate action */
function handleVoiceCommand(cmd){
  const c = cmd.toLowerCase().trim();
  if(!c) return;
  // All voice commands route through the chat box (unified pipeline)
  const chatBox   = document.getElementById("ani-chatbox");
  const toggleBtn = document.getElementById("ani-chat-toggle");
  if(chatBox && !chatBox.classList.contains("open")){
    chatBox.classList.add("open");
    if(toggleBtn) toggleBtn.textContent = "✕";
    chatOpen = true;
  }
  chatRespond(c);
}

/* ── NAME SYSTEM ── */
function applyName(){
  const name=getUserName(); if(!name)return;
  const ht=$("hero-title"); if(ht&&ht.textContent.includes("\u041B\u0430\u0431\u043E\u0440\u0430\u0442\u043E\u0440\u0438\u044F"))ht.textContent="\u041F\u0440\u0438\u0432\u0435\u0442, "+name+"!";
  const hs=$("header-subtitle"); if(hs)hs.textContent="\u0420\u0430\u0434\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0442\u0435\u0431\u044F \u0441\u043D\u043E\u0432\u0430, "+name+"! \uD83D\uDE80";
}
function scheduleWelcome(){
  const name=getUserName();
  if(name){
    setTimeout(()=>{
      aniWave();
      const ctx=getPageContext();
      aniSay(ctx.greeting);
    },1200);
  }
}
/* ── SIMPLIFIED ONBOARDING BUTTON BINDING ── */
let g_onboarding_bound=false;
let g_onboarding_submitting=false; // Prevent double-submission during transition

function bindOnboardingButton(){
  const btn=$("name-submit");
  const inp=$("name-input");
  
  // Validate elements exist
  if(!btn || !inp) return false;
  
  // Guard against duplicate binding
  if(btn.dataset.bound==="true") return true;
  
  // Define submit handler (single, guaranteed execution)
  const submit=()=>{
    // Prevent double-submission during transition
    if(g_onboarding_submitting) return;
    g_onboarding_submitting=true;
    
    try {
      const v=inp.value.trim();
      
      // Validate input
      if(!v){
        g_onboarding_submitting=false;
        aniSay("Пожалуйста, введи своё имя! 😊");
        inp.focus();
        return;
      }
      
      // Save name to localStorage (single key)
      try {
        localStorage.setItem("kl_name", v);
      } catch (storageErr) {
        g_onboarding_submitting=false;
        console.error("[Onboarding] localStorage error:", storageErr);
        aniSay("Ошибка при сохранении. Попробуй ещё раз! 😟");
        return;
      }
      
      // Trigger transition
      const overlay=$("name-overlay");
      if(!overlay){
        g_onboarding_submitting=false;
        applyName();
        scheduleWelcome();
        return;
      }
      
      // Fade out overlay (premium feel: 300ms)
      overlay.style.transition="opacity 0.3s ease-out";
      overlay.style.opacity="0";
      
      // After fade, hide overlay and show dashboard
      setTimeout(()=>{
        overlay.style.display="none";
        applyName();
        scheduleWelcome();
        g_onboarding_submitting=false;
      }, 300);
      
    } catch (err) {
      g_onboarding_submitting=false;
      console.error("[Onboarding] Error in submit:", err);
      aniSay("Ошибка. Перезагрузи страницу! 😟");
    }
  };
  
  // Single click listener
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    submit();
  });
  
  // Single Enter key listener
  inp.addEventListener("keydown", (e) => {
    if(e.key==="Enter"){
      e.preventDefault();
      submit();
    }
  });
  
  // Mark as bound
  btn.dataset.bound="true";
  inp.focus();
  
  return true;
}

/* ── RETRY BINDING WITH OPTIMIZED TIMING ── */
function retryBindOnboardingButton(){
  let attempts=0;
  const maxAttempts=10; // 2 seconds at 200ms intervals (optimized from 3s)
  
  const retryInterval=setInterval(()=>{
    attempts++;
    
    if(bindOnboardingButton()){
      clearInterval(retryInterval);
      return;
    }
    
    if(attempts>=maxAttempts){
      clearInterval(retryInterval);
      console.error("[Onboarding] Failed to bind button after", maxAttempts, "attempts");
      return;
    }
  }, 200);
}

function initNameSystem(){
  try {
    const overlay=$("name-overlay"); 
    if(!overlay){
      console.error("[Onboarding] name-overlay element not found");
      return;
    }
    
    // If user already has a name, hide overlay and show welcome
    const existingName=getUserName();
    if(existingName){
      console.log("[Onboarding] Existing user detected:", existingName);
      overlay.style.display="none";
      applyName();
      scheduleWelcome();
      return;
    }
    
    // Show onboarding overlay
    overlay.style.display="flex";
    console.log("[Onboarding] Overlay displayed, attempting button binding...");
    
    // Try immediate binding
    if(!bindOnboardingButton()){
      console.warn("[Onboarding] Immediate binding failed, starting retry strategy...");
      retryBindOnboardingButton();
    }
    
    console.log("[Onboarding] ✅ initNameSystem COMPLETE");
    
  } catch (err) {
    console.error("[Onboarding] CRITICAL ERROR in initNameSystem:", err);
  }
}

/* ── PAGE CONTEXT AWARENESS ── */
/**
 * Detect which page we're on and return context-specific data for Ani.
 * @returns {{page:string, greeting:string, hints:string[], fallback:string}}
 */
function getPageContext(){
  return computePageContext(getUserName, getProgress);
}

/* ── CONFETTI ── */
function launchConfetti(){
  const colors=["#7c3aed","#ec4899","#f59e0b","#10b981","#3b82f6","#fff"];
  for(let i=0;i<60;i++){
    const el=document.createElement("div");
    el.style.cssText="position:fixed;top:-10px;width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:99999;";
    el.style.left=Math.random()*100+"vw"; el.style.background=colors[Math.floor(Math.random()*colors.length)];
    el.style.animation="confettiFall "+(1.2+Math.random()*1.5)+"s ease forwards";
    el.style.animationDelay=Math.random()*0.8+"s";
    document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
  }
  if(!document.getElementById("confetti-style")){
    const st=document.createElement("style"); st.id="confetti-style";
    st.textContent="@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}";
    document.head.appendChild(st);
  }
}

/* ── MINI QUIZ ── */
const mqMap={
  "tech+logic":  {name:"IT-\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442",    icon:"\uD83D\uDCBB", link:"cyber-defender.html"},
  "tech+hands":  {name:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440-\u0440\u043E\u0431\u043E\u0442",    icon:"\uD83E\uDD16", link:"robotics-engineer.html"},
  "tech+dream":  {name:"\u0413\u0435\u0439\u043C-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440",   icon:"\uD83C\uDFAE", link:"game-designer.html"},
  "tech+brave":  {name:"\u041A\u0438\u0431\u0435\u0440-\u0437\u0430\u0449\u0438\u0442\u043D\u0438\u043A",  icon:"\uD83D\uDEE1\uFE0F", link:"cyber-defender.html"},
  "sky+logic":   {name:"\u041F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430",     icon:"\uD83D\uDE81", link:"drone-pilot.html"},
  "sky+hands":   {name:"\u041F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430",     icon:"\uD83D\uDE81", link:"drone-pilot.html"},
  "sky+dream":   {name:"\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C",   icon:"\uD83D\uDD2D", link:"space-explorer.html"},
  "sky+brave":   {name:"\u041F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430",     icon:"\uD83D\uDE81", link:"drone-pilot.html"},
  "space+logic": {name:"\u0410\u0441\u0442\u0440\u043E\u043D\u043E\u043C",        icon:"\uD83D\uDD2D", link:"space-explorer.html"},
  "space+hands": {name:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440 \u0440\u0430\u043A\u0435\u0442",   icon:"\uD83D\uDE80", link:"space-explorer.html"},
  "space+dream": {name:"\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C",   icon:"\uD83C\uDF0C", link:"space-explorer.html"},
  "space+brave": {name:"\u041A\u043E\u0441\u043C\u043E\u043D\u0430\u0432\u0442",       icon:"\uD83D\uDE80", link:"space-explorer.html"},
  "create+logic":{name:"\u0413\u0435\u0439\u043C-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440",  icon:"\uD83C\uDFAE", link:"game-designer.html"},
  "create+hands":{name:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440-\u0440\u043E\u0431\u043E\u0442",  icon:"\uD83E\uDD16", link:"robotics-engineer.html"},
  "create+dream":{name:"\u0413\u0435\u0439\u043C-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440",  icon:"\uD83C\uDFAE", link:"game-designer.html"},
  "create+brave":{name:"\u041A\u0438\u0431\u0435\u0440-\u0437\u0430\u0449\u0438\u0442\u043D\u0438\u043A", icon:"\uD83D\uDEE1\uFE0F", link:"cyber-defender.html"},
};
function initMiniQuiz(){
  let step1Val="";
  document.querySelectorAll(".mq-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const step=btn.dataset.step,val=btn.dataset.val;
      if(step==="1"){
        step1Val=val;
        document.querySelectorAll(".mq-step").forEach(s=>s.classList.remove("active"));
        const s2=$("mq-step-2");if(s2)s2.classList.add("active");
        aniThink();aniSay("\u0418\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u044B\u0439 \u0432\u044B\u0431\u043E\u0440! \uD83E\uDD14");
      } else {
        const key=step1Val+"+"+val;
        const res=mqMap[key]||{name:"\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C",icon:"\uD83D\uDD2D",link:"explorer.html"};
        showMqResult(res);
      }
    });
  });
  const restart=$("mq-restart");
  if(restart)restart.addEventListener("click",()=>{
    document.querySelectorAll(".mq-step").forEach(s=>s.classList.remove("active"));
    const s1=$("mq-step-1");if(s1)s1.classList.add("active");
    step1Val="";
  });
}
function showMqResult(res){
  document.querySelectorAll(".mq-step").forEach(s=>s.classList.remove("active"));
  const r=$("mq-result");if(!r)return;
  r.classList.add("active");
  const icon=$("mq-result-icon"),name=$("mq-result-name"),link=$("mq-result-link");
  if(icon)icon.textContent=res.icon;
  if(name)name.textContent=res.name;
  if(link)link.href=res.link;
  aniExcited();aniSay("\u041E\u0442\u043B\u0438\u0447\u043D\u043E! \uD83C\uDF89");
  awardPoints(10,"Mini Quiz");
}

/* ── FEEDBACK ── */
function initFeedback(){
  const form=$("feedback-form");if(!form)return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const nameEl=$("fb-name"),msgEl=$("fb-msg"),emailEl=$("fb-email");
    if(!nameEl||!msgEl)return;
    const name=nameEl.value.trim(),msg=msgEl.value.trim();
    if(!name||!msg)return;
    const email=emailEl?emailEl.value.trim():"";
    try{await addDoc(collection(db,"feedback"),{name,msg,email,date:timestamp()});}
    catch{enqueueOffline({type:"feedback",name,msg});}
    const succ=$("feedback-success");
    if(succ){form.classList.add("hidden");succ.classList.remove("hidden");}
    aniHappy();aniSay("\u0421\u043F\u0430\u0441\u0438\u0431\u043E! \uD83D\uDE0A");
    awardPoints(5,"Feedback");
  });
  const sendAnother=$("fb-send-another");
  if(sendAnother)sendAnother.addEventListener("click",()=>{
    const succ=$("feedback-success"),form2=$("feedback-form");
    if(succ)succ.classList.add("hidden");
    if(form2){form2.classList.remove("hidden");form2.reset();}
  });
  [$("view-feedback-btn"),$("view-feedback-btn-2")].forEach(b=>{if(b)b.addEventListener("click",openFeedbackModal);});
  const closeBtn=$("close-feedback-modal");
  if(closeBtn)closeBtn.addEventListener("click",()=>{const m=$("feedback-modal");if(m)m.classList.add("hidden");});
}
async function openFeedbackModal(){
  const modal=$("feedback-modal");if(!modal)return;
  modal.classList.remove("hidden");
  const list=$("fb-modal-list"),count=$("fb-modal-count");
  if(list)list.innerHTML="<div class='fb-empty'>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...</div>";
  try{
    const snap=await getDocs(query(collection(db,"feedback"),orderBy("date","desc")));
    if(count)count.textContent=snap.size+" \u043E\u0442\u0437\u044B\u0432\u043E\u0432";
    if(list){
      if(snap.empty){list.innerHTML="<div class='fb-empty'>\u041E\u0442\u0437\u044B\u0432\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \uD83D\uDE0A</div>";}
      else{list.innerHTML=snap.docs.map(d=>{
        const fd=d.data();
        const dateStr=fd.date&&fd.date.toDate?fd.date.toDate().toLocaleDateString("ru-RU"):"";
        return "<div class='fb-entry'><div class='fb-entry-header'><span class='fb-entry-name'>"+escHtml(fd.name||"")+"</span><span class='fb-entry-date'>"+escHtml(dateStr)+"</span></div>"+(fd.email?"<div class='fb-entry-email'>"+escHtml(fd.email)+"</div>":"")+"<div class='fb-entry-msg'>"+escHtml(fd.msg||"")+"</div></div>";
      }).join("");}
    }
  }catch{
    if(count)count.textContent="\u041E\u0448\u0438\u0431\u043A\u0430";
    if(list)list.innerHTML="<div class='fb-empty'>\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \uD83D\uDE14</div>";
  }
  const clearBtn=$("fb-clear-btn");
  if(clearBtn){clearBtn.onclick=async()=>{
    if(!confirm("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u043E\u0442\u0437\u044B\u0432\u044B?"))return;
    try{
      const snap2=await getDocs(collection(db,"feedback"));
      await Promise.all(snap2.docs.map(d=>deleteDoc(doc(db,"feedback",d.id))));
      if(list)list.innerHTML="<div class='fb-empty'>\u0423\u0434\u0430\u043B\u0435\u043D\u043E \uD83D\uDDD1\uFE0F</div>";
      if(count)count.textContent="0 \u043E\u0442\u0437\u044B\u0432\u043E\u0432";
    }catch{alert("\u041E\u0448\u0438\u0431\u043A\u0430");}
  };}
}

/* ── DAILY LEARNING ── */
const DAILY_FALLBACK=[
  {title:"\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435?",text:"\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 - \u044D\u0442\u043E \u0441\u043F\u043E\u0441\u043E\u0431 \u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u043E\u043C. \u0422\u044B \u043F\u0438\u0448\u0435\u0448\u044C \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438, \u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440 \u0438\u0445 \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u0442!",question:"\u0427\u0442\u043E \u0434\u0435\u043B\u0430\u0435\u0442 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442?",options:["\u041F\u0438\u0448\u0435\u0442 \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438 \u0434\u043B\u044F \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0430","\u0427\u0438\u043D\u0438\u0442 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u044B","\u0420\u0438\u0441\u0443\u0435\u0442 \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438"],correct:0},
  {title:"\u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442?",text:"\u0418\u043D\u0442\u0435\u0440\u043D\u0435\u0442 - \u044D\u0442\u043E \u043E\u0433\u0440\u043E\u043C\u043D\u0430\u044F \u0441\u0435\u0442\u044C \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u043E\u0432 \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u043C\u0438\u0440\u0443.",question:"\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442?",options:["\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u043D\u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0435","\u0421\u0435\u0442\u044C \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u043E\u0432 \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u043C\u0438\u0440\u0443","\u0412\u0438\u0434 \u0442\u0435\u043B\u0435\u0432\u0438\u0437\u043E\u0440\u0430"],correct:1},
  {title:"\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u0440\u043E\u0431\u043E\u0442?",text:"\u0420\u043E\u0431\u043E\u0442 - \u044D\u0442\u043E \u043C\u0430\u0448\u0438\u043D\u0430, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u043C\u043E\u0436\u0435\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u044F\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.",question:"\u0413\u0434\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0440\u043E\u0431\u043E\u0442\u044B?",options:["\u0422\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0437\u0430\u0432\u043E\u0434\u0430\u0445","\u0422\u043E\u043B\u044C\u043A\u043E \u0432 \u043A\u043E\u0441\u043C\u043E\u0441\u0435","\u041D\u0430 \u0437\u0430\u0432\u043E\u0434\u0430\u0445, \u0432 \u0431\u043E\u043B\u044C\u043D\u0438\u0446\u0430\u0445 \u0438 \u0432 \u043A\u043E\u0441\u043C\u043E\u0441\u0435"],correct:2},
  {title:"\u0427\u0442\u043E \u0438\u0437\u0443\u0447\u0430\u0435\u0442 \u0430\u0441\u0442\u0440\u043E\u043D\u043E\u043C\u0438\u044F?",text:"\u0410\u0441\u0442\u0440\u043E\u043D\u043E\u043C\u0438\u044F - \u043D\u0430\u0443\u043A\u0430 \u043E \u0437\u0432\u0451\u0437\u0434\u0430\u0445, \u043F\u043B\u0430\u043D\u0435\u0442\u0430\u0445 \u0438 \u0433\u0430\u043B\u0430\u043A\u0442\u0438\u043A\u0430\u0445.",question:"\u0427\u0442\u043E \u0438\u0437\u0443\u0447\u0430\u044E\u0442 \u0430\u0441\u0442\u0440\u043E\u043D\u043E\u043C\u044B?",options:["\u0416\u0438\u0432\u043E\u0442\u043D\u044B\u0445","\u0417\u0432\u0451\u0437\u0434\u044B \u0438 \u043F\u043B\u0430\u043D\u0435\u0442\u044B","\u0420\u0430\u0441\u0442\u0435\u043D\u0438\u044F"],correct:1},
  {title:"\u041A\u0430\u043A \u0441\u043E\u0437\u0434\u0430\u044E\u0442\u0441\u044F \u0438\u0433\u0440\u044B?",text:"\u0418\u0433\u0440\u044B \u0441\u043E\u0437\u0434\u0430\u044E\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B: \u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440\u044B, \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442\u044B, \u0445\u0443\u0434\u043E\u0436\u043D\u0438\u043A\u0438.",question:"\u041A\u0442\u043E \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u043D\u044B\u0435 \u0438\u0433\u0440\u044B?",options:["\u0422\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442\u044B","\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u043E\u0432","\u0422\u043E\u043B\u044C\u043A\u043E \u0445\u0443\u0434\u043E\u0436\u043D\u0438\u043A\u0438"],correct:1},
];
/** Validate a daily content object has all required fields */
function isValidDailyContent(c){
  return c &&
    typeof c.title    === "string" && c.title.trim() &&
    typeof c.text     === "string" && c.text.trim()  &&
    typeof c.question === "string" && c.question.trim() &&
    Array.isArray(c.options) && c.options.length >= 2 &&
    typeof c.correct  === "number" && c.correct >= 0 && c.correct < c.options.length;
}

async function initDailyLearning(){
  const panel=$("daily-panel"); if(!panel) return;
  let content = null;
  try{
    const snap = await getDocs(collection(db,"dailyContent"));
    if(!snap.empty){
      const items = snap.docs.map(d=>d.data()).filter(isValidDailyContent);
      if(items.length) content = items[dayOfYear() % items.length];
    }
  }catch(e){ console.warn("[CL] dailyContent fetch failed:", e); }
  // Always fall back to local data if Firestore gave nothing valid
  if(!isValidDailyContent(content)){
    content = DAILY_FALLBACK[dayOfYear() % DAILY_FALLBACK.length];
  }
  showLearningPanel(panel, content);
}

function showLearningPanel(panel, content){
  // Guard: if content is still broken, show a safe placeholder
  if(!isValidDailyContent(content)){
    console.warn("[CL] showLearningPanel: invalid content, using fallback", content);
    content = DAILY_FALLBACK[0];
  }
  const p = getProgress();
  const alreadyDone = p.dailyDone.includes(String(dayOfYear()));
  panel.innerHTML =
    "<div class='daily-card'>" +
    "<h3 class='daily-title'>\uD83D\uDCDA " + escHtml(content.title) + "</h3>" +
    "<p class='daily-text'>" + escHtml(content.text) + "</p>" +
    "<div class='daily-question'>" +
    "<p class='daily-q-text'>\uD83E\uDD14 " + escHtml(content.question) + "</p>" +
    "<div class='daily-options'>" +
    content.options.map((opt, i) =>
      "<button class='daily-opt" + (alreadyDone ? " disabled" : "") + "' data-idx='" + i + "'" +
      (alreadyDone ? " disabled" : "") + ">" +
      (i === content.correct && alreadyDone ? "\u2705 " : "") +
      escHtml(String(opt)) + "</button>"
    ).join("") +
    "</div>" +
    (alreadyDone ? "<p class='daily-done'>\u2705 \u0422\u044B \u0443\u0436\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u0441\u0435\u0433\u043E\u0434\u043D\u044F!</p>" : "") +
    "</div></div>";
  if(!alreadyDone){
    panel.querySelectorAll(".daily-opt").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const idx=parseInt(btn.dataset.idx);
        const correct=idx===content.correct;
        panel.querySelectorAll(".daily-opt").forEach(b=>{
          b.disabled=true;
          if(parseInt(b.dataset.idx)===content.correct)b.classList.add("correct-fb");
          else b.classList.add("wrong-fb");
        });
        if(correct){
          aniCelebrate();aniSay("\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \uD83C\uDF89 \u041c\u043e\u043b\u043e\u0434\u0435\u0446!");launchConfetti();
          const prog=getProgress();prog.dailyDone.push(String(dayOfYear()));saveProgress(prog);
          awardPoints(20,"Daily Learning");
        } else {
          aniThinkThenSay("\u041d\u0435 \u0441\u043e\u0432\u0441\u0435\u043c... \uD83D\uDCA1 \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437!");recordWeakArea(content.title);
        }
      });
    });
  }
}

/* ── IT SIMULATION (UPGRADED) ── */
const IT_SIM_INTRO = {
  title: "💻 IT-специалист",
  subtitle: "Программирование — язык будущего!",
  why: "IT-специалисты создают приложения, игры, сайты и системы, которыми пользуются миллиарды людей. Это одна из самых востребованных профессий в мире!",
  fact: "💡 Знаешь ли ты? Первый компьютерный баг — это настоящий жук (bug), найденный в компьютере в 1947 году!",
  levels: ["Новичок", "Разработчик", "Эксперт"],
};

const itSteps=[
  {title:"\u0428\u0430\u0433 1: \u041D\u0430\u0439\u0434\u0438 \u043E\u0448\u0438\u0431\u043A\u0443",
   realWorld:"\u0412 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u0440\u0430\u0431\u043E\u0442\u0435 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442\u044B \u0442\u0440\u0430\u0442\u044F\u0442 50% \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043D\u0430 \u043F\u043E\u0438\u0441\u043A \u0438 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0448\u0438\u0431\u043E\u043A!",
   code:[{ln:1,text:'<span class="kw">function</span> <span class="fn">greet</span>(name) {'},{ln:2,text:'  <span class="kw">return</span> <span class="str">"Hello, "</span> + <span class="err">naem</span>;'},{ln:3,text:'}'}],
   question:"\u0427\u0442\u043E \u043D\u0435 \u0442\u0430\u043A \u0432 \u0441\u0442\u0440\u043E\u043A\u0435 2?",
   options:["\u041D\u0435\u0442 \u0442\u043E\u0447\u043A\u0438 \u0441 \u0437\u0430\u043F\u044F\u0442\u043E\u0439","\u041E\u043F\u0435\u0447\u0430\u0442\u043A\u0430: naem \u0432\u043C\u0435\u0441\u0442\u043E name","\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430\u044F \u0444\u0443\u043D\u043A\u0446\u0438\u044F"],correct:1,
   explanation:"\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0430 \u0441 \u043E\u043F\u0435\u0447\u0430\u0442\u043A\u043E\u0439: naem \u0432\u043C\u0435\u0441\u0442\u043E name.",
   aniHint:"\uD83D\uDD0D \u0421\u043C\u043E\u0442\u0440\u0438 \u0432\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043D\u0430 \u043A\u0430\u0436\u0434\u043E\u0435 \u0441\u043B\u043E\u0432\u043E! \u041E\u043F\u0435\u0447\u0430\u0442\u043A\u0438 \u2014 \u0441\u0430\u043C\u0430\u044F \u0447\u0430\u0441\u0442\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442\u043E\u0432.",
   fixedCode:[{ln:1,text:'<span class="kw">function</span> <span class="fn">greet</span>(name) {'},{ln:2,text:'  <span class="kw">return</span> <span class="str">"Hello, "</span> + <span class="fix">name</span>;'},{ln:3,text:'}'}]},
  {title:"\u0428\u0430\u0433 2: \u0412\u044B\u0431\u0435\u0440\u0438 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0434",
   realWorld:"\u0426\u0438\u043A\u043B\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0432\u0435\u0437\u0434\u0435: \u0432 \u0438\u0433\u0440\u0430\u0445, \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F\u0445, \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0434\u0430\u043D\u043D\u044B\u0445. \u0411\u0435\u0437 \u043D\u0438\u0445 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F!",
   code:[{ln:1,text:'<span class="kw">const</span> nums = [1, 2, 3, 4, 5];'},{ln:2,text:'<span class="kw">let</span> sum = <span class="num">0</span>;'},{ln:3,text:'<span class="err">???</span>'}],
   question:"\u041A\u0430\u043A \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0441\u0443\u043C\u043C\u0443 \u043C\u0430\u0441\u0441\u0438\u0432\u0430?",
   options:["for(let i=0;i<nums.length;i++) sum+=nums[i];","sum = nums;","console.log(nums);"],correct:0,
   explanation:"\u0426\u0438\u043A\u043B for \u043F\u0435\u0440\u0435\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u0441\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B \u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0438\u0445 \u043A sum.",
   aniHint:"\uD83D\uDD04 \u0426\u0438\u043A\u043B \u2014 \u044D\u0442\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0435 \u043E\u0434\u043D\u043E\u0433\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043C\u043D\u043E\u0433\u043E \u0440\u0430\u0437. \u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044C, \u0447\u0442\u043E \u0442\u044B \u0441\u0447\u0438\u0442\u0430\u0435\u0448\u044C \u044F\u0431\u043B\u043E\u043A\u0438 \u043E\u0434\u043D\u043E \u0437\u0430 \u043E\u0434\u043D\u0438\u043C!",
   fixedCode:[{ln:1,text:'<span class="kw">const</span> nums = [1, 2, 3, 4, 5];'},{ln:2,text:'<span class="kw">let</span> sum = <span class="num">0</span>;'},{ln:3,text:'<span class="fix">for(let i=0;i&lt;nums.length;i++) sum+=nums[i];</span>'}]},
  {title:"\u0428\u0430\u0433 3: \u0417\u0430\u043F\u0443\u0441\u0442\u0438 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443",
   realWorld:"\u0424\u0443\u043D\u043A\u0446\u0438\u0438 \u2014 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043B\u044E\u0431\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B. \u0414\u0430\u0436\u0435 Instagram \u0438 YouTube \u0441\u043E\u0441\u0442\u043E\u044F\u0442 \u0438\u0437 \u0442\u044B\u0441\u044F\u0447 \u0444\u0443\u043D\u043A\u0446\u0438\u0439!",
   code:[{ln:1,text:'<span class="kw">function</span> <span class="fn">add</span>(a, b) {'},{ln:2,text:'  <span class="kw">return</span> a + b;'},{ln:3,text:'}'},{ln:4,text:'<span class="fn">console</span>.<span class="fn">log</span>(<span class="fn">add</span>(<span class="num">3</span>, <span class="num">4</span>));'}],
   question:"\u0427\u0442\u043E \u0432\u044B\u0432\u0435\u0434\u0435\u0442 \u044D\u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430?",
   options:["34","7","undefined"],correct:1,
   explanation:"\u0424\u0443\u043D\u043A\u0446\u0438\u044F add \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0435\u0442 3 \u0438 4, \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 - 7.",
   aniHint:"\uD83E\uDDE0 \u0424\u0443\u043D\u043A\u0446\u0438\u044F add \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0435\u0442 \u0434\u0432\u0430 \u0447\u0438\u0441\u043B\u0430. 3 + 4 = ? \u041F\u043E\u0441\u0447\u0438\u0442\u0430\u0439 \u0441\u0430\u043C!",
   fixedCode:[{ln:1,text:'<span class="kw">function</span> <span class="fn">add</span>(a, b) {'},{ln:2,text:'  <span class="kw">return</span> a + b;'},{ln:3,text:'}'},{ln:4,text:'<span class="it-run-success">// Output: 7 \u2705</span>'}]},
];
let itScore=0,itStep=0,itShowIntro=true;

function buildCode(lines){
  return "<div class='it-code-editor'><div class='it-code-titlebar'><span class='it-code-dot red'></span><span class='it-code-dot yellow'></span><span class='it-code-dot green'></span><span class='it-code-filename'>main.js</span></div><div class='it-code-body'>"+
    lines.map(l=>"<div class='it-code-line'><span class='it-code-ln'>"+l.ln+"</span><span class='it-code-text'>"+l.text+"</span></div>").join("")+"</div></div>";
}

function renderItIntro(container){
  const info=IT_SIM_INTRO;
  container.innerHTML=
    "<div class='sim-intro-card'>"+
    "<div class='sim-intro-icon'>💻</div>"+
    "<h3 class='sim-intro-title'>"+escHtml(info.title)+"</h3>"+
    "<p class='sim-intro-sub'>"+escHtml(info.subtitle)+"</p>"+
    "<div class='sim-intro-why'><strong>\u041F\u043E\u0447\u0435\u043C\u0443 \u044D\u0442\u043E \u0432\u0430\u0436\u043D\u043E?</strong><br>"+escHtml(info.why)+"</div>"+
    "<div class='sim-intro-fact'>"+escHtml(info.fact)+"</div>"+
    "<div class='sim-intro-levels'>"+info.levels.map((l,i)=>"<span class='sim-level-badge"+(i===0?" active":"")+"'>"+escHtml(l)+"</span>").join(" \u2192 ")+"</div>"+
    "<button class='btn-main sim-start-btn' id='it-start-btn'>\uD83D\uDE80 \u041D\u0430\u0447\u0430\u0442\u044C \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E!</button>"+
    "</div>";
  const startBtn=container.querySelector("#it-start-btn");
  if(startBtn)startBtn.addEventListener("click",()=>{itShowIntro=false;renderItStep(container,0);aniSay("\uD83D\uDCBB \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u0414\u0430\u0432\u0430\u0439 \u043D\u0430\u0439\u0434\u0451\u043C \u043E\u0448\u0438\u0431\u043A\u0443 \u0432 \u043A\u043E\u0434\u0435! \uD83D\uDD0D");});
}

function renderItStep(container,stepIdx){
  if(stepIdx>=itSteps.length){
    container.innerHTML="<div class='sim-result'><div class='sim-result-icon'>\uD83C\uDF89</div><h3>\u0421\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430!</h3><p>\u0422\u044B \u043D\u0430\u0431\u0440\u0430\u043B "+itScore+" \u0438\u0437 "+itSteps.length+" \u043E\u0447\u043A\u043E\u0432!</p><div class='sim-result-career'><strong>\uD83C\uDFAF \u041A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u043F\u0443\u0442\u044C:</strong> \u041D\u0430\u0447\u043D\u0438 \u0441 Python \u0438\u043B\u0438 JavaScript \u2014 \u0438 \u0447\u0435\u0440\u0435\u0437 \u0433\u043E\u0434 \u0442\u044B \u0443\u0436\u0435 \u0441\u043C\u043E\u0436\u0435\u0448\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0432\u043E\u0451 \u043F\u0435\u0440\u0432\u043E\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435!</div><button class='btn-main' id='it-restart'>\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E</button></div>";
    const rb=container.querySelector("#it-restart");
    if(rb)rb.addEventListener("click",()=>{itScore=0;itStep=0;itShowIntro=true;renderItIntro(container);});
    aniCelebrate();aniSay("\uD83C\uDF89 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u0422\u044B \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442! \uD83D\uDCBB");
    awardPoints(30,"IT Simulation");
    const p=getProgress();p.simDone++;saveProgress(p);updateDashboard();
    // Step 3: track skill result
    onItSimComplete(itScore, itSteps.length);
    return;
  }
  const s=itSteps[stepIdx];
  const progressPct=Math.round((stepIdx/itSteps.length)*100);
  container.innerHTML=
    "<div class='sim-progress-wrap'><div class='sim-progress-bar'><div class='sim-progress-fill' style='width:"+progressPct+"%'></div></div><span class='sim-progress-label'>\u0428\u0430\u0433 "+(stepIdx+1)+" \u0438\u0437 "+itSteps.length+"</span></div>"+
    "<div class='sim-realworld-tip'>\uD83C\uDF0D "+escHtml(s.realWorld)+"</div>"+
    "<div class='it-points-bar'><span class='it-points-label'>\u041E\u0447\u043A\u0438</span><span class='it-points-val'>"+itScore+"</span><span class='it-points-stars'>"+"\u2B50".repeat(itScore)+"</span></div>"+
    "<h3 style='color:#c4b5fd;margin-bottom:12px'>"+escHtml(s.title)+"</h3>"+
    buildCode(s.code)+
    "<div class='sim-ani-hint'>\uD83E\uDD16 \u0410\u043D\u044E\u0448\u0430: <em>"+escHtml(s.aniHint)+"</em></div>"+
    "<p class='sim-question'>"+escHtml(s.question)+"</p>"+
    "<div class='sim-options'>"+s.options.map((o,i)=>"<button class='sim-opt-btn' data-idx='"+i+"'>"+escHtml(o)+"</button>").join("")+"</div>"+
    "<div id='it-feedback'></div>";
  container.querySelectorAll(".sim-opt-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx=parseInt(btn.dataset.idx),correct=idx===s.correct;
      container.querySelectorAll(".sim-opt-btn").forEach(b=>{b.disabled=true;if(parseInt(b.dataset.idx)===s.correct)b.classList.add("correct");else b.classList.add("wrong");});
      const fb=container.querySelector("#it-feedback");
      if(fb){
        fb.innerHTML="<div class='"+(correct?"correct-fb":"wrong-fb")+"'>"+(correct?"\u2705 ":"\u274C ")+escHtml(s.explanation)+"</div>"+
          "<div style='margin-top:12px'>"+buildCode(s.fixedCode)+"</div>"+
          "<button class='btn-main' style='margin-top:14px' id='it-next'>"+(stepIdx<itSteps.length-1?"\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433 \u27A1\uFE0F":"\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \uD83C\uDF89")+"</button>";
        const nb=fb.querySelector("#it-next");
        if(nb)nb.addEventListener("click",()=>{itStep++;renderItStep(container,itStep);});
      }
      if(correct){itScore++;aniHappy();aniSay("\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \uD83D\uDCAA \u041c\u043e\u043b\u043e\u0434\u0435\u0446!");recordStrongArea("IT");}
      else{aniThinkThenSay("\uD83D\uDCA1 \u041d\u0435 \u0441\u043e\u0432\u0441\u0435\u043c... \u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0438 \u0432\u043d\u0438\u043c\u0430\u0442\u0435\u043b\u044c\u043d\u0435\u0435!");recordWeakArea("IT");}
    });
  });
}
function initItSim(){
  const openBtn=$("open-it-sim"),closeBtn=$("close-it-sim"),modal=$("it-sim-modal"),content=$("it-sim-content");
  if(!openBtn||!modal||!content)return;
  openBtn.addEventListener("click",()=>{
    guardSimulation("it_sim", ()=>{
      modal.classList.remove("hidden");itScore=0;itStep=0;itShowIntro=true;renderItIntro(content);
      aniSay("\uD83D\uDCBB \u0414\u0430\u0432\u0430\u0439 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u043C, \u043A\u0430\u043A\u043E\u0432\u0430 \u0440\u0430\u0431\u043E\u0442\u0430 IT-\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442\u0430!");
    });
  });
  if(closeBtn)closeBtn.addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden");});
}

/* ── PILOT SIMULATION (UPGRADED) ── */
const PILOT_SIM_INTRO = {
  title: "\uD83D\uDE81 \u041F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430",
  subtitle: "\u041D\u0435\u0431\u043E \u0431\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446 \u2014 \u0434\u043B\u044F \u0442\u0435\u0445, \u043A\u0442\u043E \u043D\u0435 \u0431\u043E\u0438\u0442\u0441\u044F \u043C\u0435\u0447\u0442\u0430\u0442\u044C!",
  why: "\u041F\u0438\u043B\u043E\u0442\u044B \u0434\u0440\u043E\u043D\u043E\u0432 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u044E\u0442 \u043B\u0435\u043A\u0430\u0440\u0441\u0442\u0432\u0430, \u0441\u043D\u0438\u043C\u0430\u044E\u0442 \u0444\u0438\u043B\u044C\u043C\u044B, \u043F\u0440\u043E\u0432\u043E\u0434\u044F\u0442 \u0441\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u0438 \u0438\u0441\u0441\u043B\u0435\u0434\u0443\u044E\u0442 \u0442\u0435\u0440\u0440\u0438\u0442\u043E\u0440\u0438\u0438. \u042D\u0442\u043E \u043E\u0434\u043D\u0430 \u0438\u0437 \u0441\u0430\u043C\u044B\u0445 \u0431\u044B\u0441\u0442\u0440\u043E\u0440\u0430\u0441\u0442\u0443\u0449\u0438\u0445 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0439 \u0432 \u043C\u0438\u0440\u0435!",
  fact: "\uD83D\uDCA1 \u0417\u043D\u0430\u0435\u0448\u044C \u043B\u0438 \u0442\u044B? \u0414\u0440\u043E\u043D\u044B \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u044E\u0442 \u043B\u0435\u043A\u0430\u0440\u0441\u0442\u0432\u0430 \u0432 \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u043D\u0438 \u0410\u0444\u0440\u0438\u043A\u0438 \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u044B!",
  levels: ["\u0412\u0437\u043B\u0451\u0442", "\u041C\u0430\u043D\u0451\u0432\u0440", "\u041C\u0438\u0441\u0441\u0438\u044F"],
};

const pilotSteps=[
  {label:"\u0412\u0437\u043B\u0451\u0442",status:"\u0413\u043E\u0442\u043E\u0432\u0438\u043C\u0441\u044F \u043A \u0432\u0437\u043B\u0451\u0442\u0443...",droneClass:"",
   realWorld:"\u041F\u0435\u0440\u0435\u0434 \u043A\u0430\u0436\u0434\u044B\u043C \u043F\u043E\u043B\u0451\u0442\u043E\u043C \u043F\u0438\u043B\u043E\u0442 \u043E\u0431\u044F\u0437\u0430\u043D \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u0440\u043E\u043D \u0438 \u043F\u043E\u0433\u043E\u0434\u0443. \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u0435\u0436\u0434\u0435 \u0432\u0441\u0435\u0433\u043E!",
   question:"\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0434 \u0432\u0437\u043B\u0451\u0442\u043E\u043C?",options:["\u0417\u0430\u0440\u044F\u0434 \u0431\u0430\u0442\u0430\u0440\u0435\u0438 \u0438 \u043F\u043E\u0433\u043E\u0434\u0443","\u0422\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0433\u043E\u0434\u0443","\u041D\u0438\u0447\u0435\u0433\u043E"],correct:0,stars:1},
  {label:"\u041D\u0430\u0431\u043E\u0440 \u0432\u044B\u0441\u043E\u0442\u044B",status:"\u041D\u0430\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u044B\u0441\u043E\u0442\u0443!",droneClass:"fly-up",
   realWorld:"\u0412 \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u0435 \u0441\u0442\u0440\u0430\u043D \u0434\u0440\u043E\u043D \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0442\u044C \u0432\u044B\u0448\u0435 120 \u043C\u0435\u0442\u0440\u043E\u0432 \u0431\u0435\u0437 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F. \u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0432\u0430\u0436\u043D\u044B \u0434\u043B\u044F \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438!",
   question:"\u041D\u0430 \u043A\u0430\u043A\u043E\u0439 \u0432\u044B\u0441\u043E\u0442\u0435 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E \u043B\u0435\u0442\u0430\u0442\u044C \u0434\u0440\u043E\u043D\u0443?",options:["\u041B\u044E\u0431\u043E\u0439","\u0414\u043E 120 \u043C\u0435\u0442\u0440\u043E\u0432","\u0412\u044B\u0448\u0435 500 \u043C\u0435\u0442\u0440\u043E\u0432"],correct:1,stars:2},
  {label:"\u041C\u0430\u043D\u0451\u0432\u0440",status:"\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0435\u043C \u043C\u0430\u043D\u0451\u0432\u0440!",droneClass:"fly-turn",
   realWorld:"\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0438\u043B\u043E\u0442\u044B \u0438\u0437\u0443\u0447\u0430\u044E\u0442 \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u0437\u0430\u0440\u0430\u043D\u0435\u0435 \u0438 \u0432\u0441\u0435\u0433\u0434\u0430 \u0438\u043C\u0435\u044E\u0442 \u043F\u043B\u0430\u043D \u0411 \u043D\u0430 \u0441\u043B\u0443\u0447\u0430\u0439 \u043F\u043E\u043C\u0435\u0445. \u0413\u0438\u0431\u043A\u043E\u0441\u0442\u044C \u2014 \u043A\u043B\u044E\u0447 \u043A \u0443\u0441\u043F\u0435\u0445\u0443!",
   question:"\u041A\u0430\u043A \u0438\u0437\u0431\u0435\u0436\u0430\u0442\u044C \u0441\u0442\u043E\u043B\u043A\u043D\u043E\u0432\u0435\u043D\u0438\u044F \u0441 \u043F\u0442\u0438\u0446\u0435\u0439?",options:["\u0423\u0441\u043A\u043E\u0440\u0438\u0442\u044C\u0441\u044F","\u0421\u043D\u0438\u0437\u0438\u0442\u044C \u0432\u044B\u0441\u043E\u0442\u0443 \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043A\u0443\u0440\u0441","\u0418\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C"],correct:1,stars:2},
  {label:"\u0422\u0443\u0440\u0431\u0443\u043B\u0435\u043D\u0442\u043D\u043E\u0441\u0442\u044C",status:"\u0422\u0443\u0440\u0431\u0443\u043B\u0435\u043D\u0442\u043D\u043E\u0441\u0442\u044C!",droneClass:"fly-shake",
   realWorld:"\u0422\u0443\u0440\u0431\u0443\u043B\u0435\u043D\u0442\u043D\u043E\u0441\u0442\u044C \u2014 \u043E\u0434\u043D\u0430 \u0438\u0437 \u0433\u043B\u0430\u0432\u043D\u044B\u0445 \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0435\u0439 \u0434\u043B\u044F \u0434\u0440\u043E\u043D\u043E\u0432. \u041F\u0438\u043B\u043E\u0442\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u044E\u0442 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u043F\u043E\u0433\u043E\u0434\u044B \u043F\u0435\u0440\u0435\u0434 \u0432\u044B\u043B\u0435\u0442\u043E\u043C.",
   question:"\u0427\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0440\u0438 \u0441\u0438\u043B\u044C\u043D\u043E\u043C \u0432\u0435\u0442\u0440\u0435?",options:["\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u043F\u043E\u043B\u0451\u0442","\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430 \u0431\u0430\u0437\u0443","\u041D\u0430\u0431\u0440\u0430\u0442\u044C \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C"],correct:1,stars:3},
  {label:"\u041F\u043E\u0441\u0430\u0434\u043A\u0430",status:"\u0418\u0434\u0451\u043C \u043D\u0430 \u043F\u043E\u0441\u0430\u0434\u043A\u0443!",droneClass:"fly-land",
   realWorld:"\u041F\u043E\u0441\u0430\u0434\u043A\u0430 \u2014 \u0441\u0430\u043C\u044B\u0439 \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442. \u041F\u0438\u043B\u043E\u0442\u044B \u0432\u0441\u0435\u0433\u0434\u0430 \u0432\u044B\u0431\u0438\u0440\u0430\u044E\u0442 \u0440\u043E\u0432\u043D\u0443\u044E \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0443 \u0438 \u043F\u043B\u0430\u0432\u043D\u043E \u0441\u043D\u0438\u0436\u0430\u044E\u0442 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u043F\u043E\u0432\u0440\u0435\u0434\u0438\u0442\u044C \u0434\u0440\u043E\u043D.",
   question:"\u041A\u0430\u043A \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u043F\u0440\u0438\u0437\u0435\u043C\u043B\u0438\u0442\u044C\u0441\u044F?",options:["\u0420\u0435\u0437\u043A\u043E \u0441\u043D\u0438\u0437\u0438\u0442\u044C\u0441\u044F","\u041F\u043B\u0430\u0432\u043D\u043E \u0441\u043D\u0438\u0437\u0438\u0442\u044C \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0438 \u0432\u044B\u0441\u043E\u0442\u0443","\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0432 \u0432\u043E\u0437\u0434\u0443\u0445\u0435"],correct:1,stars:3},
];
let pilotStep=0,pilotScore=0,pilotShowIntro=true,pilotCorrect=0;

function renderPilotIntro(container){
  const info=PILOT_SIM_INTRO;
  container.innerHTML=
    "<div class='sim-intro-card'>"+
    "<div class='sim-intro-icon'>\uD83D\uDE81</div>"+
    "<h3 class='sim-intro-title'>"+escHtml(info.title)+"</h3>"+
    "<p class='sim-intro-sub'>"+escHtml(info.subtitle)+"</p>"+
    "<div class='sim-intro-why'><strong>\u041F\u043E\u0447\u0435\u043C\u0443 \u044D\u0442\u043E \u0432\u0430\u0436\u043D\u043E?</strong><br>"+escHtml(info.why)+"</div>"+
    "<div class='sim-intro-fact'>"+escHtml(info.fact)+"</div>"+
    "<div class='sim-intro-levels'>"+info.levels.map((l,i)=>"<span class='sim-level-badge"+(i===0?" active":"")+"'>"+escHtml(l)+"</span>").join(" \u2192 ")+"</div>"+
    "<button class='btn-main sim-start-btn' id='pilot-start-btn'>\uD83D\uDE80 \u041D\u0430\u0447\u0430\u0442\u044C \u043F\u043E\u043B\u0451\u0442!</button>"+
    "</div>";
  const startBtn=container.querySelector("#pilot-start-btn");
  if(startBtn)startBtn.addEventListener("click",()=>{pilotShowIntro=false;renderPilotStep(container,0);aniSay("\uD83D\uDE81 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0434\u0440\u043E\u043D \u0438 \u0432\u0437\u043B\u0435\u0442\u0430\u0435\u043C!");});
}

function renderPilotStep(container,stepIdx){
  if(stepIdx>=pilotSteps.length){
    container.innerHTML=
      "<div class='sim-result'>"+
      "<div class='sim-result-icon'>\uD83C\uDFC6</div>"+
      "<h3>\u041F\u043E\u043B\u0451\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D!</h3>"+
      "<p>\u0422\u044B \u043D\u0430\u0431\u0440\u0430\u043B "+pilotScore+" \u0437\u0432\u0451\u0437\u0434!</p>"+
      "<div class='sim-result-career'><strong>\uD83C\uDFAF \u041A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u043F\u0443\u0442\u044C:</strong> \u041F\u043E\u043B\u0443\u0447\u0438 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043F\u0438\u043B\u043E\u0442\u0430 \u0434\u0440\u043E\u043D\u0430 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430\u0439 \u0432 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0435, \u043A\u0438\u043D\u043E\u0441\u044A\u0451\u043C\u043A\u0435 \u0438\u043B\u0438 \u0441\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F\u0445!</div>"+
      "<button class='btn-main' id='pilot-restart'>\u041B\u0435\u0442\u0438\u043C \u0441\u043D\u043E\u0432\u0430!</button>"+
      "</div>";
    const rb=container.querySelector("#pilot-restart");
    if(rb)rb.addEventListener("click",()=>{pilotStep=0;pilotScore=0;pilotCorrect=0;pilotShowIntro=true;renderPilotIntro(container);});
    aniExcited();aniSay("\uD83D\uDE81 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u044E! \u0422\u044B \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u043F\u0438\u043B\u043E\u0442!");
    awardPoints(30,"Pilot Simulation");
    const p=getProgress();p.simDone++;saveProgress(p);updateDashboard();
    // Step 3: track skill result
    onPilotSimComplete(pilotCorrect, pilotSteps.length);
    return;
  }
  const s=pilotSteps[stepIdx];
  const progressPct=Math.round((stepIdx/pilotSteps.length)*100);
  const dots=pilotSteps.map((_,i)=>"<div class='pilot-step-dot"+(i<stepIdx?" done":i===stepIdx?" current":"")+"'></div>").join("");
  container.innerHTML=
    "<div class='sim-progress-wrap'><div class='sim-progress-bar'><div class='sim-progress-fill' style='width:"+progressPct+"%'></div></div><span class='sim-progress-label'>\u0428\u0430\u0433 "+(stepIdx+1)+" \u0438\u0437 "+pilotSteps.length+"</span></div>"+
    "<div class='sim-realworld-tip'>\uD83C\uDF0D "+escHtml(s.realWorld)+"</div>"+
    "<div class='pilot-steps-bar'>"+dots+"</div>"+
    "<div class='pilot-display'>"+
    "<div class='pilot-ground'></div>"+
    "<div class='pilot-step-label'>"+escHtml(s.label)+"</div>"+
    "<div class='pilot-drone "+s.droneClass+"'>\uD83D\uDE81</div>"+
    "<div class='pilot-status'>"+escHtml(s.status)+"</div>"+
    "<div class='pilot-score-row'><span class='pilot-stars'>"+"\u2B50".repeat(pilotScore)+"</span><span class='pilot-pts'>"+pilotScore+" stars</span></div>"+
    "</div>"+
    "<div class='sim-ani-hint'>\uD83E\uDD16 \u0410\u043D\u044E\u0448\u0430: <em>\uD83D\uDE81 \u041F\u043E\u0434\u0443\u043C\u0430\u0439, \u043A\u0430\u043A \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u043F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430!</em></div>"+
    "<p class='sim-question'>"+escHtml(s.question)+"</p>"+
    "<div class='sim-options'>"+s.options.map((o,i)=>"<button class='sim-opt-btn' data-idx='"+i+"'>"+escHtml(o)+"</button>").join("")+"</div>"+
    "<div id='pilot-feedback'></div>";
  container.querySelectorAll(".sim-opt-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx=parseInt(btn.dataset.idx),correct=idx===s.correct;
      container.querySelectorAll(".sim-opt-btn").forEach(b=>{b.disabled=true;if(parseInt(b.dataset.idx)===s.correct)b.classList.add("correct");else b.classList.add("wrong");});
      if(correct){pilotScore+=s.stars;pilotCorrect++;aniHappy();aniSay("\uD83D\uDE81 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \uD83C\uDF89");recordStrongArea("Pilot");}
      else{aniThinkThenSay("\uD83D\uDCA1 \u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u0432\u044B\u0434\u0435\u043B\u0435\u043D. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451!");recordWeakArea("Pilot");}
      const fb=container.querySelector("#pilot-feedback");
      if(fb){
        fb.innerHTML="<div class='"+(correct?"correct-fb":"wrong-fb")+"'>"+(correct?"\u2705 \u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E!":"\u274C \u041D\u0435 \u0441\u043E\u0432\u0441\u0435\u043C...")+"</div>"+
          "<button class='btn-main pilot-action-btn' style='margin-top:14px' id='pilot-next'>"+(stepIdx<pilotSteps.length-1?"\u0414\u0430\u043B\u044C\u0448\u0435 \u27A1\uFE0F":"\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \uD83C\uDFC6")+"</button>";
        const nb=fb.querySelector("#pilot-next");
        if(nb)nb.addEventListener("click",()=>{pilotStep++;renderPilotStep(container,pilotStep);});
      }
    });
  });
}
function initPilotSim(){
  const openBtn=$("open-pilot-sim"),closeBtn=$("close-pilot-sim"),modal=$("pilot-sim-modal"),content=$("pilot-sim-content");
  if(!openBtn||!modal||!content)return;
  openBtn.addEventListener("click",()=>{
    guardSimulation("pilot_sim", ()=>{
      modal.classList.remove("hidden");pilotStep=0;pilotScore=0;pilotCorrect=0;pilotShowIntro=true;renderPilotIntro(content);
      aniSay("\uD83D\uDE81 \u0414\u0430\u0432\u0430\u0439 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u043C, \u043A\u0430\u043A\u043E\u0432\u0430 \u0440\u0430\u0431\u043E\u0442\u0430 \u043F\u0438\u043B\u043E\u0442\u0430 \u0434\u0440\u043E\u043D\u0430!");
    });
  });
  if(closeBtn)closeBtn.addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden");});
}

/* ── FULL QUIZ ── */
const quizCatMap={
  "tech":  {name:"IT-\u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442",    icon:"\uD83D\uDCBB", link:"cyber-defender.html",   why:"\u0422\u0435\u0431\u0435 \u043D\u0440\u0430\u0432\u044F\u0442\u0441\u044F \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438 \u0438 \u043B\u043E\u0433\u0438\u043A\u0430!"},
  "sky":   {name:"\u041F\u0438\u043B\u043E\u0442 \u0434\u0440\u043E\u043D\u0430",      icon:"\uD83D\uDE81", link:"drone-pilot.html",       why:"\u0422\u044B \u043B\u044E\u0431\u0438\u0448\u044C \u043D\u0435\u0431\u043E \u0438 \u043F\u0440\u0438\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F!"},
  "space": {name:"\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C",    icon:"\uD83C\uDF0C", link:"space-explorer.html",    why:"\u0422\u0435\u0431\u044F \u043C\u0430\u043D\u0438\u0442 \u043A\u043E\u0441\u043C\u043E\u0441 \u0438 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F!"},
  "create":{name:"\u0413\u0435\u0439\u043C-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440",   icon:"\uD83C\uDFAE", link:"game-designer.html",     why:"\u0422\u044B \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u0438\u0439 \u0438 \u043B\u044E\u0431\u0438\u0448\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C!"},
  "game":  {name:"\u0413\u0435\u0439\u043C-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440",   icon:"\uD83C\uDFAE", link:"game-designer.html",     why:"\u0422\u044B \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u0438\u0439 \u0438 \u043B\u044E\u0431\u0438\u0448\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C!"},
  "robot": {name:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440-\u0440\u043E\u0431\u043E\u0442",    icon:"\uD83E\uDD16", link:"robotics-engineer.html", why:"\u0422\u0435\u0431\u0435 \u043D\u0440\u0430\u0432\u0438\u0442\u0441\u044F \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0438 \u0438\u0437\u043E\u0431\u0440\u0435\u0442\u0430\u0442\u044C!"},
  "cyber": {name:"\u041A\u0438\u0431\u0435\u0440-\u0437\u0430\u0449\u0438\u0442\u043D\u0438\u043A",  icon:"\uD83D\uDEE1\uFE0F", link:"cyber-defender.html", why:"\u0422\u044B \u0445\u043E\u0447\u0435\u0448\u044C \u0437\u0430\u0449\u0438\u0449\u0430\u0442\u044C \u0446\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u043C\u0438\u0440!"},
};
function initQuizPage(){
  const box=$("quiz-box");if(!box)return;
  const scores={};let current=0;
  const questions=box.querySelectorAll(".question");
  const progressFill=box.querySelector(".quiz-progress-fill");
  const result=$("quiz-result");
  function showQ(idx){
    questions.forEach((q,i)=>q.classList.toggle("active",i===idx));
    if(progressFill)progressFill.style.width=((idx/questions.length)*100)+"%";
    if(idx<questions.length)aniThink();
  }
  questions.forEach((qEl,idx)=>{
    qEl.querySelectorAll(".options button").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const cat=btn.dataset.cat||"tech";
        scores[cat]=(scores[cat]||0)+1;
        current++;
        if(current<questions.length)showQ(current);
        else showQuizPageResult(scores,result,progressFill);
      });
    });
  });
  showQ(0);
  const retryBtn=$("quiz-retry-btn");
  if(retryBtn)retryBtn.addEventListener("click",()=>{
    Object.keys(scores).forEach(k=>delete scores[k]);
    current=0;
    if(result)result.classList.add("hidden");
    showQ(0);
  });
}
function showQuizPageResult(scores,resultEl,progressFill){
  if(progressFill)progressFill.style.width="100%";
  const top=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,2);
  const primary=quizCatMap[top[0]?.[0]]||quizCatMap["tech"];
  const secondary=top[1]?quizCatMap[top[1][0]]:null;
  if(resultEl){
    resultEl.classList.remove("hidden");
    const rt=$("result-text");
    if(rt)rt.textContent=primary.icon+" "+primary.name;
    const rc=$("result-cards");
    if(rc){
      rc.innerHTML="<div class='result-card'><div style='font-size:2.5rem;margin-bottom:10px'>"+primary.icon+"</div><div class='result-card-name'>"+escHtml(primary.name)+"</div><div class='result-card-why'>"+escHtml(primary.why)+"</div><a href='"+primary.link+"' class='btn-main' style='margin-top:14px;display:inline-block'>\u0423\u0437\u043D\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435</a></div>"+
        (secondary?"<div class='result-card'><div style='font-size:2.5rem;margin-bottom:10px'>"+secondary.icon+"</div><div class='result-card-name'>"+escHtml(secondary.name)+"</div><div class='result-card-why'>"+escHtml(secondary.why)+"</div><a href='"+secondary.link+"' class='btn-main' style='margin-top:14px;display:inline-block'>\u0423\u0437\u043D\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435</a></div>":"");
    }
  }
  document.querySelectorAll(".question").forEach(q=>q.classList.remove("active"));
  aniExcited();aniSay("\uD83C\uDF89 \u0422\u0432\u043E\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u044F - "+primary.name+"!");
  launchConfetti();
  awardPoints(50,"Full Quiz");
  const p=getProgress();p.quizDone++;saveProgress(p);updateDashboard();
  safe(()=>initAiMentor(scores));
}

/* ── AI MENTOR ── */
const AI_ROADMAPS={
  tech:{title:"Software Developer / IT Specialist",steps:[{icon:"\uD83D\uDCBB",text:"Learn Python or JavaScript basics (3-6 months)"},{icon:"\uD83C\uDF10",text:"Build your first website or app"},{icon:"\uD83D\uDD27",text:"Study algorithms and data structures"},{icon:"\uD83D\uDE80",text:"Contribute to open source projects"},{icon:"\uD83C\uDFC6",text:"Land your first internship or freelance job"}],skills:["Python","JavaScript","Problem Solving","Git","Databases"],resources:["freeCodeCamp","Khan Academy","CS50 (Harvard)","Codecademy"]},
  sky:{title:"Drone Pilot / Aviation Specialist",steps:[{icon:"\uD83D\uDE81",text:"Learn drone regulations and safety rules"},{icon:"\uD83C\uDF0D",text:"Practice with a beginner drone simulator"},{icon:"\uD83D\uDCF7",text:"Get your drone pilot certification"},{icon:"\uD83D\uDDFA\uFE0F",text:"Learn aerial photography and mapping"},{icon:"\uD83C\uDFC6",text:"Work on real missions: delivery, inspection, film"}],skills:["Navigation","Physics","Photography","Safety Protocols","Regulations"],resources:["FAA Drone Zone","DJI Academy","Coursera Aviation","YouTube tutorials"]},
  space:{title:"Space Explorer / Astronomer",steps:[{icon:"\uD83D\uDD2D",text:"Study physics, math, and astronomy"},{icon:"\uD83D\uDE80",text:"Join astronomy clubs and competitions"},{icon:"\uD83D\uDCBB",text:"Learn programming for data analysis"},{icon:"\uD83C\uDF0C",text:"Apply for space agency programs (NASA, ESA)"},{icon:"\uD83C\uDFC6",text:"Conduct your own research or experiments"}],skills:["Physics","Mathematics","Programming","Research","Critical Thinking"],resources:["NASA Learning","ESA Education","Coursera Astronomy","Khan Academy Physics"]},
  create:{title:"Game Designer / Creative Developer",steps:[{icon:"\uD83C\uDFAE",text:"Learn Unity or Godot game engine basics"},{icon:"\uD83C\uDFA8",text:"Study game design principles and UX"},{icon:"\uD83D\uDCBB",text:"Build and publish your first small game"},{icon:"\uD83D\uDC65",text:"Join game jams and creative communities"},{icon:"\uD83C\uDFC6",text:"Build a portfolio and apply to studios"}],skills:["Unity/Godot","C# or GDScript","Art & Design","Storytelling","UX Design"],resources:["Unity Learn","Godot Docs","itch.io","Game Maker's Toolkit (YouTube)"]},
  robot:{title:"Robotics Engineer",steps:[{icon:"\uD83E\uDD16",text:"Learn electronics and basic circuits"},{icon:"\uD83D\uDCBB",text:"Study Python and C++ for robotics"},{icon:"\uD83D\uDD27",text:"Build projects with Arduino or Raspberry Pi"},{icon:"\uD83C\uDF93",text:"Study mechanical engineering fundamentals"},{icon:"\uD83C\uDFC6",text:"Compete in robotics competitions (FIRST, WRO)"}],skills:["Electronics","Python/C++","Mechanical Design","Problem Solving","CAD"],resources:["Arduino Project Hub","ROS (Robot OS)","Coursera Robotics","FIRST Robotics"]},
  cyber:{title:"Cyber Security Defender",steps:[{icon:"\uD83D\uDD12",text:"Learn networking fundamentals (TCP/IP, DNS)"},{icon:"\uD83D\uDCBB",text:"Study Linux and command line basics"},{icon:"\uD83D\uDEE1\uFE0F",text:"Practice on CTF (Capture The Flag) challenges"},{icon:"\uD83C\uDF93",text:"Get CompTIA Security+ or CEH certification"},{icon:"\uD83C\uDFC6",text:"Work as a penetration tester or security analyst"}],skills:["Networking","Linux","Python","Cryptography","Ethical Hacking"],resources:["TryHackMe","HackTheBox","Cybrary","OWASP"]},
  game:{title:"Game Designer / Creative Developer",steps:[{icon:"\uD83C\uDFAE",text:"Learn Unity or Godot game engine basics"},{icon:"\uD83C\uDFA8",text:"Study game design principles and UX"},{icon:"\uD83D\uDCBB",text:"Build and publish your first small game"},{icon:"\uD83D\uDC65",text:"Join game jams and creative communities"},{icon:"\uD83C\uDFC6",text:"Build a portfolio and apply to studios"}],skills:["Unity/Godot","C# or GDScript","Art & Design","Storytelling","UX Design"],resources:["Unity Learn","Godot Docs","itch.io","Game Maker's Toolkit (YouTube)"]},
};

/**
 * Mock AI call — returns a career roadmap based on quiz scores.
 * Replace with real API call when key is available.
 * @param {{scores:Object, xp:number, level:number}} userProfile
 */
async function sendUserDataToAI(userProfile){
  await new Promise(r=>setTimeout(r,1800));
  const top=Object.entries(userProfile.scores||{}).sort((a,b)=>b[1]-a[1])[0];
  const cat=top?top[0]:"tech";
  return AI_ROADMAPS[cat]||AI_ROADMAPS["tech"];
}

function renderAiMentor(roadmap,container){
  container.innerHTML=
    "<div class='ai-result'>"+
    "<h4 class='ai-career-title'>"+escHtml(roadmap.title)+"</h4>"+
    "<div class='ai-roadmap'><p class='ai-section-label'>\uD83D\uDDFA\uFE0F Your path:</p>"+
    roadmap.steps.map((s,i)=>"<div class='ai-step'><span class='ai-step-num'>"+(i+1)+"</span><span class='ai-step-icon'>"+s.icon+"</span><span class='ai-step-text'>"+escHtml(s.text)+"</span></div>").join("")+
    "</div>"+
    "<div class='ai-skills'><p class='ai-section-label'>\uD83D\uDCAA Key skills:</p>"+
    "<div class='ai-skill-tags'>"+roadmap.skills.map(s=>"<span class='ai-skill-tag'>"+escHtml(s)+"</span>").join("")+"</div></div>"+
    "<div class='ai-resources'><p class='ai-section-label'>\uD83D\uDCDA Learning resources:</p>"+
    "<div class='ai-resource-list'>"+roadmap.resources.map(r=>"<div class='ai-resource-item'>\u2022 "+escHtml(r)+"</div>").join("")+"</div></div>"+
    "</div>";
}

async function initAiMentor(scores){
  const section=$("ai-mentor-section"),content=$("ai-mentor-content"),thinking=$("ai-thinking");
  if(!section||!content)return;
  section.style.display="block";
  setTimeout(()=>section.scrollIntoView({behavior:"smooth",block:"start"}),300);
  if(thinking)thinking.style.display="flex";
  try{
    const roadmap=await sendUserDataToAI({scores,xp:getProgress().points,level:getLevelInfo(getProgress().points).level});
    if(thinking)thinking.style.display="none";
    renderAiMentor(roadmap,content);
    aniHappy();aniSay("\u0412\u043E\u0442 \u0442\u0432\u043E\u0439 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043B\u0430\u043D! \uD83D\uDE80");
  }catch{
    if(thinking)thinking.style.display="none";
    if(content)content.innerHTML="<p style='color:rgba(255,255,255,0.6);text-align:center'>\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u043B\u0430\u043D. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u043E\u0432\u0430.</p>";
  }
}

/* ── SKILL LAB ── */
const SKILL_MODULES = {
  logic: {
    name: "\u041b\u043e\u0433\u0438\u043a\u0430", icon: "\uD83E\uDDE9",
    tiers: {
      basic: {
        label: "\u0411\u0430\u0437\u043e\u0432\u044b\u0439", xp: 15,
        tasks: [
          { q: "\u0427\u0442\u043e \u0438\u0434\u0451\u0442 \u0434\u0430\u043b\u044c\u0448\u0435: 2, 4, 6, 8, ...?", hint: "\u0421\u043c\u043e\u0442\u0440\u0438 \u043d\u0430 \u0440\u0430\u0437\u043d\u0438\u0446\u0443 \u043c\u0435\u0436\u0434\u0443 \u0447\u0438\u0441\u043b\u0430\u043c\u0438!", options: ["9", "10", "12"], correct: 1, explanation: "\u041a\u0430\u0436\u0434\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0435\u0433\u043e \u043d\u0430 2." },
          { q: "\u0423 \u041c\u0430\u0448\u0438 5 \u044f\u0431\u043b\u043e\u043a. \u041e\u043d\u0430 \u0441\u044a\u0435\u043b\u0430 2. \u0421\u043a\u043e\u043b\u044c\u043a\u043e \u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c?", hint: "\u041f\u0440\u043e\u0441\u0442\u043e\u0435 \u0432\u044b\u0447\u0438\u0442\u0430\u043d\u0438\u0435!", options: ["2", "3", "4"], correct: 1, explanation: "5 \u043c\u0438\u043d\u0443\u0441 2 \u0440\u0430\u0432\u043d\u043e 3." },
          { q: "\u041a\u0430\u043a\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u043b\u0438\u0448\u043d\u0435\u0435: 3, 6, 9, 13?", hint: "\u0412\u0441\u0435 \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0435\u043b\u044f\u0442\u0441\u044f \u043d\u0430 3!", options: ["3", "9", "13"], correct: 2, explanation: "3, 6, 9 \u0434\u0435\u043b\u044f\u0442\u0441\u044f \u043d\u0430 3, \u0430 13 \u2014 \u043d\u0435\u0442." }
        ]
      },
      intermediate: {
        label: "\u0421\u0440\u0435\u0434\u043d\u0438\u0439", xp: 25,
        tasks: [
          { q: "\u0415\u0441\u043b\u0438 \u0432\u0441\u0435 \u043a\u043e\u0448\u043a\u0438 \u2014 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435, \u0430 \u0432\u0441\u0435 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435 \u2014 \u043a\u043e\u0448\u043a\u0438, \u0442\u043e \u0432\u0435\u0440\u043d\u043e \u043b\u0438: \u0432\u0441\u0435 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435 \u2014 \u043a\u043e\u0448\u043a\u0438?", hint: "\u041f\u043e\u0434\u0443\u043c\u0430\u0439: \u0435\u0441\u043b\u0438 A=B \u0438 B=C, \u0442\u043e A=C?", options: ["\u0414\u0430", "\u041d\u0435\u0442", "\u041d\u0435 \u0432\u0441\u0435\u0433\u0434\u0430"], correct: 0, explanation: "\u042d\u0442\u043e \u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0437\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435: \u0435\u0441\u043b\u0438 \u0432\u0441\u0435 \u043a\u043e\u0448\u043a\u0438=\u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435 \u0438 \u0432\u0441\u0435 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0435=\u043a\u043e\u0448\u043a\u0438, \u0442\u043e \u0434\u0430." },
          { q: "\u0427\u0442\u043e \u0431\u0443\u0434\u0435\u0442 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435 ?: 1, 1, 2, 3, 5, 8, ?", hint: "\u041a\u0430\u0436\u0434\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u2014 \u0441\u0443\u043c\u043c\u0430 \u0434\u0432\u0443\u0445 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0445!", options: ["11", "13", "15"], correct: 1, explanation: "5+8=13. \u042d\u0442\u043e \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u0424\u0438\u0431\u043e\u043d\u0430\u0447\u0447\u0438!" },
          { q: "\u0412 \u043a\u043e\u0440\u0437\u0438\u043d\u0435 3 \u043a\u0440\u0430\u0441\u043d\u044b\u0445 \u0438 5 \u0441\u0438\u043d\u0438\u0445 \u0448\u0430\u0440\u0438\u043a\u043e\u0432. \u041a\u0430\u043a\u043e\u0439 \u0448\u0430\u043d\u0441 \u0432\u044b\u0442\u0430\u0449\u0438\u0442\u044c \u043a\u0440\u0430\u0441\u043d\u044b\u0439?", hint: "\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u0432\u0441\u0435\u0433\u043e \u0448\u0430\u0440\u0438\u043a\u043e\u0432?", options: ["3/5", "3/8", "5/8"], correct: 1, explanation: "\u0412\u0441\u0435\u0433\u043e 8 \u0448\u0430\u0440\u0438\u043a\u043e\u0432, 3 \u043a\u0440\u0430\u0441\u043d\u044b\u0445. \u0428\u0430\u043d\u0441 = 3/8." }
        ]
      },
      advanced: {
        label: "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439", xp: 40,
        tasks: [
          { q: "\u0415\u0441\u043b\u0438 A > B \u0438 B > C, \u0442\u043e \u0432\u0435\u0440\u043d\u043e \u043b\u0438 A > C?", hint: "\u041f\u043e\u0434\u0443\u043c\u0430\u0439 \u043e \u0442\u0440\u0430\u043d\u0437\u0438\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438!", options: ["\u0414\u0430, \u0432\u0441\u0435\u0433\u0434\u0430", "\u041d\u0435\u0442", "\u0418\u043d\u043e\u0433\u0434\u0430"], correct: 0, explanation: "\u0422\u0440\u0430\u043d\u0437\u0438\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c: \u0435\u0441\u043b\u0438 A>B \u0438 B>C, \u0442\u043e A>C \u2014 \u0432\u0441\u0435\u0433\u0434\u0430 \u0432\u0435\u0440\u043d\u043e." },
          { q: "\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u0440\u0443\u043a\u043e\u043f\u043e\u0436\u0430\u0442\u0438\u0439 \u043c\u043e\u0436\u043d\u043e \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u0438\u0437 3 \u0431\u0443\u043a\u0432: A, B, C (\u043a\u0430\u0436\u0434\u0430\u044f \u043e\u0434\u0438\u043d \u0440\u0430\u0437)?", hint: "\u041f\u0435\u0440\u0432\u0430\u044f \u0431\u0443\u043a\u0432\u0430 \u2014 3 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u0430, \u0432\u0442\u043e\u0440\u0430\u044f \u2014 2, \u0442\u0440\u0435\u0442\u044c\u044f \u2014 1.", options: ["3", "6", "9"], correct: 1, explanation: "3\u00d72\u00d71 = 6 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u044b\u0445 \u0440\u0443\u043a\u043e\u043f\u043e\u0436\u0430\u0442\u0438\u0439." },
          { q: "\u0427\u0435\u0440\u0435\u0437 \u043a\u0430\u043a\u043e\u0435 \u043d\u0430\u0438\u043c\u0435\u043d\u044c\u0448\u0435\u0435 \u0447\u0438\u0441\u043b\u043e \u0434\u0435\u043b\u044f\u0442\u0441\u044f \u0438 12, \u0438 18?", hint: "\u041d\u0430\u0439\u0434\u0438 \u043e\u0431\u0449\u0438\u0435 \u0434\u0435\u043b\u0438\u0442\u0435\u043b\u0438!", options: ["3", "6", "9"], correct: 1, explanation: "\u041d\u041e\u0414(12,18) = 6." }
        ]
      }
    }
  },
  creative: {
    name: "\u0422\u0432\u043e\u0440\u0447\u0435\u0441\u0442\u0432\u043e", icon: "\uD83C\uDFA8",
    tiers: {
      basic: {
        label: "\u0411\u0430\u0437\u043e\u0432\u044b\u0439", xp: 15,
        tasks: [
          { q: "\u041a\u0430\u043a\u0438\u0435 \u0446\u0432\u0435\u0442\u0430 \u043f\u043e\u043b\u0443\u0447\u0438\u0448\u044c, \u0441\u043c\u0435\u0448\u0430\u0432 \u0436\u0451\u043b\u0442\u044b\u0439 \u0438 \u0441\u0438\u043d\u0438\u0439?", hint: "\u041f\u043e\u0434\u0443\u043c\u0430\u0439 \u043e \u0440\u0430\u0434\u0443\u0433\u0435!", options: ["\u041e\u0440\u0430\u043d\u0436\u0435\u0432\u044b\u0439", "\u0417\u0435\u043b\u0451\u043d\u044b\u0439", "\u0424\u0438\u043e\u043b\u0435\u0442\u043e\u0432\u044b\u0439"], correct: 1, explanation: "\u0416\u0451\u043b\u0442\u044b\u0439 + \u0441\u0438\u043d\u0438\u0439 = \u0437\u0435\u043b\u0451\u043d\u044b\u0439." },
          { q: "\u0427\u0442\u043e \u0433\u043b\u0430\u0432\u043d\u043e\u0435 \u0432 \u0434\u0438\u0437\u0430\u0439\u043d\u0435 \u043f\u043b\u0430\u043a\u0430\u0442\u0430?", hint: "\u041f\u043b\u0430\u043a\u0430\u0442 \u0434\u043e\u043b\u0436\u0435\u043d \u0441\u0440\u0430\u0437\u0443 \u043f\u0440\u0438\u0432\u043b\u0435\u043a\u0430\u0442\u044c \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435!", options: ["\u041c\u043d\u043e\u0433\u043e \u0442\u0435\u043a\u0441\u0442\u0430", "\u042f\u0440\u043a\u0438\u0439 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a \u0438 \u043f\u0440\u043e\u0441\u0442\u043e\u0442\u0430", "\u0422\u043e\u043b\u044c\u043a\u043e \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438"], correct: 1, explanation: "\u042f\u0440\u043a\u0438\u0439 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a \u0438 \u043f\u0440\u043e\u0441\u0442\u043e\u0439 \u0434\u0438\u0437\u0430\u0439\u043d \u2014 \u043e\u0441\u043d\u043e\u0432\u0430 \u0445\u043e\u0440\u043e\u0448\u0435\u0433\u043e \u043f\u043b\u0430\u043a\u0430\u0442\u0430." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0448\u0440\u0438\u0444\u0442 \u0432 \u0434\u0438\u0437\u0430\u0439\u043d\u0435?", hint: "\u0428\u0440\u0438\u0444\u0442 \u2014 \u044d\u0442\u043e \u0441\u0442\u0438\u043b\u044c \u0431\u0443\u043a\u0432!", options: ["\u0426\u0432\u0435\u0442 \u0444\u043e\u043d\u0430", "\u0421\u0442\u0438\u043b\u044c \u043d\u0430\u043f\u0438\u0441\u0430\u043d\u0438\u044f \u0431\u0443\u043a\u0432", "\u0420\u0430\u0437\u043c\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f"], correct: 1, explanation: "\u0428\u0440\u0438\u0444\u0442 \u2014 \u044d\u0442\u043e \u0441\u0442\u0438\u043b\u044c \u0438 \u0432\u043d\u0435\u0448\u043d\u0438\u0439 \u0432\u0438\u0434 \u0431\u0443\u043a\u0432." }
        ]
      },
      intermediate: {
        label: "\u0421\u0440\u0435\u0434\u043d\u0438\u0439", xp: 25,
        tasks: [
          { q: "\u041a\u0430\u043a\u043e\u0439 \u043f\u0440\u0438\u043d\u0446\u0438\u043f \u0434\u0435\u043b\u0430\u0435\u0442 \u0434\u0438\u0437\u0430\u0439\u043d \u0443\u0434\u043e\u0431\u043d\u044b\u043c?", hint: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0434\u043e\u043b\u0436\u0435\u043d \u043b\u0435\u0433\u043a\u043e \u043d\u0430\u0439\u0442\u0438 \u043d\u0443\u0436\u043d\u043e\u0435!", options: ["\u041c\u043d\u043e\u0433\u043e \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u043e\u0432", "\u0427\u0451\u0442\u043a\u0430\u044f \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0438 \u043f\u0440\u043e\u0441\u0442\u043e\u0442\u0430", "\u042f\u0440\u043a\u0438\u0435 \u0446\u0432\u0435\u0442\u0430 \u0432\u0435\u0437\u0434\u0435"], correct: 1, explanation: "\u0427\u0451\u0442\u043a\u0430\u044f \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0438 \u043f\u0440\u043e\u0441\u0442\u043e\u0442\u0430 \u2014 \u043e\u0441\u043d\u043e\u0432\u0430 UX." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043a\u043e\u043d\u0442\u0440\u0430\u0441\u0442 \u0432 \u0434\u0438\u0437\u0430\u0439\u043d\u0435?", hint: "\u041a\u043e\u043d\u0442\u0440\u0430\u0441\u0442 \u2014 \u044d\u0442\u043e \u0440\u0430\u0437\u043d\u0438\u0446\u0430!", options: ["\u041e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u0435 \u0446\u0432\u0435\u0442\u0430", "\u0420\u0430\u0437\u043d\u044b\u0435 \u0446\u0432\u0435\u0442\u0430 \u0438\u043b\u0438 \u0440\u0430\u0437\u043c\u0435\u0440\u044b", "\u041c\u043d\u043e\u0433\u043e \u0442\u0435\u043a\u0441\u0442\u0430"], correct: 1, explanation: "\u041a\u043e\u043d\u0442\u0440\u0430\u0441\u0442 \u2014 \u0440\u0430\u0437\u043b\u0438\u0447\u0438\u0435 \u043c\u0435\u0436\u0434\u0443 \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u0430\u043c\u0438." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043c\u0443\u0434-\u0431\u043e\u0440\u0434?", hint: "\u041c\u0443\u0434-\u0431\u043e\u0440\u0434 \u043f\u043e\u043c\u043e\u0433\u0430\u0435\u0442 \u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0438\u0434\u0435\u0438!", options: ["\u0418\u0433\u0440\u0430", "\u0414\u043e\u0441\u043a\u0430 \u0434\u043b\u044f \u0441\u0431\u043e\u0440\u0430 \u0438\u0434\u0435\u0439 \u0438 \u0432\u0434\u043e\u0445\u043d\u043e\u0432\u0435\u043d\u0438\u044f", "\u041f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430"], correct: 1, explanation: "\u041c\u0443\u0434-\u0431\u043e\u0440\u0434 \u2014 \u0434\u043e\u0441\u043a\u0430 \u0434\u043b\u044f \u0441\u0431\u043e\u0440\u0430 \u0432\u0434\u043e\u0445\u043d\u043e\u0432\u043b\u044f\u044e\u0449\u0438\u0445 \u0438\u0434\u0435\u0439." }
        ]
      },
      advanced: {
        label: "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439", xp: 40,
        tasks: [
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0431\u0440\u0435\u043d\u0434\u0431\u0443\u043a?", hint: "\u0411\u0440\u0435\u043d\u0434\u0431\u0443\u043a \u2014 \u044d\u0442\u043e \u043a\u043d\u0438\u0433\u0430 \u0431\u0440\u0435\u043d\u0434\u0430!", options: ["\u041b\u043e\u0433\u043e\u0442\u0438\u043f", "\u0421\u0431\u043e\u0440\u043d\u0438\u043a \u0441\u0442\u0438\u043b\u0435\u0439 \u0438 \u043f\u0440\u0430\u0432\u0438\u043b \u0431\u0440\u0435\u043d\u0434\u0430", "\u0420\u0435\u043a\u043b\u0430\u043c\u0430"], correct: 1, explanation: "\u0411\u0440\u0435\u043d\u0434\u0431\u0443\u043a \u2014 \u0440\u0443\u043a\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e \u043f\u043e \u0441\u0442\u0438\u043b\u044e \u0431\u0440\u0435\u043d\u0434\u0430." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0442\u0435\u043e\u0440\u0438\u044f \u0446\u0432\u0435\u0442\u0430?", hint: "\u0426\u0432\u0435\u0442\u0430 \u043c\u043e\u0436\u043d\u043e \u0441\u043e\u0447\u0435\u0442\u0430\u0442\u044c!", options: ["\u041d\u0430\u0443\u043a\u0430 \u043e \u0441\u0432\u0435\u0442\u0435", "\u0421\u0438\u0441\u0442\u0435\u043c\u0430 \u0441\u043e\u0447\u0435\u0442\u0430\u043d\u0438\u044f \u0446\u0432\u0435\u0442\u043e\u0432", "\u0422\u0438\u043f \u043a\u0440\u0430\u0441\u043a\u0438"], correct: 1, explanation: "\u0422\u0435\u043e\u0440\u0438\u044f \u0446\u0432\u0435\u0442\u0430 \u2014 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0441\u043e\u0447\u0435\u0442\u0430\u043d\u0438\u044f \u0446\u0432\u0435\u0442\u043e\u0432 (RGB, \u043a\u043e\u043c\u043f\u043b\u0435\u043c\u0435\u043d\u0442\u0430\u0440\u043d\u044b\u0435 \u0438 \u0442.\u0434.)." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f?", hint: "\u041f\u0440\u043e\u0442\u043e\u0442\u0438\u043f \u2014 \u044d\u0442\u043e \u043f\u0435\u0440\u0432\u044b\u0439 \u043e\u0431\u0440\u0430\u0437\u0435\u0446!", options: ["\u0413\u043e\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u043e\u0434\u0443\u043a\u0442", "\u041f\u0435\u0440\u0432\u044b\u0439 \u043c\u0430\u043a\u0435\u0442 \u0434\u043b\u044f \u0442\u0435\u0441\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f", "\u0420\u0435\u043a\u043b\u0430\u043c\u0430"], correct: 1, explanation: "\u041f\u0440\u043e\u0442\u043e\u0442\u0438\u043f \u2014 \u043f\u0435\u0440\u0432\u044b\u0439 \u043e\u0431\u0440\u0430\u0437\u0435\u0446 \u0434\u043b\u044f \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u0438\u0434\u0435\u0438." }
        ]
      }
    }
  },
  science: {
    name: "\u041d\u0430\u0443\u043a\u0430", icon: "\uD83D\uDD2C",
    tiers: {
      basic: {
        label: "\u0411\u0430\u0437\u043e\u0432\u044b\u0439", xp: 15,
        tasks: [
          { q: "\u0427\u0442\u043e \u043d\u0443\u0436\u043d\u043e \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u044e \u0434\u043b\u044f \u0440\u043e\u0441\u0442\u0430?", hint: "\u041f\u043e\u0434\u0443\u043c\u0430\u0439, \u0447\u0442\u043e \u0434\u0430\u0451\u0442 \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u044e \u044d\u043d\u0435\u0440\u0433\u0438\u044e!", options: ["\u0422\u0435\u043c\u043d\u043e\u0442\u0430", "\u0421\u0432\u0435\u0442 \u0438 \u0432\u043e\u0434\u0430", "\u0422\u043e\u043b\u044c\u043a\u043e \u0432\u043e\u0434\u0430"], correct: 1, explanation: "\u0420\u0430\u0441\u0442\u0435\u043d\u0438\u044f \u043d\u0443\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0432 \u0441\u0432\u0435\u0442\u0435 \u0434\u043b\u044f \u0444\u043e\u0442\u043e\u0441\u0438\u043d\u0442\u0435\u0437\u0430 \u0438 \u0432\u043e\u0434\u0435." },
          { q: "\u0418\u0437 \u0447\u0435\u0433\u043e \u0441\u043e\u0441\u0442\u043e\u0438\u0442 \u0432\u043e\u0434\u0430?", hint: "\u0412\u0441\u043f\u043e\u043c\u043d\u0438 \u0445\u0438\u043c\u0438\u0447\u0435\u0441\u043a\u0443\u044e \u0444\u043e\u0440\u043c\u0443\u043b\u0443!", options: ["H3O", "H2O", "O2"], correct: 1, explanation: "\u0412\u043e\u0434\u0430 \u2014 H2O: 2 \u0430\u0442\u043e\u043c\u0430 \u0432\u043e\u0434\u043e\u0440\u043e\u0434\u0430 \u0438 1 \u043a\u0438\u0441\u043b\u043e\u0440\u043e\u0434\u0430." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0433\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044f?", hint: "\u0418\u043c\u0435\u043d\u043d\u043e \u043e\u043d\u0430 \u0434\u0435\u0440\u0436\u0438\u0442 \u043d\u0430\u0441 \u043d\u0430 \u0417\u0435\u043c\u043b\u0435!", options: ["\u0421\u0438\u043b\u0430 \u043f\u0440\u0438\u0442\u044f\u0436\u0435\u043d\u0438\u044f \u043c\u0435\u0436\u0434\u0443 \u043e\u0431\u044a\u0435\u043a\u0442\u0430\u043c\u0438", "\u0421\u0438\u043b\u0430 \u0432\u0435\u0442\u0440\u0430", "\u0422\u0435\u043f\u043b\u043e"], correct: 0, explanation: "\u0413\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044f \u2014 \u0441\u0438\u043b\u0430 \u043f\u0440\u0438\u0442\u044f\u0436\u0435\u043d\u0438\u044f \u043c\u0435\u0436\u0434\u0443 \u0442\u0435\u043b\u0430\u043c\u0438." }
        ]
      },
      intermediate: {
        label: "\u0421\u0440\u0435\u0434\u043d\u0438\u0439", xp: 25,
        tasks: [
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0430\u0442\u043e\u043c?", hint: "\u0410\u0442\u043e\u043c \u2014 \u043e\u0447\u0435\u043d\u044c \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u0430\u044f \u0447\u0430\u0441\u0442\u0438\u0446\u0430!", options: ["\u041c\u043e\u043b\u0435\u043a\u0443\u043b\u0430", "\u041c\u0435\u043b\u044c\u0447\u0430\u0439\u0448\u0430\u044f \u0447\u0430\u0441\u0442\u0438\u0446\u0430 \u0432\u0435\u0449\u0435\u0441\u0442\u0432\u0430", "\u041a\u043b\u0435\u0442\u043a\u0430"], correct: 1, explanation: "\u0410\u0442\u043e\u043c \u2014 \u043c\u0435\u043b\u044c\u0447\u0430\u0439\u0448\u0430\u044f \u0447\u0430\u0441\u0442\u0438\u0446\u0430 \u0445\u0438\u043c\u0438\u0447\u0435\u0441\u043a\u043e\u0433\u043e \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u0430." },
          { q: "\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u043b\u0430\u043d\u0435\u0442 \u0432 \u043d\u0430\u0448\u0435\u0439 \u0421\u043e\u043b\u043d\u0435\u0447\u043d\u043e\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u0435?", hint: "\u0421\u0447\u0438\u0442\u0430\u0439 \u043f\u043e \u043f\u0430\u043b\u044c\u0446\u0430\u043c!", options: ["7", "8", "9"], correct: 1, explanation: "\u0412 \u043d\u0430\u0448\u0435\u0439 \u0421\u043e\u043b\u043d\u0435\u0447\u043d\u043e\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u0435 8 \u043f\u043b\u0430\u043d\u0435\u0442." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0444\u043e\u0442\u043e\u0441\u0438\u043d\u0442\u0435\u0437?", hint: "\u0420\u0430\u0441\u0442\u0435\u043d\u0438\u044f \u0434\u0435\u043b\u0430\u044e\u0442 \u044d\u0442\u043e \u043a\u0430\u0436\u0434\u044b\u0439 \u0434\u0435\u043d\u044c!", options: ["\u0414\u044b\u0445\u0430\u043d\u0438\u0435", "\u041f\u0440\u043e\u0446\u0435\u0441\u0441 \u043f\u0440\u0435\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u044f \u0441\u0432\u0435\u0442\u0430 \u0432 \u043f\u0438\u0449\u0443", "\u0420\u043e\u0441\u0442"], correct: 1, explanation: "\u0424\u043e\u0442\u043e\u0441\u0438\u043d\u0442\u0435\u0437 \u2014 \u043f\u0440\u0435\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u0441\u0432\u0435\u0442\u0430 \u0432 \u043f\u0438\u0449\u0443 \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u044f\u043c\u0438." }
        ]
      },
      advanced: {
        label: "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439", xp: 40,
        tasks: [
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u044d\u0432\u043e\u043b\u044e\u0446\u0438\u044f?", hint: "\u042d\u0432\u043e\u043b\u044e\u0446\u0438\u044f \u2014 \u044d\u0442\u043e \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435!", options: ["\u0411\u044b\u0441\u0442\u0440\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435", "\u041c\u0435\u0434\u043b\u0435\u043d\u043d\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0432\u0438\u0434\u043e\u0432 \u0441\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0435\u043c", "\u0420\u043e\u0441\u0442 \u0436\u0438\u0432\u043e\u0442\u043d\u044b\u0445"], correct: 1, explanation: "\u042d\u0432\u043e\u043b\u044e\u0446\u0438\u044f \u2014 \u043f\u0440\u043e\u0446\u0435\u0441\u0441 \u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e\u0433\u043e \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0432\u0438\u0434\u043e\u0432." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0414\u041d\u041a?", hint: "\u0414\u041d\u041a \u2014 \u044d\u0442\u043e \u0438\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f \u0436\u0438\u0437\u043d\u0438!", options: ["\u0411\u0435\u043b\u043e\u043a", "\u041c\u043e\u043b\u0435\u043a\u0443\u043b\u0430, \u0445\u0440\u0430\u043d\u044f\u0449\u0430\u044f \u0433\u0435\u043d\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0443\u044e \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e", "\u041a\u043b\u0435\u0442\u043a\u0430"], correct: 1, explanation: "\u0414\u041d\u041a \u2014 \u043c\u043e\u043b\u0435\u043a\u0443\u043b\u0430, \u0445\u0440\u0430\u043d\u044f\u0449\u0430\u044f \u0433\u0435\u043d\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043a\u043e\u0434." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0447\u0451\u0440\u043d\u0430\u044f \u0434\u044b\u0440\u0430?", hint: "\u0414\u0430\u0436\u0435 \u0441\u0432\u0435\u0442 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0432\u044b\u0440\u0432\u0430\u0442\u044c\u0441\u044f!", options: ["\u0411\u043e\u043b\u044c\u0448\u0430\u044f \u0437\u0432\u0435\u0437\u0434\u0430", "\u041e\u0431\u043b\u0430\u0441\u0442\u044c \u0441 \u043e\u0447\u0435\u043d\u044c \u0441\u0438\u043b\u044c\u043d\u043e\u0439 \u0433\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u0435\u0439", "\u0422\u0443\u043c\u0430\u043d\u043d\u043e\u0441\u0442\u044c"], correct: 1, explanation: "\u0427\u0451\u0440\u043d\u0430\u044f \u0434\u044b\u0440\u0430 \u2014 \u043e\u0431\u044a\u0435\u043a\u0442 \u0441 \u043e\u0447\u0435\u043d\u044c \u0441\u0438\u043b\u044c\u043d\u043e\u0439 \u0433\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u0435\u0439, \u0438\u0437 \u043a\u043e\u0442\u043e\u0440\u043e\u0433\u043e \u043d\u0435 \u0432\u044b\u0440\u0432\u0435\u0442\u0441\u044f \u0434\u0430\u0436\u0435 \u0441\u0432\u0435\u0442." }
        ]
      }
    }
  },
  social: {
    name: "\u041e\u0431\u0449\u0435\u043d\u0438\u0435", icon: "\uD83E\uDD1D",
    tiers: {
      basic: {
        label: "\u0411\u0430\u0437\u043e\u0432\u044b\u0439", xp: 15,
        tasks: [
          { q: "\u0427\u0442\u043e \u0432\u0430\u0436\u043d\u0435\u0435 \u0432\u0441\u0435\u0433\u043e \u043f\u0440\u0438 \u043e\u0431\u0449\u0435\u043d\u0438\u0438?", hint: "\u0425\u043e\u0440\u043e\u0448\u0438\u0439 \u0441\u043e\u0431\u0435\u0441\u0435\u0434\u043d\u0438\u043a \u0441\u043b\u0443\u0448\u0430\u0435\u0442!", options: ["\u0413\u043e\u0432\u043e\u0440\u0438\u0442\u044c \u043a\u0430\u043a \u043c\u043e\u0436\u043d\u043e \u0431\u043e\u043b\u044c\u0448\u0435", "\u0421\u043b\u0443\u0448\u0430\u0442\u044c \u0438 \u043f\u043e\u043d\u0438\u043c\u0430\u0442\u044c \u0434\u0440\u0443\u0433\u043e\u0433\u043e", "\u041c\u043e\u043b\u0447\u0430\u0442\u044c"], correct: 1, explanation: "\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0435 \u0441\u043b\u0443\u0448\u0430\u043d\u0438\u0435 \u2014 \u043e\u0441\u043d\u043e\u0432\u0430 \u0445\u043e\u0440\u043e\u0448\u0435\u0433\u043e \u043e\u0431\u0449\u0435\u043d\u0438\u044f." },
          { q: "\u0427\u0442\u043e \u0434\u0435\u043b\u0430\u0435\u0442 \u043b\u0438\u0434\u0435\u0440?", hint: "\u041b\u0438\u0434\u0435\u0440 \u2014 \u044d\u0442\u043e \u0442\u043e\u0442, \u043a\u0442\u043e \u0432\u0435\u0434\u0451\u0442 \u0437\u0430 \u0441\u043e\u0431\u043e\u0439!", options: ["\u041f\u0440\u0438\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0432\u0441\u0435\u043c", "\u0412\u0434\u043e\u0445\u043d\u043e\u0432\u043b\u044f\u0435\u0442 \u0438 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0443", "\u0414\u0435\u043b\u0430\u0435\u0442 \u0432\u0441\u0451 \u0441\u0430\u043c"], correct: 1, explanation: "\u041b\u0438\u0434\u0435\u0440 \u0432\u0434\u043e\u0445\u043d\u043e\u0432\u043b\u044f\u0435\u0442 \u0438 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442 \u043a\u043e\u043c\u0430\u043d\u0434\u0443 \u043a \u0446\u0435\u043b\u0438." },
          { q: "\u041a\u0430\u043a \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e \u043f\u043e\u043f\u0440\u043e\u0441\u0438\u0442\u044c \u043e \u043f\u043e\u043c\u043e\u0449\u0438?", hint: "\u0412\u0435\u0436\u043b\u0438\u0432\u043e\u0441\u0442\u044c \u0432\u0441\u0435\u0433\u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442!", options: ["\u041f\u043e\u0442\u0440\u0435\u0431\u043e\u0432\u0430\u0442\u044c", "\u0412\u0435\u0436\u043b\u0438\u0432\u043e \u043f\u043e\u043f\u0440\u043e\u0441\u0438\u0442\u044c \u0438 \u043e\u0431\u044a\u044f\u0441\u043d\u0438\u0442\u044c \u0437\u0430\u0447\u0435\u043c", "\u041c\u043e\u043b\u0447\u0430\u0442\u044c \u0438 \u0436\u0434\u0430\u0442\u044c"], correct: 1, explanation: "\u0412\u0435\u0436\u043b\u0438\u0432\u0430\u044f \u043f\u0440\u043e\u0441\u044c\u0431\u0430 \u0441 \u043e\u0431\u044a\u044f\u0441\u043d\u0435\u043d\u0438\u0435\u043c \u2014 \u043b\u0443\u0447\u0448\u0438\u0439 \u0441\u043f\u043e\u0441\u043e\u0431." }
        ]
      },
      intermediate: {
        label: "\u0421\u0440\u0435\u0434\u043d\u0438\u0439", xp: 25,
        tasks: [
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u044d\u043c\u043f\u0430\u0442\u0438\u044f?", hint: "\u042d\u043c\u043f\u0430\u0442\u0438\u044f \u2014 \u044d\u0442\u043e \u0447\u0443\u0432\u0441\u0442\u0432\u043e\u0432\u0430\u0442\u044c \u0434\u0440\u0443\u0433\u043e\u0433\u043e!", options: ["\u0416\u0430\u043b\u043e\u0441\u0442\u044c \u043a \u0441\u0435\u0431\u0435", "\u0421\u043f\u043e\u0441\u043e\u0431\u043d\u043e\u0441\u0442\u044c \u043f\u043e\u043d\u0438\u043c\u0430\u0442\u044c \u0447\u0443\u0432\u0441\u0442\u0432\u0430 \u0434\u0440\u0443\u0433\u0438\u0445", "\u0420\u0430\u0432\u043d\u043e\u0434\u0443\u0448\u0438\u0435"], correct: 1, explanation: "\u042d\u043c\u043f\u0430\u0442\u0438\u044f \u2014 \u0441\u043f\u043e\u0441\u043e\u0431\u043d\u043e\u0441\u0442\u044c \u043f\u043e\u043d\u0438\u043c\u0430\u0442\u044c \u0438 \u0440\u0430\u0437\u0434\u0435\u043b\u044f\u0442\u044c \u0447\u0443\u0432\u0441\u0442\u0432\u0430 \u0434\u0440\u0443\u0433\u0438\u0445." },
          { q: "\u041a\u0430\u043a \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044c \u043a\u043e\u043d\u0444\u043b\u0438\u043a\u0442 \u0432 \u043a\u043e\u043c\u0430\u043d\u0434\u0435?", hint: "\u0421\u043b\u0443\u0448\u0430\u0439 \u0432\u0441\u0435\u0445 \u0438 \u0438\u0449\u0438 \u043a\u043e\u043c\u043f\u0440\u043e\u043c\u0438\u0441\u0441!", options: ["\u0418\u0433\u043d\u043e\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c", "\u0412\u044b\u0441\u043b\u0443\u0448\u0430\u0442\u044c \u0432\u0441\u0435\u0445 \u0438 \u043d\u0430\u0439\u0442\u0438 \u043a\u043e\u043c\u043f\u0440\u043e\u043c\u0438\u0441\u0441", "\u041f\u043e\u0431\u0435\u0434\u0438\u0442\u044c \u0432 \u0441\u043f\u043e\u0440\u0435"], correct: 1, explanation: "\u0412\u044b\u0441\u043b\u0443\u0448\u0430\u0442\u044c \u0432\u0441\u0435\u0445 \u0438 \u043d\u0430\u0439\u0442\u0438 \u043a\u043e\u043c\u043f\u0440\u043e\u043c\u0438\u0441\u0441 \u2014 \u043b\u0443\u0447\u0448\u0438\u0439 \u0441\u043f\u043e\u0441\u043e\u0431." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043e\u0431\u0440\u0430\u0442\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c?", hint: "\u041e\u0431\u0440\u0430\u0442\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c \u043f\u043e\u043c\u043e\u0433\u0430\u0435\u0442 \u0441\u0442\u0430\u0442\u044c \u043b\u0443\u0447\u0448\u0435!", options: ["\u041a\u0440\u0438\u0442\u0438\u043a\u0430", "\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0442\u043e\u043c, \u043a\u0430\u043a \u0443\u043b\u0443\u0447\u0448\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0443", "\u041f\u043e\u0445\u0432\u0430\u043b\u0430"], correct: 1, explanation: "\u041e\u0431\u0440\u0430\u0442\u043d\u0430\u044f \u0441\u0432\u044f\u0437\u044c \u2014 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e \u0442\u043e\u043c, \u043a\u0430\u043a \u0443\u043b\u0443\u0447\u0448\u0438\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0443." }
        ]
      },
      advanced: {
        label: "\u041f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044b\u0439", xp: 40,
        tasks: [
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043d\u0435\u0432\u0435\u0440\u0431\u0430\u043b\u044c\u043d\u043e\u0435 \u043e\u0431\u0449\u0435\u043d\u0438\u0435?", hint: "\u041d\u0435 \u0432\u0441\u0451 \u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u2014 \u0441\u043b\u043e\u0432\u0430!", options: ["\u0420\u0435\u0447\u044c", "\u041c\u0438\u043c\u0438\u043a\u0430, \u0436\u0435\u0441\u0442\u044b, \u0438\u043d\u0442\u043e\u043d\u0430\u0446\u0438\u044f", "\u041f\u0438\u0441\u044c\u043c\u043e"], correct: 1, explanation: "\u041d\u0435\u0432\u0435\u0440\u0431\u0430\u043b\u044c\u043d\u043e\u0435 \u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u2014 \u043c\u0438\u043c\u0438\u043a\u0430, \u0436\u0435\u0441\u0442\u044b, \u0438\u043d\u0442\u043e\u043d\u0430\u0446\u0438\u044f." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0435 \u0432\u044b\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435?", hint: "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0435 \u2014 \u0437\u043d\u0430\u0447\u0438\u0442 \u043f\u0435\u0440\u0435\u0434 \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u0438\u0435\u0439!", options: ["\u0420\u0430\u0437\u0433\u043e\u0432\u043e\u0440 \u0441 \u0434\u0440\u0443\u0433\u043e\u043c", "\u0420\u0435\u0447\u044c \u043f\u0435\u0440\u0435\u0434 \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u0438\u0435\u0439", "\u041f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0430"], correct: 1, explanation: "\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0435 \u0432\u044b\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435 \u2014 \u0440\u0435\u0447\u044c \u043f\u0435\u0440\u0435\u0434 \u0433\u0440\u0443\u043f\u043f\u043e\u0439 \u043b\u044e\u0434\u0435\u0439." },
          { q: "\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u043d\u0430\u0432\u044b\u043a \u043f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u043e\u0432?", hint: "\u041f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u044b \u2014 \u044d\u0442\u043e \u043f\u043e\u0438\u0441\u043a \u0440\u0435\u0448\u0435\u043d\u0438\u044f!", options: ["\u0421\u043f\u043e\u0440", "\u0423\u043c\u0435\u043d\u0438\u0435 \u0434\u043e\u0441\u0442\u0438\u0447\u044c \u0441\u043e\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f", "\u041c\u043e\u043b\u0447\u0430\u043d\u0438\u0435"], correct: 1, explanation: "\u041d\u0430\u0432\u044b\u043a \u043f\u0435\u0440\u0435\u0433\u043e\u0432\u043e\u0440\u043e\u0432 \u2014 \u0443\u043c\u0435\u043d\u0438\u0435 \u0434\u043e\u0441\u0442\u0438\u0447\u044c \u0441\u043e\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f \u0447\u0435\u0440\u0435\u0437 \u0434\u0438\u0430\u043b\u043e\u0433." }
        ]
      }
    }
  }
};

/* ── SKILL LAB PROGRESS ── */
const SKILL_PROGRESS_KEY = "kl_skill_progress";

/** @returns {Object} per-module tier unlock state and scores */
function getSkillProgress() {
  try { return JSON.parse(localStorage.getItem(SKILL_PROGRESS_KEY)) || {}; } catch { return {}; }
}

/** @param {Object} sp - skill progress object to persist */
function saveSkillProgress(sp) {
  localStorage.setItem(SKILL_PROGRESS_KEY, JSON.stringify(sp));
}

/**
 * Get or init progress for a module.
 * @param {string} moduleId
 */
function getModuleProgress(moduleId) {
  const sp = getSkillProgress();
  if (!sp[moduleId]) {
    sp[moduleId] = { basic: { unlocked: true, score: 0, done: false }, intermediate: { unlocked: false, score: 0, done: false }, advanced: { unlocked: false, score: 0, done: false } };
    saveSkillProgress(sp);
  }
  return sp[moduleId];
}

/** Update the level badge on each module card */
function updateSkillModuleBadges() {
  const sp = getSkillProgress();
  Object.keys(SKILL_MODULES).forEach(mid => {
    const badge = $("sml-" + mid); if (!badge) return;
    const mp = sp[mid];
    if (!mp) { badge.textContent = "\u0423\u0440. 1"; return; }
    if (mp.advanced && mp.advanced.done) badge.textContent = "\uD83D\uDC51 \u041c\u0430\u0441\u0442\u0435\u0440";
    else if (mp.intermediate && mp.intermediate.done) badge.textContent = "\uD83D\uDD25 \u0423\u0440. 3";
    else if (mp.basic && mp.basic.done) badge.textContent = "\u2B50 \u0423\u0440. 2";
    else badge.textContent = "\uD83C\uDF31 \u0423\u0440. 1";
  });
}

/** Initialize Skill Lab — attach card click handlers */
function initSkillLab() {
  document.querySelectorAll(".skill-module-card").forEach(card => {
    card.addEventListener("click", () => {
      const mid = card.dataset.module;
      if (mid && SKILL_MODULES[mid]) openSkillModule(mid);
    });
  });
  const closeBtn = $("close-skill-lab");
  if (closeBtn) closeBtn.addEventListener("click", () => {
    const modal = $("skill-lab-modal");
    if (modal) modal.classList.add("hidden");
  });
  const modal = $("skill-lab-modal");
  if (modal) modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
  updateSkillModuleBadges();
}

/**
 * Open the skill lab modal for a module.
 * @param {string} moduleId
 */
function openSkillModule(moduleId) {
  const modal = $("skill-lab-modal"), content = $("skill-lab-content");
  if (!modal || !content) return;
  modal.classList.remove("hidden");
  renderSkillModule(moduleId, content);
  const mod = SKILL_MODULES[moduleId];
  aniPoint();
  setTimeout(()=>aniSay("\uD83E\uDDE9 \u041e\u0442\u043a\u0440\u044b\u0432\u0430\u044e \u043c\u043e\u0434\u0443\u043b\u044c \u00ab" + mod.name + "\u00bb! \u0413\u043e\u0442\u043e\u0432 \u0443\u0447\u0438\u0442\u044c\u0441\u044f?"), 300);
}

/**
 * Render the full module UI (header + tier tabs + active tier tasks).
 * @param {string} moduleId
 * @param {HTMLElement} container
 */
function renderSkillModule(moduleId, container) {
  const mod = SKILL_MODULES[moduleId];
  const mp = getModuleProgress(moduleId);
  const tiers = ["basic", "intermediate", "advanced"];
  const activeTier = tiers.find(t => mp[t] && mp[t].unlocked && !mp[t].done) || (mp.advanced && mp.advanced.done ? "advanced" : "basic");

  const tabsHtml = tiers.map(t => {
    const td = mod.tiers[t];
    const locked = !mp[t] || !mp[t].unlocked;
    const done = mp[t] && mp[t].done;
    let cls = "sl-tab";
    if (t === activeTier) cls += " active";
    if (locked) cls += " locked";
    if (done) cls += " done";
    return "<button class='" + cls + "' data-tier='" + t + "'" + (locked ? " disabled" : "") + ">" +
      (locked ? "\uD83D\uDD12 " : done ? "\u2705 " : "") + escHtml(td.label) + "</button>";
  }).join("");

  container.innerHTML =
    "<div class='sl-header'>" +
    "<span class='sl-module-icon'>" + mod.icon + "</span>" +
    "<h3 class='sl-module-title'>" + escHtml(mod.name) + "</h3>" +
    "</div>" +
    "<div class='sl-level-tabs' id='sl-tabs'>" + tabsHtml + "</div>" +
    "<div id='sl-tier-content'></div>";

  container.querySelectorAll(".sl-tab:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".sl-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderSkillTier(moduleId, btn.dataset.tier, container.querySelector("#sl-tier-content"));
    });
  });

  renderSkillTier(moduleId, activeTier, container.querySelector("#sl-tier-content"));
}

/**
 * Render all tasks for a tier.
 * @param {string} moduleId
 * @param {string} tier - "basic"|"intermediate"|"advanced"
 * @param {HTMLElement} container
 */
function renderSkillTier(moduleId, tier, container) {
  if (!container) return;
  const mod = SKILL_MODULES[moduleId];
  const tierData = mod.tiers[tier];
  const mp = getModuleProgress(moduleId);
  const tierProg = mp[tier];

  if (!tierProg || !tierProg.unlocked) {
    container.innerHTML = "<div class='sl-locked-msg'>\uD83D\uDD12 \u0417\u0430\u0432\u0435\u0440\u0448\u0438 \u043f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0438\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c, \u0447\u0442\u043e\u0431\u044b \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c!</div>";
    return;
  }

  // Track per-task answers in closure
  const answers = new Array(tierData.tasks.length).fill(null);
  let answered = 0;

  const tasksHtml = tierData.tasks.map((task, i) =>
    "<div class='sl-task' id='sl-task-" + i + "'>" +
    "<div class='sl-task-num'>\u0417\u0430\u0434\u0430\u043d\u0438\u0435 " + (i + 1) + "</div>" +
    "<div class='sl-task-q'>" + escHtml(task.q) + "</div>" +
    "<div class='sl-task-hint'>\uD83D\uDCA1 " + escHtml(task.hint) + "</div>" +
    "<div class='sl-opts'>" +
    task.options.map((opt, oi) =>
      "<button class='sl-opt' data-task='" + i + "' data-opt='" + oi + "'>" + escHtml(opt) + "</button>"
    ).join("") +
    "</div>" +
    "<div class='sl-feedback' id='sl-fb-" + i + "'></div>" +
    "</div>"
  ).join("");

  const progressPct = tierProg.done ? 100 : 0;
  container.innerHTML =
    "<div class='sl-progress-row'>" +
    "<span>\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441</span>" +
    "<div class='sl-progress-bar'><div class='sl-progress-fill' id='sl-prog-fill' style='width:" + progressPct + "%'></div></div>" +
    "<span id='sl-prog-label'>0/" + tierData.tasks.length + "</span>" +
    "</div>" +
    tasksHtml +
    "<div id='sl-tier-result'></div>";

  if (tierProg.done) {
    container.querySelectorAll(".sl-opt").forEach(b => b.disabled = true);
    container.querySelector("#sl-tier-result").innerHTML =
      "<div class='sl-result'><div class='sl-result-score'>\u2705 \u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043f\u0440\u043e\u0439\u0434\u0435\u043d! (" + tierProg.score + "/" + tierData.tasks.length + ")</div></div>";
    return;
  }

  container.querySelectorAll(".sl-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const taskIdx = parseInt(btn.dataset.task);
      const optIdx = parseInt(btn.dataset.opt);
      if (answers[taskIdx] !== null) return; // already answered

      const task = tierData.tasks[taskIdx];
      const correct = optIdx === task.correct;
      answers[taskIdx] = correct ? 1 : 0;
      answered++;

      // Disable all opts for this task and highlight
      container.querySelectorAll(".sl-opt[data-task='" + taskIdx + "']").forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.opt) === task.correct) b.classList.add("correct");
        else b.classList.add("wrong");
      });

      const fb = container.querySelector("#sl-fb-" + taskIdx);
      if (fb) fb.innerHTML = "<div class='" + (correct ? "correct-fb" : "wrong-fb") + "'>" +
        (correct ? "\u2705 " : "\u274C ") + escHtml(task.explanation) + "</div>";

      if (correct) { aniHappy(); aniSay("\uD83C\uDF89 \u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \u041c\u043e\u043b\u043e\u0434\u0435\u0446!"); }
      else { aniThinkThenSay("\uD83D\uDCA1 \u041d\u0435 \u0441\u043e\u0432\u0441\u0435\u043c... \u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430: " + task.hint); }

      // Update progress bar
      const fill = container.querySelector("#sl-prog-fill");
      const label = container.querySelector("#sl-prog-label");
      const pct = Math.round((answered / tierData.tasks.length) * 100);
      if (fill) fill.style.width = pct + "%";
      if (label) label.textContent = answered + "/" + tierData.tasks.length;

      // All tasks answered
      if (answered === tierData.tasks.length) {
        const score = answers.reduce((a, b) => a + b, 0);
        setTimeout(() => completeSkillTier(moduleId, tier, score, tierData.tasks.length, container), 600);
      }
    });
  });
}

/**
 * Called when all tasks in a tier are answered.
 * @param {string} moduleId
 * @param {string} tier
 * @param {number} score - correct answers count
 * @param {number} total - total tasks
 * @param {HTMLElement} container
 */
function completeSkillTier(moduleId, tier, score, total, container) {
  const sp = getSkillProgress();
  if (!sp[moduleId]) sp[moduleId] = {};
  sp[moduleId][tier] = sp[moduleId][tier] || {};
  sp[moduleId][tier].score = score;
  sp[moduleId][tier].done = true;

  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  const tierOrder = ["basic", "intermediate", "advanced"];
  const nextTier = tierOrder[tierOrder.indexOf(tier) + 1];

  if (passed && nextTier) {
    if (!sp[moduleId][nextTier]) sp[moduleId][nextTier] = { unlocked: false, score: 0, done: false };
    sp[moduleId][nextTier].unlocked = true;
  }
  saveSkillProgress(sp);

  const mod = SKILL_MODULES[moduleId];
  const xpReward = mod.tiers[tier].xp;
  awardPoints(xpReward, mod.name + " \u2014 " + mod.tiers[tier].label);

  const resultEl = container ? container.querySelector("#sl-tier-result") : null;
  if (resultEl) {
    resultEl.innerHTML =
      "<div class='sl-result'>" +
      "<div class='sl-result-score'>" + (passed ? "\uD83C\uDF89" : "\uD83D\uDCAA") + " " + score + "/" + total + " (" + pct + "%)</div>" +
      (passed && nextTier ? "<div class='sl-unlock-msg'>\uD83D\uDD13 \u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d: " + escHtml(mod.tiers[nextTier].label) + "!</div>" : "") +
      (!passed ? "<div class='sl-unlock-msg'>\uD83D\uDCA1 \u041d\u0443\u0436\u043d\u043e 70% \u0434\u043b\u044f \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451!</div>" : "") +
      "</div>";
  }

  if (passed) {
    aniCelebrate();
    aniSay("\uD83C\uDF89 \u0423\u0440\u043e\u0432\u0435\u043d\u044c \u043f\u0440\u043e\u0439\u0434\u0435\u043d! +" + xpReward + " XP! \u041c\u043e\u043b\u043e\u0434\u0435\u0446!");
    launchConfetti();
    if (nextTier) {
      setTimeout(() => {
        const content = $("skill-lab-content");
        if (content) renderSkillModule(moduleId, content);
      }, 1500);
    }
  } else {
    aniThinkThenSay("\uD83D\uDCAA \u041d\u0435 \u0441\u0434\u0430\u043b\u0441\u044f... \u041d\u0443\u0436\u043d\u043e 70%. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437! \u0422\u044b \u0441\u043c\u043e\u0436\u0435\u0448\u044c!");
    // Reset tier so user can retry
    sp[moduleId][tier].done = false;
    sp[moduleId][tier].score = 0;
    saveSkillProgress(sp);
  }

  updateSkillModuleBadges();
}

/* ── DRONE CAREER SIMULATION ── */
const DRONE_SIM_INTRO = {
  title: "\uD83D\uDE81 \u041A\u0430\u0440\u044C\u0435\u0440\u0430 \u043F\u0438\u043B\u043E\u0442\u0430 \u0434\u0440\u043E\u043D\u0430",
  subtitle: "\u041E\u0442 \u043D\u043E\u0432\u0438\u0447\u043A\u0430 \u0434\u043E \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u0430 \u0437\u0430 4 \u0448\u0430\u0433\u0430!",
  why: "\u041F\u0438\u043B\u043E\u0442\u044B \u0434\u0440\u043E\u043D\u043E\u0432 \u043D\u0443\u0436\u043D\u044B \u0432 \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0435, \u043A\u0438\u043D\u043E, \u0441\u0435\u043B\u044C\u0441\u043A\u043E\u043C \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0435 \u0438 \u0441\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F\u0445. \u042D\u0442\u043E \u043E\u0434\u043D\u0430 \u0438\u0437 \u0441\u0430\u043C\u044B\u0445 \u0431\u044B\u0441\u0442\u0440\u043E\u0440\u0430\u0441\u0442\u0443\u0449\u0438\u0445 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0439 \u0432 \u043C\u0438\u0440\u0435!",
  fact: "\uD83D\uDCA1 \u041A \u0440\u044B\u043D\u043E\u043A \u0434\u0440\u043E\u043D\u043E\u0432 \u0432\u044B\u0440\u0430\u0441\u0442\u0435\u0442 \u0434\u043E $43 \u043C\u043B\u0440\u0434 \u043A 2025 \u0433\u043E\u0434\u0443!",
  levels: ["\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435", "\u041F\u0440\u0430\u0432\u0438\u043B\u0430", "\u041C\u0438\u0441\u0441\u0438\u044F", "\u041F\u0440\u043E"],
};

const droneSteps = [
  {
    level: 1, icon: "\uD83D\uDE81", title: "\u041E\u0441\u043D\u043E\u0432\u044B \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F",
    realWorld: "\u041A\u0430\u0436\u0434\u044B\u0439 \u043F\u0438\u043B\u043E\u0442 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442 \u0441 \u0438\u0437\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u0443\u043B\u044C\u0442\u0430 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F. \u0414\u0430\u0436\u0435 \u043F\u0440\u043E\u0444\u0438 \u043D\u0430\u0447\u0438\u043D\u0430\u043B\u0438 \u0441 \u044D\u0442\u043E\u0433\u043E!",
    aniHint: "\uD83D\uDE81 \u0427\u0435\u0442\u044B\u0440\u0435 \u043C\u043E\u0442\u043E\u0440\u0430 \u2014 \u044D\u0442\u043E \u0441\u0435\u0440\u0434\u0446\u0435 \u0434\u0440\u043E\u043D\u0430. \u0411\u0435\u0437 \u043D\u0438\u0445 \u043D\u0435\u0442 \u043F\u043E\u043B\u0451\u0442\u0430!",
    question: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u043E\u0442\u043E\u0440\u043E\u0432 \u0443 \u043A\u0432\u0430\u0434\u0440\u043E\u043A\u043E\u043F\u0442\u0435\u0440\u0430?",
    options: ["2", "4", "6"], correct: 1, xp: 10,
  },
  {
    level: 2, icon: "\uD83D\uDCCB", title: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u043F\u043E\u043B\u0451\u0442\u043E\u0432",
    realWorld: "\u0412 \u0431\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u0435 \u0441\u0442\u0440\u0430\u043D \u043D\u0443\u0436\u043D\u043E \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0440\u043E\u043D \u0438 \u0441\u0434\u0430\u0442\u044C \u044D\u043A\u0437\u0430\u043C\u0435\u043D. \u0417\u043D\u0430\u043D\u0438\u0435 \u0437\u0430\u043A\u043E\u043D\u043E\u0432 \u2014 \u0447\u0430\u0441\u0442\u044C \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0438!",
    aniHint: "\uD83D\uDCCB \u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0437\u0430\u0449\u0438\u0449\u0430\u044E\u0442 \u0432\u0441\u0435\u0445 \u2014 \u0438 \u043F\u0438\u043B\u043E\u0442\u0430, \u0438 \u043B\u044E\u0434\u0435\u0439 \u0432\u043E\u043A\u0440\u0443\u0433!",
    question: "\u041D\u0430 \u043A\u0430\u043A\u043E\u0439 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0432\u044B\u0441\u043E\u0442\u0435 \u043C\u043E\u0436\u043D\u043E \u043B\u0435\u0442\u0430\u0442\u044C \u0431\u0435\u0437 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u044F?",
    options: ["500 \u043C", "120 \u043C", "1000 \u043C"], correct: 1, xp: 15,
  },
  {
    level: 3, icon: "\uD83C\uDF0D", title: "\u041F\u0435\u0440\u0432\u0430\u044F \u043C\u0438\u0441\u0441\u0438\u044F",
    realWorld: "\u0420\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u043C\u0438\u0441\u0441\u0438\u0438: \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u043B\u0435\u043A\u0430\u0440\u0441\u0442\u0432, \u0441\u044A\u0451\u043C\u043A\u0430 \u043F\u043E\u043B\u0435\u0439, \u043F\u043E\u0438\u0441\u043A \u043F\u043E\u0442\u0435\u0440\u044F\u0432\u0448\u0438\u0445\u0441\u044F. \u041A\u0430\u0436\u0434\u0430\u044F \u043C\u0438\u0441\u0441\u0438\u044F \u2014 \u044D\u0442\u043E \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C!",
    aniHint: "\uD83C\uDF0D \u041F\u0435\u0440\u0435\u0434 \u043C\u0438\u0441\u0441\u0438\u0435\u0439 \u0432\u0441\u0435\u0433\u0434\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0439 \u0437\u0430\u0440\u044F\u0434 \u0431\u0430\u0442\u0430\u0440\u0435\u0438!",
    question: "\u0427\u0442\u043E \u0441\u0430\u043C\u043E\u0435 \u0432\u0430\u0436\u043D\u043E\u0435 \u043F\u0435\u0440\u0435\u0434 \u043C\u0438\u0441\u0441\u0438\u0435\u0439?",
    options: ["\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0437\u0430\u0440\u044F\u0434 \u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442", "\u0412\u0437\u043B\u0435\u0442\u0435\u0442\u044C \u0441\u0440\u0430\u0437\u0443", "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C \u0434\u0440\u0443\u0433\u0443"], correct: 0, xp: 20,
  },
  {
    level: 4, icon: "\uD83C\uDFC6", title: "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0438\u043B\u043E\u0442",
    realWorld: "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0438\u043B\u043E\u0442\u044B \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u044E\u0442 \u043E\u0442 $30 000 \u0432 \u0433\u043E\u0434. \u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0434\u0432\u0435\u0440\u0438 \u0432 \u043A\u0438\u043D\u043E, \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0435 \u0438 \u0441\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0441\u043B\u0443\u0436\u0431\u0430\u0445!",
    aniHint: "\uD83C\uDFC6 \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B \u0437\u043D\u0430\u0435\u0442 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043A\u0430\u043A \u043B\u0435\u0442\u0430\u0442\u044C, \u043D\u043E \u0438 \u043A\u0430\u043A \u0440\u0435\u0448\u0430\u0442\u044C \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B!",
    question: "\u0427\u0442\u043E \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0438\u043B\u043E\u0442\u0430?",
    options: ["\u0414\u043E\u0440\u043E\u0433\u043E\u0439 \u0434\u0440\u043E\u043D", "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442, \u043E\u043F\u044B\u0442 \u0438 \u0437\u043D\u0430\u043D\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B", "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0434\u0440\u043E\u043D"], correct: 1, xp: 25,
  },
];

let droneStep=0,droneXp=0,droneShowIntro=true,droneCorrect=0;

function renderDroneIntro(container){
  const info=DRONE_SIM_INTRO;
  container.innerHTML=
    "<div class='sim-intro-card'>"+
    "<div class='sim-intro-icon'>\uD83D\uDE81</div>"+
    "<h3 class='sim-intro-title'>"+escHtml(info.title)+"</h3>"+
    "<p class='sim-intro-sub'>"+escHtml(info.subtitle)+"</p>"+
    "<div class='sim-intro-why'><strong>\u041F\u043E\u0447\u0435\u043C\u0443 \u044D\u0442\u043E \u0432\u0430\u0436\u043D\u043E?</strong><br>"+escHtml(info.why)+"</div>"+
    "<div class='sim-intro-fact'>"+escHtml(info.fact)+"</div>"+
    "<div class='sim-intro-levels'>"+info.levels.map((l,i)=>"<span class='sim-level-badge"+(i===0?" active":"")+"'>"+escHtml(l)+"</span>").join(" \u2192 ")+"</div>"+
    "<button class='btn-main sim-start-btn' id='drone-start-btn'>\uD83D\uDE80 \u041D\u0430\u0447\u0430\u0442\u044C \u043A\u0430\u0440\u044C\u0435\u0440\u0443!</button>"+
    "</div>";
  const startBtn=container.querySelector("#drone-start-btn");
  if(startBtn)startBtn.addEventListener("click",()=>{droneShowIntro=false;renderDroneStep(container,0);aniSay("\uD83D\uDE81 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u043A\u0430\u0440\u044C\u0435\u0440\u0443 \u043F\u0438\u043B\u043E\u0442\u0430 \u0434\u0440\u043E\u043D\u0430!");});
}

function renderDroneStep(container,stepIdx){
  if(stepIdx>=droneSteps.length){
    container.innerHTML=
      "<div class='sim-result'>"+
      "<div class='sim-result-icon'>\uD83C\uDFC6</div>"+
      "<h3>\u041A\u0430\u0440\u044C\u0435\u0440\u0430 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430!</h3>"+
      "<p>\u0422\u044B \u043D\u0430\u0431\u0440\u0430\u043B "+droneXp+" XP!</p>"+
      "<div class='sim-result-career'><strong>\uD83C\uDFAF \u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433:</strong> \u041F\u043E\u043B\u0443\u0447\u0438 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442 FAA/EASA \u0438 \u043D\u0430\u0447\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043D\u0430 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u043C\u0438\u0441\u0441\u0438\u044F\u0445!</div>"+
      "<button class='btn-main' id='drone-restart'>\uD83D\uDE81 \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C!</button>"+
      "</div>";
    const rb=container.querySelector("#drone-restart");
    if(rb)rb.addEventListener("click",()=>{droneStep=0;droneXp=0;droneCorrect=0;droneShowIntro=true;renderDroneIntro(container);});
    aniCelebrate();aniSay("\uD83C\uDFC6 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u044E! \u0422\u044B \u043F\u0440\u043E\u0448\u0451\u043B \u0432\u0441\u0435 \u0443\u0440\u043E\u0432\u043D\u0438 \u043A\u0430\u0440\u044C\u0435\u0440\u044B!");
    awardPoints(40,"Drone Career Simulation");
    const p=getProgress();p.simDone++;saveProgress(p);updateDashboard();
    // Step 3: track skill result
    onDroneCareerComplete(droneCorrect, droneSteps.length);
    return;
  }
  const s=droneSteps[stepIdx];
  const progressPct=Math.round((stepIdx/droneSteps.length)*100);
  container.innerHTML=
    "<div class='sim-progress-wrap'><div class='sim-progress-bar'><div class='sim-progress-fill' style='width:"+progressPct+"%'></div></div><span class='sim-progress-label'>\u0423\u0440\u043E\u0432\u0435\u043D\u044C "+s.level+" \u0438\u0437 "+droneSteps.length+"</span></div>"+
    "<div class='sim-realworld-tip'>\uD83C\uDF0D "+escHtml(s.realWorld)+"</div>"+
    "<div class='sim-level-header'>"+s.icon+" <strong>"+escHtml(s.title)+"</strong></div>"+
    "<div class='sim-ani-hint'>\uD83E\uDD16 \u0410\u043D\u044E\u0448\u0430: <em>"+escHtml(s.aniHint)+"</em></div>"+
    "<p class='sim-question'>"+escHtml(s.question)+"</p>"+
    "<div class='sim-options'>"+s.options.map((o,i)=>"<button class='sim-opt-btn' data-idx='"+i+"'>"+escHtml(o)+"</button>").join("")+"</div>"+
    "<div id='drone-feedback'></div>";
  container.querySelectorAll(".sim-opt-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx=parseInt(btn.dataset.idx),correct=idx===s.correct;
      container.querySelectorAll(".sim-opt-btn").forEach(b=>{b.disabled=true;if(parseInt(b.dataset.idx)===s.correct)b.classList.add("correct");else b.classList.add("wrong");});
      if(correct){droneXp+=s.xp;droneCorrect++;aniHappy();aniSay("\uD83D\uDE81 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! +"+s.xp+" XP!");recordStrongArea("Drone");}
      else{aniThinkThenSay("\uD83D\uDCA1 \u041D\u0435 \u0441\u043E\u0432\u0441\u0435\u043C... \u041F\u043E\u0434\u0443\u043C\u0430\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437!");recordWeakArea("Drone");}
      const fb=container.querySelector("#drone-feedback");
      if(fb){
        fb.innerHTML="<div class='"+(correct?"correct-fb":"wrong-fb")+"'>"+(correct?"\u2705 \u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E!":"\u274C \u041D\u0435 \u0441\u043E\u0432\u0441\u0435\u043C...")+"</div>"+
          "<button class='btn-main' style='margin-top:14px' id='drone-next'>"+(stepIdx<droneSteps.length-1?"\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u27A1\uFE0F":"\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \uD83C\uDFC6")+"</button>";
        const nb=fb.querySelector("#drone-next");
        if(nb)nb.addEventListener("click",()=>{droneStep++;renderDroneStep(container,droneStep);});
      }
    });
  });
}

function initDroneSim(){
  const openBtn=$("open-drone-sim"),closeBtn=$("close-drone-sim"),modal=$("drone-sim-modal"),content=$("drone-sim-content");
  if(!openBtn||!modal||!content)return;
  openBtn.addEventListener("click",()=>{
    guardSimulation("drone_career", ()=>{
      modal.classList.remove("hidden");droneStep=0;droneXp=0;droneCorrect=0;droneShowIntro=true;renderDroneIntro(content);
      aniSay("\uD83D\uDE81 \u0414\u0430\u0432\u0430\u0439 \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u043C \u043A\u0430\u0440\u044C\u0435\u0440\u0443 \u043F\u0438\u043B\u043E\u0442\u0430 \u0434\u0440\u043E\u043D\u0430!");
    });
  });
  if(closeBtn)closeBtn.addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden");});
}

/* ── DRONE GAME (Phase 2-4) ── */
/**
 * 2D canvas drone delivery game.
 * Arrow keys + on-screen buttons move the drone.
 * Avoid obstacles, reach the landing pad to win.
 * On win: +10 XP via awardPoints. Ani reacts to events.
 */
function initDroneGame(){
  const openBtn = $("open-drone-game");
  const modal   = $("drone-game-modal");
  const closeBtn= $("close-drone-game");
  if(!openBtn || !modal) return;

  openBtn.addEventListener("click", ()=>{
    guardSimulation("drone_game", ()=>{
      modal.classList.remove("hidden");
      startDroneGame();
      aniSay("\u0414\u0430\u0432\u0430\u0439 \u0434\u043E\u0441\u0442\u0430\u0432\u0438\u043C \u043F\u043E\u0441\u044B\u043B\u043A\u0443! \u0418\u0437\u0431\u0435\u0433\u0430\u0439 \u043F\u0440\u0435\u043F\u044F\u0442\u0441\u0442\u0432\u0438\u0439 \u0438 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0438 \u0446\u0435\u043B\u0438!");
    });
  });
  if(closeBtn) closeBtn.addEventListener("click", ()=>{ stopDroneGame(); modal.classList.add("hidden"); });
  modal.addEventListener("click", e=>{ if(e.target===modal){ stopDroneGame(); modal.classList.add("hidden"); } });
}

let _droneGameLoop = null;
let _droneGameState = null;

function stopDroneGame(){
  if(_droneGameLoop){ cancelAnimationFrame(_droneGameLoop); _droneGameLoop=null; }
  _droneGameState = null;
  // Remove key listeners
  document.removeEventListener("keydown", _droneKeyDown);
  document.removeEventListener("keyup",   _droneKeyUp);
}

const _droneKeys = {};
function _droneKeyDown(e){
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
    _droneKeys[e.key] = true;
  }
}
function _droneKeyUp(e){ _droneKeys[e.key] = false; }

function startDroneGame(){
  stopDroneGame();
  const canvas = $("drone-game-canvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");

  // Responsive canvas size
  const W = canvas.width  = Math.min(480, canvas.parentElement.clientWidth - 20);
  const H = canvas.height = 320;

  // Game objects
  const DRONE_W = 36, DRONE_H = 24;
  const PAD_W = 60, PAD_H = 18;
  const SPEED = 3;

  const obstacles = [
    { x: W*0.25, y: H*0.2,  w: 28, h: 80,  color:"#10b981" }, // tree
    { x: W*0.5,  y: H*0.1,  w: 40, h: 100, color:"#6366f1" }, // building
    { x: W*0.7,  y: H*0.45, w: 28, h: 70,  color:"#10b981" }, // tree
    { x: W*0.38, y: H*0.55, w: 50, h: 30,  color:"#f59e0b" }, // wall
  ];

  const pad = { x: W - PAD_W - 16, y: H - PAD_H - 16, w: PAD_W, h: PAD_H };

  // Step 6: adaptive difficulty — timer and hints adjust based on past performance
  const _adaptiveDiff = (typeof getAdaptiveDifficulty === "function") ? getAdaptiveDifficulty("drone_game") : { timerSec: 30, showHints: true, difficulty: "normal" };
  const MISSION_TIME = _adaptiveDiff.timerSec;
  const _showHints   = _adaptiveDiff.showHints;

  const state = {
    drone: { x: 16, y: H/2 - DRONE_H/2, w: DRONE_W, h: DRONE_H, vx:0, vy:0 },
    pad,
    obstacles,
    status: "playing", // "playing" | "win" | "lose"
    xp: getProgress().points,
    halfwayTriggered: false,
    nearObstacleTriggered: false,
    W, H,
    // ── Timer & scoring ──
    timeLeft: MISSION_TIME,
    startTime: performance.now(),
    score: 0,
  };
  _droneGameState = state;

  // ── HUD elements ──
  const timerEl       = $("dg-timer");
  const scoreEl       = $("dg-score");
  const missionScreen = $("dg-mission-screen");
  const missionIcon   = $("dg-mission-icon");
  const missionTitle  = $("dg-mission-title");
  const scoreSummary  = $("dg-score-summary");

  // Reset HUD
  if(timerEl){ timerEl.textContent = "\u23F1 "+MISSION_TIME; timerEl.classList.remove("dg-timer-urgent"); }
  if(scoreEl) scoreEl.textContent = "\u2B50 0";
  if(missionScreen) missionScreen.classList.add("hidden");
  // Show difficulty badge in HUD
  const diffEl = $("dg-difficulty");
  if(diffEl) diffEl.textContent = getDifficultyLabel(_adaptiveDiff.difficulty);

  // ── Scoring helpers ──
  function calcScore(timeRemaining){ return 500 + Math.round(timeRemaining * 10); }

  function showMissionComplete(won){
    if(!missionScreen) return;
    const elapsed = MISSION_TIME - state.timeLeft;
    const finalScore = won ? calcScore(state.timeLeft) : 0;
    state.score = finalScore;
    if(missionIcon)  missionIcon.textContent  = won ? "\uD83C\uDF89" : "\uD83D\uDCA5";
    if(missionTitle) missionTitle.textContent = won ? "\u041C\u0438\u0441\u0441\u0438\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430!" : "\u041C\u0438\u0441\u0441\u0438\u044F \u043F\u0440\u043E\u0432\u0430\u043B\u0435\u043D\u0430!";
    if(scoreSummary){
      if(won){
        scoreSummary.innerHTML =
          "<div class='dg-score-row'><span>\u23F1 \u0412\u0440\u0435\u043C\u044F:</span><span>"+elapsed.toFixed(1)+"\u0441</span></div>"+
          "<div class='dg-score-row'><span>\uD83C\uDFAF \u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0441\u0447\u0451\u0442:</span><span>500</span></div>"+
          "<div class='dg-score-row'><span>\u26A1 \u0411\u043E\u043D\u0443\u0441 \u0437\u0430 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C:</span><span>+"+Math.round(state.timeLeft*10)+"</span></div>"+
          "<div class='dg-score-total'>\u2B50 \u0418\u0442\u043E\u0433\u043E: "+finalScore+" \u043E\u0447\u043A\u043E\u0432</div>";
      } else {
        const reason = state.timeLeft <= 0 ? "\u0412\u0440\u0435\u043C\u044F \u0432\u044B\u0448\u043B\u043E!" : "\u0414\u0440\u043E\u043D \u0441\u0442\u043E\u043B\u043A\u043D\u0443\u043B\u0441\u044F!";
        scoreSummary.innerHTML =
          "<div class='dg-score-row'><span>\u274C "+reason+"</span></div>"+
          "<div class='dg-score-row'><span>\u23F1 \u041F\u0440\u043E\u0448\u043B\u043E:</span><span>"+elapsed.toFixed(1)+"\u0441</span></div>"+
          "<div class='dg-score-total'>\u2B50 \u0418\u0442\u043E\u0433\u043E: 0 \u043E\u0447\u043A\u043E\u0432</div>";
      }
    }
    if(scoreEl) scoreEl.textContent = "\u2B50 "+finalScore;
    missionScreen.classList.remove("hidden");
    // Step 3: track drone game result
    onDroneGameComplete(won, elapsed, finalScore);
  }

  // Key listeners
  document.addEventListener("keydown", _droneKeyDown);
  document.addEventListener("keyup",   _droneKeyUp);

  // On-screen button state
  const btnUp    = $("dg-btn-up");
  const btnDown  = $("dg-btn-down");
  const btnLeft  = $("dg-btn-left");
  const btnRight = $("dg-btn-right");
  [btnUp,btnDown,btnLeft,btnRight].forEach(b=>{
    if(!b) return;
    b.addEventListener("pointerdown", e=>{ e.preventDefault(); _droneKeys[b.dataset.key]=true; });
    b.addEventListener("pointerup",   e=>{ _droneKeys[b.dataset.key]=false; });
    b.addEventListener("pointerleave",e=>{ _droneKeys[b.dataset.key]=false; });
  });

  function rectsOverlap(a, b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function drawRoundRect(ctx, x, y, w, h, r, fill){
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function gameLoop(){
    const s = _droneGameState;
    if(!s || s.status !== "playing"){ drawFrame(s); return; }

    // ── Timer update ──
    const elapsed = (performance.now() - s.startTime) / 1000;
    s.timeLeft = Math.max(0, MISSION_TIME - elapsed);
    const timeDisplay = Math.ceil(s.timeLeft);
    if(timerEl){
      timerEl.textContent = "\u23F1 "+timeDisplay;
      if(s.timeLeft <= 10) timerEl.classList.add("dg-timer-urgent");
      else timerEl.classList.remove("dg-timer-urgent");
    }

    // ── Timeout = lose ──
    if(s.timeLeft <= 0){
      s.status = "lose";
      aniShakeHead();
      aniSay("\u23F0 \u0412\u0440\u0435\u043C\u044F \u0432\u044B\u0448\u043B\u043E! \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437!");
      coachSay("\u23F0 \u0412\u0440\u0435\u043C\u044F \u0432\u044B\u0448\u043B\u043E! \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0431\u044B\u0441\u0442\u0440\u0435\u0435!", "fail");
      showMissionComplete(false);
      drawFrame(s);
      return;
    }

    // Movement
    const d = s.drone;
    d.vx = _droneKeys["ArrowRight"] ? SPEED : _droneKeys["ArrowLeft"] ? -SPEED : 0;
    d.vy = _droneKeys["ArrowDown"]  ? SPEED : _droneKeys["ArrowUp"]   ? -SPEED : 0;
    d.x = Math.max(0, Math.min(s.W - d.w, d.x + d.vx));
    d.y = Math.max(0, Math.min(s.H - d.h, d.y + d.vy));

    // Collision with obstacles
    for(const obs of s.obstacles){
      if(rectsOverlap(d, obs)){
        s.status = "lose";
        aniShakeHead();
        aniSay("😅 Ничего страшного! Попробуй снова — ты учишься и становишься лучше!");
        coachSay("😅 Ничего страшного! Попробуй снова!", "fail");
        showMissionComplete(false);
        drawFrame(s);
        return;
      }
      // Near obstacle warning (within 40px)
      if(!s.nearObstacleTriggered){
        const expanded = { x:obs.x-40, y:obs.y-40, w:obs.w+80, h:obs.h+80 };
        if(rectsOverlap(d, expanded)){
          s.nearObstacleTriggered = true;
          aniSay("⚠️ Осторожно! Препятствие впереди — уворачивайся!");
          coachSay("⚠️ Осторожно! Препятствие впереди!", "warn");
          setTimeout(()=>{ if(s) s.nearObstacleTriggered=false; }, 4000);
        }
      }
    }

    // Halfway progress message
    if(!s.halfwayTriggered && d.x > s.W * 0.5){
      s.halfwayTriggered = true;
      aniSay("👍 Отлично! Ты на полпути — продолжай, почти у цели!");
      coachSay("👍 Отлично! Почти у цели — продолжай!");
    }

    // Win condition
    if(rectsOverlap(d, s.pad)){
      s.status = "win";
      awardPoints(10, "Drone Game");
      aniCelebrate();
      aniSay("🎉 Потрясающе! Ты выполнил миссию как настоящий инженер-пилот!");
      coachSay("🎉 Миссия выполнена! Ты настоящий пилот!", "success");
      launchConfetti();
      showMissionComplete(true);
      drawFrame(s);
      return;
    }

    drawFrame(s);
    _droneGameLoop = requestAnimationFrame(gameLoop);
  }

  function drawFrame(s){
    if(!s){ return; }
    // Sky gradient background
    const grad = ctx.createLinearGradient(0,0,0,s.H);
    grad.addColorStop(0,"#0ea5e9");
    grad.addColorStop(1,"#7dd3fc");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,s.W,s.H);

    // Ground
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(0, s.H-20, s.W, 20);

    // Obstacles
    s.obstacles.forEach(obs=>{
      drawRoundRect(ctx, obs.x, obs.y, obs.w, obs.h, 6, obs.color);
    });

    // Landing pad
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(s.pad.x, s.pad.y, s.pad.w, s.pad.h);
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 11px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u0426\u0415\u041B\u042C", s.pad.x + s.pad.w/2, s.pad.y + 13);

    // Drone body
    const d = s.drone;
    ctx.fillStyle = "#7c3aed";
    drawRoundRect(ctx, d.x, d.y+6, d.w, d.h-10, 4, "#7c3aed");
    // Drone rotors
    ctx.fillStyle = "#c4b5fd";
    ctx.beginPath(); ctx.ellipse(d.x+6,  d.y+4, 7, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(d.x+d.w-6, d.y+4, 7, 3, 0, 0, Math.PI*2); ctx.fill();
    // Package
    ctx.fillStyle = "#f59e0b";
    drawRoundRect(ctx, d.x+d.w/2-6, d.y+d.h-4, 12, 10, 2, "#f59e0b");

    // Canvas HUD: mission label only (timer/score shown in HTML HUD above canvas)
    ctx.fillStyle = "rgba(30,10,80,0.75)";
    drawRoundRect(ctx, 8, 8, 200, 28, 8, "rgba(30,10,80,0.75)");
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Nunito, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("\uD83D\uDCE6 \u041C\u0438\u0441\u0441\u0438\u044F: \u0414\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0441\u044B\u043B\u043A\u0443", 16, 27);
  }

  // Retry button
  const retryBtn = $("dg-retry");
  if(retryBtn){
    retryBtn.style.display = "none";
    retryBtn.onclick = ()=>{
      retryBtn.style.display = "none";
      startDroneGame();
      aniSay("\uD83D\uDE81 \u0414\u0430\u0432\u0430\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437! \u0422\u044B \u0441\u043C\u043E\u0436\u0435\u0448\u044C!");
    };
  }

  _droneGameLoop = requestAnimationFrame(gameLoop);
}

/* ── LEARNING HUB (Phase 2) ── */

/**
 * Career path definitions with lessons.
 * EXTENSION POINT: Add new career paths here.
 * Each path needs: id, icon, title, desc, lessons[].
 * Each lesson needs: id, title, intro, content[], aniTip, quiz{}, xp.
 * Adding a new career path automatically appears in learn.html.
 */
const CAREER_PATHS = [
  {
    id: "drone",
    icon: "🚁",
    title: "Пилот дрона",
    desc: "Научись управлять беспилотниками и доставлять грузы",
    lessons: [
      {
        id: "drone_1",
        title: "Что такое дрон?",
        intro: "Дрон — это беспилотный летательный аппарат, который управляется дистанционно или автоматически.",
        content: [
          {
            heading: "Где используются дроны?",
            text: "Дроны применяются в доставке посылок, съёмке фильмов, сельском хозяйстве, спасательных операциях и даже в медицине для доставки лекарств в труднодоступные места."
          },
          {
            heading: "Основные части дрона",
            list: ["Корпус (рама)", "Пропеллеры (винты)", "Моторы", "Батарея", "Контроллер полёта", "Камера (опционально)"]
          }
        ],
        aniTip: "Знаешь ли ты? Самый маленький дрон в мире весит всего 2 грамма — как монетка! 🪙",
        quiz: {
          question: "Для чего НЕ используются дроны?",
          options: ["Доставка посылок", "Съёмка фильмов", "Приготовление еды", "Спасательные операции"],
          correct: 2,
          explanation: "Дроны не готовят еду! Они используются для полётов и выполнения задач в воздухе."
        },
        xp: 15
      },
      {
        id: "drone_2",
        title: "Как управлять дроном?",
        intro: "Управление дроном требует практики и понимания основных команд.",
        content: [
          {
            heading: "Основные команды",
            list: ["Взлёт и посадка", "Движение вперёд/назад", "Поворот влево/вправо", "Подъём и снижение высоты"]
          },
          {
            heading: "Правила безопасности",
            text: "Всегда проверяй заряд батареи перед полётом. Не летай над людьми или животными. Следи за погодой — сильный ветер опасен для дрона."
          }
        ],
        aniTip: "Совет от Анюши: Начинай с малых высот и медленных движений. Практика делает мастера! 💪",
        quiz: {
          question: "Что нужно проверить ПЕРЕД полётом дрона?",
          options: ["Цвет дрона", "Заряд батареи", "Погоду завтра", "Имя дрона"],
          correct: 1,
          explanation: "Правильно! Заряд батареи — это первое, что нужно проверить перед полётом."
        },
        xp: 20
      },
      {
        id: "drone_3",
        title: "Карьера пилота дрона",
        intro: "Пилоты дронов — востребованная профессия будущего с множеством возможностей.",
        content: [
          {
            heading: "Где работают пилоты дронов?",
            list: ["Компании доставки (Amazon, DHL)", "Киностудии и ТВ", "Сельское хозяйство", "Строительные компании", "Спасательные службы"]
          },
          {
            heading: "Сколько зарабатывают?",
            text: "Начинающий пилот дрона зарабатывает от 50,000₽ в месяц. Опытные специалисты могут получать 150,000₽ и выше!"
          }
        ],
        aniTip: "Мечта становится реальностью! Начни учиться сегодня — и через год ты уже сможешь работать пилотом! 🚀",
        quiz: {
          question: "Какая компания использует дроны для доставки?",
          options: ["McDonald's", "Amazon", "Школа №5", "Библиотека"],
          correct: 1,
          explanation: "Amazon активно использует дроны для доставки посылок клиентам!"
        },
        xp: 25
      }
    ]
  },
  {
    id: "cyber",
    icon: "🛡️",
    title: "Кибер-защитник",
    desc: "Защищай интернет от хакеров и вирусов",
    lessons: [
      {
        id: "cyber_1",
        title: "Что такое кибербезопасность?",
        intro: "Кибербезопасность — это защита компьютеров, сетей и данных от атак и вирусов.",
        content: [
          {
            heading: "Почему это важно?",
            text: "Каждый день хакеры пытаются украсть пароли, деньги и личную информацию. Специалисты по кибербезопасности защищают нас от этих угроз."
          },
          {
            heading: "Основные угрозы",
            list: ["Вирусы и вредоносные программы", "Фишинг (поддельные сайты)", "Взлом паролей", "DDoS-атаки"]
          }
        ],
        aniTip: "Интересный факт: Каждые 39 секунд в мире происходит кибератака! 😱",
        quiz: {
          question: "Что такое фишинг?",
          options: ["Рыбалка в интернете", "Поддельные сайты для кражи данных", "Компьютерная игра", "Антивирус"],
          correct: 1,
          explanation: "Фишинг — это когда мошенники создают поддельные сайты, чтобы украсть твои пароли и данные."
        },
        xp: 15
      },
      {
        id: "cyber_2",
        title: "Как создать надёжный пароль?",
        intro: "Надёжный пароль — первая линия защиты твоих данных.",
        content: [
          {
            heading: "Правила надёжного пароля",
            list: ["Минимум 12 символов", "Используй буквы, цифры и символы", "Не используй своё имя или дату рождения", "Разные пароли для разных сайтов"]
          },
          {
            heading: "Пример надёжного пароля",
            text: "Вместо '12345' используй что-то вроде 'Dr0n!2024$Sky' — сложно угадать, легко запомнить!"
          }
        ],
        aniTip: "Совет: Используй менеджер паролей, чтобы не забывать сложные пароли! 🔐",
        quiz: {
          question: "Какой пароль самый надёжный?",
          options: ["12345", "password", "Qw3rTy!2024#", "qwerty"],
          correct: 2,
          explanation: "Правильно! Пароль с буквами, цифрами и символами — самый надёжный."
        },
        xp: 20
      }
    ]
  },
  {
    id: "space",
    icon: "🌌",
    title: "Исследователь космоса",
    desc: "Изучай планеты, звёзды и тайны Вселенной",
    lessons: [
      {
        id: "space_1",
        title: "Солнечная система",
        intro: "Наша Солнечная система состоит из Солнца и 8 планет, вращающихся вокруг него.",
        content: [
          {
            heading: "Планеты по порядку",
            list: ["Меркурий (самая близкая к Солнцу)", "Венера", "Земля (наш дом!)", "Марс", "Юпитер (самая большая)", "Сатурн (с кольцами)", "Уран", "Нептун"]
          },
          {
            heading: "Интересные факты",
            text: "На Марсе день длится почти как на Земле — 24 часа 37 минут. А на Венере один день длится 243 земных дня!"
          }
        ],
        aniTip: "Знаешь ли ты? В нашей галактике более 200 миллиардов звёзд! 🌟",
        quiz: {
          question: "Какая планета самая большая в Солнечной системе?",
          options: ["Земля", "Марс", "Юпитер", "Сатурн"],
          correct: 2,
          explanation: "Юпитер — гигантская планета, в 11 раз больше Земли по диаметру!"
        },
        xp: 15
      }
    ]
  }
];

/* ── MASTERY GATE ── */

/**
 * Simulation unlock criteria.
 * EXTENSION POINT: Add new simulations here.
 * key = simulation id, value = array of lesson IDs required (lesson + quiz must both be passed).
 * To add a new simulation: add an entry here and a matching card in initPlayHub's SIM_DEFS array.
 */
const SIM_UNLOCK_CRITERIA = {
  "drone_game":   ["drone_1"],
  "drone_career": ["drone_1", "drone_2"],
  "it_sim":       ["cyber_1"],
  "cyber_sim":    ["cyber_1", "cyber_2"],
  "pilot_sim":    ["drone_1", "drone_2", "drone_3"],
};

/**
 * Check if a simulation is unlocked based on mastery gate.
 * Admin always has access. Users need: lessons completed + quizzes passed + min XP.
 */
function isSimUnlocked(simId) {
  if (isAdmin()) return true; // Admin override
  const required = SIM_UNLOCK_CRITERIA[simId] || [];
  if (required.length === 0) return true;
  const completed = getLessonProgress();
  const quizPassed = getQuizPassed();
  // Must have completed all required lessons AND passed their quizzes
  return required.every(lessonId => completed[lessonId] && quizPassed[lessonId]);
}

/**
 * Get count of unlocked simulations.
 */
function getUnlockedSimulationsCount() {
  return Object.keys(SIM_UNLOCK_CRITERIA).filter(id => isSimUnlocked(id)).length;
}

/**
 * Update simulation unlock states on index.html.
 */
function updateSimulationUnlocks() {
  const simMap = {
    "open-drone-game":  "drone_game",
    "open-drone-sim":   "drone_career",
    "open-it-sim":      "it_sim",
    "open-cyber-sim":   "cyber_sim",
    "open-pilot-sim":   "pilot_sim",
  };
  Object.entries(simMap).forEach(([btnId, simId]) => {
    const btn = $(btnId);
    if (!btn) return;
    const unlocked = isSimUnlocked(simId);
    btn.classList.toggle("sim-locked", !unlocked);
    if (!unlocked) {
      const required = SIM_UNLOCK_CRITERIA[simId] || [];
      const completed = getLessonProgress();
      const remaining = required.filter(id => !completed[id]).length;
      btn.title = `Пройди ещё ${remaining} урок(а) чтобы разблокировать`;
    } else {
      btn.title = "";
    }
  });
}

/**
 * Guard simulation open — mastery gate for users, admin bypass.
 */
function guardSimulation(simId, openFn) {
  if (isAdmin()) { openFn(); return; } // Admin always passes
  if (isSimUnlocked(simId)) {
    openFn();
  } else {
    const required = SIM_UNLOCK_CRITERIA[simId] || [];
    const completed = getLessonProgress();
    const quizPassed = getQuizPassed();
    const notDone = required.filter(id => !completed[id] || !quizPassed[id]);
    aniShakeHead();
    aniSay(`🔒 Пройди обучение и тест, чтобы открыть эту симуляцию! Осталось: ${notDone.length} урок(а).`);
    // Show mastery gate modal
    showMasteryGate(simId);
  }
}

/**
 * Show mastery gate modal — explains what user needs to unlock simulation.
 */
function showMasteryGate(simId) {
  const required = SIM_UNLOCK_CRITERIA[simId] || [];
  const completed = getLessonProgress();
  const quizPassed = getQuizPassed();

  // Build status rows
  const rows = required.map(lessonId => {
    const lessonDone = !!completed[lessonId];
    const quizDone = !!quizPassed[lessonId];
    // Find lesson title from CAREER_PATHS
    let title = lessonId;
    for (const cp of CAREER_PATHS) {
      const l = cp.lessons.find(x => x.id === lessonId);
      if (l) { title = l.title; break; }
    }
    return `
      <div class="mastery-row">
        <span class="mastery-row-title">${escHtml(title)}</span>
        <span class="mastery-check ${lessonDone ? 'done' : ''}">${lessonDone ? '✅' : '📖'} Урок</span>
        <span class="mastery-check ${quizDone ? 'done' : ''}">${quizDone ? '✅' : '🧠'} Тест</span>
      </div>
    `;
  }).join('');

  // Remove existing gate modal
  const existing = document.getElementById("mastery-gate-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "mastery-gate-modal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box mastery-gate-box">
      <button class="modal-close" id="close-mastery-gate">✕</button>
      <div class="mastery-gate-icon">🔒</div>
      <h2>Пройди обучение!</h2>
      <p class="sim-desc">Выполни все уроки и тесты, чтобы разблокировать симуляцию.</p>
      <div class="mastery-rows">${rows}</div>
      <a href="learn.html" class="btn-main" style="margin-top:20px;display:inline-block">📚 Перейти к обучению</a>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#close-mastery-gate").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}

/* ── ROLE SYSTEM ── */

/**
 * Initialize role system — show admin badge if admin, add toggle in settings.
 * Admin mode: activated via URL param ?role=admin or localStorage.kl_role = "admin".
 * Admin bypasses all mastery gates and sees all simulations unlocked.
 */
function initRoleSystem() {
  // Show admin indicator if admin
  if (isAdmin()) {
    const existing = document.getElementById("admin-badge");
    if (!existing) {
      const badge = document.createElement("div");
      badge.id = "admin-badge";
      badge.className = "admin-badge";
      badge.textContent = "👑 Режим администратора";
      badge.title = "Нажми чтобы выйти из режима администратора";
      badge.addEventListener("click", () => {
        setRole("user");
        badge.remove();
        aniSay("Режим пользователя активирован.");
        updateSimulationUnlocks();
        if (typeof initPlayHub === "function") safe(initPlayHub);
      });
      document.body.appendChild(badge);
    }
  }
  // Secret admin activation: type "admin" in console or URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get("role") === "admin") {
    setRole("admin");
    safe(initRoleSystem);
  }
}

/**
 * Get lesson progress
 * Returns object: { drone_1: true, cyber_1: true, ... }
 */
function getLessonProgress() {
  const p = getProgress();
  return p.lessonsCompleted || {};
}

/**
 * Get quiz-passed map: { drone_1: true, ... }
 */
function getQuizPassed() {
  const p = getProgress();
  return p.quizPassed || {};
}

/**
 * Mark a lesson quiz as passed.
 */
function markQuizPassed(lessonId) {
  const p = getProgress();
  if (!p.quizPassed) p.quizPassed = {};
  p.quizPassed[lessonId] = true;
  saveProgress(p);
}

/**
 * Check if a lesson's quiz has been passed.
 */
function isLessonQuizPassed(lessonId) {
  return !!getQuizPassed()[lessonId];
}

/**
 * Get readiness level for a career path.
 * Returns: "beginner" | "learning" | "ready"
 */
function getCareerReadiness(careerPath) {
  const completed = getLessonProgress();
  const quizPassed = getQuizPassed();
  const lessons = careerPath.lessons;
  const doneLessons = lessons.filter(l => completed[l.id]).length;
  const passedQuizzes = lessons.filter(l => quizPassed[l.id]).length;
  const total = lessons.length;
  if (doneLessons === 0) return "beginner";
  if (doneLessons >= total && passedQuizzes >= total) return "ready";
  return "learning";
}

/**
 * Mark a lesson as completed and award XP.
 */
function completeLesson(lessonId, xp) {
  const p = getProgress();
  if (!p.lessonsCompleted) p.lessonsCompleted = {};
  if (p.lessonsCompleted[lessonId]) return; // Already completed
  
  p.lessonsCompleted[lessonId] = true;
  saveProgress(p);
  awardPoints(xp, "Урок завершён");
  
  // Update unlock status for simulations
  updateSimulationUnlocks();
}

/**
 * Calculate how many lessons completed in a career path.
 */
function getCareerProgress(careerPath) {
  const completed = getLessonProgress();
  const total = careerPath.lessons.length;
  const done = careerPath.lessons.filter(l => completed[l.id]).length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

/**
 * Initialize learning hub page.
 */
function initLearningHub() {
  const grid = $("career-paths-grid");
  if (!grid) return;
  
  // Update progress cards
  const completed = getLessonProgress();
  const quizPassed = getQuizPassed();
  const totalLessons = CAREER_PATHS.reduce((sum, cp) => sum + cp.lessons.length, 0);
  const completedCount = Object.keys(completed).length;
  
  const lessonsEl = $("lessons-completed");
  const xpEl = $("total-xp");
  const simsEl = $("unlocked-sims");
  
  if (lessonsEl) lessonsEl.textContent = completedCount;
  if (xpEl) xpEl.textContent = getProgress().points;
  if (simsEl) simsEl.textContent = getUnlockedSimulationsCount();
  
  // Render career paths
  grid.innerHTML = CAREER_PATHS.map(cp => {
    const prog = getCareerProgress(cp);
    const readiness = getCareerReadiness(cp);
    const readinessMap = {
      beginner: { label: "Новичок", icon: "🌱", cls: "readiness-beginner" },
      learning: { label: "Обучается", icon: "📖", cls: "readiness-learning" },
      ready:    { label: "Готов к миссии!", icon: "🚀", cls: "readiness-ready" },
    };
    const rd = readinessMap[readiness];
    const dotsHTML = cp.lessons.map((lesson, i) => {
      const isDone = completed[lesson.id];
      const quizDone = quizPassed[lesson.id];
      const isCurrent = !isDone && i === prog.done;
      return `<span class="lesson-dot ${isDone && quizDone ? 'completed' : isDone ? 'lesson-done' : ''} ${isCurrent ? 'current' : ''}" title="${escHtml(lesson.title)}"></span>`;
    }).join('');
    
    return `
      <div class="career-path-card" data-career="${cp.id}">
        <div class="career-path-header">
          <div class="career-path-icon">${cp.icon}</div>
          <div class="career-path-title">${escHtml(cp.title)}</div>
          <span class="readiness-badge ${rd.cls}">${rd.icon} ${rd.label}</span>
        </div>
        <p class="career-path-desc">${escHtml(cp.desc)}</p>
        <div class="career-path-progress">
          <div class="career-progress-bar">
            <div class="career-progress-fill" style="width:${prog.percent}%"></div>
          </div>
          <span class="career-progress-text">${prog.done}/${prog.total}</span>
        </div>
        <div class="career-path-lessons">${dotsHTML}</div>
      </div>
    `;
  }).join('');
  
  // Click handlers
  grid.querySelectorAll(".career-path-card").forEach(card => {
    card.addEventListener("click", () => {
      const careerId = card.dataset.career;
      const careerPath = CAREER_PATHS.find(cp => cp.id === careerId);
      if (careerPath) openCareerLessons(careerPath);
    });
  });
  
  // Ani greeting for learn page
  setTimeout(() => {
    aniWave();
    const name = getUserName() || "друг";
    const readyCount = CAREER_PATHS.filter(cp => getCareerReadiness(cp) === "ready").length;
    if (isAdmin()) {
      aniSay(`Привет, ${name}! 👑 Режим администратора — все симуляции доступны!`);
    } else if (readyCount > 0) {
      aniSay(`Отлично, ${name}! 🚀 Ты готов к ${readyCount} миссии! Иди в Центр Симуляций!`);
    } else {
      aniSay(`Привет, ${name}! 📚 Я твой учитель Анюша. Выбери карьерный путь и начни учиться!`);
    }
  }, 800);
}

/**
 * Open career path and show first incomplete lesson.
 */
function openCareerLessons(careerPath) {
  const completed = getLessonProgress();
  const nextLesson = careerPath.lessons.find(l => !completed[l.id]) || careerPath.lessons[0];
  openLesson(careerPath, nextLesson);
}

/**
 * Open a specific lesson in modal.
 */
function openLesson(careerPath, lesson) {
  const modal = $("lesson-modal");
  const content = $("lesson-content");
  if (!modal || !content) return;
  
  const completed = getLessonProgress();
  const isCompleted = completed[lesson.id];
  const lessonIndex = careerPath.lessons.indexOf(lesson) + 1;
  
  // Build content blocks HTML
  const contentHTML = lesson.content.map(block => {
    if (block.list) {
      return `
        <div class="lesson-content-block">
          <h3>${escHtml(block.heading)}</h3>
          <ul>${block.list.map(item => `<li>${escHtml(item)}</li>`).join('')}</ul>
        </div>
      `;
    } else {
      return `
        <div class="lesson-content-block">
          <h3>${escHtml(block.heading)}</h3>
          <p>${escHtml(block.text)}</p>
        </div>
      `;
    }
  }).join('');
  
  // Ani tip
  const aniTipHTML = lesson.aniTip ? `
    <div class="lesson-ani-tip">
      <div class="lesson-ani-tip-icon">🤖</div>
      <div class="lesson-ani-tip-text">${escHtml(lesson.aniTip)}</div>
    </div>
  ` : '';
  
  content.innerHTML = `
    <div class="lesson-header">
      <div class="lesson-number">Урок ${lessonIndex} из ${careerPath.lessons.length}</div>
      <h2 class="lesson-title">${careerPath.icon} ${escHtml(lesson.title)}</h2>
      <p class="lesson-intro">${escHtml(lesson.intro)}</p>
    </div>
    ${contentHTML}
    ${aniTipHTML}
    <div class="lesson-quiz" id="lesson-quiz-${lesson.id}">
      <h3 class="lesson-quiz-title">🧠 Проверь себя!</h3>
      <p class="lesson-question">${escHtml(lesson.quiz.question)}</p>
      <div class="lesson-options">
        ${lesson.quiz.options.map((opt, i) => 
          `<button class="lesson-option" data-idx="${i}" ${isCompleted ? 'disabled' : ''}>${escHtml(opt)}</button>`
        ).join('')}
      </div>
      <div id="lesson-feedback-${lesson.id}"></div>
    </div>
  `;
  
  modal.classList.remove("hidden");
  
  // Quiz logic
  if (!isCompleted) {
    content.querySelectorAll(".lesson-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const correct = idx === lesson.quiz.correct;
        
        // Disable all buttons
        content.querySelectorAll(".lesson-option").forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.idx) === lesson.quiz.correct) {
            b.classList.add("correct");
          } else {
            b.classList.add("wrong");
          }
        });
        
        const feedbackEl = $(`lesson-feedback-${lesson.id}`);
        if (feedbackEl) {
          if (correct) {
            feedbackEl.innerHTML = `
              <div class="lesson-feedback correct">
                ✅ ${escHtml(lesson.quiz.explanation)}
              </div>
            `;
            aniCelebrate();
            aniSay(`Правильно! Молодец! 🎉 +${lesson.xp} XP`);
            launchConfetti();
            
            // Mark quiz as passed + lesson completed
            markQuizPassed(lesson.id);
            setTimeout(() => {
              completeLesson(lesson.id, lesson.xp);
              showLessonComplete(careerPath, lesson);
            }, 1500);
          } else {
            feedbackEl.innerHTML = `
              <div class="lesson-feedback wrong">
                ❌ Не совсем... ${escHtml(lesson.quiz.explanation)}
              </div>
            `;
            aniThinkThenSay("Подумай ещё раз! Ты почти угадал! 💡");
            
            // Re-enable buttons after 2 seconds
            setTimeout(() => {
              content.querySelectorAll(".lesson-option").forEach(b => {
                b.disabled = false;
                b.classList.remove("correct", "wrong");
              });
              feedbackEl.innerHTML = '';
            }, 2000);
          }
        }
      });
    });
  } else {
    // Already completed - show completion message
    const feedbackEl = $(`lesson-feedback-${lesson.id}`);
    if (feedbackEl) {
      feedbackEl.innerHTML = `
        <div class="lesson-feedback correct">
          ✅ Урок уже пройден! Ты молодец! 🎉
        </div>
      `;
    }
  }
  
  // Ani says lesson intro
  aniSay(`📖 ${lesson.title}. Давай изучим это вместе!`);

  // Phase 3: wire tutor panel
  const readiness = getCareerReadiness(careerPath);
  updateTutorReadiness(readiness);
  // Clear old tutor messages and add lesson-specific ones
  const tutorBox = $("tutor-messages");
  if (tutorBox) {
    tutorBox.innerHTML = "";
    tutorSay(`Урок ${careerPath.lessons.indexOf(lesson)+1}: "${lesson.title}". Читай внимательно! 📖`);
    if (lesson.aniTip) {
      setTimeout(() => tutorSay(lesson.aniTip, "tip"), 1200);
    }
    if (readiness === "ready") {
      setTimeout(() => tutorSay("🚀 Ты готов к симуляции! Иди в Центр Симуляций после урока!", "celebrate"), 2400);
    } else if (readiness === "learning") {
      setTimeout(() => tutorSay("📖 Ты улучшаешься! Продолжай — симуляция скоро откроется!"), 2400);
    } else {
      setTimeout(() => tutorSay("🌱 Ты только начинаешь — это здорово! Каждый урок делает тебя сильнее!"), 2400);
    }
  }
}

/**
 * Show lesson completion screen.
 */
function showLessonComplete(careerPath, lesson) {
  const content = $("lesson-content");
  if (!content) return;
  
  const completed = getLessonProgress();
  const nextLesson = careerPath.lessons.find(l => !completed[l.id]);
  const readiness = getCareerReadiness(careerPath);
  
  // Motivational message based on readiness
  let motivationMsg = "Ты получил XP и разблокировал новые возможности!";
  if (readiness === "ready") {
    motivationMsg = "🚀 Ты готов к симуляции! Иди в Центр Симуляций и попробуй!";
  } else if (nextLesson) {
    motivationMsg = "📖 Ты улучшаешься! Следующий урок ждёт тебя!";
  }
  
  content.innerHTML = `
    <div class="lesson-complete">
      <div class="lesson-complete-icon">🎉</div>
      <h3>Урок завершён!</h3>
      <p>${motivationMsg}</p>
      ${readiness === "ready" ? `<a href="play.html" class="btn-main" style="margin-bottom:12px;display:inline-block">🎮 Перейти к симуляциям</a>` : ''}
      <div class="lesson-actions">
        ${nextLesson ? `<button class="btn-main" id="next-lesson-btn">Следующий урок →</button>` : ''}
        <button class="btn-glass-dark" id="back-to-hub-btn">← Вернуться к обучению</button>
      </div>
    </div>
  `;

  // Phase 3: update tutor panel on completion
  updateTutorReadiness(readiness);
  const tutorBox = $("tutor-messages");
  if (tutorBox) {
    if (readiness === "ready") {
      tutorSay("🚀 Отлично! Ты готов к симуляции! Иди в Центр Симуляций!", "celebrate");
    } else if (nextLesson) {
      tutorSay("📖 Ты улучшаешься! Следующий урок ждёт тебя!", "tip");
    } else {
      tutorSay("🎉 Все уроки пройдены! Ты молодец!", "celebrate");
    }
  }
  // Update sidebar
  updateSidebarProgress();
  
  const nextBtn = $("next-lesson-btn");
  const backBtn = $("back-to-hub-btn");
  
  if (nextBtn && nextLesson) {
    nextBtn.addEventListener("click", () => {
      openLesson(careerPath, nextLesson);
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const modal = $("lesson-modal");
      if (modal) modal.classList.add("hidden");
      initLearningHub(); // Refresh the hub
    });
  }
}

/**
 * Close lesson modal.
 */
function initLessonModal() {
  const closeBtn = $("close-lesson");
  const modal = $("lesson-modal");
  
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      initLearningHub(); // Refresh progress
    });
    
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        initLearningHub();
      }
    });
  }
}

/**
 * Update the learn-unlock-status element on index.html.
 */
function updateLearnUnlockStatus() {
  const el = $("learn-unlock-status");
  if (!el) return;
  const count = getUnlockedSimulationsCount();
  const total = Object.keys(SIM_UNLOCK_CRITERIA).length;
  el.textContent = `🔓 Открыто симуляций: ${count} из ${total}`;
  el.style.cssText = "color:rgba(255,255,255,0.85);font-weight:700;font-size:0.9rem;padding:10px 0;";
}

/* ── SIMULATION HUB ── */

/**
 * Initialize the Simulation Hub (play.html).
 * Renders simulation cards with mastery gate lock/unlock state.
 * EXTENSION POINT: Add new simulations to SIM_DEFS array below.
 * Each sim needs: id (matching SIM_UNLOCK_CRITERIA key), icon, title, desc, color.
 */
function initPlayHub() {
  const grid = $("play-sims-grid");
  if (!grid) return;

  const SIM_DEFS = [
    { id: "it_sim",       icon: "💻", title: "IT Симуляция",          desc: "Стань программистом и реши реальную задачу!", color: "#0ea5e9" },
    { id: "pilot_sim",    icon: "🚁", title: "Симуляция пилота",      desc: "Управляй дроном и выполни все этапы полёта!", color: "#6366f1" },
    { id: "drone_career", icon: "🚀", title: "Карьера Дрон-Пилота",   desc: "Пройди 4 уровня карьеры пилота дрона!",       color: "#ec4899" },
    { id: "drone_game",   icon: "🎮", title: "Игра: Доставь посылку", desc: "Управляй дроном — избегай препятствий!",       color: "#f59e0b" },
    { id: "cyber_sim",    icon: "🛡️", title: "Кибер Симуляция",       desc: "Защити цифровой мир от хакеров!",             color: "#10b981" },
  ];

  const adminMode = isAdmin();

  grid.innerHTML = SIM_DEFS.map(sim => {
    const unlocked = isSimUnlocked(sim.id);
    const required = SIM_UNLOCK_CRITERIA[sim.id] || [];
    const completed = getLessonProgress();
    const quizPassed = getQuizPassed();
    const notDone = required.filter(id => !completed[id] || !quizPassed[id]);

    let actionHTML;
    if (unlocked || adminMode) {
      actionHTML = `<button class="btn-main play-sim-btn" data-sim="${sim.id}" style="background:${sim.color}">${adminMode && !unlocked ? '👑 Открыть' : '▶ Играть'}</button>`;
    } else {
      actionHTML = `<div class="play-sim-lock-info">🔒 Нужно: ${notDone.length} урок(а) + тест<br><a href="learn.html" class="play-sim-learn-link">📚 Учиться →</a></div>`;
    }

    return `
      <div class="play-sim-card ${unlocked || adminMode ? '' : 'play-sim-locked'}" data-sim="${sim.id}" style="--sim-color:${sim.color}">
        <div class="play-sim-icon">${sim.icon}</div>
        <div class="play-sim-info">
          <h3 class="play-sim-title">${escHtml(sim.title)}</h3>
          <p class="play-sim-desc">${escHtml(sim.desc)}</p>
          ${!unlocked && !adminMode && required.length > 0 ? `<div class="play-sim-progress-hint">Нужно: ${required.length} урок(а) + тест ✓</div>` : ''}
        </div>
        <div class="play-sim-action">${actionHTML}</div>
      </div>
    `;
  }).join('');

  // Wire modal close buttons on play.html
  ["it-sim-modal","pilot-sim-modal","drone-sim-modal","drone-game-modal","cyber-sim-modal"].forEach(modalId => {
    const modal = $(modalId);
    if (!modal) return;
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn && !closeBtn._playWired) {
      closeBtn._playWired = true;
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
    if (!modal._playOverlayWired) {
      modal._playOverlayWired = true;
      modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
    }
  });

  // Wire play buttons
  grid.querySelectorAll(".play-sim-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const simId = btn.dataset.sim;
      guardSimulation(simId, () => {
        const modalMap = {
          "it_sim":       "it-sim-modal",
          "pilot_sim":    "pilot-sim-modal",
          "drone_career": "drone-sim-modal",
          "drone_game":   "drone-game-modal",
          "cyber_sim":    "cyber-sim-modal",
        };
        const modalId = modalMap[simId];
        if (!modalId) return;
        const modal = $(modalId);
        if (!modal) return;
        modal.classList.remove("hidden");
        // Trigger the appropriate init + Ani coach intro
        if (simId === "it_sim") {
          itScore=0; itStep=0; itShowIntro=true;
          const c=$("it-sim-content"); if(c) renderItIntro(c);
          setTimeout(() => aniSay("💻 Давай! Ты — программист. Найди и исправь ошибку в коде!"), 400);
        } else if (simId === "pilot_sim") {
          pilotStep=0; pilotScore=0; pilotShowIntro=true;
          const c=$("pilot-sim-content"); if(c) renderPilotIntro(c);
          setTimeout(() => aniSay("🚁 Вперёд! Выполни все этапы полёта как настоящий пилот!"), 400);
        } else if (simId === "drone_career") {
          droneStep=0; droneXp=0; droneShowIntro=true;
          const c=$("drone-sim-content"); if(c) renderDroneIntro(c);
          setTimeout(() => aniSay("🚀 Начинаем карьеру! Пройди все 4 уровня и стань профессионалом!"), 400);
        } else if (simId === "drone_game") {
          startDroneGame();
          setTimeout(() => aniSay("🎮 Доставь посылку! Избегай препятствий и достигни цели!"), 400);
        } else if (simId === "cyber_sim") {
          cyberScore=0; cyberStep=0; cyberShowIntro=true;
          const c=$("cyber-sim-content"); if(c) renderCyberIntro(c);
          setTimeout(() => aniSay("🛡️ Защити цифровой мир! Найди угрозы и нейтрализуй их!"), 400);
        }
      });
    });
  });

  // Update unlock bar
  const unlockText = $("play-unlock-text");
  if (unlockText) {
    const count = getUnlockedSimulationsCount();
    const total = Object.keys(SIM_UNLOCK_CRITERIA).length;
    unlockText.textContent = adminMode
      ? `👑 Администратор — все ${total} симуляций доступны`
      : `🔓 Открыто симуляций: ${count} из ${total}`;
  }

  // Ani coach greeting
  setTimeout(() => {
    aniWave();
    const name = getUserName() || "друг";
    const count = getUnlockedSimulationsCount();
    if (adminMode) {
      aniSay(`Привет, ${name}! 👑 Режим администратора — все симуляции открыты. Выбирай!`);
    } else if (count === 0) {
      aniSay(`Привет, ${name}! 🎮 Сначала пройди уроки и тесты в Центре Обучения, чтобы открыть симуляции!`);
    } else {
      aniSay(`Привет, ${name}! 🎮 У тебя открыто ${count} симуляций. Я твой тренер — давай играть!`);
    }
  }, 800);
}

/* ── PHASE 2: GLOBAL NAVBAR + SIDEBAR ── */

/**
 * Initialize mobile sidebar toggle (hamburger menu).
 */
function initNavbar() {
  updateNavXpBar();
  updateSidebarProgress();
  const menuBtn  = $("nav-menu-btn");
  const sidebar  = $("app-sidebar");
  if (!menuBtn || !sidebar) return;
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
  // Close sidebar when clicking outside
  document.addEventListener("click", e => {
    if (sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn) {
      sidebar.classList.remove("open");
    }
  });
}

/* ── PHASE 3: TUTOR PANEL (lesson two-panel) ── */

/**
 * Add a message to the Ani tutor panel inside the lesson modal.
 * @param {string} text
 * @param {'default'|'tip'|'celebrate'} type
 */
function tutorSay(text, type = "default") {
  const container = $("tutor-messages");
  if (!container) return;
  const msg = document.createElement("div");
  msg.className = "tutor-msg" + (type !== "default" ? " " + type : "");
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  // Also say it via Ani
  aniSay(text);
}

/**
 * Update the readiness indicator in the tutor panel.
 * @param {'beginner'|'learning'|'ready'} readiness
 */
function updateTutorReadiness(readiness) {
  const el = $("tutor-readiness");
  if (!el) return;
  const map = {
    beginner: { cls: "beginner", text: "🌱 Новичок — начни учиться!" },
    learning: { cls: "learning", text: "📖 Обучается — продолжай!" },
    ready:    { cls: "ready",    text: "🚀 Готов к симуляции!" },
  };
  const r = map[readiness] || map.beginner;
  el.className = "tutor-readiness " + r.cls;
  el.textContent = r.text;
}

/* ── PHASE 6: COACH PANEL (drone game) ── */

/**
 * Add a message to the Ani coach panel inside the drone game modal.
 * @param {string} text
 * @param {'default'|'warn'|'success'|'fail'} type
 */
function coachSay(text, type = "default") {
  const container = $("coach-messages");
  if (!container) return;
  // Keep max 4 messages
  while (container.children.length >= 4) container.removeChild(container.firstChild);
  const msg = document.createElement("div");
  msg.className = "coach-msg" + (type !== "default" ? " " + type : "");
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

/* ── DOM READY ── */
document.addEventListener("DOMContentLoaded",()=>{
  safe(initVoiceToggle);
  safe(initAni);
  safe(initAniOnboarding);
  safe(initAniMouseFollow);
  /* ── PHASE 5 ── */
  safe(initAniClickReaction);
  safe(initAniMemory);
  safe(initMissionEngine);
  safe(initAchieverEngine);
  safe(initParentDashboard);
  safe(initLessonGamification);
  /* ── PHASE 5.8 ── */
  safe(initAniDialogMemory);
  safe(initSimulationCoach);
  safe(initSimulationDifficulty);
  safe(initSimulationBranching);
  safe(initSimulationParentInsights);
  
  /* ── PHASE 5.8.5 ── */
  safe(initMultiStageFlow);
  safe(initParentInsightsV2);
  safe(initNextActionEngine);
  safe(initCareerProgression);
  
  /* ── PHASE 5.9 ── */
  safe(initArena);
  safe(initArenaVisuals);
  safe(initArenaSimulationHook);
  
  /* ── PHASE 6 MONETIZATION MVP ── */
  safe(initSubscriptionPreview);
  safe(initPremiumParentDashboard);
  safe(initMissionEconomy);
  
  /* ── ONBOARDING (after all systems initialized) ── */
  safe(initNameSystem);
  
  /* ── PHASE 5.8.5 INTEGRATION ── */
  safe(() => {
    // Wire multi-stage flow to simulations
    document.addEventListener("phase585:stageComplete", (e) => {
      try {
        const { simType, score } = e.detail;
        trackCareerPerformance(simType, score, true);
        trackWeeklyGrowth(score);
      } catch (err) {
        console.error("[Phase 5.8.5] Stage complete wire error:", err);
      }
    });

    // Wire parent insights v2 to progress updates
    document.addEventListener("phase5:pointsAwarded", (e) => {
      try {
        const points = e.detail?.points || 0;
        trackWeeklyGrowth(points);
      } catch (err) {
        console.error("[Phase 5.8.5] Points awarded wire error:", err);
      }
    });

    // Wire career progression to XP awards
    document.addEventListener("phase5:pointsAwarded", (e) => {
      try {
        const points = e.detail?.points || 0;
        ["pilot", "doctor", "drone", "cyber"].forEach(career => {
          const unlock = unlockCareerLevel(career, points);
          if (unlock) {
            aniSay(`🎉 ${unlock.levelDef.name} уровень разблокирован!`);
          }
        });
      } catch (err) {
        console.error("[Phase 5.8.5] Career unlock wire error:", err);
      }
    });

    // Wire next action engine to dashboard
    document.addEventListener("phase585:nextActionUpdated", (e) => {
      try {
        const hint = document.getElementById("p585-next-action-hint");
        if (hint) {
          renderNextActionHint(hint);
        }
      } catch (err) {
        console.error("[Phase 5.8.5] Next action update wire error:", err);
      }
    });
  });
  
  /* ── PHASE 5.9 INTEGRATION ── */
  safe(() => {
    // Wire arena to simulation start buttons
    ["pilot", "doctor", "drone", "cyber"].forEach(simType => {
      const btn = document.querySelector(`[data-sim-type="${simType}"]`);
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          try {
            hookSimulationToArena(simType);
            startArenaSimulation(simType);
          } catch (err) {
            console.error(`[Phase 5.9] Arena start error for ${simType}:`, err);
          }
        });
      }
    });

    // Wire arena stage completion to Phase 5.8.5 multi-stage system
    document.addEventListener("phase59:arenaStageComplete", (e) => {
      try {
        const { simType, stageIdx, score } = e.detail;
        completeSimulationStage(simType, stageIdx, score);
      } catch (err) {
        console.error("[Phase 5.9] Arena stage complete wire error:", err);
      }
    });

    // Wire arena action feedback to coaching system
    document.addEventListener("phase59:arenaActionFeedback", (e) => {
      try {
        const { simType, actionKey, correct } = e.detail;
        if (!correct) {
          triggerArenaCoaching(simType, actionKey);
        }
      } catch (err) {
        console.error("[Phase 5.9] Arena action feedback wire error:", err);
      }
    });

    // Wire arena branching events to simulation system
    document.addEventListener("phase59:arenaBranchingEvent", (e) => {
      try {
        const { simType, event } = e.detail;
        triggerArenaBranchingEvent(simType, event);
      } catch (err) {
        console.error("[Phase 5.9] Arena branching event wire error:", err);
      }
    });

    // Wire arena exit to cleanup
    document.addEventListener("phase59:arenaExit", (e) => {
      try {
        exitArena();
      } catch (err) {
        console.error("[Phase 5.9] Arena exit wire error:", err);
      }
    });
  });
  
  /* ── PHASE 6 MONETIZATION MVP INTEGRATION ── */
  safe(() => {
    // Lock premium simulations in arena
    document.addEventListener("phase59:simulationStarted", (e) => {
      try {
        const { simType } = e.detail;
        if (lockPremiumSimulation(simType)) {
          showUpgradeCTA("arena_start");
        }
      } catch (err) {
        console.error("[Phase 6] Arena premium lock error:", err);
      }
    });

    // Award coins on simulation completion
    document.addEventListener("phase59:simulationComplete", (e) => {
      try {
        const { simType, finalScore } = e.detail;
        const difficulty = getDifficultyTier ? getDifficultyTier() : "medium";
        const coins = calculateMissionReward(10, difficulty);
        awardCoins(coins, `simulation_complete_${simType}`);
        
        // Award premium points
        awardPremiumPoints(Math.floor(finalScore / 10));
        
        // Increment streak
        incrementStreak();
      } catch (err) {
        console.error("[Phase 6] Coin award error:", err);
      }
    });

    // Lock elite challenges in career progression
    document.addEventListener("phase585:careerLevelUnlocked", (e) => {
      try {
        const { careerType } = e.detail;
        if (isPremiumFeature("elite_challenge")) {
          showUpgradeCTA("career_elite");
        }
      } catch (err) {
        console.error("[Phase 6] Career elite lock error:", err);
      }
    });

    // Award gems on elite challenge completion
    document.addEventListener("phase585:eliteChallengeComplete", (e) => {
      try {
        const { careerType, won, reward } = e.detail;
        if (won) {
          awardGems(10, "elite_challenge_complete");
        }
      } catch (err) {
        console.error("[Phase 6] Gem award error:", err);
      }
    });

    // Blur locked rewards in parent dashboard
    document.addEventListener("phase585:insightsUpdated", () => {
      try {
        const container = document.getElementById("parent-insights-container");
        if (container) {
          blurLockedRewards(container);
        }
      } catch (err) {
        console.error("[Phase 6] Blur locked rewards error:", err);
      }
    });

    // Show preview timer on dashboard
    document.addEventListener("phase585:parentDashboardReady", () => {
      try {
        const timerContainer = document.getElementById("p6-preview-timer");
        if (timerContainer) {
          renderPreviewTimerCard(timerContainer);
        }
      } catch (err) {
        console.error("[Phase 6] Preview timer render error:", err);
      }
    });

    // Render premium dashboard components
    document.addEventListener("phase6:premiumDashboardReady", () => {
      try {
        const status = getSubscriptionStatus();
        if (status === "premium" || status === "trial") {
          const heatmapContainer = document.getElementById("p6-heatmap");
          if (heatmapContainer) renderWeeklyHeatmap(heatmapContainer);
          
          const radarContainer = document.getElementById("p6-radar");
          if (radarContainer) renderSkillRadar(radarContainer);
          
          const intelligenceContainer = document.getElementById("p6-intelligence");
          if (intelligenceContainer) renderRetryIntelligence(intelligenceContainer);
          
          const confidenceContainer = document.getElementById("p6-confidence");
          if (confidenceContainer) renderConfidenceScore(confidenceContainer);
          
          const activitiesContainer = document.getElementById("p6-activities");
          if (activitiesContainer) renderActivityRecommendations(activitiesContainer);
          
          const readinessContainer = document.getElementById("p6-readiness");
          if (readinessContainer) renderSchoolReadinessPreview(readinessContainer);
        }
      } catch (err) {
        console.error("[Phase 6] Premium dashboard render error:", err);
      }
    });

    // Render mission economy UI
    document.addEventListener("phase6:missionEconomyReady", () => {
      try {
        const walletContainer = document.getElementById("p6-wallet");
        if (walletContainer) renderWalletDisplay(walletContainer);
        
        const inventoryContainer = document.getElementById("p6-inventory");
        if (inventoryContainer) renderInventoryPanel(inventoryContainer);
        
        const spinContainer = document.getElementById("p6-spin");
        if (spinContainer) renderDailySpinWheel(spinContainer);
      } catch (err) {
        console.error("[Phase 6] Mission economy render error:", err);
      }
    });

    // Update wallet display on coin award
    document.addEventListener("phase6:coinsAwarded", () => {
      try {
        const walletContainer = document.getElementById("p6-wallet");
        if (walletContainer) renderWalletDisplay(walletContainer);
      } catch (err) {
        console.error("[Phase 6] Wallet update error:", err);
      }
    });

    // Update inventory on accessory unlock
    document.addEventListener("phase6:accessoryUnlocked", () => {
      try {
        const inventoryContainer = document.getElementById("p6-inventory");
        if (inventoryContainer) renderInventoryPanel(inventoryContainer);
      } catch (err) {
        console.error("[Phase 6] Inventory update error:", err);
      }
    });
  });
  
  /* Phase 5.7 — scroll reveal + lazy image fade */
  safe(() => {
    if (!window.IntersectionObserver) return;
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("p5-revealed"); revObs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".p5-reveal").forEach(el => revObs.observe(el));
    // Lazy image fade
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete) { img.classList.add("p5-loaded"); return; }
      img.addEventListener("load", () => img.classList.add("p5-loaded"), { once: true });
    });
    // Wire mission memory tracking
    document.addEventListener("phase5:missionComplete", e => {
      try { recordMissionAttempt(e.detail?.id); } catch {}
    });
  });
  safe(initIdleMessages);
  safe(initScrollReactions);
  safe(initMiniQuiz);
  safe(initFeedback);
  safe(initItSim);
  safe(initPilotSim);
  safe(initDroneSim);
  safe(initDroneGame);
  safe(initCyberSim);
  safe(initQuizPage);
  safe(initDailyLearning);
  safe(initStt);
  safe(initSkillLab);
  safe(initChat);
  safe(updateDashboard);
  safe(updateXpBar);
  safe(initCareerMicroQuiz);
  safe(initDailyMissions);
  safe(initLeaderboard);
  safe(initStoryArc);
  safe(initLearningHub);
  safe(initLessonModal);
  safe(updateSimulationUnlocks);
  safe(updateLearnUnlockStatus);
  safe(initPlayHub);
  safe(initRoleSystem);
  // Phase 2: navbar + sidebar
  safe(initNavbar);
});

/* ── ANI CHAT ENGINE ── */

/**
 * Local AI knowledge base — child-friendly Russian, ages 7-14.
 * Covers careers, learning, gamification, navigation, fun facts, emotions.
 */
const CHAT_KB = [

  /* ── GREETINGS ── */
  { keys:["привет","здравствуй","хай","hello","hi","добрый день","добрый вечер","доброе утро"],
    fn:()=>{ const n=getUserName()||"друг"; return `Привет, ${n}! 😊 Я Анюша — твой помощник в мире профессий! Спроси меня о любой профессии или скажи «помоги»!`; }},

  /* ── WHO AM I ── */
  { keys:["кто ты","как тебя зовут","твоё имя","ты робот","ты человек","ты ии","ты ai"],
    fn:()=>"Я Анюша — умный AI-помощник Карьерной Лаборатории! 🤖 Я помогаю детям узнавать о профессиях будущего. Спроси меня о дронах, роботах, космосе или играх!" },

  /* ── HELP ── */
  { keys:["помоги","помощь","что делать","не знаю","с чего начать","как пользоваться"],
    fn:()=>"Конечно помогу! 💡 Вот что ты можешь делать:\n• Пройти тест профессий 🧠\n• Изучить карьеры 🔭\n• Открыть Лабораторию навыков 🧩\n• Спросить меня о любой профессии!\nПросто напиши или скажи вслух!" },

  /* ── PROGRESS / XP ── */
  { keys:["очки","баллы","прогресс","сколько очков","xp","опыт","заработал"],
    fn:()=>{ const p=getProgress(),lv=getLevelInfo(p.points);
      return `У тебя ${p.points} XP! 🌟 Уровень: ${lv.icon} ${lv.label}. Серия: ${p.streak} дней подряд! Продолжай — ты молодец!`; }},

  /* ── BADGES ── */
  { keys:["значки","бейджи","награды","достижения","медали"],
    fn:()=>{ const p=getProgress();
      if(!p.badges.length) return "У тебя пока нет значков. 🏅 Пройди тест или симуляцию — и получишь первый!";
      const earned=BADGE_DEFS.filter(b=>p.badges.includes(b.id)).map(b=>b.emoji+" "+b.label).join(", ");
      return `Твои значки: ${earned}! 🏆 Отличная коллекция! Продолжай зарабатывать новые!`; }},

  /* ── STREAK ── */
  { keys:["серия","streak","дней подряд","каждый день"],
    fn:()=>{ const p=getProgress();
      return `Твоя серия: ${p.streak} дней подряд! 🔥 Заходи каждый день, чтобы не прерывать серию и получить значок «7-дневная серия»!`; }},

  /* ── LEVEL ── */
  { keys:["уровень","level","ранг","мой уровень"],
    fn:()=>{ const p=getProgress(),lv=getLevelInfo(p.points);
      const next=LEVELS.find(l=>l.level===lv.level+1);
      const need=next?next.min-p.points:0;
      return `Ты на уровне ${lv.icon} ${lv.label}! ${need>0?`До следующего уровня: ${need} XP. Ты почти там!`:"Ты на максимальном уровне! 👑 Легенда!"}`; }},

  /* ── DRONE PILOT ── */
  { keys:["дрон","пилот","беспилотник","квадрокоптер","летать","полёт"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="drone-pilot.html",1400);
      return "Пилот дрона — профессия будущего! 🚁 Они управляют беспилотниками для доставки лекарств, съёмки фильмов и спасения людей. Открываю страницу!"; }},

  /* ── CYBER SECURITY ── */
  { keys:["кибер","хакер","безопасность","защита","взлом","пароль","вирус","интернет"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="cyber-defender.html",1400);
      return "Кибер-защитник охраняет интернет от злоумышленников! 🛡️ Каждые 39 секунд в мире происходит кибератака. Это очень важная профессия! Открываю страницу!"; }},

  /* ── SPACE ── */
  { keys:["космос","астронавт","ракета","планета","звезда","nasa","марс","луна","галактика"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="space-explorer.html",1400);
      return "Исследователь космоса — мечта многих! 🌌 NASA планирует отправить людей на Марс в 2030-х. В нашей галактике более 200 миллиардов звёзд! Открываю страницу!"; }},

  /* ── ROBOTICS ── */
  { keys:["робот","роботика","инженер","механика","arduino","raspberry","конструктор"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="robotics-engineer.html",1400);
      return "Инженер-робот создаёт машины, которые помогают людям! 🤖 Роботы уже работают в больницах, на заводах и даже в космосе. Открываю страницу!"; }},

  /* ── GAME DESIGN ── */
  { keys:["игра","геймдизайн","разработка игр","unity","minecraft","roblox","создать игру"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="game-designer.html",1400);
      return "Гейм-дизайнер создаёт игры! 🎮 Minecraft создал один человек, а индустрия игр зарабатывает больше, чем кино! Открываю страницу!"; }},

  /* ── QUIZ ── */
  { keys:["тест","квиз","какая профессия","моя профессия","подходит","выбрать профессию"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="quiz.html",1200);
      return "Отличная идея! 🧠 Открываю тест профессий — отвечай честно, и я скажу, какая профессия тебе подходит!"; }},

  /* ── EXPLORER ── */
  { keys:["исследовать","все профессии","список профессий","explorer","посмотреть"],
    fn:()=>{ aniPoint(); setTimeout(()=>window.location.href="explorer.html",1200);
      return "Открываю все профессии! 🔭 Там 5 удивительных карьер будущего — выбирай любую!"; }},

  /* ── HOME ── */
  { keys:["главная","домой","назад","home","начало"],
    fn:()=>{ setTimeout(()=>window.location.href="index.html",1000);
      return "Идём на главную! 🏠"; }},

  /* ── SKILL LAB ── */
  { keys:["навыки","лаборатория","skill","задание","упражнение","тренировка","логика","творчество"],
    fn:()=>{ const sec=document.getElementById("skill-lab-section");
      if(sec) sec.scrollIntoView({behavior:"smooth"});
      return "Лаборатория навыков — вот она! 🧩 Тренируй логику, творчество и общение. Зарабатывай XP за каждый уровень!"; }},

  /* ── DAILY LESSON ── */
  { keys:["урок","ежедневный","сегодня","учиться","учёба","занятие"],
    fn:()=>{ const sec=document.getElementById("daily-panel");
      if(sec) sec.scrollIntoView({behavior:"smooth"});
      return "Ежедневный урок ждёт тебя! 📚 Каждый день — новая тема и +20 XP за правильный ответ. Поехали!"; }},

  /* ── WHAT IS PROGRAMMING ── */
  { keys:["программирование","код","кодить","python","javascript","программист"],
    fn:()=>"Программирование — это способ общаться с компьютером! 💻 Ты пишешь инструкции, а компьютер их выполняет. Python — отличный язык для начала. Попробуй в Лаборатории навыков!"},

  /* ── WHAT IS AI ── */
  { keys:["искусственный интеллект","нейросеть","машинное обучение","chatgpt","что такое ии"],
    fn:()=>"Искусственный интеллект — это когда компьютер учится думать! 🧠 Как я, Анюша! Нейросети учатся на миллионах примеров и потом могут отвечать на вопросы, рисовать картинки и даже играть в игры."},

  /* ── HOW TO STUDY ── */
  { keys:["как учиться","как запомнить","советы","лайфхак","учёба","школа"],
    fn:()=>"Вот мои советы для учёбы! 📖\n• Учись понемногу каждый день\n• Делай перерывы каждые 25 минут\n• Объясняй тему другу — это лучший способ запомнить!\n• Не бойся ошибаться — ошибки помогают расти! 💪"},

  /* ── FUTURE JOBS ── */
  { keys:["профессии будущего","будущее","новые профессии","какие профессии будут"],
    fn:()=>"Профессии будущего — это круто! 🚀 Самые востребованные:\n• Пилот дрона 🚁\n• Кибер-защитник 🛡️\n• Инженер-робот 🤖\n• Исследователь космоса 🌌\n• Гейм-дизайнер 🎮\nВсе они есть в нашей Лаборатории!"},

  /* ── MONEY / SALARY ── */
  { keys:["зарплата","деньги","сколько зарабатывают","доход","богатый"],
    fn:()=>"Профессии будущего хорошо оплачиваются! 💰 Например, кибер-специалисты зарабатывают от 100 000 рублей в месяц. Но главное — выбирай то, что тебе нравится, и деньги придут сами!"},

  /* ── ENCOURAGEMENT ── */
  { keys:["скучно","не интересно","устал","не хочу","надоело","сложно","не получается"],
    fn:()=>{ aniHappy();
      return "Не сдавайся! 💪 Все великие люди сначала тоже не умели. Попробуй другой модуль или сделай перерыв — и возвращайся! Ты точно справишься!"; }},

  /* ── PRAISE ── */
  { keys:["молодец","спасибо","отлично","круто","класс","супер","здорово","ты лучшая"],
    fn:()=>{ aniHappy(); return "Пожалуйста! 😊 Ты тоже молодец — продолжай учиться и исследовать! Вместе мы непобедимы! 🌟"; }},

  /* ── EMOTIONS ── */
  { keys:["грустно","плохо","расстроен","обидно","не получилось"],
    fn:()=>{ aniNod(); return "Не расстраивайся! 🤗 Ошибки — это часть обучения. Попробуй ещё раз, и у тебя обязательно получится! Я верю в тебя! 💜"; }},

  /* ── FUN FACTS ── */
  { keys:["интересный факт","факт","расскажи что-нибудь","удиви меня","знаешь ли ты"],
    fn:()=>{ const facts=[
      "Первый компьютер весил 27 тонн — как 5 слонов! 🐘 А сейчас компьютер помещается в кармане!",
      "Дроны используются для доставки пиццы в некоторых городах! 🍕🚁",
      "Международная космическая станция летит со скоростью 28 000 км/ч! 🚀",
      "Робот-хирург может делать операции точнее человека! 🤖",
      "Первая компьютерная игра была создана в 1958 году — это был теннис! 🎮",
      "В мире более 1 миллиарда программистов! 💻",
    ]; return facts[Math.floor(Math.random()*facts.length)]; }},

  /* ── AGE / WHEN TO START ── */
  { keys:["когда начать","с какого возраста","я маленький","я ещё ребёнок","мне лет"],
    fn:()=>"Начинать никогда не рано! 🌱 Многие великие программисты начали в 8-10 лет. Билл Гейтс написал первую программу в 13 лет! Ты уже на правильном пути — ты здесь!"},

  /* ── SIMULATION ── */
  { keys:["симуляция","симулятор","попробовать","поиграть","задание"],
    fn:()=>{ const itBtn=document.getElementById("open-it-sim");
      const pilotBtn=document.getElementById("open-pilot-sim");
      if(itBtn){ itBtn.click(); return "Открываю IT-симуляцию! 💻 Найди ошибку в коде!"; }
      if(pilotBtn){ pilotBtn.click(); return "Открываю симуляцию пилота! 🚁 Управляй дроном!"; }
      return "Симуляции есть на главной странице! 🎮 Зайди туда и попробуй!"; }},
];


/**
 * Local KB lookup — instant, no network.
 * @param {string} msg
 * @returns {string|null}
 */
function chatLocalResponse(msg){
  const m = msg.toLowerCase().trim();
  for(const rule of CHAT_KB){
    if(rule.keys.some(k => m.includes(k))) return rule.fn();
  }
  return null;
}

/* ── AI BACKEND CONFIG ── */
// Set your OpenAI key in localStorage: localStorage.setItem("kl_openai_key","sk-...")
// Or set Ollama endpoint: localStorage.setItem("kl_ollama_url","http://localhost:11434")
// If neither is set, falls back to local KB.

/** Build the system prompt, injecting live page + user context */
function buildSystemPrompt(){
  const name = getUserName() || "друг";
  const p = getProgress();
  const lv = getLevelInfo(p.points);
  const ctx = getPageContext();
  // Weak areas: top 2 topics the user struggles with
  const weakStr = Object.entries(p.weakAreas||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>k).join(", ") || "нет";
  // Completed missions
  const missionsStr = DAILY_MISSION_DEFS.filter(m=>(p[m.key]||0)>=m.threshold).map(m=>m.title).join(", ") || "нет";
  return (
    "Ты Анюша — тёплый, живой AI-помощник для детей 7-14 лет на сайте «Карьерная Лаборатория».\n" +
    "Ты как старшая подруга: весёлая, добрая, немного игривая. Ты искренне радуешься успехам ребёнка.\n" +
    "Контекст пользователя:\n" +
    `• Имя: ${name}\n` +
    `• XP: ${p.points}, уровень: ${lv.label}, серия: ${p.streak} дней\n` +
    `• Текущая страница: ${ctx.page}\n` +
    `• Слабые темы: ${weakStr}\n` +
    `• Выполненные миссии: ${missionsStr}\n` +
    "Правила поведения:\n" +
    "1. Отвечай ТОЛЬКО по-русски. Коротко — 2-3 предложения максимум.\n" +
    "2. Используй 1-2 эмодзи. Не перегружай текст.\n" +
    "3. Говори живо: «Ого!», «Вот это да!», «Слушай, а ты знал...», «Кстати...»\n" +
    "4. В конце каждого ответа задавай один короткий вопрос ребёнку — чтобы он думал дальше.\n" +
    "5. Никогда не давай вредных, опасных или взрослых советов.\n" +
    "6. Если не знаешь — скажи «Хм, не уверена... но давай узнаем вместе! 🤔»\n" +
    "7. Помогай узнавать о профессиях: пилот дрона 🚁, кибер-защитник 🛡️, " +
    "исследователь космоса 🌌, инженер-робот 🤖, гейм-дизайнер 🎮.\n" +
    "8. Поощряй любопытство: «Отличный вопрос!», «Ты думаешь как настоящий учёный!»\n" +
    "9. Если ребёнок грустит или устал — поддержи тепло: «Всё получится, я верю в тебя! 💪»\n" +
    "10. Обращайся на «ты», тепло и с уважением. Ты друг, не учитель.\n" +
    "11. Если у пользователя есть слабые темы — мягко предложи попрактиковаться в них.\n" +
    "Сайт: Карьерная Лаборатория — образовательная платформа для детей о профессиях будущего."
  );
}

/** In-memory conversation history for multi-turn context (last 6 turns = 12 messages) */
const AI_CONV_HISTORY = [];
const AI_CONV_MAX = 12; // 6 user + 6 assistant

/**
 * Push a turn into conversation history, trimming to max.
 * @param {"user"|"assistant"} role
 * @param {string} content
 */
function aiHistoryPush(role, content){
  AI_CONV_HISTORY.push({ role, content });
  if(AI_CONV_HISTORY.length > AI_CONV_MAX){
    AI_CONV_HISTORY.splice(0, AI_CONV_HISTORY.length - AI_CONV_MAX);
  }
}

/**
 * Try OpenAI API (gpt-4o-mini) — requires key in localStorage.
 * Sends full conversation history for multi-turn context.
 */
async function tryOpenAI(msg){
  const key = localStorage.getItem("kl_openai_key");
  if(!key) return null;
  const messages = [
    { role:"system", content: buildSystemPrompt() },
    ...AI_CONV_HISTORY,
    { role:"user",   content: msg }
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+key },
    body: JSON.stringify({
      model: localStorage.getItem("kl_openai_model") || "gpt-4o-mini",
      max_tokens: 180,
      temperature: 0.75,
      messages
    }),
    signal: AbortSignal.timeout(12000)
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({}));
    console.debug("[Ani] OpenAI error:", res.status, err?.error?.message);
    return null;
  }
  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() || null;
  if(reply){
    // Record both sides in history for next turn
    aiHistoryPush("user", msg);
    aiHistoryPush("assistant", reply);
  }
  return reply;
}

/**
 * Try Ollama local AI — requires Ollama running on localhost.
 * Uses /api/chat endpoint for multi-turn support.
 */
async function tryOllama(msg){
  const base = localStorage.getItem("kl_ollama_url") || "http://localhost:11434";
  const model = localStorage.getItem("kl_ollama_model") || "llama3";
  const messages = [
    { role:"system", content: buildSystemPrompt() },
    ...AI_CONV_HISTORY,
    { role:"user",   content: msg }
  ];
  const res = await fetch(base + "/api/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
    signal: AbortSignal.timeout(8000)
  });
  if(!res.ok) return null;
  const data = await res.json();
  const reply = data?.message?.content?.trim() || null;
  if(reply){
    aiHistoryPush("user", msg);
    aiHistoryPush("assistant", reply);
  }
  return reply;
}

/**
 * Main async AI response — tries OpenAI → Ollama → local KB.
 * @param {string} msg
 * @returns {Promise<string>}
 */
async function chatAiResponseAsync(msg){
  // 1. Always check local KB first for instant navigation/gamification commands
  const local = chatLocalResponse(msg);
  if(local) return local;

  // 2. Try OpenAI
  try{
    const ai = await tryOpenAI(msg);
    if(ai) return ai;
  }catch(e){ console.debug("[Ani] OpenAI unavailable:", e.message); }

  // 3. Try Ollama
  try{
    const ol = await tryOllama(msg);
    if(ol) return ol;
  }catch(e){ console.debug("[Ani] Ollama unavailable:", e.message); }

  // 4. Local fallback
  const ctx = getPageContext();
  const fallbacks = [
    "Интересный вопрос! 🤔 Попробуй спросить меня о профессиях, очках или навыках!",
    "Не совсем поняла... 😊 Скажи «помоги» — и я покажу, что умею!",
    ctx.fallback,
    "Хм... Попробуй: «Что такое дрон?» или «Сколько у меня очков?»",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ── CHAT BOX UI ── */
const CHAT_QUICK = [
  { label:"🧠 Тест",        msg:"какая профессия мне подходит" },
  { label:"📊 Мои очки",    msg:"сколько у меня очков" },
  { label:"🌟 Факт",        msg:"расскажи интересный факт" },
  { label:"💡 Помощь",      msg:"помоги мне" },
  { label:"🔭 Профессии",   msg:"все профессии" },
];

let chatOpen = false;
let chatMsgCount = 0;
let chatSttRec = null;
let chatSttActive = false;

function injectChatWidget(){
  if(document.getElementById("ani-chatbox")) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
<button class="ani-chat-toggle" id="ani-chat-toggle" title="Чат с Анюшей" aria-label="Открыть чат">
  💬<span class="chat-badge" id="chat-badge"></span>
</button>
<div class="ani-chatbox" id="ani-chatbox" role="dialog" aria-label="Чат с Анюшей">
  <div class="chat-header">
    <div class="chat-header-avatar">🤖</div>
    <div class="chat-header-info">
      <div class="chat-header-name">Анюша</div>
      <div class="chat-header-status"><span class="chat-status-dot" id="chat-status-dot"></span><span id="chat-status-text">Онлайн</span></div>
    </div>
    <button class="chat-icon-btn" id="chat-settings-btn" title="Настройки AI" aria-label="Настройки AI">⚙️</button>
    <button class="chat-icon-btn" id="chat-sound-btn" title="Звук" aria-label="Звук">${localStorage.getItem("kl_voice")==="off"?"🔇":"🔊"}</button>
    <button class="chat-close-btn" id="chat-close-btn" aria-label="Закрыть чат">✕</button>
  </div>
  <div class="chat-settings-panel hidden" id="chat-settings-panel">
    <p class="chat-settings-title">⚙️ Настройки AI</p>
    <label class="chat-settings-label">OpenAI API ключ</label>
    <input class="chat-settings-input" id="chat-openai-key" type="password"
      placeholder="sk-..." value="${localStorage.getItem("kl_openai_key")||""}" />
    <label class="chat-settings-label">OpenAI модель</label>
    <select class="chat-settings-input" id="chat-openai-model" style="cursor:pointer">
      <option value="gpt-4o-mini" ${(localStorage.getItem("kl_openai_model")||"gpt-4o-mini")==="gpt-4o-mini"?"selected":""}>gpt-4o-mini (быстрый, дешёвый)</option>
      <option value="gpt-4o" ${localStorage.getItem("kl_openai_model")==="gpt-4o"?"selected":""}>gpt-4o (умнее)</option>
      <option value="gpt-3.5-turbo" ${localStorage.getItem("kl_openai_model")==="gpt-3.5-turbo"?"selected":""}>gpt-3.5-turbo (старый)</option>
    </select>
    <label class="chat-settings-label">Ollama URL (локальный)</label>
    <input class="chat-settings-input" id="chat-ollama-url" type="text"
      placeholder="http://localhost:11434" value="${localStorage.getItem("kl_ollama_url")||""}" />
    <label class="chat-settings-label">Ollama модель</label>
    <input class="chat-settings-input" id="chat-ollama-model" type="text"
      placeholder="llama3" value="${localStorage.getItem("kl_ollama_model")||""}" />
    <button class="chat-settings-save" id="chat-settings-save">💾 Сохранить</button>
    <p class="chat-settings-hint">💡 Без ключа работает локальная база знаний (25+ тем).<br>OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#a78bfa">platform.openai.com</a><br>Ollama: запусти <code style="color:#6ee7b7">ollama serve</code> локально.</p>
  </div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-quick-replies" id="chat-quick-replies"></div>
  <div class="chat-input-row">
    <input class="chat-text-input" id="chat-text-input" type="text"
      placeholder="Напиши вопрос..." maxlength="200" autocomplete="off" />
    <button class="chat-mic-btn" id="chat-mic-btn" title="Голосовой ввод" aria-label="Голосовой ввод">🎤</button>
    <button class="chat-send-btn" id="chat-send-btn" title="Отправить" aria-label="Отправить">➤</button>
  </div>
</div>`;
  document.body.appendChild(wrap);
}

function chatAddMsg(text, role){
  const list = document.getElementById("chat-messages");
  if(!list) return;
  const div = document.createElement("div");
  div.className = "chat-msg " + role;
  const avatar = role === "ani"
    ? "<div class='chat-msg-avatar'>🤖</div>"
    : "<div class='chat-msg-avatar'>👤</div>";
  const bubble = document.createElement("div");
  bubble.className = "chat-msg-bubble";
  div.innerHTML = avatar;
  div.appendChild(bubble);
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;

  if(role === "ani"){
    // Typewriter effect for Ani messages
    let i = 0;
    const chars = Array.from(text); // handle emoji/unicode correctly
    const tick = () => {
      if(i < chars.length){
        bubble.textContent += chars[i++];
        list.scrollTop = list.scrollHeight;
        setTimeout(tick, i < 30 ? 18 : 10); // faster after first 30 chars
      }
    };
    tick();
    chatMsgCount++;
  } else {
    bubble.textContent = text;
  }

  // Persist to sessionStorage (last 20 messages)
  try{
    const hist = JSON.parse(sessionStorage.getItem("kl_chat_hist")||"[]");
    hist.push({role, text});
    if(hist.length > 20) hist.splice(0, hist.length - 20);
    sessionStorage.setItem("kl_chat_hist", JSON.stringify(hist));
  }catch(e){}
}

function chatShowTyping(){
  const list = document.getElementById("chat-messages");
  if(!list) return null;
  const div = document.createElement("div");
  div.className = "chat-msg ani chat-msg-typing";
  div.id = "chat-typing";
  div.innerHTML = "<div class='chat-msg-avatar'>🤖</div><div class='chat-msg-bubble'><span class='ani-typing-dots'><span></span><span></span><span></span></span></div>";
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  return div;
}

function chatRemoveTyping(){
  const t = document.getElementById("chat-typing");
  if(t) t.remove();
}

function chatRespond(userMsg){
  chatAddMsg(userMsg, "user");
  chatShowTyping();
  aniThink();
  // Track chat messages for missions
  const p = getProgress();
  p.chatMessages = (p.chatMessages || 0) + 1;
  saveProgress(p);
  chatAiResponseAsync(userMsg).then(reply=>{
    chatRemoveTyping();
    chatAddMsg(reply, "ani");
    aniSay(reply);
    // Award XP for chat interaction (max 5 per day)
    const chatXpKey = "kl_chat_xp_" + dayOfYear();
    const used = parseInt(localStorage.getItem(chatXpKey)||"0");
    if(used < 5){ awardPoints(2,"Чат с Анюшей"); localStorage.setItem(chatXpKey, used+1); }
  }).catch(()=>{
    chatRemoveTyping();
    chatAddMsg("Упс, что-то пошло не так. 😅 Попробуй ещё раз!", "ani");
  });
}

function initChatStt(){
  const btn = document.getElementById("chat-mic-btn");
  if(!btn) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ btn.style.display="none"; return; }
  const rec = new SR();
  chatSttRec = rec;
  rec.lang = "ru-RU"; rec.interimResults = false; rec.maxAlternatives = 1;
  btn.addEventListener("click", ()=>{
    if(isSpeaking){ aniSay("Подожди, я ещё говорю!"); return; }
    if(chatSttActive){ rec.stop(); return; }
    unlockAudio();
    try{ rec.start(); }catch(e){}
  });
  rec.onstart = ()=>{
    chatSttActive = true;
    btn.classList.add("listening");
    btn.textContent = "🔴";
  };
  rec.onend = ()=>{
    chatSttActive = false;
    btn.classList.remove("listening");
    btn.textContent = "🎤";
  };
  rec.onerror = e=>{
    chatSttActive = false;
    btn.classList.remove("listening");
    btn.textContent = "🎤";
    if(e.error === "not-allowed") chatAddMsg("🎤 Разреши микрофон в браузере!", "ani");
  };
  rec.onresult = e=>{
    const txt = (e.results[0][0].transcript||"").trim();
    if(txt){
      const inp = document.getElementById("chat-text-input");
      if(inp) inp.value = txt;
      chatRespond(txt);
    }
  };
}

function initChat(){
  injectChatWidget();

  const toggleBtn    = document.getElementById("ani-chat-toggle");
  const chatBox      = document.getElementById("ani-chatbox");
  const closeBtn     = document.getElementById("chat-close-btn");
  const sendBtn      = document.getElementById("chat-send-btn");
  const input        = document.getElementById("chat-text-input");
  const quickWrap    = document.getElementById("chat-quick-replies");
  const badge        = document.getElementById("chat-badge");
  const settingsBtn  = document.getElementById("chat-settings-btn");
  const settingsPanel= document.getElementById("chat-settings-panel");
  const saveBtn      = document.getElementById("chat-settings-save");
  const soundBtn     = document.getElementById("chat-sound-btn");

  if(!toggleBtn || !chatBox) return;

  // Quick reply buttons
  if(quickWrap){
    CHAT_QUICK.forEach(q=>{
      const b = document.createElement("button");
      b.className = "chat-quick-btn";
      b.textContent = q.label;
      b.addEventListener("click", ()=>{ chatRespond(q.msg); });
      quickWrap.appendChild(b);
    });
  }

  // Settings panel toggle
  settingsBtn?.addEventListener("click", ()=>{
    settingsPanel?.classList.toggle("hidden");
  });

  // Save AI settings
  saveBtn?.addEventListener("click", ()=>{
    const key    = document.getElementById("chat-openai-key")?.value.trim();
    const model  = document.getElementById("chat-openai-model")?.value;
    const olUrl  = document.getElementById("chat-ollama-url")?.value.trim();
    const olMod  = document.getElementById("chat-ollama-model")?.value.trim();
    if(key)   localStorage.setItem("kl_openai_key", key);
    else      localStorage.removeItem("kl_openai_key");
    if(model) localStorage.setItem("kl_openai_model", model);
    if(olUrl) localStorage.setItem("kl_ollama_url", olUrl);
    else      localStorage.removeItem("kl_ollama_url");
    if(olMod) localStorage.setItem("kl_ollama_model", olMod);
    else      localStorage.removeItem("kl_ollama_model");
    // Clear conversation history so new model starts fresh
    AI_CONV_HISTORY.length = 0;
    settingsPanel?.classList.add("hidden");
    const dot = document.getElementById("chat-status-dot");
    const txt = document.getElementById("chat-status-text");
    if(dot) dot.style.background = "#a78bfa";
    if(txt) txt.textContent = key ? (model || "gpt-4o-mini") + " ✓" : olUrl ? "Ollama ✓" : "Локальный режим";
    setTimeout(()=>{ if(dot) dot.style.background=""; if(txt) txt.textContent="Онлайн"; }, 3000);
    chatAddMsg("Настройки сохранены! 💾 Теперь я умнее.", "ani");
  });

  // Sound toggle in chat header (mirrors global voiceOn)
  soundBtn?.addEventListener("click", ()=>{
    unlockAudio();
    voiceOn = !voiceOn;
    localStorage.setItem("kl_voice", voiceOn ? "on" : "off");
    soundBtn.textContent = voiceOn ? "🔊" : "🔇";
    // Sync global voice toggle button too
    const globalBtn = document.getElementById("voice-toggle");
    if(globalBtn){
      globalBtn.textContent = voiceOn ? "\uD83D\uDD0A" : "\uD83D\uDD07";
      globalBtn.classList.toggle("active", voiceOn);
    }
    if(voiceOn) speak("\u0417\u0432\u0443\u043a \u0432\u043a\u043b\u044e\u0447\u0451\u043d!");
    else speechSynthesis.cancel();
  });

  // Open/close
  toggleBtn.addEventListener("click", ()=>{
    chatOpen = !chatOpen;
    chatBox.classList.toggle("open", chatOpen);
    document.body.classList.toggle("chat-open", chatOpen);
    toggleBtn.textContent = chatOpen ? "✕" : "💬";
    if(chatOpen){
      if(badge) badge.classList.remove("show");
      const msgs = document.getElementById("chat-messages");
      if(msgs && !msgs.children.length){
        // Restore session history first
        try{
          const hist = JSON.parse(sessionStorage.getItem("kl_chat_hist")||"[]");
          if(hist.length){
            hist.forEach(m => chatAddMsg(m.text, m.role));
          } else {
            const name = getUserName() || "друг";
            chatAddMsg(`Привет, ${name}! 😊 Я Анюша. Спроси меня о профессиях, очках или навыках!`, "ani");
          }
        }catch(e){
          const name = getUserName() || "друг";
          chatAddMsg(`Привет, ${name}! 😊 Я Анюша. Спроси меня о профессиях, очках или навыках!`, "ani");
        }
      }
      setTimeout(()=>{ if(input) input.focus(); }, 300);
    }
  });

  closeBtn?.addEventListener("click", ()=>{
    chatOpen = false;
    document.body.classList.remove("chat-open");
    chatBox.classList.remove("open");
    toggleBtn.textContent = "💬";
  });

  // Send on button click
  sendBtn?.addEventListener("click", ()=>{
    const txt = input?.value.trim();
    if(!txt) return;
    input.value = "";
    chatRespond(txt);
  });

  // Send on Enter
  input?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){
      const txt = input.value.trim();
      if(!txt) return;
      input.value = "";
      chatRespond(txt);
    }
  });

  // STT for chat mic
  initChatStt();

  // Show badge after 3s if chat never opened
  setTimeout(()=>{
    if(!chatOpen && !chatMsgCount){
      if(badge){ badge.textContent="1"; badge.classList.add("show"); }
    }
  }, 3000);
}


/* ── CAREER MICRO QUIZ ── */
/**
 * Handles all .career-micro-quiz elements on career pages.
 * Manages click on .micro-opt buttons, shows correct/wrong feedback,
 * advances to next question, shows result with XP award on completion.
 */
function initCareerMicroQuiz(){
  document.querySelectorAll(".career-micro-quiz").forEach(quiz=>{
    const questions = Array.from(quiz.querySelectorAll(".micro-q"));
    if(!questions.length) return;
    let current = 0;
    let correct = 0;
    const total = questions.length;

    function showQuestion(idx){
      questions.forEach((q,i)=>{
        q.classList.toggle("active", i===idx);
      });
    }

    function handleAnswer(btn, qEl){
      const isCorrect = btn.dataset.correct === "true";
      // Disable all options in this question
      qEl.querySelectorAll(".micro-opt").forEach(b=>{
        b.disabled = true;
        if(b.dataset.correct === "true") b.classList.add("correct");
        else b.classList.add("wrong");
      });
      if(isCorrect){
        correct++;
        aniHappy();
        aniSay("\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \uD83C\uDF89 \u041c\u043e\u043b\u043e\u0434\u0435\u0446!");
      } else {
        aniShakeHead();
        aniSay("\uD83D\uDCA1 \u041d\u0435 \u0441\u043e\u0432\u0441\u0435\u043c... \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0432\u043e\u043f\u0440\u043e\u0441!");
      }
      // Advance after short delay
      setTimeout(()=>{
        current++;
        if(current < total){
          showQuestion(current);
        } else {
          showResult(quiz, correct, total);
        }
      }, 1200);
    }

    // Attach listeners
    questions.forEach(qEl=>{
      qEl.querySelectorAll(".micro-opt").forEach(btn=>{
        btn.addEventListener("click", ()=>handleAnswer(btn, qEl));
      });
    });

    showQuestion(0);
  });
}

function showResult(quiz, correct, total){
  const resultEl = quiz.querySelector(".micro-result");
  if(!resultEl) return;
  resultEl.classList.remove("hidden");
  const pct = Math.round((correct/total)*100);
  let emoji = correct === total ? "\uD83C\uDF89" : correct >= total/2 ? "\uD83D\uDCAA" : "\uD83D\uDCA1";
  resultEl.innerHTML =
    emoji + " \u0422\u044B \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E " + correct + " \u0438\u0437 " + total + "! (" + pct + "%)" +
    (correct === total ? "<br>\uD83C\uDFC6 \u041E\u0442\u043B\u0438\u0447\u043D\u043E! \u0422\u044B \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u0437\u043D\u0430\u0442\u043E\u043A!" : "");
  // Award XP
  const xp = correct * 10;
  if(xp > 0) awardPoints(xp, "Micro Quiz");
  // Track micro quiz completion for badge
  const p = getProgress();
  p.microQuizDone = (p.microQuizDone || 0) + 1;
  saveProgress(p);
  checkBadges(p);
  if(correct === total){ aniCelebrate(); launchConfetti(); }
  else { aniNod(); aniSay("\uD83D\uDCAA \u0425\u043E\u0440\u043E\u0448\u0430\u044F \u043F\u043E\u043F\u044B\u0442\u043A\u0430! \u041F\u043E\u0432\u0442\u043E\u0440\u0438 \u0435\u0449\u0451 \u0440\u0430\u0437!"); }
}

/* ── DAILY MISSIONS ── */
const DAILY_MISSION_DEFS = [
  {
    id:"mission_quiz",   icon:"\uD83E\uDDE0", title:"\u041F\u0440\u043E\u0439\u0434\u0438 \u043C\u0438\u043D\u0438-\u0437\u0430\u0434\u0430\u043D\u0438\u0435",
    desc:"\u0412\u044B\u043F\u043E\u043B\u043D\u0438 \u043B\u044E\u0431\u043E\u0435 \u043C\u0438\u043D\u0438-\u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0438",
    story:"\u041B\u0430\u0431\u043E\u0440\u0430\u0442\u043E\u0440\u0438\u044F \u0436\u0434\u0451\u0442 \u0442\u0432\u043E\u0435\u0433\u043E \u043E\u0442\u0432\u0435\u0442\u0430! \u041F\u0440\u043E\u0439\u0434\u0438 \u043C\u0438\u043D\u0438-\u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0438 \u0434\u043E\u043A\u0430\u0436\u0438, \u0447\u0442\u043E \u0442\u044B \u0433\u043E\u0442\u043E\u0432 \u043A \u0431\u043E\u043B\u044C\u0448\u043E\u043C\u0443 \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044E.",
    xp:20, key:"microQuizDone", threshold:1
  },
  {
    id:"mission_career", icon:"\uD83D\uDD2D", title:"\u0418\u0437\u0443\u0447\u0438 2 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0438",
    desc:"\u041E\u0442\u043A\u0440\u043E\u0439 2 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0439 \u0438 \u0443\u0437\u043D\u0430\u0439 \u0447\u0442\u043E-\u043D\u043E\u0432\u043E\u0435",
    story:"\u041A\u0430\u0440\u0442\u0430 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0439 \u0440\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u0430! \u041A\u0430\u0436\u0434\u0430\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u044F — \u044D\u0442\u043E \u043D\u043E\u0432\u044B\u0439 \u043C\u0438\u0440 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0435\u0439. \u0418\u0441\u0441\u043B\u0435\u0434\u0443\u0439 \u0438\u0445 \u0432\u0441\u0435!",
    xp:15, key:"careerPagesVisited", threshold:2
  },
  {
    id:"mission_chat",   icon:"\uD83D\uDCAC", title:"\u041F\u043E\u0433\u043E\u0432\u043E\u0440\u0438 \u0441 \u0410\u043D\u044E\u0448\u0435\u0439",
    desc:"\u041D\u0430\u043F\u0438\u0448\u0438 3 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0432 \u0447\u0430\u0442\u0435",
    story:"\u0410\u043D\u044E\u0448\u0430 \u0445\u043E\u0447\u0435\u0442 \u0443\u0437\u043D\u0430\u0442\u044C \u0442\u0435\u0431\u044F \u043B\u0443\u0447\u0448\u0435! \u0417\u0430\u0434\u0430\u0439 \u0435\u0439 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u043E \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u044F\u0445 \u0438 \u043F\u043E\u043B\u0443\u0447\u0438 \u0441\u043E\u0432\u0435\u0442\u044B \u043E\u0442 AI-\u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A\u0430.",
    xp:10, key:"chatMessages", threshold:3
  },
  {
    id:"mission_sim",    icon:"\uD83C\uDFAE", title:"\u041F\u0440\u043E\u0439\u0434\u0438 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E",
    desc:"\u0417\u0430\u0432\u0435\u0440\u0448\u0438 \u043B\u044E\u0431\u0443\u044E \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u0438",
    story:"\u0421\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D! \u041F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0439 \u0441\u0435\u0431\u044F \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u043C \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u043E\u043C — \u043F\u0440\u043E\u0439\u0434\u0438 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E \u0434\u043E \u043A\u043E\u043D\u0446\u0430!",
    xp:25, key:"simDone", threshold:1
  },
  {
    id:"mission_daily",  icon:"\uD83D\uDCDA", title:"\u041E\u0442\u0432\u0435\u0442\u044C \u043D\u0430 \u0443\u0440\u043E\u043A \u0434\u043D\u044F",
    desc:"\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u043E\u0442\u0432\u0435\u0442\u044C \u043D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u043A\u0430",
    story:"\u041A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C — \u043D\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u043D\u0438\u0435! \u041E\u0442\u0432\u0435\u0442\u044C \u043D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441 \u0443\u0440\u043E\u043A\u0430 \u0434\u043D\u044F \u0438 \u0441\u0442\u0430\u043D\u044C \u043D\u0430 \u0448\u0430\u0433 \u0431\u043B\u0438\u0436\u0435 \u043A \u0441\u0432\u043E\u0435\u0439 \u043C\u0435\u0447\u0442\u0435.",
    xp:20, key:"dailyDone", threshold:1
  },
];

function initDailyMissions(){
  const container = document.getElementById("daily-missions-container");
  if(!container) return;
  const p = getProgress();
  // Track career page visit
  const path = window.location.pathname.split("/").pop() || "";
  const careerPages = ["drone-pilot.html","cyber-defender.html","space-explorer.html","robotics-engineer.html","game-designer.html"];
  if(careerPages.includes(path)){
    p.careerPagesVisited = (p.careerPagesVisited || 0) + 1;
    checkBadges(p);
    saveProgress(p);
  }
  container.innerHTML = DAILY_MISSION_DEFS.map(m=>{
    // dailyDone is an array, other keys are numbers
    const val = m.key === "dailyDone" ? (p.dailyDone||[]).length : (p[m.key] || 0);
    const done = val >= m.threshold;
    const pct = Math.min(100, Math.round((val / m.threshold) * 100));
    return "<div class='mission-card" + (done?" done":"") + "'>" +
      "<div class='mission-icon'>" + m.icon + "</div>" +
      "<div class='mission-body'>" +
      "<div class='mission-title'>" + escHtml(m.title) + "</div>" +
      "<div class='mission-story'>" + escHtml(m.story) + "</div>" +
      "<div class='mission-desc'>" + escHtml(m.desc) + "</div>" +
      "<div class='mission-progress-bar'><div class='mission-progress-fill' style='width:" + pct + "%'></div></div>" +
      "</div>" +
      "<div class='mission-xp'>+" + m.xp + " XP</div>" +
      (done ? "<div class='mission-done-badge'>\u2705</div>" : "") +
      "</div>";
  }).join("");
}

/* ── STREAK REWARDS ── */
/**
 * Award bonus XP and show special Ani message at streak milestones.
 * Milestones: 3, 7, 14 days. Each rewarded only once.
 */
function checkStreakReward(p){
  const milestones = [
    { days:3,  bonus:30,  msg:"🔥 3 дня подряд! Ты настоящий чемпион! +30 XP бонус!" },
    { days:7,  bonus:75,  msg:"🌟 7 дней подряд! Невероятно! +75 XP бонус! Ты звезда!" },
    { days:14, bonus:150, msg:"👑 14 дней подряд! Легенда! +150 XP мега-бонус!" },
  ];
  milestones.forEach(m=>{
    if(p.streak >= m.days && !p.streakRewarded.includes(m.days)){
      p.streakRewarded.push(m.days);
      p.points += m.bonus;
      saveProgress(p);
      showPointsToast(m.bonus, "Streak Bonus");
      setTimeout(()=>{ aniCelebrate(); aniSay(m.msg); launchConfetti(); }, 600);
    }
  });
}

setProgressGamificationDeps({
  showPointsToast,
  showBadgeToast,
  showLevelUp,
  checkStreakReward,
  getUnlockedSimulationsCount,
  /* Phase 5: XP bar animation + streak toast hooks */
  onPointsAwarded(prevPts, newPts, streak) {
    try { animateXpGain(prevPts, newPts); } catch {}
    try { if (streak >= 2) showStreakToast(streak); } catch {}
    try { syncWeakSkill(); } catch {}
  },
});

/* ── CYBERSECURITY SIMULATION ── */
const CYBER_SIM_STEPS = [
  {
    title: "Шаг 1: Найди фишинговое письмо",
    realWorld: "Фишинг — самая распространённая кибератака. Хакеры маскируются под банки и сервисы, чтобы украсть пароли!",
    aniHint: "🔍 Смотри на адрес отправителя и ссылки — они часто содержат ошибки!",
    scenario: "Ты получил письмо: «Срочно! Ваш аккаунт заблокирован. Перейдите по ссылке: www.g00gle-secure.ru для восстановления.»",
    question: "Это письмо безопасно?",
    options: ["Да, нужно перейти по ссылке", "Нет — это фишинг! Адрес поддельный", "Не знаю, лучше спросить у взрослых"],
    correct: 1,
    explanation: "Правильно! «g00gle» с нулями вместо букв — классический признак фишинга. Никогда не переходи по подозрительным ссылкам!"
  },
  {
    title: "Шаг 2: Создай надёжный пароль",
    realWorld: "Слабые пароли — причина 80% взломов. Хороший пароль — это первая линия защиты!",
    aniHint: "💡 Хороший пароль: длинный, с буквами, цифрами и символами. Не используй имя или дату рождения!",
    scenario: "Тебе нужно создать пароль для нового аккаунта. Какой выбрать?",
    question: "Какой пароль самый надёжный?",
    options: ["12345678", "Masha2010", "K@t!k_L3t!t_V_K0sm0s#2024"],
    correct: 2,
    explanation: "Длинный пароль с разными символами — лучший выбор! Используй фразу из слов + цифры + символы."
  },
  {
    title: "Шаг 3: Закрой уязвимость",
    realWorld: "Обновления программ закрывают дыры в безопасности. Хакеры атакуют устаревшие системы!",
    aniHint: "🛡️ Всегда обновляй программы — это как надеть броню перед битвой!",
    scenario: "Система показывает: «Доступно обновление безопасности для вашего браузера». Что делать?",
    question: "Как правильно поступить?",
    options: ["Игнорировать — и так работает", "Установить обновление немедленно", "Удалить браузер"],
    correct: 1,
    explanation: "Обновления безопасности нужно устанавливать сразу! Они закрывают уязвимости, которые используют хакеры."
  }
];

let cyberScore = 0, cyberStep = 0, cyberShowIntro = true;

function renderCyberIntro(container){
  container.innerHTML =
    "<div class='sim-intro-card'>" +
    "<div class='sim-intro-icon'>🛡️</div>" +
    "<h3 class='sim-intro-title'>Кибер-защитник</h3>" +
    "<p class='sim-intro-sub'>Защити цифровой мир от хакеров!</p>" +
    "<div class='sim-intro-why'><strong>Почему это важно?</strong><br>Каждые 39 секунд в мире происходит кибератака. Кибер-специалисты — самые востребованные IT-профессионалы!</div>" +
    "<div class='sim-intro-fact'>💡 Знаешь ли ты? Первый компьютерный вирус был создан в 1971 году и назывался «Creeper»!</div>" +
    "<div class='sim-intro-levels'><span class='sim-level-badge active'>Обнаружение</span> → <span class='sim-level-badge'>Защита</span> → <span class='sim-level-badge'>Патч</span></div>" +
    "<button class='btn-main sim-start-btn' id='cyber-start-btn'>🚀 Начать симуляцию!</button>" +
    "</div>";
  const btn = container.querySelector("#cyber-start-btn");
  if(btn) btn.addEventListener("click",()=>{ cyberShowIntro=false; renderCyberStep(container,0); aniSay("🛡️ Отлично! Давай защитим цифровой мир! Будь внимателен!"); });
}

function renderCyberStep(container, stepIdx){
  if(stepIdx >= CYBER_SIM_STEPS.length){
    container.innerHTML =
      "<div class='sim-result'><div class='sim-result-icon'>🏆</div>" +
      "<h3>Симуляция завершена!</h3>" +
      "<p>Ты набрал " + cyberScore + " из " + CYBER_SIM_STEPS.length + " очков!</p>" +
      "<div class='sim-result-career'><strong>🎯 Карьерный путь:</strong> Начни с изучения основ сетевой безопасности и Python. Сертификат CompTIA Security+ откроет двери в кибербезопасность!</div>" +
      "<button class='btn-main' id='cyber-restart'>Начать заново</button></div>";
    const rb = container.querySelector("#cyber-restart");
    if(rb) rb.addEventListener("click",()=>{ cyberScore=0; cyberStep=0; cyberShowIntro=true; renderCyberIntro(container); });
    aniCelebrate(); aniSay("🛡️ Отличная работа, кибер-защитник! Ты защитил цифровой мир!");
    awardPoints(35, "Cyber Simulation");
    const p = getProgress(); p.simDone++; saveProgress(p); updateDashboard();
    // Step 3: track skill result
    onCyberSimComplete(cyberScore, CYBER_SIM_STEPS.length);
    return;
  }
  const s = CYBER_SIM_STEPS[stepIdx];
  const pct = Math.round((stepIdx / CYBER_SIM_STEPS.length) * 100);
  container.innerHTML =
    "<div class='sim-progress-wrap'><div class='sim-progress-bar'><div class='sim-progress-fill' style='width:" + pct + "%'></div></div><span class='sim-progress-label'>Шаг " + (stepIdx+1) + " из " + CYBER_SIM_STEPS.length + "</span></div>" +
    "<div class='sim-realworld-tip'>🌍 " + escHtml(s.realWorld) + "</div>" +
    "<div class='sim-ani-hint'>🤖 Анюша: <em>" + escHtml(s.aniHint) + "</em></div>" +
    "<h3 style='color:#c4b5fd;margin-bottom:10px'>" + escHtml(s.title) + "</h3>" +
    "<div class='cyber-scenario'>" + escHtml(s.scenario) + "</div>" +
    "<p class='sim-question'>" + escHtml(s.question) + "</p>" +
    "<div class='sim-options'>" + s.options.map((o,i)=>"<button class='sim-opt-btn' data-idx='" + i + "'>" + escHtml(o) + "</button>").join("") + "</div>" +
    "<div id='cyber-feedback'></div>";
  container.querySelectorAll(".sim-opt-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx = parseInt(btn.dataset.idx), correct = idx === s.correct;
      container.querySelectorAll(".sim-opt-btn").forEach(b=>{ b.disabled=true; if(parseInt(b.dataset.idx)===s.correct) b.classList.add("correct"); else b.classList.add("wrong"); });
      const fb = container.querySelector("#cyber-feedback");
      if(fb){
        fb.innerHTML = "<div class='" + (correct?"correct-fb":"wrong-fb") + "'>" + (correct?"✅ ":"❌ ") + escHtml(s.explanation) + "</div>" +
          "<button class='btn-main' style='margin-top:14px' id='cyber-next'>" + (stepIdx < CYBER_SIM_STEPS.length-1 ? "Следующий шаг ➡️" : "Завершить 🎉") + "</button>";
        const nb = fb.querySelector("#cyber-next");
        if(nb) nb.addEventListener("click",()=>{ cyberStep++; renderCyberStep(container, cyberStep); });
      }
      if(correct){ cyberScore++; aniHappy(); aniSay("✅ Правильно! Ты думаешь как настоящий кибер-защитник!"); }
      else { aniThinkThenSay("💡 Не совсем... " + s.explanation); }
    });
  });
}

function initCyberSim(){
  const openBtn = $("open-cyber-sim"), closeBtn = $("close-cyber-sim");
  const modal = $("cyber-sim-modal"), content = $("cyber-sim-content");
  if(!openBtn || !modal || !content) return;
  openBtn.addEventListener("click",()=>{
    guardSimulation("cyber_sim", ()=>{
      modal.classList.remove("hidden");
      cyberScore=0; cyberStep=0; cyberShowIntro=true;
      renderCyberIntro(content);
      aniSay("\uD83D\uDEE1\uFE0F \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u0441\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044E \u043A\u0438\u0431\u0435\u0440\u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438! \u0411\u0443\u0434\u044C \u0432\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u0435\u043D!");
    });
  });
  if(closeBtn) closeBtn.addEventListener("click",()=>modal.classList.add("hidden"));
  modal.addEventListener("click",e=>{ if(e.target===modal) modal.classList.add("hidden"); });
}

/* ── LEADERBOARD ── */
async function initLeaderboard(){
  const container = $("leaderboard-list");
  if(!container) return;
  try{
    const snap = await getDocs(query(collection(db,"users"), orderBy("points","desc")));
    const users = [];
    snap.forEach(d=>{ const u=d.data(); if(u.name && u.points) users.push(u); });
    const top5 = users.slice(0,5);
    if(!top5.length){ container.innerHTML="<div class='lb-empty'>Будь первым! 🚀</div>"; return; }
    const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
    container.innerHTML = top5.map((u,i)=>
      "<div class='lb-row" + (u.name===getUserName()?" lb-me":"") + "'>" +
      "<span class='lb-rank'>" + medals[i] + "</span>" +
      "<span class='lb-name'>" + escHtml(u.name) + "</span>" +
      "<span class='lb-pts'>" + (u.points||0) + " XP</span>" +
      "</div>"
    ).join("");
  }catch(e){
    container.innerHTML="<div class='lb-empty'>Нет данных 😔</div>";
  }
}

/* ── STORY ARC ── */
const STORY_CHAPTERS = [
  { minPts:0,   icon:"🌱", title:"День 1: Новый стажёр",    text:"Ты только что пришёл в Карьерную Лабораторию. Твоя миссия — исследовать профессии будущего и найти свой путь!" },
  { minPts:50,  icon:"🔬", title:"День 2: Первые открытия",  text:"Ты уже изучил несколько профессий! Лаборатория открывает новые секреты. Продолжай исследовать!" },
  { minPts:150, icon:"⚡", title:"День 3: Испытание навыков", text:"Пришло время проверить себя! Пройди симуляции и докажи, что ты готов к настоящей карьере!" },
  { minPts:300, icon:"🚀", title:"День 4: Взлёт",            text:"Ты уже настоящий эксперт! Твои знания растут с каждым днём. Осталось совсем немного до вершины!" },
  { minPts:500, icon:"👑", title:"День 5: Легенда Лаборатории", text:"Ты достиг вершины! Ты — легенда Карьерной Лаборатории. Твой путь вдохновляет других!" },
];

function initStoryArc(){
  const container = $("story-arc-container");
  if(!container) return;
  const p = getProgress();
  const chapter = [...STORY_CHAPTERS].reverse().find(c => p.points >= c.minPts) || STORY_CHAPTERS[0];
  const nextChapter = STORY_CHAPTERS.find(c => c.minPts > p.points);
  container.innerHTML =
    "<div class='story-arc-card'>" +
    "<div class='story-arc-icon'>" + chapter.icon + "</div>" +
    "<div class='story-arc-content'>" +
    "<div class='story-arc-title'>" + escHtml(chapter.title) + "</div>" +
    "<div class='story-arc-text'>" + escHtml(chapter.text) + "</div>" +
    (nextChapter ? "<div class='story-arc-next'>Следующая глава: <strong>" + escHtml(nextChapter.title) + "</strong> — нужно " + nextChapter.minPts + " XP</div>" : "<div class='story-arc-next'>🏆 Ты прошёл все главы!</div>") +
    "</div></div>";
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — STORY MODE
   Lightweight story briefing + outro for each simulation.
   Hooks into existing renderXxxIntro / completion blocks.
   No new modals, no redesign.
═══════════════════════════════════════════════════════════════ */

const STORY_SCENES = {
  drone_career: {
    briefing: {
      icon: "🚁",
      title: "Миссия: Стать пилотом дрона",
      narrative: "Раннее утро. Туман над горами. Где-то в лесу потерялся турист. Спасатели не могут пройти — слишком опасно. Тебя вызвали как пилота дрона. Это твой первый настоящий день на работе. Готов?",
      cta: "🚀 Принять миссию!",
    },
    outro: {
      win:  { icon:"🏆", title:"Миссия выполнена!", text:"Ты прошёл все уровни карьеры пилота дрона. Турист найден, аптечка доставлена. Ты — настоящий профессионал!" },
      lose: { icon:"📋", title:"Карьера продолжается!", text:"Каждый профессионал начинал с ошибок. Попробуй ещё раз — с каждым разом ты становишься лучше!" },
    },
  },
  pilot_sim: {
    briefing: {
      icon: "🛫",
      title: "Миссия: Первый самостоятельный полёт",
      narrative: "Ты стоишь на взлётной площадке. Дрон готов. Инструктор смотрит. Сегодня ты впервые летишь самостоятельно — от взлёта до посадки. Каждое решение важно!",
      cta: "🛫 Взлетаем!",
    },
    outro: {
      win:  { icon:"🌟", title:"Полёт завершён!", text:"Ты прошёл все этапы полёта — от взлёта до посадки. Инструктор доволен. Следующий шаг — сертификат пилота!" },
      lose: { icon:"📋", title:"Тренировка продолжается!", text:"Даже лучшие пилоты тренируются годами. Попробуй снова — ты уже знаешь, что улучшить!" },
    },
  },
  it_sim: {
    briefing: {
      icon: "💻",
      title: "Миссия: Первый день в IT-компании",
      narrative: "Ты — новый разработчик в стартапе. Тебе дали задание: найти и исправить баги в коде до конца дня. Команда ждёт. Код не работает. Ты готов?",
      cta: "💻 Открыть редактор!",
    },
    outro: {
      win:  { icon:"🚀", title:"Код работает!", text:"Ты нашёл все баги и исправил код. Команда аплодирует. Ты — настоящий разработчик!" },
      lose: { icon:"🔧", title:"Отладка продолжается!", text:"Программирование — это постоянное обучение. Попробуй снова — каждая ошибка делает тебя сильнее!" },
    },
  },
  cyber_sim: {
    briefing: {
      icon: "🛡️",
      title: "Миссия: Защити систему",
      narrative: "Тревога! Система компании под угрозой. Хакеры пытаются взломать базу данных. Ты — единственный кибер-защитник на смене. Каждая секунда на счету!",
      cta: "🛡️ Защищать систему!",
    },
    outro: {
      win:  { icon:"🔒", title:"Система защищена!", text:"Ты отразил все атаки и закрыл уязвимости. Компания в безопасности. Ты — настоящий кибер-защитник!" },
      lose: { icon:"📋", title:"Учимся на ошибках!", text:"Кибербезопасность — это постоянная борьба. Попробуй снова — теперь ты знаешь тактику хакеров!" },
    },
  },
  drone_game: {
    briefing: {
      icon: "📦",
      title: "Миссия: Срочная доставка",
      narrative: "Поступил срочный заказ: доставить медикаменты в труднодоступный район. Препятствия на пути. Время ограничено. Только ты и твой дрон!",
      cta: "🚁 Взлетаем!",
    },
    outro: {
      win:  { icon:"🎉", title:"Доставка выполнена!", text:"Медикаменты доставлены вовремя. Жизнь спасена. Ты — настоящий пилот-профессионал!" },
      lose: { icon:"🔄", title:"Попробуй снова!", text:"Каждая попытка делает тебя лучше. Изучи маршрут и попробуй ещё раз!" },
    },
  },
};

/**
 * Renders a story briefing card inside container.
 * Replaces the standard intro with a narrative wrapper.
 * @param {string} simId - key in STORY_SCENES
 * @param {HTMLElement} container
 * @param {Function} onStart - called when user clicks CTA
 */
function showStoryBriefing(simId, container, onStart) {
  const scene = STORY_SCENES[simId];
  if (!scene) { onStart(); return; }
  const { icon, title, narrative, cta } = scene.briefing;
  container.innerHTML =
    "<div class='story-briefing-card'>" +
    "<div class='story-briefing-icon'>" + icon + "</div>" +
    "<h3 class='story-briefing-title'>" + escHtml(title) + "</h3>" +
    "<p class='story-briefing-narrative'>" + escHtml(narrative) + "</p>" +
    "<button class='btn-main story-briefing-cta' id='story-cta-btn'>" + escHtml(cta) + "</button>" +
    "</div>";
  const btn = container.querySelector("#story-cta-btn");
  if (btn) btn.addEventListener("click", () => { aniSay("📖 " + title + " — начинаем!"); onStart(); });
}

/**
 * Renders a story outro card inside container.
 * @param {string} simId
 * @param {HTMLElement} container
 * @param {boolean} won
 * @param {number} score - XP or score earned
 * @param {Function} onReplay
 */
function showStoryOutro(simId, container, won, score, onReplay) {
  const scene = STORY_SCENES[simId];
  if (!scene) return;
  const outro = won ? scene.outro.win : scene.outro.lose;
  container.innerHTML =
    "<div class='story-outro-card'>" +
    "<div class='story-outro-icon'>" + outro.icon + "</div>" +
    "<h3 class='story-outro-title'>" + escHtml(outro.title) + "</h3>" +
    "<p class='story-outro-text'>" + escHtml(outro.text) + "</p>" +
    (score > 0 ? "<div class='story-outro-score'>⭐ +" + score + " XP заработано!</div>" : "") +
    "<button class='btn-main' id='story-replay-btn'>🔄 Сыграть снова</button>" +
    "</div>";
  const btn = container.querySelector("#story-replay-btn");
  if (btn) btn.addEventListener("click", () => { if (onReplay) onReplay(); });
  if (won) { aniCelebrate(); aniSay(outro.title + " " + outro.text.slice(0, 60)); }
  else { aniNod(); aniSay(outro.text.slice(0, 60)); }
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — SKILL TRACKING
   Tracks per-simulation: accuracy, completion time, fail count.
   Stored in localStorage under key "kl_skill_tracking".
   No duplication with existing weakAreas / simDone tracking.
═══════════════════════════════════════════════════════════════ */

const SKILL_TRACKING_KEY = "kl_skill_tracking";

/** Load skill tracking data */
function loadSkillTracking() {
  try { return JSON.parse(localStorage.getItem(SKILL_TRACKING_KEY)) || {}; } catch { return {}; }
}

/** Save skill tracking data */
function saveSkillTracking(data) {
  localStorage.setItem(SKILL_TRACKING_KEY, JSON.stringify(data));
}

/**
 * Get or initialize tracking record for a simulation.
 * @param {string} simId
 */
function getSimTracking(simId) {
  const data = loadSkillTracking();
  if (!data[simId]) {
    data[simId] = { attempts: 0, wins: 0, totalCorrect: 0, totalQuestions: 0, totalTimeSec: 0, lastScore: 0, lastPlayed: 0 };
  }
  return { data, record: data[simId] };
}

/**
 * Record the result of a simulation attempt.
 * @param {string} simId - e.g. "drone_career", "pilot_sim", "it_sim", "cyber_sim", "drone_game"
 * @param {boolean} won
 * @param {number} correct - questions answered correctly
 * @param {number} total - total questions
 * @param {number} timeSec - time taken in seconds (0 if not applicable)
 * @param {number} score - final score/XP
 */
function trackSimResult(simId, won, correct, total, timeSec, score) {
  const { data, record } = getSimTracking(simId);
  record.attempts++;
  if (won) record.wins++;
  record.totalCorrect += correct;
  record.totalQuestions += total;
  record.totalTimeSec += timeSec;
  record.lastScore = score;
  record.lastPlayed = Date.now();
  saveSkillTracking(data);
}

/** Get accuracy % for a sim (0-100) */
function getSimAccuracy(simId) {
  const { record } = getSimTracking(simId);
  if (!record.totalQuestions) return null;
  return Math.round((record.totalCorrect / record.totalQuestions) * 100);
}

/** Get win rate % for a sim (0-100) */
function getSimWinRate(simId) {
  const { record } = getSimTracking(simId);
  if (!record.attempts) return null;
  return Math.round((record.wins / record.attempts) * 100);
}

/** Get average completion time in seconds */
function getSimAvgTime(simId) {
  const { record } = getSimTracking(simId);
  if (!record.wins) return null;
  return Math.round(record.totalTimeSec / record.wins);
}

/* ═══════════════════════════════════════════════════════════════
   STEP 5 — SKILL INSIGHTS
   Rule-based insights from tracked data.
   No AI API — pure logic.
═══════════════════════════════════════════════════════════════ */

const SIM_LABELS = {
  drone_career: "Пилот дрона (карьера)",
  pilot_sim:    "Пилот дрона (полёт)",
  it_sim:       "IT-специалист",
  cyber_sim:    "Кибер-защитник",
  drone_game:   "Доставка дроном",
};

/**
 * Generate rule-based insights for a given simId.
 * Returns array of {icon, text, type: "strength"|"warning"|"tip"}.
 */
function getSimInsights(simId) {
  const insights = [];
  const accuracy = getSimAccuracy(simId);
  const winRate  = getSimWinRate(simId);
  const avgTime  = getSimAvgTime(simId);
  const { record } = getSimTracking(simId);

  if (record.attempts === 0) return [{ icon:"💡", text:"Ещё не пройдено. Попробуй!", type:"tip" }];

  // Accuracy insights
  if (accuracy !== null) {
    if (accuracy >= 80) insights.push({ icon:"🎯", text:"Высокая точность (" + accuracy + "%) — отличное решение задач!", type:"strength" });
    else if (accuracy >= 50) insights.push({ icon:"📈", text:"Точность " + accuracy + "% — есть куда расти. Повтори теорию!", type:"tip" });
    else insights.push({ icon:"⚠️", text:"Точность " + accuracy + "% — нужно больше практики в этой теме.", type:"warning" });
  }

  // Win rate / failure insights
  if (winRate !== null) {
    if (winRate >= 70) insights.push({ icon:"💪", text:"Успешных попыток: " + winRate + "% — стабильный результат!", type:"strength" });
    else if (record.attempts >= 3 && winRate < 40) insights.push({ icon:"🔄", text:"Много попыток, мало побед — попробуй другую стратегию.", type:"warning" });
  }

  // Speed insights (drone game only)
  if (avgTime !== null && simId === "drone_game") {
    if (avgTime <= 15) insights.push({ icon:"⚡", text:"Быстрое прохождение (" + avgTime + "с) — отличная реакция!", type:"strength" });
    else if (avgTime <= 25) insights.push({ icon:"🕐", text:"Среднее время " + avgTime + "с — можно быстрее!", type:"tip" });
    else insights.push({ icon:"⏰", text:"Медленное прохождение (" + avgTime + "с) — тренируй скорость реакции.", type:"warning" });
  }

  // Persistence insight
  if (record.attempts >= 5) insights.push({ icon:"🏅", text:"Настойчивость! " + record.attempts + " попыток — ты не сдаёшься!", type:"strength" });

  return insights;
}

/**
 * Get all insights across all sims.
 * Returns {simId, label, insights[]} for each sim with attempts > 0.
 */
function getAllInsights() {
  const tracking = loadSkillTracking();
  return Object.keys(SIM_LABELS)
    .filter(id => tracking[id] && tracking[id].attempts > 0)
    .map(id => ({ simId: id, label: SIM_LABELS[id], insights: getSimInsights(id) }));
}

/* ═══════════════════════════════════════════════════════════════
   STEP 6 — ADAPTIVE DIFFICULTY
   Adjusts game parameters based on tracked performance.
   Only modifies: timer duration, hint visibility.
   Subtle changes — never breaks core logic.
═══════════════════════════════════════════════════════════════ */

/**
 * Get adaptive difficulty settings for a simulation.
 * Returns { timerSec, showHints, difficulty: "easy"|"normal"|"hard" }
 */
function getAdaptiveDifficulty(simId) {
  const winRate  = getSimWinRate(simId);
  const accuracy = getSimAccuracy(simId);
  const { record } = getSimTracking(simId);

  // Default (normal)
  let timerSec  = 30;
  let showHints = true;
  let difficulty = "normal";

  if (record.attempts < 2) {
    // First-timers: easy mode — more time, hints on
    timerSec  = 40;
    showHints = true;
    difficulty = "easy";
  } else if (winRate !== null && winRate < 30 && record.attempts >= 3) {
    // Struggling: reduce difficulty — more time, hints on
    timerSec  = 45;
    showHints = true;
    difficulty = "easy";
  } else if (winRate !== null && winRate >= 70 && accuracy !== null && accuracy >= 75) {
    // Consistent success: increase challenge — less time, hints off
    timerSec  = 22;
    showHints = false;
    difficulty = "hard";
  }

  return { timerSec, showHints, difficulty };
}

/**
 * Get a difficulty label string for display.
 */
function getDifficultyLabel(difficulty) {
  return { easy:"🟢 Лёгкий", normal:"🟡 Обычный", hard:"🔴 Сложный" }[difficulty] || "🟡 Обычный";
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 — PARENT REPORT
   Clean report view using only existing tracked data.
   Triggered via a button added to the sidebar.
   No new page — uses a modal overlay.
═══════════════════════════════════════════════════════════════ */

/**
 * Build and show the parent report modal.
 * Reads from: kl_progress (XP, lessons, badges) + kl_skill_tracking (sim data).
 */
function showParentReport() {
  // Remove existing modal if any
  const existing = document.getElementById("parent-report-modal");
  if (existing) existing.remove();

  const p = getProgress();
  const tracking = loadSkillTracking();
  const allInsights = getAllInsights();
  const name = getUserName() || "Ученик";

  // Build sim rows
  const simRows = Object.keys(SIM_LABELS).map(id => {
    const rec = tracking[id];
    if (!rec || rec.attempts === 0) return "<tr><td>" + SIM_LABELS[id] + "</td><td colspan='3' style='color:#6b7280'>Не пройдено</td></tr>";
    const acc = getSimAccuracy(id);
    const wr  = getSimWinRate(id);
    const diff = getAdaptiveDifficulty(id);
    return "<tr>" +
      "<td>" + SIM_LABELS[id] + "</td>" +
      "<td>" + rec.attempts + " попыток</td>" +
      "<td>" + (acc !== null ? acc + "%" : "—") + "</td>" +
      "<td>" + getDifficultyLabel(diff.difficulty) + "</td>" +
      "</tr>";
  }).join("");

  // Build insights section
  const insightHtml = allInsights.length
    ? allInsights.map(s =>
        "<div class='pr-sim-block'>" +
        "<div class='pr-sim-name'>" + escHtml(s.label) + "</div>" +
        s.insights.map(i => "<div class='pr-insight pr-insight-" + i.type + "'>" + i.icon + " " + escHtml(i.text) + "</div>").join("") +
        "</div>"
      ).join("")
    : "<p style='color:#9ca3af'>Пройди симуляции, чтобы увидеть инсайты.</p>";

  // Completed lessons count
  const lessonsCount = Object.keys(p.lessonsCompleted || {}).length;
  const quizCount    = Object.keys(p.quizPassed || {}).length;

  const modal = document.createElement("div");
  modal.id = "parent-report-modal";
  modal.className = "modal-overlay";
  modal.innerHTML =
    "<div class='modal-box parent-report-box'>" +
    "<button class='modal-close' id='pr-close'>✕</button>" +
    "<div class='pr-header'>" +
    "<div class='pr-header-icon'>📊</div>" +
    "<h2>Отчёт для родителей</h2>" +
    "<p class='pr-subtitle'>Прогресс ученика: <strong>" + escHtml(name) + "</strong></p>" +
    "<p class='pr-date'>Дата: " + new Date().toLocaleDateString("ru-RU") + "</p>" +
    "</div>" +

    "<div class='pr-section'>" +
    "<div class='pr-section-title'>📈 Общий прогресс</div>" +
    "<div class='pr-stats-grid'>" +
    "<div class='pr-stat'><span class='pr-stat-val'>" + p.points + "</span><span class='pr-stat-label'>XP заработано</span></div>" +
    "<div class='pr-stat'><span class='pr-stat-val'>" + p.streak + "</span><span class='pr-stat-label'>Дней подряд</span></div>" +
    "<div class='pr-stat'><span class='pr-stat-val'>" + lessonsCount + "</span><span class='pr-stat-label'>Уроков пройдено</span></div>" +
    "<div class='pr-stat'><span class='pr-stat-val'>" + quizCount + "</span><span class='pr-stat-label'>Тестов сдано</span></div>" +
    "</div></div>" +

    "<div class='pr-section'>" +
    "<div class='pr-section-title'>🎮 Симуляции</div>" +
    "<table class='pr-table'><thead><tr><th>Симуляция</th><th>Попытки</th><th>Точность</th><th>Уровень</th></tr></thead>" +
    "<tbody>" + simRows + "</tbody></table>" +
    "</div>" +

    "<div class='pr-section'>" +
    "<div class='pr-section-title'>💡 Навыки и инсайты</div>" +
    insightHtml +
    "</div>" +

    "<div class='pr-section'>" +
    "<div class='pr-section-title'>🏅 Значки</div>" +
    "<div class='pr-badges'>" +
    (p.badges.length
      ? BADGE_DEFS.filter(b => p.badges.includes(b.id)).map(b => "<span class='pr-badge' title='" + b.label + "'>" + b.emoji + " " + escHtml(b.label) + "</span>").join("")
      : "<span style='color:#9ca3af'>Значков пока нет — продолжай учиться!</span>") +
    "</div></div>" +

    "</div>";

  document.body.appendChild(modal);
  document.getElementById("pr-close").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}

/**
 * Inject the "Parent Report" button into the sidebar.
 * Called once on DOMContentLoaded.
 */
function initParentReport() {
  const sidebar = document.getElementById("app-sidebar");
  if (!sidebar) return;
  // Avoid duplicate injection
  if (document.getElementById("pr-open-btn")) return;
  const btn = document.createElement("button");
  btn.id = "pr-open-btn";
  btn.className = "pr-sidebar-btn";
  btn.innerHTML = "📊 Отчёт для родителей";
  btn.addEventListener("click", showParentReport);
  sidebar.appendChild(btn);
}

/* ═══════════════════════════════════════════════════════════════
   STORY MODE HOOKS — patch existing sim render functions
   We use a wrapper flag approach to inject story briefings
   before the standard intro screens.
═══════════════════════════════════════════════════════════════ */

// Patch renderDroneIntro: intercept the first call to show story briefing
const _origRenderDroneIntroFn = typeof renderDroneIntro === "function" ? renderDroneIntro : null;
if (_origRenderDroneIntroFn) {
  window._droneStoryShown = false;
}

/**
 * Story-wrapped drone intro. Called by initDroneSim on modal open.
 * We monkey-patch by replacing the module-level reference via a
 * shared flag checked inside renderDroneIntro itself.
 * Instead, we inject story via the openBtn click handler patch below.
 */
function _patchDroneSimForStory() {
  const openBtn = $("open-drone-sim");
  const modal   = $("drone-sim-modal");
  const content = $("drone-sim-content");
  if (!openBtn || !modal || !content) return;

  // Replace the existing click listener by cloning the button
  const newBtn = openBtn.cloneNode(true);
  openBtn.parentNode.replaceChild(newBtn, openBtn);

  newBtn.addEventListener("click", () => {
    guardSimulation("drone_career", () => {
      modal.classList.remove("hidden");
      droneStep = 0; droneXp = 0; droneCorrect = 0; droneShowIntro = true;
      // Show story briefing first, then standard sim
      showStoryBriefing("drone_career", content, () => {
        droneShowIntro = false;
        renderDroneStep(content, 0);
        aniSay("🚁 Отлично! Начинаем карьеру пилота дрона!");
      });
      aniSay("📖 Новая миссия! Читай историю и принимай решения!");
    });
  });
}

function _patchPilotSimForStory() {
  const openBtn = $("open-pilot-sim");
  const modal   = $("pilot-sim-modal");
  const content = $("pilot-sim-content");
  if (!openBtn || !modal || !content) return;

  const newBtn = openBtn.cloneNode(true);
  openBtn.parentNode.replaceChild(newBtn, openBtn);

  newBtn.addEventListener("click", () => {
    guardSimulation("pilot_sim", () => {
      modal.classList.remove("hidden");
      pilotStep = 0; pilotScore = 0; pilotCorrect = 0; pilotShowIntro = true;
      showStoryBriefing("pilot_sim", content, () => {
        pilotShowIntro = false;
        renderPilotStep(content, 0);
        aniSay("🛫 Отлично! Проверяем дрон и взлетаем!");
      });
      aniSay("📖 Новая миссия! Первый самостоятельный полёт!");
    });
  });
}

function _patchItSimForStory() {
  const openBtn = $("open-it-sim");
  const modal   = $("it-sim-modal");
  const content = $("it-sim-content");
  if (!openBtn || !modal || !content) return;

  const newBtn = openBtn.cloneNode(true);
  openBtn.parentNode.replaceChild(newBtn, openBtn);

  newBtn.addEventListener("click", () => {
    guardSimulation("it_sim", () => {
      modal.classList.remove("hidden");
      itScore = 0; itStep = 0; itShowIntro = true;
      showStoryBriefing("it_sim", content, () => {
        itShowIntro = false;
        renderItStep(content, 0);
        aniSay("💻 Отлично! Давай найдём ошибку в коде! 🔍");
      });
      aniSay("📖 Новая миссия! Первый день в IT-компании!");
    });
  });
}

function _patchCyberSimForStory() {
  const openBtn = $("open-cyber-sim");
  const modal   = $("cyber-sim-modal");
  const content = $("cyber-sim-content");
  if (!openBtn || !modal || !content) return;

  const newBtn = openBtn.cloneNode(true);
  openBtn.parentNode.replaceChild(newBtn, openBtn);

  newBtn.addEventListener("click", () => {
    guardSimulation("cyber_sim", () => {
      modal.classList.remove("hidden");
      cyberScore = 0; cyberStep = 0; cyberShowIntro = true;
      showStoryBriefing("cyber_sim", content, () => {
        cyberShowIntro = false;
        renderCyberStep(content, 0);
        aniSay("🛡️ Отлично! Давай защитим цифровой мир! Будь внимателен!");
      });
      aniSay("📖 Новая миссия! Система под угрозой!");
    });
  });
}

safe(_patchDroneSimForStory);
safe(_patchPilotSimForStory);
safe(_patchItSimForStory);
safe(_patchCyberSimForStory);

/* ═══════════════════════════════════════════════════════════════
   INIT — wire everything up on page load
═══════════════════════════════════════════════════════════════ */

safe(initParentReport);

/**
 * Called when drone career sim completes.
 * droneXp = total XP earned, droneStep = steps completed.
 */
function onDroneCareerComplete(correct, total) {
  const timeSec = 0; // career sim is not timed
  trackSimResult("drone_career", true, correct, total, timeSec, droneXp);
}

/**
 * Called when pilot sim completes.
 */
function onPilotSimComplete(correct, total) {
  trackSimResult("pilot_sim", true, correct, total, 0, pilotScore);
}

/**
 * Called when IT sim completes.
 */
function onItSimComplete(correct, total) {
  trackSimResult("it_sim", true, correct, total, 0, itScore);
}

/**
 * Called when cyber sim completes.
 */
function onCyberSimComplete(correct, total) {
  trackSimResult("cyber_sim", true, correct, total, 0, cyberScore);
}

/**
 * Called when drone game ends (win or lose).
 * @param {boolean} won
 * @param {number} timeSec - elapsed time
 * @param {number} score - final score
 */
function onDroneGameComplete(won, timeSec, score) {
  trackSimResult("drone_game", won, won ? 1 : 0, 1, timeSec, score);
}
