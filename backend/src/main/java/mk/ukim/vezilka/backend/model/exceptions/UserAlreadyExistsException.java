package mk.ukim.vezilka.backend.model.exceptions;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String email) {
        super("User with email: " + email + " already exists!");
    }
}
