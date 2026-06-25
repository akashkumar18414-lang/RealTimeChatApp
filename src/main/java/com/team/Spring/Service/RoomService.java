package com.team.Spring.Service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.team.Spring.DTO.CreateRoomDTO;
import com.team.Spring.DTO.RoomListItemDTO;
import com.team.Spring.Entity.RoomEntity;
import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Enum.JoinPolicyEnum;
import com.team.Spring.Exception.RoomFullException;
import com.team.Spring.Repository.RoomRepository;

import jakarta.transaction.Transactional;

@Service
public class RoomService {
	private final RoomRepository roomRepo;

	public RoomService(RoomRepository roomRepo) {
		super();
		this.roomRepo = roomRepo;
	}
	
	public RoomEntity getRoom(String roomId) {
		return roomRepo.getRoom(roomId);
	}

	public List<RoomListItemDTO> getMyRooms(UserAuthEntity user) {
		return roomRepo.getMyRooms(user);
	}

	public List<RoomListItemDTO> getJoinedRooms(UserAuthEntity user) {
		return roomRepo.getJoinedRooms(user);
	}

	public List<RoomListItemDTO> getPublicRooms(UserAuthEntity user) {
		return roomRepo.getPublicRooms(user);
	}

	@Transactional
	public void createRoom(CreateRoomDTO roomDetails, UserAuthEntity createdBy) {
		RoomEntity room = roomRepo.save(new RoomEntity(roomDetails.getName(), roomDetails.getDescription(),
				roomDetails.getVisibility(), roomDetails.getJoinPolicy(), roomDetails.getPreferredCountry(),
				roomDetails.getMaxMembers(), createdBy));
		room.addMember(createdBy);
	}

	@Transactional
	public void updateRoom(String roomId, CreateRoomDTO roomDetails, UserAuthEntity user) {
		RoomEntity room = roomRepo.findById(roomId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid Room ID: " + roomId));
		if (!(room.getCreatedBy().getId().equals(user.getId()))) throw new AccessDeniedException("You are not an admin of this room!");
		if (room.getMaxMembers() <= room.getMemberCount()) throw new RoomFullException("Sorry! Room is already full.");
		room.setName(roomDetails.getName());
		room.setDescription(roomDetails.getDescription());
		room.setVisibility(roomDetails.getVisibility());
		room.setJoinPolicy(roomDetails.getJoinPolicy());
		room.setPreferredCountry(roomDetails.getPreferredCountry());
		room.setMaxMembers(roomDetails.getMaxMembers());
	}

	public void deleteRoom(String roomId, UserAuthEntity user) {
		RoomEntity room = roomRepo.findById(roomId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid Room ID: " + roomId));
		if (!(room.getCreatedBy().getId().equals(user.getId()))) throw new AccessDeniedException("You are not an admin of this room!");
		roomRepo.delete(room);
	}

	@Transactional
	public void joinRoom(String roomId, UserAuthEntity user) {
		RoomEntity room = roomRepo.findById(roomId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid Room ID: " + roomId));
		if (checkMembership(roomId, user.getId())) return;
		if (!room.isFull() && !(room.getJoinPolicy() == JoinPolicyEnum.CLOSED))
			room.addMember(user);
	}

	@Transactional
	public void leaveRoom(String roomId, UserAuthEntity user) {
		RoomEntity room = roomRepo.findById(roomId)
				.orElseThrow(() -> new IllegalArgumentException("Invalid Room ID: " + roomId));
		if (room.getCreatedBy().equals(user)) {
			throw new IllegalStateException("Room owner cannot leave");
		}

		if (!room.getMembers().contains(user)) {
			throw new IllegalStateException("User is not a member");
		}
		
		room.removeMember(user);
	}
	
	@Transactional
	public boolean checkMembership(String roomId, Long userId) {
		return roomRepo.existsByIdAndMembers_Id(roomId, userId);
	}

}
