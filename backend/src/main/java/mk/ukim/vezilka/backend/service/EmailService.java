package mk.ukim.vezilka.backend.service;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void sendVerificationEmail(String to, String code);
}
