package mk.ukim.vezilka.backend.web.controller;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.enums.Role;
import mk.ukim.vezilka.backend.model.exceptions.UserAlreadyExistsException;
import mk.ukim.vezilka.backend.service.AuthService;
import mk.ukim.vezilka.backend.service.UserService;
import mk.ukim.vezilka.backend.service.VerificationCodeService;
import mk.ukim.vezilka.backend.util.JwtUtil;
import mk.ukim.vezilka.backend.web.request.EmailVerificationRequest;
import mk.ukim.vezilka.backend.web.request.LoginRequest;
import mk.ukim.vezilka.backend.web.request.RegisterRequest;
import mk.ukim.vezilka.backend.web.response.AuthResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.InvalidParameterException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final VerificationCodeService verificationCodeService;

    public AuthController(AuthService authService, JwtUtil jwtUtil, UserService userService, VerificationCodeService verificationCodeService) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.verificationCodeService = verificationCodeService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            AppUser user = authService.register(request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getCode());
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name()
            );

            AuthResponse response = new AuthResponse(
                    token,
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getAvatarUrl(),
                    !user.getRole().equals(Role.USER),
                    user.getCreatedAt()
            );

            return ResponseEntity.ok(response);
        } catch (UserAlreadyExistsException ex) {
            return ResponseEntity.status(409).build();
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AppUser user = authService.login(request.getEmail(), request.getPassword());
            if (user.isBlocked())
                return ResponseEntity.status(423).build();

            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole().name()
            );

            AuthResponse response = new AuthResponse(
                    token,
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getAvatarUrl(),
                    !user.getRole().equals(Role.USER),
                    user.getCreatedAt()
            );

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/register/send-code")
    public ResponseEntity<String> sendVerificationCode(@RequestBody EmailVerificationRequest request) {
        try {
            verificationCodeService.generateAndSendCode(request.getEmail());
            return ResponseEntity.ok("Кодот е успешно испратен.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Грешка при испраќање на кодот.");
        }
    }

    @GetMapping
    public ResponseEntity<AuthResponse> getUserByToken(Authentication authentication) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        AuthResponse response = new AuthResponse(user, jwtToken);
        return ResponseEntity.ok(response);
    }
}
