package com.team.Spring.Repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.Spring.Entity.OtpEntity;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity, Integer> {
	OtpEntity findTopByEmailAndVerifiedOrderByExpiryTimeDesc(String email, boolean verified);
	void deleteAllByVerifiedTrueOrExpiryTimeBefore(LocalDateTime time);
}
