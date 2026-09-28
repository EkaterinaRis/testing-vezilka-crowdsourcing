package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.exceptions.InvalidCredentialsException;
import mk.ukim.vezilka.backend.model.exceptions.UserAlreadyExistsException;
import mk.ukim.vezilka.backend.model.exceptions.UserNotFoundException;
import mk.ukim.vezilka.backend.repository.AppUserRepository;
import mk.ukim.vezilka.backend.service.AuthService;
import mk.ukim.vezilka.backend.service.UserService;
import mk.ukim.vezilka.backend.service.VerificationCodeService;
import mk.ukim.vezilka.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.InvalidParameterException;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private final AppUserRepository appUserRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final VerificationCodeService verificationCodeService;


    public AuthServiceImpl(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, UserService userService, VerificationCodeService verificationCodeService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.verificationCodeService = verificationCodeService;
    }

    @Override
    public AppUser register(String firstName, String lastName, String email, String password, String code) {
        if(firstName == null || firstName.isEmpty())
            throw new InvalidParameterException("First name can't be empty!");
        if(lastName == null || lastName.isEmpty())
            throw new InvalidParameterException("Last name can't be empty!");
        if(email == null || email.isEmpty())
            throw new InvalidParameterException("Email can't be empty!");
        if(password == null || password.isEmpty())
            throw new InvalidParameterException("Password name can't be empty!");

        if(appUserRepository.findByEmail(email).isPresent())
            throw new UserAlreadyExistsException(email);
        boolean isValidCode = verificationCodeService.verifyCode(email, code);
        if (!isValidCode) {
            throw new InvalidParameterException("Invalid verification code");
        }
        AppUser user = new AppUser(firstName, lastName, email, passwordEncoder.encode(password), true);
        return appUserRepository.save(user);
    }

    @Override
    public AppUser login(String email, String password) {
        AppUser user = userService.getUserByEmail(email);
        if(!passwordEncoder.matches(password, user.getPassword()))
            throw new InvalidCredentialsException();

        return user;
    }
}
