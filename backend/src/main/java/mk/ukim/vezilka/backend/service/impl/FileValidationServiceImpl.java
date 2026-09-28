package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.service.FileValidationService;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
public class FileValidationServiceImpl implements FileValidationService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf",
            "doc",
            "docx",
            "txt",
            "pptx",

            "png",
            "jpg",
            "jpeg",

            "mp3",
            "wav",
            "ogg",
            "flac",
            "aac",
            "m4a",

            "mp4",
            "mov",
            "avi",
            "mkv",
            "webm",
            "wmv"
    );

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "text/plain",
            "image/png",
            "image/jpeg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/flac",
            "audio/aac",
            "audio/mp4",
            "audio/x-m4a",

            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska",
            "video/webm",
            "video/x-ms-wmv"
    );

    private final Tika tika = new Tika();

    @Override
    public void validate(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Датотеката е празна");
        }

        validateExtension(file);
        validateMimeType(file);
        validateWithTika(file);
    }

    @Override
    public String detectMimeType(MultipartFile file) throws IOException {
        return tika.detect(file.getInputStream(), file.getOriginalFilename());
    }

    @Override
    public boolean isSupported(MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String mime = file.getContentType();
        String tikaMime = tika.detect(file.getInputStream());

        return ALLOWED_EXTENSIONS.contains(ext)
                && ALLOWED_MIME_TYPES.contains(mime)
                && ALLOWED_MIME_TYPES.contains(tikaMime);
    }

    private void validateExtension(MultipartFile file) {
        String filename = file.getOriginalFilename();

        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("Фајлот мора да има екстензија");
        }

        String ext = getExtension(filename);

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Форматот на датотеката не е поддржан: " + ext);
        }
    }

    private void validateMimeType(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException("Нема MIME тип");
        }

        if (!ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Неподржан MIME тип: " + contentType);
        }
    }

    private void validateWithTika(MultipartFile file) throws IOException {
        String detectedType = tika.detect(file.getInputStream(), file.getOriginalFilename());

        if (!ALLOWED_MIME_TYPES.contains(detectedType)) {
            throw new IllegalArgumentException(
                    "Несовпаѓање на потписот на датотеката или неподдржан тип: " + detectedType
            );
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase();
    }
}