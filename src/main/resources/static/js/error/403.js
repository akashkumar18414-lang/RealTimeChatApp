/* ==========================================================================
   Interactivity
   - Go back
   - Illustration click (key -> door clunk)
   - Modal open/close + focus trap
   - Easter egg: press "U"
   - Accessibility helpers
   ========================================================================== */
   
// Utilities
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const live = (msg) => {
  const region = $('#liveRegion');
  region.textContent = ''; // reset to ensure announcement
  setTimeout(() => region.textContent = msg, 10);
};

// Go Back
$('#goBackBtn').addEventListener('click', () => {
  if (window.history.length > 1) history.back();
  else window.location.assign('/');
});

// Illustration: attempt unlock
const illusButton = $('.illus-button');
let attemptLock = false;
illusButton.addEventListener('click', () => {
  if (attemptLock) return;
  attemptLock = true;
  illusButton.classList.add('attempt');
  live('Clunk! Door remains locked.');
  setTimeout(() => {
    illusButton.classList.remove('attempt');
    attemptLock = false;
  }, 1200);
});

// Modal behavior with focus trap
const modal = $('#requestModal');
const openBtn = $('#openModalBtn');
const dialog = $('.dialog', modal);
let lastFocus = null;

const focusableSelector = `
  a[href], area[href], input:not([disabled]):not([type="hidden"]):not([aria-hidden]),
  select:not([disabled]):not([aria-hidden]), textarea:not([disabled]):not([aria-hidden]),
  button:not([disabled]):not([aria-hidden]), [tabindex]:not([tabindex="-1"])
`;

function trapFocus(e){
  if (e.key !== 'Tab') return;
  const focusables = $$(focusableSelector, dialog).filter(el => el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

function openModal(){
  lastFocus = document.activeElement;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('show'));
  document.body.style.overflow = 'hidden';
  $('#main').setAttribute('aria-hidden', 'true');
  const firstInput = $('#name');
  setTimeout(() => firstInput.focus(), 50);
  modal.addEventListener('keydown', trapFocus);
}

function closeModal(){
  modal.classList.remove('show');
  setTimeout(() => { modal.hidden = true; }, 200);
  document.body.style.overflow = '';
  $('#main').removeAttribute('aria-hidden');
  modal.removeEventListener('keydown', trapFocus);
  if (lastFocus) lastFocus.focus();
}

openBtn.addEventListener('click', openModal);
$$('.overlay, [data-close]', modal).forEach(el => el.addEventListener('click', closeModal));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// Form handling (demo only)
$('#accessForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = ($('#name').value || '').trim();
  const reason = ($('#reason').value || '').trim();
  if (!name || !reason) {
    // Simple validation styling
    if (!name) $('#name').style.borderColor = 'var(--danger)';
    if (!reason) $('#reason').style.borderColor = 'var(--danger)';
    live('Please complete the form.');
    return;
  }
  live('Access request submitted.');
  closeModal();
  // Reset styles/inputs after closing
  setTimeout(() => {
    $('#accessForm').reset();
    $('#name').style.borderColor = '';
    $('#reason').style.borderColor = '';
  }, 250);
  // Optional: show banner confirmation in page
  const banner = $('#elevateBanner');
  banner.textContent = 'Request sent ✔️ We’ll get back to you.';
  banner.classList.add('show');
  setTimeout(() => {
    banner.classList.remove('show');
    banner.textContent = 'Attempting elevation…';
  }, 1800);
});

// Easter egg: press "U"
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'u') return;
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

  const banner = $('#elevateBanner');
  banner.textContent = 'Attempting elevation…';
  banner.classList.add('show');
  if (!prefersReduced) banner.classList.add('glitch');
  live('Attempting elevation…');
  setTimeout(() => {
    banner.classList.remove('glitch');
    banner.classList.remove('show');
    live('Nope. Still locked.');
  }, 1500);
});