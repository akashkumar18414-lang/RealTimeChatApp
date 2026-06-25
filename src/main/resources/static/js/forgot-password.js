// Theme init (dark by default unless saved)
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
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  updateThemeText(next);
  try { localStorage.setItem("erp-theme", next); } catch (_) {}
});