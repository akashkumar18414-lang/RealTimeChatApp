package com.team.Spring.Controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.team.Spring.DTO.SignupFormDTO;
import com.team.Spring.Service.UserAuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
public class AuthController {

	private final UserAuthService userService;
	private final AuthenticationManager authenticationManager;

	public AuthController(UserAuthService userService, AuthenticationManager authenticationManager) {
		this.userService = userService;
		this.authenticationManager = authenticationManager;
	}

	@GetMapping({ "", "/" })
	public String redirectToHome() {
		return "redirect:/home";
	}
	@GetMapping("/error/403")
	public String accessDeniedPage() {
		return "error/403";
	}

	@GetMapping("/login")
	public String loginPage() {
		return "login";
	}

	@GetMapping("/signup")
	public String signupPage(Model model) {
		model.addAttribute("signupForm", new SignupFormDTO());
		return "signup";
	}

	@PostMapping("/signup")
	public String signup(@Valid @ModelAttribute("signupForm") SignupFormDTO form, BindingResult result,
			HttpServletRequest request, Model model) {

		if (result.hasErrors()) {
			return "signup";
		}

		if (!form.getPassword().equals(form.getConfirmPassword())) {
			result.rejectValue("confirmPassword", "password.mismatch", "Passwords do not match");
			return "signup";
		}

		if (!form.isTerms()) {
			result.rejectValue("terms", "terms.required", "You must accept Terms & Conditions");
			return "signup";
		}

		if (userService.usernameExists(form.getUsername())) {
			result.rejectValue("username", "username.exists", "Username already exists");
			return "signup";
		}

		if (userService.emailExists(form.getEmail())) {
			result.rejectValue("email", "email.exists", "Email already registered");
			return "signup";
		}

		if (form.getPhone().length() != 10) {
			result.rejectValue("phone", "phone.error", "Phone number is invalid");
			return "signup";
		}
		
		if (userService.phoneExists(Long.parseLong(form.getPhone()))) {
			result.rejectValue("phone", "phone.exists", "Phone number already registered");
			return "signup";
		}

		userService.createUser(form, request.getRemoteAddr(), request.getHeader("User-Agent"));

		// Auto-login after sign-up
		UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(form.getUsername(),
				form.getPassword());

		Authentication auth = authenticationManager.authenticate(token);

		SecurityContext context = SecurityContextHolder.getContext();
		context.setAuthentication(auth);

		HttpSession session = request.getSession(true);
		session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

		return "redirect:/home";
	}
	
}
