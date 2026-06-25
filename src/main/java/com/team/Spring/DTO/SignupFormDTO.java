package com.team.Spring.DTO;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupFormDTO {

	@NotBlank(message = "Full Name is required")
	@Size(min = 3, max = 50, message = "Full Name must be between 3 and 50 characters")
	private String fullName;

	@NotBlank(message = "Username is required")
	@Size(min = 4, max = 20, message = "Username must be between 4 and 20 characters")
	@Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "Username can contain letters, numbers, dot and underscore only")
	private String username;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	// Optional phone (null allowed, empty allowed, but if present must be valid)
	@Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Phone number must be 10 digits starting with 6-9")
	private String phone;

	@NotBlank(message = "Password is required")
	@Size(min = 6, message = "Password must be at least 6 characters")
	@Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).*$", message = "Password must contain at least one uppercase letter, one lowercase letter and one digit")
	private String password;

	@NotBlank(message = "Confirm password is required")
	private String confirmPassword;

	@AssertTrue(message = "You must accept the terms and conditions")
	private boolean terms;

	// Custom validation for password match
	@AssertTrue(message = "Passwords do not match")
	public boolean isPasswordMatching() {
		if (password == null || confirmPassword == null)
			return true;
		return password.equals(confirmPassword);
	}

	// getters + setters…
	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getConfirmPassword() {
		return confirmPassword;
	}

	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}

	public boolean isTerms() {
		return terms;
	}

	public void setTerms(boolean terms) {
		this.terms = terms;
	}
}
