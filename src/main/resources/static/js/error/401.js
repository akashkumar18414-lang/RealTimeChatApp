// Configuration (adjust as needed)
const LOGIN_URL = '/login'; // Change to your app's login route

// Elements
const card = document.querySelector('.card');
const loginBtn = document.getElementById('loginBtn');
const precisePointer = matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background parallax layers
const blobs = document.querySelectorAll('.blob');
const cloudLayer = document.querySelector('.cloud-layer');
const grid = document.querySelector('.grid');

// 1) Subtle 3D tilt on card (desktop / precise pointer only)
if (precisePointer && !reduceMotion) {
  const maxTilt = 4; // deg
  let rafId = null;

  const onMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;   // 0..1
    const rotateY = (x - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - y) * (maxTilt * 2);

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.classList.add('tilted');
    });
  };

  const onLeave = () => {
    if (rafId) cancelAnimationFrame(rafId);
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
    card.classList.remove('tilted');
  };

  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', onLeave);
}

// 2) Background parallax on pointer move (subtle)
if (precisePointer && !reduceMotion) {
  let rafIdBg = null;
  window.addEventListener('pointermove', (e) => {
    if (rafIdBg) cancelAnimationFrame(rafIdBg);
    rafIdBg = requestAnimationFrame(() => {
      const { innerWidth: w, innerHeight: h } = window;
      const px = (e.clientX / w - 0.5); // -0.5..0.5
      const py = (e.clientY / h - 0.5);

      // Parallax transforms
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 6;
        b.style.transform = `translate3d(${px * depth}vw, ${py * depth}vh, 0)`;
      });
      if (cloudLayer) {
        cloudLayer.style.transform = `translate3d(${px * 1.5}vw, ${py * 1.2}vh, 0)`;
      }
      if (grid) {
        grid.style.transform = `translate3d(${px * 0.8}vw, ${py * 0.6}vh, 0)`;
      }
    });
  });
}

// 3) Ripple + loading + navigation for Login
function createRipple(e, target) {
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  // Position at click location or center if keyboard
  const x = e.clientX ? (e.clientX - rect.left) : rect.width / 2;
  const y = e.clientY ? (e.clientY - rect.top) : rect.height / 2;
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  target.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function goToLogin() {
  loginBtn.classList.add('is-loading');
  loginBtn.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    window.location.href = LOGIN_URL;
  }, 650);
}

loginBtn.addEventListener('click', (e) => {
  createRipple(e, loginBtn);
  goToLogin();
});

// Keyboard accessibility: Enter/Space triggers on focus
loginBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    createRipple({ clientX: 0, clientY: 0 }, loginBtn);
    goToLogin();
  }
});

// Quick shortcut: press L to login
window.addEventListener('keydown', (e) => {
  if ((e.key === 'l' || e.key === 'L') && document.activeElement !== loginBtn) {
    createRipple({ clientX: 0, clientY: 0 }, loginBtn);
    goToLogin();
  }
});

// Focus the button on load for immediate action
window.addEventListener('load', () => {
  loginBtn.focus({ preventScroll: true });
});