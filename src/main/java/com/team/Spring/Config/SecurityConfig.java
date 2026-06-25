package com.team.Spring.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableScheduling
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/login", "/error", "/forgot-password", "/send-otp", "/verify-otp",
								"/reset-password", "/css/**", "/js/**", "/images/**", "/favicon.ico")
						.permitAll().requestMatchers("/home", "/chat/**", "/api/**").authenticated().anyRequest().permitAll())
				.formLogin(form -> form.loginPage("/login") // GET /login
						.loginProcessingUrl("/perform_login") // POST /login
						.usernameParameter("username") // expect <input name="username">
						.passwordParameter("password") // expect <input name="password">
						.failureUrl("/login?error=true").defaultSuccessUrl("/home").permitAll())
//				.oauth2Login(oauth -> oauth.loginPage("/login").defaultSuccessUrl("/home", true))
				.logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/login?logout=true")
						.invalidateHttpSession(true).clearAuthentication(true).deleteCookies("JSESSIONID").permitAll())
				.exceptionHandling(exception -> exception.accessDeniedPage("/error/403")).build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
