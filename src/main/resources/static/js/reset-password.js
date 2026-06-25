// Theme init
(function initTheme() {
  try {
    const saved = localStorage.getItem("erp-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.body.setAttribute("data-theme", theme);
    updateThemeText(theme);
  } catch (_) {}
})();
function updateThemeText(theme) {
  const text = document.getElementById("themeText");
  if (text) text.textContent = theme === "dark" ? "Light" : "Dark";
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  updateThemeText(next);
  try { localStorage.setItem("erp-theme", next); } catch (_) {}
});

// Config: backend base + CSRF
const API_BASE = '/api/auth'; // adjust if needed
function getCsrfHeaders() {
  const headerName = document.querySelector('meta[name="_csrf_header"]')?.content;
  const token = document.querySelector('meta[name="_csrf"]')?.content;
  return headerName && token ? { [headerName]: token } : {};
}

// Elements
const resetForm = document.getElementById('resetForm');
const newPwd = document.getElementById('newPassword');
const confirmPwd = document.getElementById('confirmPassword');
const setPwdBtn = document.getElementById('setPwdBtn');
const strengthFill = document.getElementById('strengthFill');
const reqLen = document.getElementById('reqLen');
const reqLower = document.getElementById('reqLower');
const reqUpper = document.getElementById('reqUpper');
const reqNum = document.getElementById('reqNum');
const reqSpec = document.getElementById('reqSpec');
const capsNew = document.getElementById('capsNew');
const capsConfirm = document.getElementById('capsConfirm');
const resetNotice = document.getElementById('resetNotice');
const resetNoticeText = document.getElementById('resetNoticeText');
const toggleNewPwd = document.getElementById('toggleNewPwd');
const toggleConfirmPwd = document.getElementById('toggleConfirmPwd');

// State
let resetToken = null;

// Token fetch (URL ?token=... or sessionStorage)
(function initToken() {
  const p = new URLSearchParams(location.search);
  resetToken = p.get('token') || sessionStorage.getItem('erp-reset-token') || null;
  if (!resetToken) {
    resetNoticeText.textContent = 'Missing reset token. Please verify the code again.';
    resetNotice.classList.add('show');
    setPwdBtn.setAttribute('disabled', 'false');
  }
})();

// Backend call
async function setPassword(newPassword) {
  if (!resetToken) throw new Error('Missing reset token.');
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getCsrfHeaders() },
    body: JSON.stringify({ resetToken, newPassword }),
    credentials: 'same-origin'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || 'Could not update password');
  }
}

// Password rules
function pwdRules(p) {
  return { len: p.length >= 8, lower: /[a-z]/.test(p), upper: /[A-Z]/.test(p), num: /\d/.test(p), spec: /[^A-Za-z0-9]/.test(p) };
}
function scoreRules(r) { return (r.len?1:0)+(r.lower?1:0)+(r.upper?1:0)+(r.num?1:0)+(r.spec?1:0); }
function updateReqItem(el, ok) { el.classList.toggle('ok', ok); }

function updatePwdUI() {
  const r = pwdRules(newPwd.value);
  updateReqItem(reqLen, r.len);
  updateReqItem(reqLower, r.lower);
  updateReqItem(reqUpper, r.upper);
  updateReqItem(reqNum, r.num);
  updateReqItem(reqSpec, r.spec);
  const s = scoreRules(r);
  const pct = Math.min(100, Math.max(0, (s/5)*100));
  strengthFill.style.width = pct + '%';

  const match = confirmPwd.value && newPwd.value === confirmPwd.value;
  const valid = s >= 4 && match && !!resetToken; // require 4 of 5 incl. length + token present
  setPwdBtn.toggleAttribute('disabled', !valid);
}

// Caps lock hints
function handleCapsHint(e, el) {
  const caps = e.getModifierState && e.getModifierState('CapsLock');
  el.classList.toggle('show', !!caps);
}
newPwd.addEventListener('keyup', (e) => handleCapsHint(e, capsNew));
confirmPwd.addEventListener('keyup', (e) => handleCapsHint(e, capsConfirm));

newPwd.addEventListener('input', updatePwdUI);
confirmPwd.addEventListener('input', updatePwdUI);

// Toggle show/hide for reset fields
function toggleField(btn, field) {
  const isHidden = field.getAttribute('type') === 'password';
  field.setAttribute('type', isHidden ? 'text' : 'password');
  btn.setAttribute('aria-pressed', String(isHidden));
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  field.focus();
}
toggleNewPwd.addEventListener('click', () => toggleField(toggleNewPwd, newPwd));
toggleConfirmPwd.addEventListener('click', () => toggleField(toggleConfirmPwd, confirmPwd));

// Submit
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = pwdRules(newPwd.value);
  const s = scoreRules(r);
  const match = newPwd.value === confirmPwd.value;
  if (!(s >= 4 && match && resetToken)) {
    resetForm.classList.remove('shake'); void resetForm.offsetWidth; resetForm.classList.add('shake');
    return;
  }
  setPwdBtn.setAttribute('data-loading', 'true');
  try {
    await setPassword(newPwd.value);
    resetNoticeText.textContent = 'Password updated. You can now log in.';
    resetNotice.classList.add('show');
    // clear token after success
    sessionStorage.removeItem('erp-reset-token');
    setTimeout(() => { window.location.href = '/auth'; }, 1200);
  } catch (err) {
    resetNoticeText.textContent = err.message || 'Could not update password. Please try again.';
    resetNotice.classList.add('show');
  } finally {
    setPwdBtn.removeAttribute('data-loading');
  }
});

// Esc -> back to sign in
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.location.href = '/auth'; });

// Init UI
updatePwdUI();