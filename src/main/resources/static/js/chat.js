let isRecording = false;
let chatHistory = [];
let mediaRecorder;
let audioChunks = [];
let participants = [
    "jeeban",
    "manisha",
    "jeeban1"
];
let scheduledMessages = [];
let gameData = {
    gameId: null,
    number: null
};
let stompClient = null;
function setConnected(connected) {
	document.getElementById("sendMessageBtn").disabled = !connected;
}

let lastSender = null;

function showMessage(message) {
	console.log("GAME ID:", message.gameId);
	console.log("SHOW MESSAGE CALLED:", message);
	if (!stompClient) {
	    alert("Not connected yet ❌");
	    return;
	}
	if (!message.replay) {
	    chatHistory.push(message);
	}

    console.log("MESSAGE RECEIVED:", message);

    const chatBox = document.getElementById("chatBox"); // ✅ ADD THIS

	const fullEmail = USERNAME;
	const currentUsername = fullEmail.split("@")[0].toLowerCase();

	if (
	    message.taggedUsername &&
	    message.taggedUsername.trim().toLowerCase() === currentUsername
	) {
	    console.log("TAG MATCHED ✅");

	    showTagNotification(message.senderName || "Someone", message.content);
	    showBrowserNotification(message.senderName || "Someone", message.content);
	    playNotificationSound();
	}
    const currentUserId = Number(document.getElementById("senderId").value);
	
	//Game
	if (message.mood === "GAME") {

	    const div = document.createElement("div");
	    div.className = "message incoming";

	    div.innerHTML = `
	        <div class="bubble" style="background:#fff3cd;">
	            🎮 Guess the Number Game Started!
	            <br><br>
	            <button onclick="joinGame('${message.gameId}', ${message.number})"
	                class="btn btn-primary btn-sm">
	                ▶ Join Game
	            </button>
	        </div>
	    `;

	    chatBox.appendChild(div);
	    chatBox.scrollTop = chatBox.scrollHeight;
	    return;
	}
	if (message.mood === "GAME_RESULT") {

	    const div = document.createElement("div");
	    div.className = "system-warning";

	    div.innerHTML = message.content;

	    chatBox.appendChild(div);
	    return;
	}
	if (message.mood === "GAME_TTT") {

	    const gameId = message.gameId; // ✅ extract properly

	    const div = document.createElement("div");

	    div.innerHTML = `
	        <div class="bubble" style="background:#d1ecf1;">
	            🎮 Tic Tac Toe Game Started!
	            <br><br>
	            <button onclick="joinTicTacToe('${gameId}')" 
	                class="btn btn-primary">
	                ▶ Join Game
	            </button>
	        </div>
	    `;

	    chatBox.appendChild(div);
	    return;
	}
	// 🔥 BLOCKED MESSAGE
		if (message.mood === "BLOCKED_AUDIO") {

		    const div = document.createElement("div");
		    div.className = "system-warning";

		    div.innerHTML = `🚫 Voice blocked due to inappropriate language`;

		    chatBox.appendChild(div);
		    chatBox.scrollTop = chatBox.scrollHeight;
		    return;
		}
		
		

    // 🔥 SYSTEM MESSAGE (WARNING / PAYMENT)
    if (message.senderName === "System") {

        const div = document.createElement("div");
        div.className = "system-warning";

        //div.innerText = "⚠️ " + message.content;

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
		
		div.innerHTML = `⚠️ ${message.content}`;
		

        return;
    }
	//Payment
	if (message.mood === "PAYMENT") {

	    const chatBox = document.getElementById("chatBox");

	    const paymentDiv = document.createElement("div");
	    paymentDiv.className = "message payment";

	    const timerId = "timer-" + Date.now();
		const paymentId = "payment-" + Date.now();

		paymentDiv.innerHTML = `
		    <div id="${paymentId}" class="bubble" style="background:#e6ffe6; border-radius:10px; padding:10px;">
		        <img src="${message.content}" style="width:150px; border-radius:10px"/>

		        <div style="margin-top:5px; font-weight:bold;">
		            💸 Pay ₹${message.amount}
		        </div>

		        <div id="${timerId}">
		            ⏳ ${message.timer}s
		        </div>

		        <button class="btn btn-success btn-sm mt-2"
		            onclick="markAsPaid('${paymentId}', '${timerId}', this, '${message.amount}')">
		            ✅ Mark Paid
		        </button>
		    </div>
		`;
	    chatBox.appendChild(paymentDiv);
	    chatBox.scrollTop = chatBox.scrollHeight;

	    // 🔥 LIVE COUNTDOWN
	    let timeLeft = parseInt(message.timer || 30);

	    const timerElement = document.getElementById(timerId);

	    const countdown = setInterval(() => {
	        timeLeft--;

			if (timeLeft > 0) {
			    timerElement.innerHTML = `⏳ ${timeLeft}s`;
			} else {
			    clearInterval(countdown);
			    timerElement.innerHTML = "❌ Expired";

			    // 🔥 HIDE QR IMAGE
			    const img = paymentDiv.querySelector("img");
			    if (img) img.style.display = "none";

			    // 🔥 DISABLE BUTTON
			    const btn = paymentDiv.querySelector("button");
			    if (btn) btn.disabled = true;
			}
	    }, 1000);

	    return;
	}
	if (message.mood === "PAID") {

	    const chatBox = document.getElementById("chatBox");

	    const div = document.createElement("div");
	    div.className = "system-warning";

	    div.innerHTML = `✅ Payment received`;

	    chatBox.appendChild(div);
	    chatBox.scrollTop = chatBox.scrollHeight;

	    // 🔥 REMOVE ALL ACTIVE QR
	    const allPayments = document.querySelectorAll(".payment .bubble");

	    allPayments.forEach(p => {
	        p.innerHTML = `
	            <div style="text-align:center; color:green; font-weight:bold;">
	                ✅ Payment Completed
	            </div>
	        `;
	    });

	    return;
	}
	//Voice Message
	if (message.mood === "VOICE") {

	    const div = document.createElement("div");
	    div.className = "message incoming";

	    div.innerHTML = `
	        <div class="bubble">
	            🎤 ${message.content}
	            <div class="time">${getCurrentTime()}</div>
	        </div>
	    `;

	    chatBox.appendChild(div);
	    return;
	}
	
	

	// 🔥 AUDIO MESSAGE
	
	if (message.content && message.content.startsWith("blob:")) {

	    const msgDiv = document.createElement("div");
	    msgDiv.className = "message incoming";

	    msgDiv.innerHTML = `
	        <div class="bubble">
	            🎤 Voice Message<br>
	            <audio controls src="${message.content}"></audio>
	            <div class="time">${getCurrentTime()}</div>
	        </div>
	    `;

	    chatBox.appendChild(msgDiv);
	    chatBox.scrollTop = chatBox.scrollHeight;
	    return;
	}
	
    
	// NORMAL MESSAGE


	const isMe = message.senderId === currentUserId;

	const msgDiv = document.createElement("div");
	msgDiv.className = "message " + (isMe ? "outgoing" : "incoming");

	const scheduleTag = message.scheduled ? "<small style='color:orange'>(Scheduled)</small>" : "";

	msgDiv.innerHTML = `
	    <div class="bubble">
	        ${message.content} ${scheduleTag}
	        ${message.mood ? `<div style="font-size:12px; color:gray;">${message.mood}</div>` : ""}
	        <div class="time">${getCurrentTime()}</div>
	    </div>
	`;

	chatBox.appendChild(msgDiv);
	chatBox.scrollTop = chatBox.scrollHeight;

	}

function getInitial(name) {
	return name ? name.charAt(0).toUpperCase() : "?";
}
function playNotificationSound() {

    if (notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(err => {
            console.log("Play failed:", err);
        });
    } else {
        console.log("Audio not initialized yet");
    }
}

function getCurrentTime() {
	const now = new Date();
	return now.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function connect() {
	var socket = new SockJS("/ChatApp/chat");
	stompClient = Stomp.over(socket);

	stompClient.connect({}, function() {
		setConnected(true);

		const SUBSCRIPTION_URL = CHAT_TYPE === "GENERAL"
		    ? "/topic/chat/general"
		    : "/topic/chat/room/" + ROOM_ID;

		stompClient.subscribe(SUBSCRIPTION_URL, function(message) {
			showMessage(JSON.parse(message.body));
		});
		// 🔒 PRIVATE MESSAGE SUBSCRIPTION (VERY IMPORTANT)
		const currentUsername = USERNAME.trim().toLowerCase();

		console.log("CURRENT USERNAME:", currentUsername);
		console.log("SUBSCRIBING TO:", "/topic/private/" + currentUsername);

		stompClient.subscribe("/topic/private/" + currentUsername, function(message) {
		    console.log("PRIVATE MESSAGE RECEIVED:", message.body);
		    showMessage(JSON.parse(message.body));
		});
	});
	
}

// 🔔 Ask browser permission
	function showBrowserNotification(sender, content) {

	    if (!("Notification" in window)) {
	        console.log("Browser does not support notifications");
	        return;
	    }

	    if (Notification.permission === "granted") {

	        try {
	            const notification = new Notification("🔔 New Mention", {
	                body: sender + ": " + content,
	                icon: "https://cdn-icons-png.flaticon.com/512/561/561127.png"
	            });

	            notification.onclick = () => {
	                window.focus();
	            };

	        } catch (e) {
	            console.log("Notification error:", e);
	        }

	    } else {
	        console.log("Permission not granted");
	    }
	}

function markAsPaid(paymentId, timerId, button, amount) {

    console.log("Mark Paid clicked", paymentId, timerId, amount);

    // 🛑 Stop timer
    if (timerId && window[timerId]) {
        clearInterval(window[timerId]);
    }

    // 🧼 Disable button
    if (button) {
        button.disabled = true;
        button.innerText = "Paid ✔";
    }

    // 🧼 Update UI
    const paymentBox = document.getElementById(paymentId);
    if (paymentBox) {
        paymentBox.innerHTML = `
            <div style="text-align:center; color:green; font-weight:bold;">
                ✅ Payment Completed
            </div>
        `;
    }

    // 🚀 SAVE TO BACKEND
   
}
function showToast(message, type = "info") {
	const toast = document.getElementById("toast");

	if (!toast) return; // safety check

	toast.textContent = message;
	toast.className = "toast-msg show " + type;

	setTimeout(() => {
		toast.classList.remove("show");
	}, 3000);
}


function sendMessage() {
	
    var content = document.getElementById("messageInput").value;
	const scheduleTime = document.getElementById("scheduleTime").value;

    if (!content) {
        showToast("Message is empty ❌", "error");
        return;
    }

    // 🔥 CHECK FROM BACKEND
	// 🔍 EXTRACT TAGGED USERNAME
	let taggedUsername = null;

	const match = content.match(/@([^\s]+)/);

	if (match) {
	    taggedUsername = match[1];
	}

	// 🚀 SEND DIRECTLY
	var chatMessage = {
	    content: content,
	    taggedUsername: taggedUsername
	};

	const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
	    ? "/app/chat/general"
	    : "/app/chat/room/" + ROOM_ID;

	stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));
	// 📅 SCHEDULE LOGIC
	if (scheduleTime) {

	    const now = new Date().getTime();
	    const scheduled = new Date(scheduleTime).getTime();

	    const delay = scheduled - now;

	    if (delay <= 0) {
	        showToast("Invalid schedule time ❌", "error");
	        return;
	    }

	    showToast("Message scheduled ⏳", "info");

	    setTimeout(() => {
	        sendScheduledMessage(content);
	    }, delay);

	    document.getElementById("messageInput").value = "";
	    document.getElementById("scheduleTime").value = "";

	    return;
	}

	document.getElementById("messageInput").value = "";
}


document.addEventListener('DOMContentLoaded', () => {
	document.getElementById("messageInput").focus();
	const toast = document.getElementById("toast");

	if (toast) {
		const message = toast.getAttribute("data-message");
		const type = toast.getAttribute("data-type") || "info";

		toast.textContent = message;
		toast.className = "toast-msg show " + type;

		setTimeout(() => {
			toast.classList.remove("show");
		}, 3000);
	}
});
document.addEventListener('DOMContentLoaded', () => {

    document.body.addEventListener("click", () => {

        notificationAudio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");

        notificationAudio.volume = 1.0;

        // 🔥 Unlock audio
        notificationAudio.play().then(() => {
            notificationAudio.pause();
            notificationAudio.currentTime = 0;
        }).catch(() => {});

    }, { once: true });

});
document.addEventListener("DOMContentLoaded", () => {

    const audio = document.getElementById("notificationSound");

    document.body.addEventListener("click", () => {

        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {});

    }, { once: true });

});

document.addEventListener('DOMContentLoaded', () => {

    const input = document.getElementById("messageInput");

    if (input) {

        // ✅ ENTER KEY SEND
        input.addEventListener("keydown", function(event) {

            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                document.getElementById("sendMessageBtn").click();
            }

        });

        // 🔥 ADD THIS PART (MENTION DROPDOWN)
        input.addEventListener("input", function () {

            const value = this.value;
            const mentionBox = document.getElementById("mentionList");

            const match = value.match(/@(\w*)$/);

            if (match) {
                const keyword = match[1].toLowerCase();

                const filtered = participants.filter(p =>
                    p.toLowerCase().includes(keyword)
                );

                if (filtered.length > 0) {
                    mentionBox.style.display = "block";
                    mentionBox.innerHTML = "";

                    filtered.forEach(user => {
                        const div = document.createElement("div");
                        div.innerText = user;

                        div.onclick = () => {
                            this.value = value.replace(/@(\w*)$/, "@" + user + " ");
                            mentionBox.style.display = "none";
                        };

                        mentionBox.appendChild(div);
                    });

                } else {
                    mentionBox.style.display = "none";
                }
            } else {
                mentionBox.style.display = "none";
            }
        });
    }
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

function generateQR() {

    const upiId = document.getElementById("upiIdInput").value;
    const name = document.getElementById("nameInput").value;
    const amount = document.getElementById("amountInput").value;
    const timer = document.getElementById("timerInput").value || 30;

    if (!upiId || !name || !amount) {
        alert("Fill all fields ❌");
        return;
    }

    const qrData = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    const qrContainer = document.getElementById("qrContainer");

	qrContainer.innerHTML = `
	    <div style="background:white;padding:15px;border-radius:15px;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
	        
	        <h6>💳 ${name}</h6>
	        <p style="color:gray;">UPI: ${upiId}</p>

	        <img src="${qrUrl}" style="width:180px;border-radius:10px"/>

	        <h5 class="mt-2">₹${amount}</h5>

	        <button class="btn btn-success mt-2 w-100"
	            onclick="shareQR('${qrUrl}', '${amount}', '${timer}')">
	            📤 Share Payment Request
	        </button>
	    </div>
	`;
    // ✅ NEW CLEAN WAY
    saveUserPaymentProfile(upiId, name);
}
document.addEventListener('DOMContentLoaded', () => {

    const savedUpi = localStorage.getItem("upiId");
    const savedName = localStorage.getItem("upiName");

    if (savedUpi) {
        document.getElementById("upiIdInput").value = savedUpi;
    }

    if (savedName) {
        document.getElementById("nameInput").value = savedName;
    }
});
function shareQR(qrUrl, amount, timer) {

    const paymentId = "pay_" + Date.now();

    const upiId = localStorage.getItem("upiId");
    const name = localStorage.getItem("upiName");

    const chatMessage = {
        id: paymentId,
        content: qrUrl,
        mood: "PAYMENT",
        amount: amount,
        timer: timer,
        status: "PENDING",
        upiId: upiId,
        senderName: name
    };
	const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
	    ? "/app/chat/general"
	    : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));
}
function savePaymentHistory(amount, qrUrl) {

    let history = JSON.parse(localStorage.getItem("payments")) || [];

    const payment = {
        amount: amount,
        qr: qrUrl,
        time: new Date().toLocaleString()
    };

    history.push(payment);

    localStorage.setItem("payments", JSON.stringify(history));
}


function viewHistory() {

    let history = JSON.parse(localStorage.getItem("payments")) || [];

    let html = "<h5>📜 Payment History</h5>";

    if (history.length === 0) {
        html += "<p>No payments yet</p>";
    } else {
        history.reverse().forEach(p => {
            html += `
                <div style="padding:10px;border:1px solid #ddd;margin-bottom:10px;">
                    ₹${p.amount} - ${p.status}<br>
                    <small>${p.time}</small>
                </div>
            `;
        });
    }

    document.getElementById("chatBox").innerHTML = html;
}
/*PROFILE*/
function loadUserPaymentProfile() {
    const upi = localStorage.getItem("upiId");
    const name = localStorage.getItem("upiName");

    if (upi) document.getElementById("upiIdInput").value = upi;
    if (name) document.getElementById("nameInput").value = name;
}
function showTagNotification(sender, content) {

    const div = document.createElement("div");
    div.className = "tag-notification";

    div.innerHTML = `🔔 ${sender} mentioned you: ${content}`;

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}
function showBrowserNotification(sender, content) {

    if (Notification.permission === "granted") {

        const notification = new Notification("🔔 New Mention", {
            body: sender + " mentioned you: " + content,
            icon: "https://cdn-icons-png.flaticon.com/512/561/561127.png"
        });

        notification.onclick = () => {
            window.focus();
        };
    }
}
function saveUserPaymentProfile(upi, name) {
    localStorage.setItem("upiId", upi);
    localStorage.setItem("upiName", name);
}
function closeHistory() {
    document.getElementById("historySection").style.display = "none";
    document.querySelector(".chat-area").style.display = "block";
}

function containsBadWords(text) {
    const badWords = ["idiot", "stupid", "fuck", "noob", "shit"];

    const words = text.toLowerCase().split(" ");

    return badWords.some(bad => words.includes(bad));
}
function sendVoiceMessage(text) {

    const chatMessage = {
        content: "🎤 " + text,
        mood: "VOICE"
    };

    const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
        ? "/app/chat/general"
        : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));
}





let stream; // 👈 ADD THIS GLOBAL

async function startRecording() {

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

	mediaRecorder.ondataavailable = (event) => {
	    if (event.data.size > 0) {
	        audioChunks.push(event.data);
	    }
	};
    mediaRecorder.start();

    isRecording = true;

    const btn = document.getElementById("micBtn");
    btn.innerText = "🔴 Stop";
    btn.style.backgroundColor = "red";
}
function stopRecording() {

    if (!mediaRecorder) return;

    mediaRecorder.stop();

    mediaRecorder.onstop = () => {

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // ✅ DIRECT SEND (NO BUGS)
        sendAudioToServer(audioBlob);

        // release mic
        stream.getTracks().forEach(track => track.stop());

        // reset chunks
        audioChunks = [];
    };

    isRecording = false;

    const btn = document.getElementById("micBtn");
    btn.innerText = "🎤";
    btn.style.backgroundColor = "";
}
function sendAudioToServer(audioBlob) {

    const formData = new FormData();
    formData.append("file", audioBlob);

    fetch("/api/check-audio", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        const audioUrl = URL.createObjectURL(audioBlob);

        if (data.blocked) {
            // 🚫 BLOCK MESSAGE
            const chatMessage = {
                content: "BLOCKED_AUDIO",
                mood: "BLOCKED_AUDIO"
            };

            const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
                ? "/app/chat/general"
                : "/app/chat/room/" + ROOM_ID;

            stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));

        } else {
            // ✅ SAFE → send audio
            sendAudioMessage(audioUrl);
        }

    })
    .catch(err => {
        console.error("Error:", err);

        // fallback → send anyway
        const audioUrl = URL.createObjectURL(audioBlob);
        sendAudioMessage(audioUrl);
    });
}
//Voice Recording


function toggleRecording() {

    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}
window.toggleRecording = toggleRecording;
function sendAudioMessage(audioUrl) {

    

    const chatMessage = {
        content: audioUrl,
        mood: "AUDIO"
    };

    const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
        ? "/app/chat/general"
        : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));
}


window.sendAudioMessage = sendAudioMessage;
window.onload = connect;
// 💰 OPEN PAYMENT MODAL
function openPayment() {
    console.log("Payment button clicked");

    const modalElement = document.getElementById('paymentModal');

    if (!modalElement) {
        alert("Payment modal not found!");
        return;
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
function reportVoice(btn) {

    showToast("🚫 Voice reported as inappropriate", "error");

    const chatMessage = {
        content: "⚠️ Voice reported by user",
        mood: "BLOCKED"
    };

    const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
        ? "/app/chat/general"
        : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));

    btn.disabled = true;
    btn.innerText = "Reported";
}

function replayChat() {

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    let i = 0;

    function showNext() {

        if (i >= chatHistory.length) {
            return; // ✅ STOP after finishing
        }

        showMessage({ ...chatHistory[i], replay: true });
        i++;

        setTimeout(showNext, 1000);
    }

    showNext();
}
function playNotificationSound() {

    const audio = document.getElementById("notificationSound");

    if (!audio) {
        console.log("❌ Audio not found");
        return;
    }

    audio.currentTime = 0;

    audio.play().then(() => {
        console.log("✅ Sound played");
    }).catch(err => {
        console.log("❌ Sound blocked", err);
    });
}
window.addEventListener("click", function () {

    const audio = document.getElementById("notificationSound");

    if (audio) {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log("Audio unlocked ✅");
        }).catch(err => {
            console.log("Unlock failed ❌", err);
        });
    }

}, { once: true });

function sendScheduledMessage(content) {

    let taggedUsername = null;

    const match = content.match(/@([^\s]+)/);

    if (match) {
        taggedUsername = match[1];
    }

    const chatMessage = {
        content: content,
        taggedUsername: taggedUsername,
        scheduled: true
    };

    const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
        ? "/app/chat/general"
        : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));

    console.log("Scheduled message sent ✅");
}
function scheduleMessage() {

    const content = document.getElementById("messageInput").value;
    const scheduleTime = document.getElementById("scheduleTime").value;

    if (!content || !scheduleTime) {
        showToast("Enter message & time ❌", "error");
        return;
    }

    const scheduled = new Date(scheduleTime).getTime();

    if (scheduled <= Date.now()) {
        showToast("Invalid time ❌", "error");
        return;
    }

    scheduledMessages.push({
        content: content,
        time: scheduled
    });

    showToast("Message scheduled ✅", "info");

    document.getElementById("messageInput").value = "";
    document.getElementById("scheduleTime").value = "";

    console.log("Scheduled List:", scheduledMessages);
}
setInterval(() => {

    const now = Date.now();

    scheduledMessages.forEach((msg, index) => {

        if (msg.time <= now) {

            sendScheduledMessage(msg.content);

            // remove after sending
            scheduledMessages.splice(index, 1);

            console.log("Sent scheduled message ✅");
        }

    });

}, 1000); // check every second
console.log(scheduledMessages);

//Game Logic
let currentGameId = null;
let mySymbol = null;
let gameOver = false;
let gameSubscribed = false;

function shareGame() {

    const gameId = "game_" + Date.now();

    const chatMessage = {
        content: "🎮 Tic Tac Toe Game Started!",
        mood: "GAME_TTT",
        gameId: gameId
    };

    const CHAT_DESTINATION = CHAT_TYPE === "GENERAL"
        ? "/app/chat/general"
        : "/app/chat/room/" + ROOM_ID;

    stompClient.send(CHAT_DESTINATION, {}, JSON.stringify(chatMessage));
	gameSubscribed = false;	
	joinTicTacToe(gameId);
	
}

function joinTicTacToe(gameId) {
	gameOver = false;
	mySymbol = null;

    currentGameId = gameId;

    document.getElementById("gameBoard").style.display = "block";

    // show empty board
    renderBoard(["","","","","","","","",""], "X");

    stompClient.send("/app/game/join", {}, JSON.stringify({
        gameId: gameId,
        username: USERNAME
    }));

    // ✅ SUBSCRIBE ONLY ONCE
    if (!gameSubscribed) {
        subscribeToGame(gameId);
        gameSubscribed = true;
    }
}

function subscribeToGame(gameId) {
	console.log(USERNAME);

    stompClient.subscribe("/topic/game/" + gameId, function (msg) {

		let data;

		if (msg.body) {
		    data = JSON.parse(msg.body);   // ✅ normal STOMP
		} else if (msg.data) {
		    data = JSON.parse(msg.data);   // ✅ fallback
		} else {
		    data = msg;                    // ✅ already object
		}

		console.log("PARSED DATA:", data);
		
		
        // assign symbol
        //if (data.players) {
            mySymbol = data.players[USERNAME];
        //}

        // ✅ STATUS FIX

        // ✅ WIN
        if (data.winner) {
            alert("🏆 Winner: " + data.winner);
            gameOver = true;
            renderBoard(data.board, null, null);
            return;
        }

        // ✅ DRAW
        if (data.draw) {
            alert("🤝 Draw!");
            gameOver = true;
            renderBoard(data.board, null, null);
            return;
        }

		
        renderBoard(data.board, data.turn, mySymbol);
    });
}

function renderBoard(board, turn, mySymbol) {
    document.getElementById("status").innerText = mySymbol;
	console.log("renderBoard called with:", mySymbol);

    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    board.forEach((cell, i) => {

        const div = document.createElement("div");

        div.style.width = "80px";
        div.style.height = "80px";
        div.style.background = "#eee";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.fontSize = "24px";
        div.style.cursor = "pointer";

        div.innerText = cell;
        div.onclick = () => {

            if (gameOver) return; // ✅ stop after finish

            if (!mySymbol) {
                alert(mySymbol);
                return;
            }

            if (cell !== "") return;

            if (turn !== mySymbol) {
                alert("Not your turn ❌");
                return;
            }

            stompClient.send("/app/game/move", {}, JSON.stringify({
                gameId: currentGameId,
                index: i,
                username: USERNAME
            }));
        };

        boardDiv.appendChild(div);
    });
}
function openThemePanel() {
    const panel = document.getElementById("themePanel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function setTheme(theme) {

    document.body.className = theme;

    // ✅ SAVE USER PREFERENCE
    localStorage.setItem("selectedTheme", theme);
}
window.onload = function () {
    const savedTheme = localStorage.getItem("selectedTheme");

    if (savedTheme) {
        document.body.className = savedTheme;
    }
};
function toggleEmojiPicker() {

    const picker = document.getElementById("emojiPicker");

    if (!picker) {
        console.log("emojiPicker not found");
        return;
    }

    picker.style.display =
        picker.style.display === "block"
            ? "none"
            : "block";
}

function addEmoji(emoji) {

    const input = document.getElementById("messageInput");

    if (!input) return;

    input.value += emoji;
    input.focus();
}

window.toggleEmojiPicker = toggleEmojiPicker;
window.addEmoji = addEmoji;
window.onload = connect;