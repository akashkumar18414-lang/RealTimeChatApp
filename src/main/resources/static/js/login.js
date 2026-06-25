(function() {
	// show/hide password toggle (robust + accessible)
	const pwd = document.getElementById('password');
	const toggle = document.getElementById('togglePassword');
	const eyeIcon = document.getElementById('eyeIcon');

	const eyeSvg = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>';
	const eyeOffSvg = '<path d="M1 1l22 22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>' +
		'<path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7 1.5-2.7 3.9-4.8 6.6-6.1"></path>' +
		'<path d="M9.4 9.4a3 3 0 014.2 4.2"></path>';

	function setHidden() {
		eyeIcon.innerHTML = eyeSvg;
		toggle.setAttribute('aria-label', 'Show password');
		toggle.setAttribute('aria-pressed', 'false');
	}
	function setVisible() {
		eyeIcon.innerHTML = eyeOffSvg;
		toggle.setAttribute('aria-label', 'Hide password');
		toggle.setAttribute('aria-pressed', 'true');
	}

	// init
	setHidden();

	toggle.addEventListener('click', function(e) {
		e.preventDefault();
		if (!pwd) return;
		const hidden = pwd.type === 'password';
		pwd.type = hidden ? 'text' : 'password';
		if (hidden) setVisible(); else setHidden();
		toggle.focus();
	});

	toggle.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
	});

	// basic client-side check: require username
	const form = document.getElementById('loginForm');
	form.addEventListener('submit', function(e) {
		const u = document.getElementById('username');
		if (!u.value.trim()) {
			e.preventDefault();
			u.focus();
		}
	});
})();