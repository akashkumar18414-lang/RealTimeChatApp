package com.team.Spring.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.team.Spring.DTO.RoomListItemDTO;
import com.team.Spring.Entity.RoomEntity;
import com.team.Spring.Entity.UserAuthEntity;

@Repository
public interface RoomRepository extends JpaRepository<RoomEntity, String> {
	@Query("SELECT r FROM RoomEntity r LEFT JOIN FETCH r.members WHERE r.id = :roomId")
	RoomEntity getRoom(@Param("roomId") String roomId);

	@Query("SELECT new com.team.Spring.DTO.RoomListItemDTO("
			+ "r.id, r.name, r.description, r.visibility, r.joinPolicy, r.preferredCountry, COUNT(m), r.maxMembers, r.updatedAt) "
			+ "FROM RoomEntity r LEFT JOIN r.members m WHERE r.createdBy = :user GROUP BY r.id")
	List<RoomListItemDTO> getMyRooms(@Param("user") UserAuthEntity user);

	@Query("SELECT new com.team.Spring.DTO.RoomListItemDTO("
			+ "r.id, r.name, r.description, r.visibility, r.joinPolicy, r.preferredCountry, COUNT(m), r.maxMembers, r.updatedAt) "
			+ "FROM RoomEntity r LEFT JOIN r.members m JOIN r.members u WHERE u = :user AND r.createdBy != :user GROUP BY r.id")
	List<RoomListItemDTO> getJoinedRooms(@Param("user") UserAuthEntity user);

	@Query("SELECT new com.team.Spring.DTO.RoomListItemDTO("
			+ "r.id, r.name, r.description, r.visibility, r.joinPolicy, r.preferredCountry, COUNT(m), r.maxMembers, r.updatedAt) "
			+ "FROM RoomEntity r LEFT JOIN r.members m WHERE r.visibility = 'PUBLIC' AND r.createdBy != :user AND r.id not in (SELECT rr.id FROM RoomEntity rr JOIN rr.members mm WHERE mm = :user) GROUP BY r.id")
	List<RoomListItemDTO> getPublicRooms(@Param("user") UserAuthEntity user);

	boolean existsByIdAndMembers_Id(String roomId, Long userId);

}
