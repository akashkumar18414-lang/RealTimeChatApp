package com.team.Spring.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.team.Spring.Service.OtpService;
import com.team.Spring.Service.UserAuthService;

import jakarta.servlet.http.HttpServletResponse;

@Controller
public class ForgotPasswordController {

	private OtpService otpService;
	private UserAuthService userAuthService;

	public ForgotPasswordController(OtpService otpService, UserAuthService userAuthService) {
		this.otpService = otpService;
		this.userAuthService = userAuthService;
	}

	@GetMapping("/forgot-password")
	public String forgotPasswordPage() {
		return "forgot-password";
	}

	@PostMapping("/send-otp")
	public String sendOtp(@RequestParam String username, Model model, HttpServletResponse response) {
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader("Expires", 0);
		if (!userAuthService.usernameExists(username)) {
			model.addAttribute("error", "User not registered!");
			return "forgot-password";
		}

		otpService.generateAndSendOtp(userAuthService.findUserByUsername(username).getEmail());
		model.addAttribute("email", userAuthService.findUserByUsername(username).getEmail());
		return "verify-otp";
	}

	@PostMapping("/verify-otp")
	public String verifyOtp(HttpServletResponse response, @RequestParam String email, @RequestParam String otp,
			Model model) {
		response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader("Expires", 0);
		System.out.println(otp);
		if (otpService.verifyOtp(email, otp)) {
			model.addAttribute("email", email);
			return "reset-password";
		} else {
			model.addAttribute("email", email);
			model.addAttribute("error", "Invalid or expired OTP!");
			return "verify-otp";
		}
	}

	@PostMapping("/reset-password")
	public String resetPassword(@RequestParam String email, @RequestParam String newPassword,
			RedirectAttributes redirectAttributes) {
		userAuthService.updatePassword(email, newPassword);
		redirectAttributes.addFlashAttribute("message", "Password updated successfully!");
		return "redirect:/login";
	}
}
