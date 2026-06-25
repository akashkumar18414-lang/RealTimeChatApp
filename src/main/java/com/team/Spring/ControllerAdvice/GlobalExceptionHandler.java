package com.team.Spring.ControllerAdvice;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(AccessDeniedException.class)
	public String accessDeniedHandler(AccessDeniedException e, Model model) {
		model.addAttribute("error", e.getMessage());
		return "error/403";
	}

	@MessageExceptionHandler(AccessDeniedException.class)
	@SendToUser("/queue/errors")
	public String accessDeniedMessageHandler(AccessDeniedException e) {
		return e.getMessage();
	}
}
