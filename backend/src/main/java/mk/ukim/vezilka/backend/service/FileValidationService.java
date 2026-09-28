package mk.ukim.vezilka.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileValidationService {
    void validate(MultipartFile file) throws IOException;

    String detectMimeType(MultipartFile file) throws IOException;

    boolean isSupported(MultipartFile file) throws IOException;
}
