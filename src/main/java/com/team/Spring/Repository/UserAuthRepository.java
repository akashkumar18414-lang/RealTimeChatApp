package com.team.Spring.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.team.Spring.Entity.UserAuthEntity;

import jakarta.transaction.Transactional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuthEntity, Long> {
    UserAuthEntity findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(Long phone);
    
    @Modifying
    @Transactional
    @Query("UPDATE UserAuthEntity u SET u.password = :password WHERE u.email = :email")
    void updatePasswordByEmail(String password, String email);
}
