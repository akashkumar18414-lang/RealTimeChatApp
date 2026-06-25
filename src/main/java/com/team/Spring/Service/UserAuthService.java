package com.team.Spring.Service;

import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.team.Spring.DTO.SignupFormDTO;
import com.team.Spring.Entity.UserAuthEntity;
import com.team.Spring.Repository.UserAuthRepository;

@Service
public class UserAuthService implements UserDetailsService{

	private final UserAuthRepository repo;
	private final PasswordEncoder encoder;

	public UserAuthService(UserAuthRepository repo, PasswordEncoder encoder) {
		this.repo = repo;
		this.encoder = encoder;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return repo.findByUsername(username);
	}
	public UserAuthEntity createUser(SignupFormDTO form, String ip, String userAgent) {

		Long phone = null;
		if (form.getPhone() != null && !form.getPhone().isBlank()) {
			System.out.print(form.getPhone());
			phone = Long.parseLong(form.getPhone());
		}

		UserAuthEntity user = new UserAuthEntity(form.getFullName(), form.getUsername(),
				encoder.encode(form.getPassword()), form.getEmail(), phone);

		// TAC fields
		user.setAcceptedTerms(true);
		user.setTermsVersion("v1.0");
		user.setAcceptedAt(LocalDateTime.now());
		user.setAcceptedIp(ip);
		user.setAcceptedUserAgent(userAgent);

		return repo.save(user);
	}

	public boolean usernameExists(String username) {
		return repo.existsByUsername(username);
	}

	public boolean emailExists(String email) {
		return repo.existsByEmail(email);
	}

	public boolean phoneExists(Long phone) {
		return repo.existsByPhone(phone);
	}

	public UserAuthEntity findUserById(Long userId) {
		return repo.findById(userId).orElseThrow(() -> new IllegalArgumentException("Invalid User ID: " + userId));
	}

	public UserAuthEntity findUserByUsername(String username) {
		return repo.findByUsername(username);
	}

	public void updatePassword(String email, String newPassword) {
		repo.updatePasswordByEmail(newPassword, email);
	}

}
