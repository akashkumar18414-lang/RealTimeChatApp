const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
// Theme toggle (persist in localStorage) 
(function() {
	const themeToggle = document.getElementById('themeToggle');
	const themeIcon = document.getElementById('themeIcon');
	function applyTheme(theme) {
		document.body.setAttribute('data-theme', theme);
		if (theme === 'dark') themeIcon.className = 'bi bi-sun';
		else themeIcon.className = 'bi bi-moon';
	}
	const saved = localStorage.getItem('chatapp-theme') || 'light';
	applyTheme(saved);
	themeToggle?.addEventListener('click', function() {
		const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		const next = current === 'dark' ? 'light' : 'dark';
		localStorage.setItem('chatapp-theme', next);
		applyTheme(next);
	});
})();

document.addEventListener('click', function(e) {
	const button = e.target.closest('#room-settings-btn');
	if (!button) return;
	document.getElementById('settingsName').value = button.dataset.roomName || '';
	document.getElementById('settingsDescription').value = button.dataset.description || '';
	document.getElementById('settingsVisibility').value = button.dataset.visibility || 'PUBLIC';
	document.getElementById('settingsJoinPolicy').value = button.dataset.joinPolicy || 'OPEN';
	document.getElementById('settingsCountry').value = button.dataset.preferredCountry || '';
	document.getElementById('settingsMaxMembers').value = button.dataset.maxMembers || '';
	document.getElementById('settingsMaxMembers').min = button.dataset.membersCount || 2;
	document.getElementById('roomSettingsForm').action = '/ChatApp/updateRoom/' + button.dataset.roomId;
	const modal = new bootstrap.Modal(document.getElementById('roomSettingsModal'));
	modal.show();
});

let formToSubmit = null;

function confirmAction(form, title, message, btnClass) {
	formToSubmit = form;

	document.getElementById('confirmTitle').textContent = title;
	document.getElementById('confirmMessage').textContent = message;

	const confirmBtn = document.getElementById('confirmBtn');
	confirmBtn.className = 'btn ' + btnClass;
	confirmBtn.textContent = title;

	const modal = new bootstrap.Modal(
		document.getElementById('confirmActionModal')
	);
	modal.show();

	confirmBtn.onclick = function() {
		formToSubmit.submit();
	};
}


document.addEventListener('DOMContentLoaded', () => {
	const publicSearchInput = document.getElementById('publicSearch');
	const globalSearchInput = document.getElementById('globalSearch');
	const countryFilter = document.getElementById('filterCountry');
	const policyFilter = document.getElementById('filterJoinPolicy');

	const publicRoomCards = document.querySelectorAll('#publicRoomsContainer .room-card');
	const createdCards = document.querySelectorAll('#createdRoomsContainer .room-card');
	const joinedCards = document.querySelectorAll('#joinedRoomsContainer .room-card');

	const publicNoResults = document.getElementById('publicNoResults');
	const createdNoResults = document.getElementById('createdNoResults');
	const joinedNoResults = document.getElementById('joinedNoResults');

	function filterPublicRooms() {
		const searchValue = publicSearchInput.value.trim().toLowerCase();
		const selectedCountry = countryFilter.value;
		const selectedPolicy = policyFilter.value;

		let visibleCount = 0;

		publicRoomCards.forEach(card => {
			const name = (card.dataset.name || '').toLowerCase();
			const description = (card.dataset.description || '').toLowerCase();
			const country = card.dataset.country || '';
			const joinPolicy = card.dataset.joinPolicy || '';

			const matchesSearch = name.includes(searchValue) || description.includes(searchValue);
			const matchesCountry = !selectedCountry || country === selectedCountry;
			const matchesPolicy = !selectedPolicy || joinPolicy === selectedPolicy;

			const wrapper = card.closest('.mb-2');

			if (matchesSearch && matchesCountry && matchesPolicy) {
				wrapper.style.display = '';
				visibleCount++;
			} else {
				wrapper.style.display = 'none';
			}
		});

		publicNoResults.style.display = visibleCount === 0 ? 'block' : 'none';
	}

	function filterRoomList(cards, noResultEl) {
		const searchValue = globalSearchInput.value.trim().toLowerCase();
		let visibleCount = 0;

		cards.forEach(card => {
			const name = (card.dataset.name || '').toLowerCase();
			const description = (card.dataset.description || '').toLowerCase();
			const wrapper = card.closest('.mb-2');

			if (name.includes(searchValue) || description.includes(searchValue)) {
				wrapper.style.display = '';
				visibleCount++;
			} else {
				wrapper.style.display = 'none';
			}
		});

		noResultEl.style.display = visibleCount === 0 ? 'block' : 'none';
	}

	publicSearchInput.addEventListener('input', filterPublicRooms);
	countryFilter.addEventListener('change', filterPublicRooms);
	policyFilter.addEventListener('change', filterPublicRooms);

	globalSearchInput.addEventListener('input', () => {
		filterRoomList(createdCards, createdNoResults);
		filterRoomList(joinedCards, joinedNoResults);
	});
});


let currentShareLink = '';

function openShareModal(button) {
	const roomId = button.dataset.roomId;

	currentShareLink = `${window.location.origin}/ChatApp/chat/room/${roomId}`;

	document.getElementById('shareLink').value = currentShareLink;

	new bootstrap.Modal(
		document.getElementById('shareModal')
	).show();
}

function copyShareLink() {
	const input = document.getElementById('shareLink');
	input.select();
	input.setSelectionRange(0, 99999);
	document.execCommand('copy');
	input.blur();

	// show toast
	const toastEl = document.getElementById('copyToast');
	const toast = new bootstrap.Toast(toastEl, {
		delay: 2000
	});
	toast.show();
}


function shareWhatsApp() {
	const text = encodeURIComponent(
		`Join this chat room:\n${currentShareLink}`
	);
	window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareTelegram() {
	const text = encodeURIComponent('Join this chat room');
	const url = encodeURIComponent(currentShareLink);

	window.open(
		`https://t.me/share/url?url=${url}&text=${text}`,
		'_blank'
	);
}

function shareEmail() {
	const subject = encodeURIComponent('Join my chat room');
	const body = encodeURIComponent(
		`Hey,\n\nJoin this chat room:\n${currentShareLink}`
	);

	window.location.href =
		`mailto:?subject=${subject}&body=${body}`;
}

function shareTwitter() {
	const text = encodeURIComponent('Join this chat room');
	const url = encodeURIComponent(currentShareLink);

	window.open(
		`https://twitter.com/intent/tweet?text=${text}&url=${url}`,
		'_blank'
	);
}

