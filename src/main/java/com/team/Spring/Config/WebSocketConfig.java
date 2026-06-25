package com.team.Spring.Config;

import java.security.Principal;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.team.Spring.Service.RoomService;
import com.team.Spring.Service.UserAuthService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final RoomService roomService;
	private final UserAuthService userService;

	public WebSocketConfig(RoomService roomService, UserAuthService userService) {
		super();
		this.roomService = roomService;
		this.userService = userService;
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/chat").setAllowedOrigins("http://localhost:8084").withSockJS();
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.setApplicationDestinationPrefixes("/app");
		registry.enableSimpleBroker("/topic");
	}

	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.interceptors(new ChannelInterceptor() {

			@Override
			public Message<?> preSend(Message<?> message, MessageChannel channel) {

				StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
				if (message.getHeaders().get("simpUser") instanceof Principal principal)
					accessor.setUser(principal);

				if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
					String destination = accessor.getDestination();
					Principal principal = accessor.getUser();
					if (principal == null || destination == null)
//						throw new AccessDeniedException("Unauthenticated");
						return null;

					Long userId = userService.findUserByUsername(principal.getName()).getId();

					if (destination.startsWith("/user/")) {
						return message;
					}

					// GENERAL CHAT → allowed
					if ("/topic/chat/general".equals(destination)) {
						return message;
					}

					// ROOM CHAT
					if (destination.startsWith("/topic/chat/room/")) {
						String roomId = destination.substring(destination.lastIndexOf("/") + 1);
						if (!roomService.checkMembership(roomId, userId)) {

//							throw new AccessDeniedException("Not allowed to subscribe");
							return null;
						}
						return message;
					}

					// EVERYTHING ELSE → BLOCK
//					throw new AccessDeniedException("Invalid destination");
					return null;
				}

				return message;
			}
		});
	}

}
