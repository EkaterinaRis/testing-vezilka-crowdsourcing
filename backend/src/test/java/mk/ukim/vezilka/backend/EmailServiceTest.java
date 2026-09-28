package mk.ukim.vezilka.backend.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Test
    void sendVerificationEmailSuccess() {
        String to = "test@example.com";
        String code = "123456";

        emailService.sendVerificationEmail(to, code);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertEquals(to, message.getTo()[0]);
        assertEquals("Везилка - Код за потврда на регистрација", message.getSubject());
        assertTrue(message.getText().contains(code));
    }

    @Test
    void sendVerificationEmailThrowsWhenToIsNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            emailService.sendVerificationEmail(null, "123456");
        });
    }

    @Test
    void sendVerificationEmailThrowsWhenToIsEmpty() {
        assertThrows(IllegalArgumentException.class, () -> {
            emailService.sendVerificationEmail("", "123456");
        });
    }

    @Test
    void sendVerificationEmailThrowsWhenToIsBlank() {
        assertThrows(IllegalArgumentException.class, () -> {
            emailService.sendVerificationEmail("   ", "123456");
        });
    }
}