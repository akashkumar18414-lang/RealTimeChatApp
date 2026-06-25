package com.team.Spring.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.team.Spring.Entity.JoinRequestEntity;
import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Enum.JoinRequestStatusEnum;
import com.team.Spring.Repository.JoinRequestRepository;

import jakarta.transaction.Transactional;

@Service
public class JoinRequestService {
	private final JoinRequestRepository joinReqRepo;
	private final RoomService roomService;
	
	public JoinRequestService(JoinRequestRepository joinReqRepo, RoomService roomService) {
		super();
		this.joinReqRepo = joinReqRepo;
		this.roomService = roomService;
	}
	
	public List<JoinRequestEntity> getJoinRequests() {
		return joinReqRepo.findAll();
	}
	
	public void sendJoinRequest(String roomId, UserAuthEntity user) {
		if (roomService.checkMembership(roomId, user.getId())) throw new IllegalStateException("Already a member of this room");
		if (joinReqRepo.existsByRoom_IdAndUserAndStatus(roomId, user, JoinRequestStatusEnum.PENDING)) throw new IllegalStateException("Join Request already sent!");
		joinReqRepo.save(new JoinRequestEntity(roomService.getRoom(roomId), user));
	}
	
	@Transactional
	public void approveJoinRequest(Long requestId, UserAuthEntity user) {
		JoinRequestEntity request = joinReqRepo.findById(requestId).orElseThrow(() -> new IllegalArgumentException("Invalid Request ID: " + requestId));
		if (request.getStatus() != JoinRequestStatusEnum.PENDING) throw new IllegalStateException("Request already processed");
		if (!request.getRoom().getCreatedBy().equals(user)) throw new AccessDeniedException("Not authorized");
		request.setStatus(JoinRequestStatusEnum.APPROVED);
		request.setProcessedBy(user);
		request.setProcessedAt(LocalDateTime.now());
		roomService.joinRoom(request.getRoom().getId(), request.getUser());
	}
	
	@Transactional
	public void rejectJoinRequest(Long requestId, UserAuthEntity user) {
		JoinRequestEntity request = joinReqRepo.findById(requestId).orElseThrow(() -> new IllegalArgumentException("Invalid Request ID: " + requestId));
		if (request.getStatus() != JoinRequestStatusEnum.PENDING) throw new IllegalStateException("Request already processed");
		if (!request.getRoom().getCreatedBy().equals(user)) throw new AccessDeniedException("Not authorized");
	    request.setStatus(JoinRequestStatusEnum.REJECTED);
		request.setProcessedBy(user);
		request.setProcessedAt(LocalDateTime.now());
	}
	
}
