package mk.ukim.vezilka.backend.service;

import org.springframework.stereotype.Service;

@Service
public interface VerificationCodeService {
    void generateAndSendCode(String email);

    boolean verifyCode(String email, String code);
}
