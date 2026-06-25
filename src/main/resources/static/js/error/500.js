/* =====================================================
   Interactivity: tilt, glitch/shake, sparks, reload
   Accessibility + reduced-motion friendly.
   ===================================================== */

const reloadBtn = document.getElementById('reload');
const robotBtn  = document.getElementById('robotBtn');
const card      = document.querySelector('.card');
const svg       = document.getElementById('robot-svg');
const head      = svg?.querySelector('#head');
const eyesWrap  = svg?.querySelector('#eyes-wrap');
const sparks    = svg?.querySelector('#sparks');

const mm = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduceMotion = mm.matches;
mm.addEventListener?.('change', e => reduceMotion = e.matches);

// Reload
reloadBtn.addEventListener('click', () => { location.reload(); });

// Utility
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Tilt head toward pointer (smooth, blink-safe)
let headCenter = { x: 160, y: 115 };
function updateHeadCenter(){
  const rect = head.getBoundingClientRect();
  headCenter = { x: rect.left + rect.width/2, y: rect.top + rect.height*0.45 };
}
function onPointerMove(e){
  if (reduceMotion) return;
  updateHeadCenter();
  const dx = e.clientX - headCenter.x;
  const dy = e.clientY - headCenter.y;
  const angle = clamp(dx / 14, -14, 14);
  head.style.transform = `rotate(${angle}deg)`;
  const eyeShiftX = clamp(dx / 48, -3, 3);
  const eyeShiftY = clamp(dy / 60, -2, 2);
  eyesWrap.style.transform = `translate(${eyeShiftX}px, ${eyeShiftY}px)`;
}
function onPointerLeave(){
  if (reduceMotion) return;
  head.style.transform = 'rotate(0deg)';
  eyesWrap.style.transform = 'translate(0,0)';
}
window.addEventListener('pointermove', onPointerMove, { passive: true });
window.addEventListener('pointerleave', onPointerLeave, { passive: true });
window.addEventListener('resize', () => { if (!reduceMotion) updateHeadCenter(); });
window.addEventListener('orientationchange', () => { if (!reduceMotion) updateHeadCenter(); });

// Quick glitch on click / keyboard
function quickGlitch(){
  robotBtn.classList.add('glitch');
  burstSparks(10, true);
  setTimeout(() => robotBtn.classList.remove('glitch'), 520);
}
robotBtn.addEventListener('click', quickGlitch);
robotBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    quickGlitch();
  }
});

// Mobile-friendly: double-click or long-press to panic
robotBtn.addEventListener('dblclick', () => panic());
let pressTimer = null;
robotBtn.addEventListener('pointerdown', () => {
  pressTimer = setTimeout(() => panic(), 550);
});
['pointerup','pointerleave','pointercancel'].forEach(evt => {
  robotBtn.addEventListener(evt, () => clearTimeout(pressTimer));
});

// Easter egg: Press "R" to panic; "Esc" to calm
let panicTimer = null;
function panic(){
  if (panicTimer) return;
  card.classList.add('panic');
  burstSparks(28, false);
  let waves = 2;
  const interval = setInterval(() => {
    if (--waves < 0) return clearInterval(interval);
    burstSparks(16, false);
  }, 220);

  panicTimer = setTimeout(() => calm(), 1400);
}
function calm(){
  clearTimeout(panicTimer);
  panicTimer = null;
  card.classList.remove('panic');
}

// More robust key detection for "R"
function isKeyR(e){
  return e.code === 'KeyR' || e.key === 'r' || e.key === 'R' || e.keyCode === 82;
}
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return;
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    if (isKeyR(e)) {
      e.preventDefault();
      // Always trigger panic; reduced-motion just shows a low-motion version
      panic();
    } else if (e.key === 'Escape') {
      calm();
    }
  }
});

// Sparks (particles) near antenna
function burstSparks(count = 8, small = false){
  if (!sparks || reduceMotion) return;
  for (let i = 0; i < count; i++){
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const size = small ? (Math.random()*2 + 1.2) : (Math.random()*3 + 1.7);
    const points = [[0,-size],[size,0],[0,size],[-size,0]]
      .map(([x,y]) => `${x},${y}`).join(' ');
    p.setAttribute('points', points);
    p.setAttribute('class', 'spark');
    const angle = Math.random() * Math.PI * 2;
    const dist  = (small ? 22 : 34) + Math.random() * (small ? 16 : 30);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist * 0.6 - (small ? 12 : 22);
    p.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    p.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    p.style.setProperty('--t', `${(small ? 650 : 900) + Math.random()*450}ms`);
    p.setAttribute('transform', `rotate(${(angle*180/Math.PI).toFixed(1)})`);
    sparks.appendChild(p);
    setTimeout(() => p.remove(), 1700);
  }
}

// Idle gentle sparks every few seconds
let idleSparkTimer = null;
function startIdleSparks(){
  if (reduceMotion) return;
  if (idleSparkTimer) clearInterval(idleSparkTimer);
  idleSparkTimer = setInterval(() => {
    if (document.hidden) return;
    burstSparks(5, true);
  }, 3600);
}
function stopIdleSparks(){
  if (idleSparkTimer) clearInterval(idleSparkTimer);
}
startIdleSparks();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopIdleSparks();
  else startIdleSparks();
});

// Initialize head center after first layout
window.addEventListener('load', () => {
  if (!reduceMotion) updateHeadCenter();
});