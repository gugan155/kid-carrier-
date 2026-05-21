$out = [System.IO.StreamWriter]::new("$PWD\script.js", $false, [System.Text.Encoding]::UTF8)
$L = { param($s) $out.WriteLine($s) }

# Build emoji via char conversion (PS5 safe, no \u{} syntax)
$e_medal  = [char]::ConvertFromUtf32(0x1F3C5)
$e_gold   = [char]::ConvertFromUtf32(0x1F947)
$e_plane  = [char]0x2708 + [char]0xFE0F
$e_fire   = [char]::ConvertFromUtf32(0x1F525)
$e_star   = [char]::ConvertFromUtf32(0x1F31F)
$e_100    = [char]::ConvertFromUtf32(0x1F4AF)
$e_rocket = [char]::ConvertFromUtf32(0x1F680)
$e_crown  = [char]::ConvertFromUtf32(0x1F451)
$e_trophy = [char]::ConvertFromUtf32(0x1F3C6)
$e_check  = [char]0x2705
$e_cross  = [char]0x274C
$e_bulb   = [char]::ConvertFromUtf32(0x1F4A1)
$e_drone  = [char]::ConvertFromUtf32(0x1F681)
$e_robot  = [char]::ConvertFromUtf32(0x1F916)
$e_game   = [char]::ConvertFromUtf32(0x1F3AE)
$e_shield = [char]::ConvertFromUtf32(0x1F6E1) + [char]0xFE0F
$e_space  = [char]::ConvertFromUtf32(0x1F30C)
$e_brain  = [char]::ConvertFromUtf32(0x1F9E0)
$e_wave   = [char]::ConvertFromUtf32(0x1F44B)
$e_party  = [char]::ConvertFromUtf32(0x1F389)
$e_muscle = [char]::ConvertFromUtf32(0x1F4AA)
$e_book   = [char]::ConvertFromUtf32(0x1F4DA)
$e_world  = [char]::ConvertFromUtf32(0x1F30D)
$e_laptop = [char]::ConvertFromUtf32(0x1F4BB)
$e_cal    = [char]::ConvertFromUtf32(0x1F4C5)
$e_smile  = [char]::ConvertFromUtf32(0x1F60A)
$e_star2  = [char]0x2B50
$e_warn   = [char]0x26A0 + [char]0xFE0F
$e_flag   = [char]::ConvertFromUtf32(0x1F3C1)
$e_mag    = [char]::ConvertFromUtf32(0x1F50D)
$e_vol_on = [char]::ConvertFromUtf32(0x1F50A)
$e_vol_off= [char]::ConvertFromUtf32(0x1F507)
$e_thumb  = [char]::ConvertFromUtf32(0x1F44D)
$e_play   = [char]0x25B6 + [char]0xFE0F

&$L "/* ================================================================="
&$L "   KARRIERNAYA LABORATORIYA  script.js  v4.0  ES Module"
&$L "   Full: Firebase + Gamification + Adaptive + Voice + Ani 3D"
&$L "================================================================= */"
&$L "import { db, collection, doc, addDoc, setDoc, timestamp } from './firebase.js';"
&$L "import { getDocs, query, orderBy, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';"
&$L ""
&$L "/* ── UTILS ── */"
&$L "const `$ = id => document.getElementById(id);"
&$L "const safe = fn => { try { fn(); } catch(e) { console.warn('[CL]', e); } };"
&$L "const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/`"/g,'&quot;');"
&$L "const shrinkBubble = () => { const b=`$('ani-bubble'); if(b) b.classList.add('small'); };"
&$L "const dayOfYear = () => { const n=new Date(),s=new Date(n.getFullYear(),0,0); return Math.floor((n-s)/86400000); };"
&$L ""
&$L "/* ── USER IDENTITY ── */"
&$L "function getUserId(){let uid=localStorage.getItem('kl_uid');if(!uid){uid='u_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);localStorage.setItem('kl_uid',uid);}return uid;}"
&$L "function getUserName(){return localStorage.getItem('kl_name')||'';}"
&$L "function saveUserName(n){localStorage.setItem('kl_name',n);}"
&$L ""
&$L "/* ── PROGRESS / GAMIFICATION ── */"
&$L "const PROGRESS_KEY='kl_progress';"
&$L "function loadProgress(){try{return JSON.parse(localStorage.getItem(PROGRESS_KEY))||{};}catch{return{};}}"
&$L "function saveProgress(p){localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}"
&$L "function getProgress(){const p=loadProgress();return{points:p.points||0,streak:p.streak||0,lastDay:p.lastDay||0,quizDone:p.quizDone||0,simDone:p.simDone||0,dailyDone:p.dailyDone||[],weakAreas:p.weakAreas||{},badges:p.badges||[]};}"

&$L "/* Badge definitions with emoji */"
&$L "const BADGE_DEFS=["
$out.WriteLine("  {id:'first_quiz', emoji:'$e_medal', label:'First Quiz',    cond:p=>p.quizDone>=1},")
$out.WriteLine("  {id:'quiz_master',emoji:'$e_gold',  label:'Quiz Master',   cond:p=>p.quizDone>=5},")
$out.WriteLine("  {id:'sim_pilot',  emoji:'$e_plane', label:'Pilot',         cond:p=>p.simDone>=1},")
$out.WriteLine("  {id:'streak_3',   emoji:'$e_fire',  label:'3-Day Streak',  cond:p=>p.streak>=3},")
$out.WriteLine("  {id:'streak_7',   emoji:'$e_star',  label:'7-Day Streak',  cond:p=>p.streak>=7},")
$out.WriteLine("  {id:'pts_100',    emoji:'$e_100',   label:'100 Points',    cond:p=>p.points>=100},")
$out.WriteLine("  {id:'pts_500',    emoji:'$e_rocket',label:'500 Points',    cond:p=>p.points>=500},")
$out.WriteLine("  {id:'pts_1000',   emoji:'$e_crown', label:'1000 Points',   cond:p=>p.points>=1000},")
&$L "];"
&$L ""
$out.WriteLine("function checkBadges(p){BADGE_DEFS.forEach(r=>{if(r.cond(p)&&!p.badges.includes(r.id)){p.badges.push(r.id);showBadgeToast(r.emoji+' '+r.label);}});}")
$out.WriteLine("function showPointsToast(pts,reason){const t=document.createElement('div');t.className='points-toast';t.textContent='+'+pts+' pts'+(reason?' — '+reason:'');document.body.appendChild(t);setTimeout(()=>t.remove(),2800);}")
$out.WriteLine("function showBadgeToast(label){const t=document.createElement('div');t.className='badge-toast';t.textContent='$e_trophy '+label;document.body.appendChild(t);setTimeout(()=>t.remove(),3800);}")
&$L ""
&$L "async function syncProgressToFirebase(p){try{await setDoc(doc(db,'users',getUserId()),{name:getUserName(),points:p.points,streak:p.streak,badges:p.badges,quizDone:p.quizDone,simDone:p.simDone,updated:timestamp()},{merge:true});}catch(e){}}"
&$L ""
&$L "function updateDashboard(){const p=getProgress();const dp=`$('dp-points'),ds=`$('dp-streak'),dq=`$('dp-quizzes'),dsim=`$('dp-sims');if(dp)dp.textContent=p.points;if(ds)ds.textContent=p.streak;if(dq)dq.textContent=p.quizDone;if(dsim)dsim.textContent=p.simDone;const dash=`$('progress-dashboard');if(dash&&p.points>0)dash.style.display='';const db2=`$('dash-badges');if(db2){db2.innerHTML=BADGE_DEFS.filter(r=>p.badges.includes(r.id)).map(r=>'<span class=dash-badge title=`"'+r.label+'`">'+r.emoji+'</span>').join('');}}"
&$L ""
&$L "function awardPoints(pts,reason){const p=getProgress();p.points+=pts;const today=dayOfYear();if(p.lastDay!==today){p.streak=(p.lastDay===today-1)?p.streak+1:1;p.lastDay=today;}checkBadges(p);saveProgress(p);syncProgressToFirebase(p);showPointsToast(pts,reason);updateDashboard();}"
&$L ""
&$L "/* ── ADAPTIVE LEARNING ── */"
&$L "function recordWeakArea(cat){const p=getProgress();p.weakAreas[cat]=(p.weakAreas[cat]||0)+1;saveProgress(p);}"
&$L "function recordStrongArea(cat){const p=getProgress();if(p.weakAreas[cat]>0)p.weakAreas[cat]--;saveProgress(p);}"
&$L "function getWeakestArea(){const w=getProgress().weakAreas;return Object.entries(w).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;}"
&$L ""
&$L "/* ── OFFLINE QUEUE ── */"
&$L "const QUEUE_KEY='kl_offline_queue';"
&$L "function enqueueOffline(item){const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');q.push(item);localStorage.setItem(QUEUE_KEY,JSON.stringify(q));}"
&$L "async function flushOfflineQueue(){const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');if(!q.length)return;const rem=[];for(const item of q){try{if(item.type==='feedback')await addDoc(collection(db,'feedback'),{name:item.name,msg:item.msg,date:timestamp()});else if(item.type==='progress')await setDoc(doc(db,'users',item.uid),item.data,{merge:true});}catch{rem.push(item);}}localStorage.setItem(QUEUE_KEY,JSON.stringify(rem));}"
&$L "window.addEventListener('online',()=>flushOfflineQueue().catch(()=>{}));"
&$L ""
&$L "/* ── VOICE (Russian TTS) ── */"
&$L "let voiceEnabled=localStorage.getItem('kl_voice')==='1';"
&$L "let _voices=[];"
&$L "function loadVoices(){_voices=window.speechSynthesis?.getVoices()||[];}"
&$L "if('speechSynthesis' in window){loadVoices();window.speechSynthesis.onvoiceschanged=loadVoices;}"
&$L "function speak(text){if(!voiceEnabled||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=0.95;u.pitch=1.2;u.volume=1;const rv=_voices.find(v=>v.lang&&v.lang.startsWith('ru'));if(rv)u.voice=rv;window.speechSynthesis.speak(u);}"
&$L ""
$out.WriteLine("function initVoiceToggle(){const btn=`$('voice-toggle');if(!btn)return;const upd=()=>{btn.textContent=voiceEnabled?'$e_vol_on':'$e_vol_off';btn.title=voiceEnabled?'Turn off voice':'Turn on voice';btn.classList.toggle('active',voiceEnabled);};upd();btn.addEventListener('click',()=>{voiceEnabled=!voiceEnabled;localStorage.setItem('kl_voice',voiceEnabled?'1':'0');upd();aniSay(voiceEnabled?'Voice on! Hello!':'Voice off',false);setTimeout(shrinkBubble,3000);});}")
&$L ""
&$L "/* ── NAME SYSTEM ── */"
&$L "function initNameSystem(){const overlay=`$('name-overlay');if(!overlay)return;const name=getUserName();if(name){overlay.classList.add('hidden');applyName(name);scheduleWelcome(name,false);}else{overlay.classList.remove('hidden');const input=`$('name-input'),btn=`$('name-submit');const submit=()=>{const val=(input?.value||'').trim();if(!val){input?.classList.add('shake');setTimeout(()=>input?.classList.remove('shake'),500);input?.focus();return;}saveUserName(val);overlay.style.opacity='0';setTimeout(()=>overlay.classList.add('hidden'),350);applyName(val);scheduleWelcome(val,true);syncProgressToFirebase(getProgress());};btn?.addEventListener('click',submit);input?.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});setTimeout(()=>input?.focus(),400);}}"
&$L ""
$out.WriteLine("function applyName(name){const sub=`$('header-subtitle');if(sub)sub.textContent='Hello, '+name+'! $e_wave Explore future careers with Anyusha!';const fbName=`$('fb-name');if(fbName&&!fbName.value)fbName.value=name;updateDashboard();}")
$out.WriteLine("function scheduleWelcome(name,isFirst){const p=getProgress();const streakMsg=p.streak>1?' Streak: '+p.streak+' days! $e_fire':'';const msg=isFirst?'Hello, '+name+'! I am Anyusha — your career guide! $e_star':'Welcome back, '+name+'!'+streakMsg+' $e_smile';setTimeout(()=>{aniSay(msg,true);setTimeout(shrinkBubble,6000);},800);}")
&$L ""
&$L "/* ── ANI CHARACTER ── */"
$out.WriteLine("const ANI_HINTS=[")
$out.WriteLine("  ()=>{ const n=getUserName(); return n?'Hello, '+n+'! Try the career quiz! $e_brain':'Try the career quiz! $e_brain'; },")
$out.WriteLine("  ()=>'Choose a career and learn everything about it! $e_mag',")
$out.WriteLine("  ()=>'Play a simulation right now! $e_game',")
$out.WriteLine("  ()=>{ const p=getProgress(); const n=getUserName(); return (n?n+', you have ':'You have ')+p.points+' points! Keep going! $e_star'; },")
$out.WriteLine("  ()=>'I am here if you need help $e_smile',")
$out.WriteLine("  ()=>{ const w=getWeakestArea(); return w?'Try the '+w+' section again! $e_book':'Every career is a whole world! $e_world'; },")
$out.WriteLine("  ()=>'Did you know drones deliver medicine? $e_drone',")
$out.WriteLine("  ()=>'Programmers create the future every day! $e_laptop',")
$out.WriteLine("  ()=>'Space is waiting for its explorers! $e_space',")
$out.WriteLine("  ()=>'Robots help people all over the world! $e_robot',")
&$L "];"
&$L ""
$out.WriteLine("function aniSay(text,doSpeak){const bubble=`$('ani-bubble'),aniText=`$('ani-text');if(!bubble||!aniText)return;bubble.classList.remove('small','hidden-bubble');aniText.textContent=text;bubble.classList.add('ani-pop');setTimeout(()=>bubble.classList.remove('ani-pop'),400);if(doSpeak)speak(text);}")
$out.WriteLine("function aniExcited(){const c=`$('ani-char');if(!c)return;c.classList.add('ani-excited');setTimeout(()=>c.classList.remove('ani-excited'),800);}")
$out.WriteLine("function aniHappy(){const c=`$('ani-char');if(!c)return;c.classList.add('ani-happy');setTimeout(()=>c.classList.remove('ani-happy'),1000);}")
$out.WriteLine("function aniThink(){const c=`$('ani-char');if(!c)return;c.classList.add('ani-think');setTimeout(()=>c.classList.remove('ani-think'),1200);}")
&$L ""
$out.WriteLine("function initAni(){const aniChar=`$('ani-char'),bubble=`$('ani-bubble');if(!aniChar||!bubble)return;aniChar.addEventListener('mouseenter',()=>{bubble.classList.remove('small','hidden-bubble');const t=`$('ani-text');if(t)t.textContent=voiceEnabled?'Click to listen $e_vol_on':'Click to talk $e_smile';aniChar.classList.add('ani-hover');});aniChar.addEventListener('mouseleave',()=>{aniChar.classList.remove('ani-hover');setTimeout(shrinkBubble,1200);});aniChar.addEventListener('click',()=>{const hint=ANI_HINTS[Math.floor(Math.random()*ANI_HINTS.length)]();aniSay(hint,true);aniExcited();setTimeout(shrinkBubble,5000);});setTimeout(shrinkBubble,5000);}")
&$L ""
&$L "/* ── IDLE MESSAGES ── */"
&$L "function initIdleMessages(){let timer=null,idx=0;const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>{const hint=ANI_HINTS[idx%ANI_HINTS.length]();aniSay(hint,false);aniThink();idx++;setTimeout(shrinkBubble,4000);reset();},6000+Math.random()*4000);};document.addEventListener('click',reset);document.addEventListener('scroll',reset,{passive:true});document.addEventListener('keydown',reset);reset();}"
&$L ""
&$L "/* ── SCROLL REACTIONS ── */"
&$L "function initScrollReactions(){const sections=document.querySelectorAll('[data-ani-msg]');if(!sections.length)return;let last='';const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting&&last!==e.target.id){last=e.target.id;const msg=e.target.dataset.aniMsg;if(msg)setTimeout(()=>{aniSay(msg,true);aniHappy();setTimeout(shrinkBubble,4000);},600);}});},{threshold:0.35});sections.forEach(s=>obs.observe(s));}"
&$L ""
&$L "/* ── CONFETTI ── */"
&$L "function launchConfetti(){const colors=['#a78bfa','#ec4899','#fbbf24','#34d399','#60a5fa','#f472b6','#fb923c'];for(let i=0;i<55;i++){const el=document.createElement('div');el.className='confetti-piece';const size=5+Math.random()*10;el.style.cssText='left:'+Math.random()*100+'vw;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation-duration:'+(0.8+Math.random()*1.4)+'s;animation-delay:'+Math.random()*0.6+'s;width:'+size+'px;height:'+size+'px;border-radius:'+(Math.random()>.5?'50%':'3px')+';';document.body.appendChild(el);el.addEventListener('animationend',()=>el.remove());}}"

&$L ""
&$L "/* ── MINI QUIZ ── */"
&$L "let mq1='';"
$out.WriteLine("const mqMap={'tech-logic':{name:'$e_shield Cyber Defender',url:'cyber-defender.html',icon:'$e_shield'},'tech-hands':{name:'$e_robot Robotics Engineer',url:'robotics-engineer.html',icon:'$e_robot'},'tech-dream':{name:'$e_game Game Designer',url:'game-designer.html',icon:'$e_game'},'tech-brave':{name:'$e_shield Cyber Defender',url:'cyber-defender.html',icon:'$e_shield'},'sky-logic':{name:'$e_drone Drone Pilot',url:'drone-pilot.html',icon:'$e_drone'},'sky-hands':{name:'$e_drone Drone Pilot',url:'drone-pilot.html',icon:'$e_drone'},'sky-dream':{name:'$e_space Space Explorer',url:'space-explorer.html',icon:'$e_space'},'sky-brave':{name:'$e_drone Drone Pilot',url:'drone-pilot.html',icon:'$e_drone'},'space-logic':{name:'$e_space Space Explorer',url:'space-explorer.html',icon:'$e_space'},'space-hands':{name:'$e_robot Robotics Engineer',url:'robotics-engineer.html',icon:'$e_robot'},'space-dream':{name:'$e_space Space Explorer',url:'space-explorer.html',icon:'$e_space'},'space-brave':{name:'$e_space Space Explorer',url:'space-explorer.html',icon:'$e_space'},'create-logic':{name:'$e_game Game Designer',url:'game-designer.html',icon:'$e_game'},'create-hands':{name:'$e_robot Robotics Engineer',url:'robotics-engineer.html',icon:'$e_robot'},'create-dream':{name:'$e_game Game Designer',url:'game-designer.html',icon:'$e_game'},'create-brave':{name:'$e_drone Drone Pilot',url:'drone-pilot.html',icon:'$e_drone'}};")
&$L ""
$out.WriteLine("function initMiniQuiz(){document.querySelectorAll('.mq-btn').forEach(btn=>{btn.addEventListener('click',()=>{const step=parseInt(btn.dataset.step),val=btn.dataset.val;if(step===1){mq1=val;`$('mq-step-1')?.classList.remove('active');`$('mq-step-2')?.classList.add('active');aniSay('Great choice! One more question! $e_star',false);aniHappy();setTimeout(shrinkBubble,2500);}else{`$('mq-step-2')?.classList.remove('active');showMqResult(mq1,val);}});});`$('mq-restart')?.addEventListener('click',()=>{mq1='';document.querySelectorAll('.mq-step').forEach(s=>s.classList.remove('active'));`$('mq-result')?.classList.remove('active');`$('mq-step-1')?.classList.add('active');});}")
$out.WriteLine("function showMqResult(a1,a2){const r=mqMap[a1+'-'+a2]||{name:'$e_rocket Tech Explorer',url:'explorer.html',icon:'$e_rocket'};const icon=`$('mq-result-icon'),nm=`$('mq-result-name'),lk=`$('mq-result-link'),res=`$('mq-result');if(icon)icon.textContent=r.icon;if(nm)nm.textContent=r.name;if(lk)lk.href=r.url;if(res)res.classList.add('active');launchConfetti();aniExcited();const name=getUserName();aniSay((name?'Congrats, '+name+'! ':'Congrats! ')+'Your career: '+r.name+'! $e_party',true);awardPoints(10,'Quick quiz');setTimeout(shrinkBubble,5000);try{addDoc(collection(db,'sessions'),{uid:getUserId(),type:'mini_quiz',result:r.url,date:timestamp()});}catch{}}")
&$L ""
&$L "/* ── FEEDBACK ── */"
$out.WriteLine("function initFeedback(){const form=`$('feedback-form');if(!form)return;form.addEventListener('submit',async e=>{e.preventDefault();const name=(`$('fb-name')?.value||'').trim();const msg=(`$('fb-msg')?.value||'').trim();if(!name||!msg)return;const entry={name,msg,date:new Date().toISOString()};try{await addDoc(collection(db,'feedback'),{name,msg,date:timestamp()});}catch{enqueueOffline({type:'feedback',name,msg});const local=JSON.parse(localStorage.getItem('kl_feedback')||'[]');local.push(entry);localStorage.setItem('kl_feedback',JSON.stringify(local));}form.classList.add('hidden');`$('feedback-success')?.classList.remove('hidden');aniSay('Thank you for your feedback! $e_star',true);aniHappy();awardPoints(5,'Feedback');setTimeout(shrinkBubble,3500);});`$('fb-send-another')?.addEventListener('click',()=>{`$('feedback-success')?.classList.add('hidden');form.classList.remove('hidden');form.reset();const fbName=`$('fb-name');if(fbName)fbName.value=getUserName();});[`$('view-feedback-btn'),`$('view-feedback-btn-2')].forEach(btn=>btn?.addEventListener('click',openFeedbackModal));`$('close-feedback-modal')?.addEventListener('click',()=>`$('feedback-modal')?.classList.add('hidden'));`$('feedback-modal')?.addEventListener('click',e=>{if(e.target===`$('feedback-modal'))`$('feedback-modal').classList.add('hidden');});`$('fb-clear-btn')?.addEventListener('click',async()=>{if(!confirm('Delete all feedback?'))return;try{const snap=await getDocs(collection(db,'feedback'));await Promise.all(snap.docs.map(d=>deleteDoc(doc(db,'feedback',d.id))));}catch{}localStorage.removeItem('kl_feedback');const list=`$('fb-modal-list'),cnt=`$('fb-modal-count');if(list)list.innerHTML='';if(cnt)cnt.textContent='No feedback yet.';});}")
$out.WriteLine("async function openFeedbackModal(){const modal=`$('feedback-modal'),list=`$('fb-modal-list'),cnt=`$('fb-modal-count');if(!modal)return;modal.classList.remove('hidden');if(list)list.innerHTML='<p style=color:rgba(255,255,255,0.5);text-align:center;padding:20px>Loading...</p>';if(cnt)cnt.textContent='Loading...';let items=[];try{const snap=await getDocs(query(collection(db,'feedback'),orderBy('date','desc')));snap.forEach(d=>items.push(d.data()));}catch{items=JSON.parse(localStorage.getItem('kl_feedback')||'[]').reverse();}if(!list)return;if(!items.length){list.innerHTML='<p class=fb-empty>No feedback yet $e_smile</p>';if(cnt)cnt.textContent='No feedback yet.';return;}if(cnt)cnt.textContent='Total: '+items.length;list.innerHTML=items.map(item=>{const d=item.date?.toDate?item.date.toDate().toLocaleDateString('ru-RU'):(item.date?new Date(item.date).toLocaleDateString('ru-RU'):'');return '<div class=fb-entry><div class=fb-entry-header><span class=fb-entry-name>'+escHtml(item.name||'Anon')+'</span><span class=fb-entry-date>'+d+'</span></div><p class=fb-entry-msg>'+escHtml(item.msg||'')+'</p></div>';}).join('');}")
&$L ""
&$L "/* ── LEARNING PANEL ── */"
$out.WriteLine("function showLearningPanel(containerId,facts,quizQ){const el=`$(containerId);if(!el)return;const qHtml=quizQ?('<div class=learn-quiz><p class=learn-q>'+quizQ.q+'</p><div class=learn-opts>'+quizQ.opts.map((o,i)=>'<button class=learn-opt-btn data-correct='+(i===quizQ.correct)+' data-cat='+(quizQ.cat||'')+'>'+escHtml(o)+'</button>').join('')+'</div><div class=learn-fb hidden id=lfb-'+containerId+'></div></div>'):'';el.innerHTML='<div class=learn-panel><h3>$e_bulb What did you learn?</h3>'+facts.map(f=>'<div class=learn-fact>'+f+'</div>').join('')+qHtml+'</div>';if(!quizQ)return;el.querySelectorAll('.learn-opt-btn').forEach(btn=>{btn.addEventListener('click',()=>{el.querySelectorAll('.learn-opt-btn').forEach(b=>b.disabled=true);const fb=`$('lfb-'+containerId),correct=btn.dataset.correct==='true',cat=btn.dataset.cat;if(correct){btn.classList.add('correct');if(fb){fb.textContent='$e_check Correct! Well done!';fb.className='learn-fb correct-fb';fb.classList.remove('hidden');}launchConfetti();aniExcited();aniSay('Correct! You are a real expert! $e_star',true);awardPoints(15,'Correct answer');if(cat)recordStrongArea(cat);}else{btn.classList.add('wrong');el.querySelectorAll('.learn-opt-btn')[quizQ.correct]?.classList.add('correct');if(fb){fb.textContent='$e_cross Not quite. Correct answer highlighted!';fb.className='learn-fb wrong-fb';fb.classList.remove('hidden');}aniSay('Don\'t give up! Try again! $e_muscle',true);if(cat)recordWeakArea(cat);}setTimeout(shrinkBubble,3500);});});}")

&$L ""
&$L "/* ── IT SIMULATION ── */"
&$L "const itSteps=["
$out.WriteLine("  {title:'Step 1: Find the bug',desc:'There is a bug in the code. Find the error!',code:[{ln:1,text:'<span class=kw>function</span> <span class=fn>greet</span>(name) {'},{ln:2,text:'  <span class=kw>let</span> msg = <span class=str>Hello</span> + name;'},{ln:3,text:'  <span class=err>console.log(msg</span>  <span class=kw>// error!</span>'},{ln:4,text:'}'}],question:'What is wrong on line 3?',options:['Missing closing bracket )','Wrong function name','Variable not declared','Missing semicolon'],correct:0,cat:'tech',explain:'Correct! Missing closing bracket: console.log(msg)'},")
$out.WriteLine("  {title:'Step 2: Fix the logic',desc:'The function should add numbers but returns wrong result.',code:[{ln:1,text:'<span class=kw>function</span> <span class=fn>add</span>(a, b) {'},{ln:2,text:'  <span class=kw>return</span> <span class=err>a - b</span>;  <span class=kw>// wrong!</span>'},{ln:3,text:'}'},{ln:4,text:'<span class=fn>add</span>(<span class=num>5</span>, <span class=num>3</span>); <span class=kw>// should be 8</span>'}],question:'How to fix line 2?',options:['return a + b','return a * b','return a / b','return b - a'],correct:0,cat:'tech',explain:'Correct! Use addition: return a + b'},")
$out.WriteLine("  {title:'Step 3: Run the program',desc:'Code is fixed. Click Run and see the result!',code:[{ln:1,text:'<span class=kw>function</span> <span class=fn>greet</span>(name) {'},{ln:2,text:'  <span class=kw>let</span> msg = <span class=str>Hello</span> + name;'},{ln:3,text:'  <span class=fix>console.log(msg);</span>  <span class=kw>// fixed</span>'},{ln:4,text:'}'},{ln:5,text:'<span class=fn>greet</span>(<span class=str>World</span>);'}],question:'What will the program output?',options:['Hello World','Error!','undefined','World Hello'],correct:0,cat:'tech',explain:'Correct! Output: Hello World'},")
&$L "];"
&$L "let itIndex=0,itScore=0;"
$out.WriteLine("const itStars=(s,t)=>s===t?'$e_star2$e_star2$e_star2':s>=t*.66?'$e_star2$e_star2':s>=t*.33?'$e_star2':'..';")
&$L "function buildCode(lines){return '<div class=it-code-editor><div class=it-code-titlebar><span class=it-code-dot red></span><span class=it-code-dot yellow></span><span class=it-code-dot green></span><span class=it-code-filename>main.js</span></div><div class=it-code-body>'+lines.map(l=>'<div class=it-code-line><span class=it-code-ln>'+l.ln+'</span><span class=it-code-text>'+l.text+'</span></div>').join('')+'</div></div>';}"
$out.WriteLine("function renderItStep(){const content=`$('it-sim-content');if(!content)return;if(itIndex>=itSteps.length){if(itScore===itSteps.length)launchConfetti();const msg=itScore===itSteps.length?'Excellent! You are a real programmer! $e_laptop':itScore>=2?'Good job! Keep learning! $e_muscle':'Don\'t give up! $e_star';content.innerHTML='<div class=sim-result><div class=sim-result-icon>'+itStars(itScore,itSteps.length)+'</div><h3>Result: '+itScore+' / '+itSteps.length+'</h3><p>'+msg+'</p><div id=it-lp></div><button class=btn-main id=it-restart style=margin-top:12px>Try again</button></div>';showLearningPanel('it-lp',['Programmers find and fix bugs every day!','Reading code is the most important IT skill.'],{q:'What is the process of finding bugs called?',opts:['Debugging','Compilation','Rendering','Deploy'],correct:0,cat:'tech'});`$('it-restart')?.addEventListener('click',()=>{itIndex=0;itScore=0;renderItStep();});aniSay(itScore===itSteps.length?'Excellent! Real programmer! $e_laptop':'Good try! $e_muscle',true);const p=getProgress();p.simDone++;saveProgress(p);awardPoints(20,'IT simulation');return;}const step=itSteps[itIndex],isRun=itIndex===2;content.innerHTML='<div class=it-points-bar><span class=it-points-label>'+step.title+'</span><span class=it-points-stars>'+itStars(itScore,itSteps.length)+'</span><span class=it-points-val>'+itScore*10+' pts</span></div><p class=sim-question>'+step.desc+'</p>'+buildCode(step.code)+(isRun?'<button class=btn-main id=it-run-btn style=margin-bottom:14px;width:100%>$e_play Run program</button><div id=it-run-area></div>':'')+'<div id=it-qa'+(isRun?' style=display:none':'')+'>  <p class=sim-question style=margin-top:8px>'+step.question+'</p><div class=sim-options>'+step.options.map((o,i)=>'<button class=sim-opt-btn data-idx='+i+'>'+o+'</button>').join('')+'</div><div class=sim-feedback hidden id=sim-fb></div></div>';if(isRun){`$('it-run-btn')?.addEventListener('click',()=>{if(`$('it-run-btn'))`$('it-run-btn').disabled=true;const ra=`$('it-run-area');if(ra)ra.innerHTML='<div class=it-loading><div>Compiling...</div><div class=it-loading-bar><div class=it-loading-fill></div></div><div id=it-run-out></div></div>';setTimeout(()=>{const ro=`$('it-run-out');if(ro)ro.innerHTML='<div class=it-run-success>Program running!<br>&gt; Hello World</div>';const qa=`$('it-qa');if(qa)qa.style.display='';attachItOpts(step);},1400);});}else{attachItOpts(step);}}")
$out.WriteLine("function attachItOpts(step){const fb=`$('sim-fb');document.querySelectorAll('.sim-opt-btn').forEach(btn=>{btn.addEventListener('click',()=>{const chosen=parseInt(btn.dataset.idx);document.querySelectorAll('.sim-opt-btn').forEach(b=>b.disabled=true);if(chosen===step.correct){btn.classList.add('correct');itScore++;if(fb){fb.textContent='$e_check '+step.explain;fb.className='sim-feedback correct-fb';fb.classList.remove('hidden');}launchConfetti();aniSay('Correct! $e_star',true);awardPoints(10,'Correct answer');recordStrongArea(step.cat||'tech');}else{btn.classList.add('wrong');document.querySelectorAll('.sim-opt-btn')[step.correct]?.classList.add('correct');if(fb){fb.textContent='$e_cross Wrong. '+step.explain;fb.className='sim-feedback wrong-fb';fb.classList.remove('hidden');}aniSay('Don\'t give up! $e_muscle',true);recordWeakArea(step.cat||'tech');}setTimeout(()=>{itIndex++;renderItStep();},2000);});});}")
$out.WriteLine("function initItSim(){const open=`$('open-it-sim'),close=`$('close-it-sim'),modal=`$('it-sim-modal');if(!open||!modal)return;open.addEventListener('click',()=>{itIndex=0;itScore=0;modal.classList.remove('hidden');renderItStep();aniSay('Let\'s test your IT skills! $e_laptop',true);});close?.addEventListener('click',()=>modal.classList.add('hidden'));modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden');});}")
&$L ""
&$L "/* ── PILOT SIMULATION ── */"
&$L "const pilotSteps=["
$out.WriteLine("  {phase:'Pre-flight check',label:'$e_mag Check drone',msg:'Drone checked! All systems normal.',droneClass:'',aniMsg:'Good! Always check your equipment! $e_thumb'},")
$out.WriteLine("  {phase:'Takeoff',label:'$e_rocket Take off',msg:'Drone airborne! Gaining altitude.',droneClass:'fly-up',aniMsg:'Up! Drone is in the air! $e_drone'},")
$out.WriteLine("  {phase:'Turbulence',label:'$e_warn Stabilize',msg:'Turbulence! Hold the controls!',droneClass:'fly-shake',aniMsg:'Stay calm! Hold steady! $e_muscle'},")
$out.WriteLine("  {phase:'Landing',label:'$e_flag Land drone',msg:'Bravo! Smooth landing!',droneClass:'fly-land',aniMsg:'Perfect landing! Real pilot! $e_trophy},")
&$L "];"
&$L "let pilotStep=0,pilotScore=0;"
$out.WriteLine("const pilotStars=(s,t)=>s===t?'$e_star2$e_star2$e_star2':s>=t*.75?'$e_star2$e_star2':'$e_star2';")
$out.WriteLine("function renderPilotStep(){const content=`$('pilot-sim-content');if(!content)return;if(pilotStep>=pilotSteps.length){if(pilotScore===pilotSteps.length)launchConfetti();content.innerHTML='<div class=sim-result><div class=sim-result-icon>'+pilotStars(pilotScore,pilotSteps.length)+'</div><h3>Mission complete! $e_trophy</h3><p>You flew the drone!<br>Score: '+pilotScore*25+' / '+pilotSteps.length*25+'</p><div id=pilot-lp></div><button class=btn-main id=pilot-restart style=margin-top:12px>Fly again</button></div>';showLearningPanel('pilot-lp',['Drone pilots undergo special training!','Drones are used in medicine, agriculture and film.'],{q:'What does a pilot check before flight?',opts:['Technical condition of drone','Weather in another country','Color of drone','Music in headphones'],correct:0,cat:'sky'});`$('pilot-restart')?.addEventListener('click',()=>{pilotStep=0;pilotScore=0;renderPilotStep();});const p=getProgress();p.simDone++;saveProgress(p);awardPoints(20,'Pilot simulation');return;}const step=pilotSteps[pilotStep];const dots=pilotSteps.map((_,i)=>'<div class=pilot-step-dot'+(i<pilotStep?' done':i===pilotStep?' current':'')+'>  </div>').join('');content.innerHTML='<div class=pilot-steps-bar>'+dots+'</div><div class=pilot-display><div class=pilot-ground></div><div class=pilot-step-label>Step '+(pilotStep+1)+'/'+pilotSteps.length+': '+step.phase+'</div><div class=pilot-drone id=pilot-drone>$e_drone</div><div class=pilot-status id=pilot-status>Ready for next step!</div><div class=pilot-score-row><span class=pilot-stars>'+pilotStars(pilotScore,pilotSteps.length)+'</span><span class=pilot-pts>'+pilotScore*25+' pts</span></div></div><div class=pilot-controls><button class=btn-main id=pilot-action>'+step.label+'</button></div>';`$('pilot-action')?.addEventListener('click',()=>{const drone=`$('pilot-drone'),status=`$('pilot-status');if(drone)drone.className='pilot-drone '+step.droneClass;if(status)status.textContent=step.msg;aniSay(step.aniMsg,true);pilotScore++;setTimeout(()=>{if(drone)drone.className='pilot-drone';pilotStep++;renderPilotStep();},step.droneClass==='fly-shake'?2000:1600);});}")
$out.WriteLine("function initPilotSim(){const open=`$('open-pilot-sim'),close=`$('close-pilot-sim'),modal=`$('pilot-sim-modal');if(!open||!modal)return;open.addEventListener('click',()=>{pilotStep=0;pilotScore=0;modal.classList.remove('hidden');renderPilotStep();aniSay('Welcome to the cockpit! $e_drone',true);});close?.addEventListener('click',()=>modal.classList.add('hidden'));modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden');});}")

&$L ""
&$L "/* ── FULL QUIZ PAGE ── */"
&$L "const quizCatMap={"
$out.WriteLine("  tech: {name:'$e_laptop IT Specialist / Cyber Defender',url:'cyber-defender.html',why:'You love technology and logic!'},")
$out.WriteLine("  sky:  {name:'$e_drone Drone Pilot',url:'drone-pilot.html',why:'You are drawn to the sky and technology!'},")
$out.WriteLine("  space:{name:'$e_space Space Explorer',url:'space-explorer.html',why:'You are attracted to the universe!'},")
$out.WriteLine("  robot:{name:'$e_robot Robotics Engineer',url:'robotics-engineer.html',why:'You love to build and create!'},")
$out.WriteLine("  game: {name:'$e_game Game Designer',url:'game-designer.html',why:'You are creative — make games!'},")
&$L "};"
&$L ""
$out.WriteLine("function initQuizPage(){const box=`$('quiz-box');if(!box)return;const questions=Array.from(box.querySelectorAll('.question'));if(!questions.length)return;const scores={tech:0,sky:0,space:0,robot:0,game:0};let current=0;const fill=`$('quiz-progress-fill');const updateBar=()=>{if(fill)fill.style.width=Math.round((current/questions.length)*100)+'%';};questions.forEach((q,i)=>q.classList.toggle('active',i===0));updateBar();questions.forEach((qEl,idx)=>{qEl.querySelectorAll('.options button').forEach(btn=>{btn.addEventListener('click',()=>{const cat=btn.dataset.cat||'tech';scores[cat]=(scores[cat]||0)+1;recordStrongArea(cat);qEl.classList.remove('active');current=idx+1;updateBar();if(current<questions.length){questions[current].classList.add('active');aniSay('Great answer! Keep going! $e_star',false);setTimeout(shrinkBubble,2000);}else{showQuizPageResult(box,scores,questions);}});});});}")
$out.WriteLine("function showQuizPageResult(box,scores,questions){questions.forEach(q=>q.classList.remove('active'));const fill=`$('quiz-progress-fill');if(fill)fill.style.width='100%';const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);const top1=quizCatMap[sorted[0]?.[0]]||quizCatMap.tech;const top2=quizCatMap[sorted[1]?.[0]]||quizCatMap.sky;const res=`$('quiz-result');if(res){res.classList.remove('hidden');res.innerHTML='<h2>Your careers:</h2><span id=result-text>Great work! Here are your results:</span><div id=result-cards><div class=result-card><div class=result-card-name>'+top1.name+'</div><p class=result-card-why>'+top1.why+'</p><a href='+top1.url+' class=btn-main style=margin-top:14px;display:inline-block>Learn more</a></div><div class=result-card><div class=result-card-name>'+top2.name+'</div><p class=result-card-why>'+top2.why+'</p><a href='+top2.url+' class=btn-main style=margin-top:14px;display:inline-block>Learn more</a></div></div><button class=btn-glass-dark id=quiz-retry-btn style=margin-top:24px>Take again</button>';`$('quiz-retry-btn')?.addEventListener('click',()=>{res.classList.add('hidden');Object.keys(scores).forEach(k=>scores[k]=0);questions.forEach((q,i)=>q.classList.toggle('active',i===0));if(fill)fill.style.width='0%';aniSay('Let\'s try again! $e_muscle',false);});}launchConfetti();const name=getUserName();aniSay((name?name+', quiz done! ':'Quiz done! ')+'Your career: '+top1.name+'! $e_party',true);const p=getProgress();p.quizDone++;saveProgress(p);checkBadges(p);awardPoints(30,'Quiz done');syncProgressToFirebase(p);setTimeout(shrinkBubble,5000);}")
&$L ""
&$L "/* ── DAILY LEARNING ── */"
&$L "const DAILY_FALLBACK=["
$out.WriteLine("  {title:'Career of the day: Drone Pilot $e_drone',content:'Drone pilots operate unmanned aerial vehicles. They work in medicine, agriculture, film and rescue operations!',question:'Where are drones used?',opts:['All of the above','Only in film','Only in military','Only for pizza delivery'],correct:0,cat:'sky'},")
$out.WriteLine("  {title:'Career of the day: IT Specialist $e_laptop',content:'IT specialists create programs, websites and apps. They solve complex problems with code and logic every day!',question:'What do IT specialists create?',opts:['Programs and apps','Airplanes','Buildings','Food'],correct:0,cat:'tech'},")
$out.WriteLine("  {title:'Career of the day: Space Explorer $e_space',content:'Astronauts and scientists study planets, stars and galaxies. They help humanity understand the universe!',question:'What do space explorers study?',opts:['Planets and stars','Fish in the ocean','Mountains and rivers','Weather on Earth'],correct:0,cat:'space'},")
$out.WriteLine("  {title:'Career of the day: Robotics Engineer $e_robot',content:'Robotics engineers design and build robots. Robots help in factories, hospitals and even in space!',question:'Where do robots work?',opts:['Factories, hospitals and space','Only in factories','Only in film','Only at home'],correct:0,cat:'tech'},")
$out.WriteLine("  {title:'Career of the day: Game Designer $e_game',content:'Game designers invent rules, levels and characters. They combine creativity and technology to create unforgettable worlds!',question:'What does a game designer do?',opts:['Invents games','Builds houses','Flies to space','Operates drones'],correct:0,cat:'game'},")
&$L "];"
&$L ""
$out.WriteLine("async function initDailyLearning(){const feedbackSection=`$('feedback-section');if(!feedbackSection)return;const today=new Date().toDateString();const p=getProgress();const alreadyDone=Array.isArray(p.dailyDone)&&p.dailyDone.includes(today);let item=null;try{const snap=await getDocs(collection(db,'dailyContent'));const items=[];snap.forEach(d=>items.push(d.data()));if(items.length)item=items[dayOfYear()%items.length];}catch{}if(!item)item=DAILY_FALLBACK[dayOfYear()%DAILY_FALLBACK.length];const section=document.createElement('section');section.className='section-block teal-section';section.id='daily-section';section.innerHTML='<div style=max-width:760px;margin:0 auto><span class=section-badge>$e_cal Mission of the day</span><h2 class=section-title-sm style=margin-top:10px>'+escHtml(item.title)+'</h2><p style=color:rgba(255,255,255,0.85);line-height:1.7;margin-bottom:24px>'+escHtml(item.content)+'</p>'+(alreadyDone?'<div class=sim-feedback correct-fb style=display:inline-block>$e_check Mission done! Come back tomorrow $e_star</div>':'<div id=daily-quiz><p class=mq-question style=text-align:left>'+escHtml(item.question)+'</p><div class=sim-options id=daily-opts>'+item.opts.map((o,i)=>'<button class=sim-opt-btn data-idx='+i+' data-correct='+(i===item.correct)+' data-cat='+(item.cat||'tech')+'>'+escHtml(o)+'</button>').join('')+'</div><div class=sim-feedback hidden id=daily-fb></div></div>')+'</div>';feedbackSection.parentNode.insertBefore(section,feedbackSection);if(alreadyDone)return;section.querySelectorAll('.sim-opt-btn').forEach(btn=>{btn.addEventListener('click',()=>{section.querySelectorAll('.sim-opt-btn').forEach(b=>b.disabled=true);const fb=`$('daily-fb'),correct=btn.dataset.correct==='true',cat=btn.dataset.cat;if(correct){btn.classList.add('correct');if(fb){fb.textContent='$e_check Correct! Excellent!';fb.className='sim-feedback correct-fb';fb.classList.remove('hidden');}launchConfetti();aniExcited();aniSay('Correct! Daily mission complete! $e_party',true);awardPoints(20,'Daily mission');const p2=getProgress();if(!p2.dailyDone.includes(today)){p2.dailyDone.push(today);saveProgress(p2);}}else{btn.classList.add('wrong');section.querySelectorAll('.sim-opt-btn')[item.correct]?.classList.add('correct');if(fb){fb.textContent='$e_cross Not quite. Correct answer highlighted!';fb.className='sim-feedback wrong-fb';fb.classList.remove('hidden');}aniSay('Don\'t give up! Try again! $e_muscle',true);}setTimeout(shrinkBubble,3500);});});}")
&$L ""
&$L "/* ── DOM READY — all inits wrapped in safe() ── */"
&$L "document.addEventListener('DOMContentLoaded',()=>{"
&$L "  safe(initVoiceToggle);"
&$L "  safe(initNameSystem);"
&$L "  safe(initAni);"
&$L "  safe(initIdleMessages);"
&$L "  safe(initScrollReactions);"
&$L "  safe(initMiniQuiz);"
&$L "  safe(initFeedback);"
&$L "  safe(initItSim);"
&$L "  safe(initPilotSim);"
&$L "  safe(initQuizPage);"
&$L "  safe(()=>initDailyLearning().catch(()=>{}));"
&$L "  safe(updateDashboard);"
&$L "});"

$out.Flush()
$out.Close()
Write-Host "DONE"
Get-Item script.js | Select-Object Name, Length
