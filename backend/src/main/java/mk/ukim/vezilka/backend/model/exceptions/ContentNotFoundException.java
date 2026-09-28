package mk.ukim.vezilka.backend.model.exceptions;

public class ContentNotFoundException extends RuntimeException {
    public ContentNotFoundException(Long id) {
        super("File with id " + id + " not found!");
    }
}
