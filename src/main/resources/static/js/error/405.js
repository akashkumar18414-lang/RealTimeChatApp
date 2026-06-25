/* ===========================================
   405 RPS Game – Light Blue / White / Grey
   =========================================== */
const homeBtn = document.getElementById('home');
homeBtn.addEventListener('click', () => {
  if (history.length > 1) history.back(); else location.href = '/';
});

const handYou = document.getElementById('handYou');
const handAI = document.getElementById('handAI');
const resultEl = document.getElementById('result');
const winsEl = document.getElementById('wins');
const drawsEl = document.getElementById('draws');
const lossesEl = document.getElementById('losses');
const roundEl = document.getElementById('round');
const roundsTotalEl = document.getElementById('roundsTotal');
const bestOfSel = document.getElementById('bestOf');
const againBtn = document.getElementById('again');
const resetBtn = document.getElementById('reset');
const arena = document.getElementById('arena');

const mm = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = mm.matches;
mm.addEventListener?.('change', e => { reduceMotion = e.matches; lowMotion.checked = reduceMotion; });
const lowMotion = document.getElementById('lowMotion');
lowMotion.checked = reduceMotion;
lowMotion.addEventListener('change', () => reduceMotion = lowMotion.checked);

const picks = ['rock','paper','scissors'];
let state = {
  wins: 0, losses: 0, draws: 0, round: 1, bestOf: parseInt(bestOfSel.value, 10),
  locked: false, over: false
};
roundsTotalEl.textContent = state.bestOf;

bestOfSel.addEventListener('change', e => {
  state.bestOf = parseInt(e.target.value, 10);
  roundsTotalEl.textContent = state.bestOf;
  resetMatch();
});

/* Helpers */
function setPick(el, pick){
  el.setAttribute('data-pick', pick);
}
function aiPick(){
  // Simple random; could be smarter if needed
  return picks[Math.floor(Math.random()*picks.length)];
}
function whoWins(player, ai){
  if (player === ai) return 'draw';
  if (
    (player === 'rock' && ai === 'scissors') ||
    (player === 'paper' && ai === 'rock') ||
    (player === 'scissors' && ai === 'paper')
  ) return 'win';
  return 'lose';
}
function updateHUD(){
  winsEl.textContent = state.wins;
  drawsEl.textContent = state.draws;
  lossesEl.textContent = state.losses;
  roundEl.textContent = state.round;
}
function pulse(el, color){
  if (reduceMotion) return;
  el.style.color = color;
  el.classList.add('pulse');
  setTimeout(() => {
    el.classList.remove('pulse');
    el.style.color = '';
  }, 900);
}
function confettiBurst(x, y){
  if (reduceMotion) return;
  const colors = ['#93c5fd', '#60a5fa', '#e5e7eb', '#cbd5e1'];
  const n = 30;
  for (let i=0;i<n;i++){
    const s = document.createElement('span');
    s.className = 'confetti';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.background = colors[i % colors.length];
    s.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
    document.body.appendChild(s);
    const ang = Math.random()*Math.PI*2;
    const dist = 40 + Math.random()*120;
    const dx = Math.cos(ang)*dist;
    const dy = Math.sin(ang)*dist*0.9;
    const rot = (Math.random()*360|0) + 'deg';
    const duration = 700 + Math.random()*700;
    s.animate([
      { transform:'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
      { transform:`translate3d(${dx}px, ${dy}px, 0) rotate(${rot})`, opacity: 0 }
    ], { duration, easing:'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => s.remove();
  }
}
function announce(msg){ resultEl.textContent = msg; }

/* Round flow */
function playRound(playerPick){
  if (state.locked || state.over) return;
  state.locked = true;
  const serverPick = aiPick();

  // Pre-reveal shake
  if (!reduceMotion){
    handYou.classList.add('shake');
    handAI.classList.add('shake');
  }
  setPick(handYou, 'rock');  // neutral placeholder during shake
  setPick(handAI, 'rock');

  setTimeout(() => {
    // Reveal
    setPick(handYou, playerPick);
    setPick(handAI, serverPick);

    const outcome = whoWins(playerPick, serverPick);
    if (outcome === 'win'){
      state.wins++; pulse(handYou, '#22c55e'); announce(`You win the round! You: ${playerPick} • Server: ${serverPick} → 200 OK`);
    } else if (outcome === 'lose'){
      state.losses++; pulse(handAI, '#ef4444'); announce(`You lose the round. You: ${playerPick} • Server: ${serverPick} → 405 Blocked`);
    } else {
      state.draws++; pulse(handYou, '#64748b'); pulse(handAI, '#64748b'); announce(`Draw. Both chose ${playerPick}.`);
    }

    if (!reduceMotion){
      handYou.classList.remove('shake');
      handAI.classList.remove('shake');
    }

    // Next state
    const needed = Math.floor(state.bestOf / 2) + 1;
    if (state.wins >= needed || state.losses >= needed || state.round >= state.bestOf){
      state.over = true;
      const cx = window.innerWidth/2, cy = window.innerHeight/3;
      if (state.wins > state.losses){
        announce(`Match won! Methods allowed here: GET • HEAD • OPTIONS`);
        confettiBurst(cx, cy);
      } else if (state.wins < state.losses){
        announce(`Match lost. This endpoint is picky—try again or go back.`);
      } else {
        announce(`Match tied. One more try?`);
      }
    } else {
      state.round++;
    }
    updateHUD();
    state.locked = false;
  }, reduceMotion ? 40 : 820);
}

/* UI hooks */
document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => playRound(btn.dataset.pick));
});
againBtn.addEventListener('click', () => {
  if (state.over){
    resetMatch();
  } else if (!state.locked){
    // Play again reuses last pick? We'll prompt to pick.
    announce('Choose Rock, Paper, or Scissors.');
  }
});
resetBtn.addEventListener('click', resetMatch);

/* Keyboard */
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return;
  const k = e.key.toLowerCase();
  if (k === 'escape'){ resetMatch(); return; }
  if (k === 'enter'){ if (state.over) resetMatch(); return; }
  if (state.locked) return;
  if (k === 'r') playRound('rock');
  else if (k === 'p') playRound('paper');
  else if (k === 's') playRound('scissors');
});

/* Reset */
function resetMatch(){
  state = { wins:0, losses:0, draws:0, round:1, bestOf: parseInt(bestOfSel.value,10), locked:false, over:false };
  roundsTotalEl.textContent = state.bestOf;
  setPick(handYou, 'rock');
  setPick(handAI, 'rock');
  announce('Choose Rock, Paper, or Scissors.');
  updateHUD();
}

/* Init */
resetMatch();