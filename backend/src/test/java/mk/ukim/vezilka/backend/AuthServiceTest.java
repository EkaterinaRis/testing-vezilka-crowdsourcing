package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.exceptions.InvalidCredentialsException;
import mk.ukim.vezilka.backend.model.exceptions.UserAlreadyExistsException;
import mk.ukim.vezilka.backend.repository.AppUserRepository;
import mk.ukim.vezilka.backend.service.UserService;
import mk.ukim.vezilka.backend.service.VerificationCodeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.InvalidParameterException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private VerificationCodeService verificationCodeService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerSuccess() {
        when(appUserRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppUser result = authService.register("John", "Doe", "john@example.com", "password123", "123456");

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("john@example.com", result.getEmail());
        assertEquals("encodedPassword", result.getPassword());
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    void registerWithEmptyFirstName() {
        assertThrows(InvalidParameterException.class, () -> {
            authService.register("", "Doe", "john@example.com", "password123", "123456");
        });
    }

    @Test
    void registerWithNullFirstName() {
        assertThrows(InvalidParameterException.class, () -> {
            authService.register(null, "Doe", "john@example.com", "password123", "123456");
        });
    }

    @Test
    void registerWithEmptyLastName() {
        assertThrows(InvalidParameterException.class, () -> {
            authService.register("John", "", "john@example.com", "password123", "123456");
        });
    }

    @Test
    void registerWithEmptyEmail() {
        assertThrows(InvalidParameterException.class, () -> {
            authService.register("John", "Doe", "", "password123", "123456");
        });
    }

    @Test
    void registerWithEmptyPassword() {
        assertThrows(InvalidParameterException.class, () -> {
            authService.register("John", "Doe", "john@example.com", "", "123456");
        });
    }

    @Test
    void registerWhenUserAlreadyExists() {
        when(appUserRepository.findByEmail(anyString())).thenReturn(Optional.of(new AppUser()));

        assertThrows(UserAlreadyExistsException.class, () -> {
            authService.register("John", "Doe", "john@example.com", "password123", "123456");
        });
    }

    @Test
    void registerWithInvalidVerificationCode() {
        when(appUserRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(false);

        assertThrows(InvalidParameterException.class, () -> {
            authService.register("John", "Doe", "john@example.com", "password123", "wrongCode");
        });
    }

    @Test
    void loginSuccess() {
        AppUser user = new AppUser();
        user.setPassword("encodedPassword");

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        AppUser result = authService.login("john@example.com", "password123");

        assertNotNull(result);
        assertEquals(user, result);
        verify(passwordEncoder).matches("password123", "encodedPassword");
    }

    @Test
    void loginWithInvalidPassword() {
        AppUser user = new AppUser();
        user.setPassword("encodedPassword");

        when(userService.getUserByEmail(anyString())).thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> {
            authService.login("john@example.com", "wrongPassword");
        });
    }
}