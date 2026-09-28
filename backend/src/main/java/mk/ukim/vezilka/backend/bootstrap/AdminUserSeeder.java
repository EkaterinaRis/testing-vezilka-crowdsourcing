package mk.ukim.vezilka.backend.bootstrap;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.enums.Role;
import mk.ukim.vezilka.backend.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminUserSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final String ADMIN_PASSWORD = "password123";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserSeeder(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            return;
        }

        AppUser admin = new AppUser();
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setVerified(true);
        admin.setBlocked(false);
        admin.setPoints(0);
        admin.setLevel(1);
        admin.setTrustScore(0);
        admin.setCreatedAt(LocalDateTime.now());

        appUserRepository.save(admin);
    }
}
