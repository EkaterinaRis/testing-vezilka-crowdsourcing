package mk.ukim.vezilka.backend.model.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String email) {
        super("User with email " + email + " can't be found");
    }
}
