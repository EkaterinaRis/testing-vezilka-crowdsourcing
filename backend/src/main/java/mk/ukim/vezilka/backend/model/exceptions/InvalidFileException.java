package mk.ukim.vezilka.backend.model.exceptions;

public class InvalidFileException extends RuntimeException {
    public InvalidFileException() {
        super("Please select a file to upload!");
    }
}
