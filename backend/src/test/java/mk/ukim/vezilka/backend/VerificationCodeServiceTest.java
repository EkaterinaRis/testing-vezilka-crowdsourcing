package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.VerificationCode;
import mk.ukim.vezilka.backend.repository.VerificationCodeRepository;
import mk.ukim.vezilka.backend.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationCodeServiceTest {

    @Mock
    private VerificationCodeRepository codeRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private VerificationCodeServiceImpl verificationCodeService;

    @Test
    void generateAndSendCodeSendsEmailAndSavesToDb() {
        String email = "test@example.com";

        verificationCodeService.generateAndSendCode(email);

        verify(codeRepository).deleteByEmail(email);
        verify(codeRepository).save(any(VerificationCode.class));

        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendVerificationEmail(eq(email), codeCaptor.capture());

        String capturedCode = codeCaptor.getValue();
        assertNotNull(capturedCode);
        assertEquals(6, capturedCode.length());
        assertTrue(capturedCode.matches("\\d{6}"));
    }

    @Test
    void verifyCodeReturnsTrueWhenCodeIsValid() {
        String email = "test@example.com";
        String code = "123456";
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(codeRepository.findByEmailAndCode(email, code)).thenReturn(Optional.of(verificationCode));

        boolean result = verificationCodeService.verifyCode(email, code);

        assertTrue(result);
        verify(codeRepository).delete(verificationCode);
    }

    @Test
    void verifyCodeReturnsFalseWhenCodeNotFound() {
        String email = "test@example.com";
        String code = "000000";

        when(codeRepository.findByEmailAndCode(email, code)).thenReturn(Optional.empty());

        boolean result = verificationCodeService.verifyCode(email, code);

        assertFalse(result);
        verify(codeRepository, never()).delete(any());
    }

    @Test
    void verifyCodeReturnsFalseWhenCodeIsExpired() {
        String email = "test@example.com";
        String code = "123456";
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setExpiresAt(LocalDateTime.now().minusMinutes(5));

        when(codeRepository.findByEmailAndCode(email, code)).thenReturn(Optional.of(verificationCode));

        boolean result = verificationCodeService.verifyCode(email, code);

        assertFalse(result);
        verify(codeRepository, never()).delete(any());
    }
}