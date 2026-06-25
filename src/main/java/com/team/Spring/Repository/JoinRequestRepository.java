package com.team.Spring.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.Spring.Entity.JoinRequestEntity;
import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Enum.JoinRequestStatusEnum;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequestEntity, Long> {
	boolean existsByRoom_IdAndUserAndStatus(String room, UserAuthEntity user, JoinRequestStatusEnum status);
	JoinRequestEntity findByRoom_IdAndUser(String roomId, UserAuthEntity user);
}
