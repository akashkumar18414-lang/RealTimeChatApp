package com.team.Spring.Controller;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.security.Principal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.team.Spring.DTO.CreateRoomDTO;
import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Repository.UserAuthRepository;
import com.team.Spring.Service.JoinRequestService;
import com.team.Spring.Service.RoomService;

import jakarta.validation.Valid;

@Controller
public class UserController {
	
	private final RoomService roomService;
	private final JoinRequestService joinRequestService;
	private final UserAuthRepository userAuthRepository;
	
	public UserController(RoomService roomService,
            JoinRequestService joinRequestService,
            UserAuthRepository userAuthRepository) {

this.roomService = roomService;
this.joinRequestService = joinRequestService;
this.userAuthRepository = userAuthRepository;
}
	
	@GetMapping("/profile")
	public String getProfile(@AuthenticationPrincipal UserAuthEntity user, Model model) {
	    model.addAttribute("user", user);
	    return "profile";
	}
	
	@GetMapping("/settings")
	public String settingsPage(@AuthenticationPrincipal UserAuthEntity user, Model model) {
	    model.addAttribute("user", user);
	    return "settings";
	}
	
	@PostMapping("/settings/save")
	public String saveSettings(@AuthenticationPrincipal UserAuthEntity user,
	                           @org.springframework.web.bind.annotation.RequestParam(required = false) boolean chatLocked,
	                           @org.springframework.web.bind.annotation.RequestParam(required = false) boolean notificationsEnabled) {

	    user.setChatLocked(chatLocked);
	    user.setNotificationsEnabled(notificationsEnabled);

	    // You need repository to save
	    
	    userAuthRepository.save(user);

	    return "redirect:/settings";
	}
	

	@GetMapping("/home")
	public String homePage(@AuthenticationPrincipal UserAuthEntity user, Model model) {
		if (!model.containsAttribute("user"))
			model.addAttribute("user", user);
		model.addAttribute("createRoomDTO", new CreateRoomDTO());
		model.addAttribute("myRooms", roomService.getMyRooms(user));
		model.addAttribute("publicRooms", roomService.getPublicRooms(user));
		model.addAttribute("joinedRooms", roomService.getJoinedRooms(user));
		return "home";
	}

	@PostMapping("/createRoom")
	public String createRoom(@Valid @ModelAttribute CreateRoomDTO roomDetails, BindingResult result,
			@AuthenticationPrincipal UserAuthEntity user) {
		if (result.hasErrors())
			return "home";
		roomService.createRoom(roomDetails, user);
		return "redirect:/home";
	}

	@PostMapping("/updateRoom/{roomId}")
	public String updateRoom(@PathVariable("roomId") String roomId, @Valid @ModelAttribute CreateRoomDTO roomDetails,
			@AuthenticationPrincipal UserAuthEntity user, BindingResult result) {
		if (result.hasErrors())
			return "home";
		roomService.updateRoom(roomId, roomDetails, user);
		return "redirect:/home";
	}

	@PostMapping("/deleteRoom/{roomId}")
	public String deleteRoom(@PathVariable("roomId") String roomId, @AuthenticationPrincipal UserAuthEntity user) {
		roomService.deleteRoom(roomId, user);
		return "redirect:/home";
	}

	@PostMapping("/joinRoom/{roomId}")
	public String joinRoom(@PathVariable("roomId") String roomId, @AuthenticationPrincipal UserAuthEntity user) {
		roomService.joinRoom(roomId, user);
		return "redirect:/chat/room/" + roomId;
	}

	@PostMapping("/requestToJoinRoom/{roomId}")
	public String sendJoinRequest(@PathVariable("roomId") String roomId, @AuthenticationPrincipal UserAuthEntity user, Model model) {
		joinRequestService.sendJoinRequest(roomId, user);
		return "redirect:/home";
	}

	@PostMapping("/leaveRoom/{roomId}")
	public String leaveRoom(@PathVariable("roomId") String roomId, @AuthenticationPrincipal UserAuthEntity user) {
		roomService.leaveRoom(roomId, user);
		return "redirect:/home";
	}

	@GetMapping("/chat/general")
	public String generalChatPage(@AuthenticationPrincipal UserAuthEntity user, Model model) {
		model.addAttribute("chatType", "GENERAL");
		model.addAttribute("user", user);
		return "chat";
	}

	@GetMapping("/chat/room/{roomId}")
	public String openChatRoom(
	        @PathVariable("roomId") String roomId,
	        @AuthenticationPrincipal UserAuthEntity user,
	        Model model) {

	    var room = roomService.getRoom(roomId);

	    model.addAttribute("room", room);

	    if (!roomService.checkMembership(roomId, user.getId()))
	        return "room-details";

	    model.addAttribute("chatType", "ROOM");
	    model.addAttribute("user", user);

	    // ADD THESE LINES
	    model.addAttribute("admin", room.getCreatedBy());
	    model.addAttribute("isAdmin",
	            room.getCreatedBy() != null &&
	            room.getCreatedBy().getId().equals(user.getId()));

	    if (room.getCreatedBy() != null &&
	        room.getCreatedBy().getId().equals(user.getId())) {

	        model.addAttribute("joinRequests",
	                joinRequestService.getJoinRequests());
	    }

	    return "chat";
	}
}
