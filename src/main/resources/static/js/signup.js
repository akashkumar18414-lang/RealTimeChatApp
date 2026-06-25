(function() {
	// toggles
	const pw = document.getElementById('password');
	const togglePw = document.getElementById('togglePw');
	const cpw = document.getElementById('confirmPassword');
	const toggleConfirm = document.getElementById('toggleConfirm');

	function wire(btn, input) {
		if (!btn || !input) return;
		btn.addEventListener('click', function(e) { e.preventDefault(); const hidden = input.type === 'password'; input.type = hidden ? 'text' : 'password'; btn.setAttribute('aria-pressed', String(hidden)); btn.focus(); });
		btn.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
	}
	wire(togglePw, pw);
	wire(toggleConfirm, cpw);

	// simple client validation
	
})();