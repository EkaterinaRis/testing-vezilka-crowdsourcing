package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.service.EmailService;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendVerificationEmail(String to, String code) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email cannot be empty");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Везилка - Код за потврда на регистрација");
        message.setText("Здраво,\n\nТвојот код за потврда е: " + code + "\n\nОвој код е валиден 10 минути.\n\nПоздрав,\nТимот на Везилка");

        mailSender.send(message);

    }
}
