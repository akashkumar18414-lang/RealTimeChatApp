package com.team.Spring.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Model.ChatMessageModel;
import com.team.Spring.Service.JoinRequestService;
import com.team.Spring.Service.RoomService;
import com.team.Spring.Service.UserAuthService;

@Controller
public class ChatController {
	private final RoomService roomService;
	private final UserAuthService userService;
	private final JoinRequestService joinRequestService;
	private final Map<Long, Long> lastMessageTime = new ConcurrentHashMap<>();
	
	public ChatController(RoomService roomService, UserAuthService userService, JoinRequestService joinRequestService) {
		super();
		this.roomService = roomService;
		this.userService = userService;
		this.joinRequestService = joinRequestService;
	}
	
	@PostMapping("/approveJoinRequest/{requestId}")
	public String approveJoinRequest(@PathVariable("requestId") Long requestId, @AuthenticationPrincipal UserAuthEntity user) {
		joinRequestService.approveJoinRequest(requestId, user);
		return "redirect:/home";
	}
		
	@PostMapping("/rejectJoinRequest/{requestId}")
	public String rejectJoinRequest(@PathVariable("requestId") Long requestId, @AuthenticationPrincipal UserAuthEntity user) {
		joinRequestService.rejectJoinRequest(requestId, user);
		return "redirect:/home";
	}
	
	@MessageMapping("/chat/general")
	@SendTo("/topic/chat/general")
	public ChatMessageModel sendMessageToGeneral(ChatMessageModel chatMessage, Principal user) {
		chatMessage.setSender(userService.findUserByUsername(user.getName()).getFullName());
		checkRateLimit(userService.findUserByUsername(user.getName()).getId());
		validateMessage(chatMessage.getContent());
		return chatMessage;
	}
	
	@MessageMapping("/chat/room/{roomId}")
	@SendTo("/topic/chat/room/{roomId}")
	public ChatMessageModel sendMessageToRoom(ChatMessageModel chatMessage, @DestinationVariable("roomId") String roomId, Principal user) {
		if (!roomService.checkMembership(roomId, userService.findUserByUsername(user.getName()).getId())) throw new AccessDeniedException("Not a room member");
		chatMessage.setSender(userService.findUserByUsername(user.getName()).getFullName());
		checkRateLimit(userService.findUserByUsername(user.getName()).getId());
		validateMessage(chatMessage.getContent());
		if (!"PAYMENT".equals(chatMessage.getMood())) {
	        validateMessage(chatMessage.getContent());
	    }
		return chatMessage;
	}
	
	private void validateMessage(String content) {
	    if (content == null || content.trim().isEmpty())
	        throw new IllegalArgumentException("Empty message");

	    if (content.length() > 500)
	        throw new IllegalArgumentException("Message too long");

	    if (content.matches(".*<script>.*"))
	        throw new IllegalArgumentException("Invalid content");
	 // 🔥 BAD WORD FILTER
	 		String[] badWords = { "idiot", "stupid", "fuck", "noob" };

	 		String lower = content.toLowerCase();

	 		for (String word : badWords) {
	 			if (lower.contains(word)) {
	 				throw new IllegalArgumentException("BAD_WORD");
	 			}
	 		}
	}
	

	private void checkRateLimit(Long userId) {
	    long now = System.currentTimeMillis();
	    long last = lastMessageTime.getOrDefault(userId, 0L);

	    if (now - last < 500) { // 2 messages/second
	        throw new AccessDeniedException("Too many messages");
	    }
	    lastMessageTime.put(userId, now);
	}

}
