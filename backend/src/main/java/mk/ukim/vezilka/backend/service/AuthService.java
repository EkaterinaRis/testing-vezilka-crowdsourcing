package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.AppUser;

public interface AuthService {
    AppUser register(String firstName, String lastName, String email, String password, String code);
    AppUser login(String email, String password);
}
