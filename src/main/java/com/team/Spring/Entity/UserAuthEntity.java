package com.team.Spring.Entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;

@Entity
@Table(name = "userAuth")
public class UserAuthEntity implements UserDetails {

	private static final long serialVersionUID = 864002985569872843L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String fullName;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(unique = true)
	private Long phone;
	
	@Column
	private boolean chatLocked = false;

	@Column
	private boolean notificationsEnabled = true;

	// ---- Terms & Conditions ----
	@Column(nullable = false)
	private boolean acceptedTerms = false;

	private String termsVersion;

	private LocalDateTime acceptedAt;

	private String acceptedIp;

	@Column(length = 512)
	private String acceptedUserAgent;

	// ---- Spring Security ----
	private boolean enabled = true;
	private boolean accountNonExpired = true;
	private boolean accountNonLocked = true;
	private boolean credentialsNonExpired = true;

	private LocalDateTime createdAt = LocalDateTime.now();
	@Column
	private LocalDateTime updatedAt = LocalDateTime.now();

	public UserAuthEntity() {
	}

	// Builder-style constructor
	public UserAuthEntity(String fullName, String username, String password, String email, Long phone) {
		this.fullName = fullName;
		this.username = username;
		this.password = password;
		this.email = email;
		this.phone = phone;
	}

	// --- UserDetails required methods ---
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.emptyList(); // no roles for now
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return accountNonExpired;
	}

	@Override
	public boolean isAccountNonLocked() {
		return accountNonLocked;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return credentialsNonExpired;
	}

	@Override
	public boolean isEnabled() {
		return enabled;
	}
	
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
	    if (!(obj instanceof UserAuthEntity)) return false;
		UserAuthEntity other = (UserAuthEntity) obj;
		return id != null && id.equals(other.getId());
	}

	// ---- Getters + setters ----
	public Long getId() {
		return id;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getFullName() {
		return fullName;
	}
	
	public String getFirstName() {
		return fullName.split("\\s+")[0];
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getEmail() {
		return email;
	}

	public Long getPhone() {
		return phone;
	}

	public void setPhone(Long phone) {
		this.phone = phone;
	}

	public boolean isAcceptedTerms() {
		return acceptedTerms;
	}

	public void setAcceptedTerms(boolean acceptedTerms) {
		this.acceptedTerms = acceptedTerms;
	}

	public String getTermsVersion() {
		return termsVersion;
	}

	public void setTermsVersion(String termsVersion) {
		this.termsVersion = termsVersion;
	}

	public LocalDateTime getAcceptedAt() {
		return acceptedAt;
	}

	public void setAcceptedAt(LocalDateTime acceptedAt) {
		this.acceptedAt = acceptedAt;
	}

	public String getAcceptedIp() {
		return acceptedIp;
	}

	public void setAcceptedIp(String acceptedIp) {
		this.acceptedIp = acceptedIp;
	}

	public String getAcceptedUserAgent() {
		return acceptedUserAgent;
	}

	public void setAcceptedUserAgent(String acceptedUserAgent) {
		this.acceptedUserAgent = acceptedUserAgent;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	public boolean isChatLocked() {
	    return chatLocked;
	}

	public void setChatLocked(boolean chatLocked) {
	    this.chatLocked = chatLocked;
	}

	public boolean isNotificationsEnabled() {
	    return notificationsEnabled;
	}

	public void setNotificationsEnabled(boolean notificationsEnabled) {
	    this.notificationsEnabled = notificationsEnabled;
	}

}
