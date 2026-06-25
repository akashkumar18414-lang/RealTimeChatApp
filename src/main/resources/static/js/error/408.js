/* ==========================================================================
   Interactivity — Retry (R), Flip (click/Enter/Space), Time Warp (T)
   ========================================================================== */
const retryBtn = document.getElementById('retryBtn');
const hg = document.getElementById('hourglass');
const hgBtn = document.getElementById('hourglassBtn');
const statusLive = document.getElementById('status');
const root = document.documentElement;

// Retry via button
retryBtn.addEventListener('click', () => location.reload());

// Safety: ignore keybinds while typing in form elements/contenteditable
const isTypingTarget = (el) => {
  if (!el) return false;
  const tag = el.tagName ? el.tagName.toLowerCase() : '';
  return el.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
};

// Flip hourglass
const flip = () => {
  const flipped = hg.getAttribute('data-flipped') === 'true';
  hg.setAttribute('data-flipped', flipped ? 'false' : 'true');
  statusLive.textContent = flipped ? 'Hourglass upright' : 'Hourglass flipped';
  setTimeout(() => statusLive.textContent = '', 1200);
};
hgBtn.addEventListener('click', flip);
hgBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
});

// Time warp (T) — bump animation speed via CSS variable
const toggleTimeWarp = () => {
  const on = root.getAttribute('data-timewarp') === 'on';
  if (on) {
    root.removeAttribute('data-timewarp');
    root.style.setProperty('--speed', '1');
    statusLive.textContent = 'Time warp off';
  } else {
    root.setAttribute('data-timewarp', 'on');
    root.style.setProperty('--speed', '3.5');
    statusLive.textContent = 'Time warp on';
  }
  setTimeout(() => statusLive.textContent = '', 1200);
};

// Global keybindings: R = retry, T = time warp
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((key === 'r' || key === 'R') && !isTypingTarget(document.activeElement)) {
    e.preventDefault();
    location.reload();
  }
  if (key === 't' || key === 'T') {
    e.preventDefault();
    toggleTimeWarp();
  }
});

// Respect reduced motion at runtime
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const applyReduced = () => {
  if (prefersReduced.matches) root.style.setProperty('--speed', '1');
};
prefersReduced.addEventListener?.('change', applyReduced);
applyReduced();