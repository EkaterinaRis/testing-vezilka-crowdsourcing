package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.VerificationCode;
import mk.ukim.vezilka.backend.repository.VerificationCodeRepository;
import mk.ukim.vezilka.backend.service.EmailService;
import mk.ukim.vezilka.backend.service.VerificationCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {
    private static final Logger log = LoggerFactory.getLogger(VerificationCodeServiceImpl.class);

    private final VerificationCodeRepository codeRepository;
    private final EmailService emailService;

    public VerificationCodeServiceImpl(VerificationCodeRepository codeRepository, EmailService emailService) {
        this.codeRepository = codeRepository;
        this.emailService = emailService;
    }

    @Transactional
    @Override
    public void generateAndSendCode(String email) {
        codeRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));

        VerificationCode verificationCode = new VerificationCode(email, code, LocalDateTime.now().plusMinutes(10));
        codeRepository.save(verificationCode);

        try {
            emailService.sendVerificationEmail(email, code);
        } catch (Exception ex) {
            log.warn("Verification email could not be sent to {}. Code [{}] remains stored for local/dev validation.", email, code, ex);
        }
    }

    @Transactional
    @Override
    public boolean verifyCode(String email, String code) {
        Optional<VerificationCode> optionalCode = codeRepository.findByEmailAndCode(email, code);

        if (optionalCode.isEmpty()) {
            return false;
        }

        VerificationCode verificationCode = optionalCode.get();

        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        codeRepository.delete(verificationCode);
        return true;
    }
}
