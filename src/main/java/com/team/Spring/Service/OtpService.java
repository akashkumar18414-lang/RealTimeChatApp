package com.team.Spring.Service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.team.Spring.Entity.OtpEntity;
import com.team.Spring.Repository.OtpRepository;

@Service
public class OtpService {

    private final OtpRepository otpRepo;
    private final EmailService emailService;
    
    public OtpService(OtpRepository otpRepo, EmailService emailService) {
		super();
		this.otpRepo = otpRepo;
		this.emailService = emailService;
	}

	public void generateAndSendOtp(String toEmail) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        OtpEntity otpEntity = new OtpEntity(toEmail, otp, LocalDateTime.now().plusMinutes(5));
        otpRepo.save(otpEntity);

        emailService.sendEmail(toEmail, "OTP for Password Reset", "Your OTP is: " + otp);
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntity record = otpRepo.findTopByEmailAndVerifiedOrderByExpiryTimeDesc(email, false);

        if (record != null && record.getExpiryTime().isAfter(LocalDateTime.now()) && record.getOtp().equals(otp)) {
            record.setVerified(true);
            otpRepo.save(record);
            return true;
        }
        return false;
    }
    
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteOldOrVerifiedOtps() {
        otpRepo.deleteAllByVerifiedTrueOrExpiryTimeBefore(LocalDateTime.now());
    }

}
