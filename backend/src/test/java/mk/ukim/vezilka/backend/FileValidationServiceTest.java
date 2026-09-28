package mk.ukim.vezilka.backend.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileValidationServiceTest {

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private FileValidationServiceImpl fileValidationService;

    private static final byte[] PNG_BYTES = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    // ZIP Header (PK..). Tika detects this as application/zip, which is NOT in ALLOWED_MIME_TYPES.
    private static final byte[] ZIP_BYTES = {0x50, 0x4B, 0x03, 0x04};

    @BeforeEach
    void setUp() throws IOException {
        lenient().when(multipartFile.getOriginalFilename()).thenReturn("image.png");
        lenient().when(multipartFile.getContentType()).thenReturn("image/png");
        lenient().when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(PNG_BYTES));
    }

    @Test
    void validateSuccess() throws IOException {
        assertDoesNotThrow(() -> fileValidationService.validate(multipartFile));
    }

    @Test
    void validateThrowsWhenFileIsNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(null);
        });
    }

    @Test
    void validateThrowsWhenFileIsEmpty() {
        when(multipartFile.isEmpty()).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenFilenameIsNull() {
        when(multipartFile.getOriginalFilename()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenNoExtension() {
        when(multipartFile.getOriginalFilename()).thenReturn("filename");

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenExtensionIsNotAllowed() {
        when(multipartFile.getOriginalFilename()).thenReturn("file.exe");

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenContentTypeIsNull() {
        when(multipartFile.getContentType()).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenContentTypeIsNotAllowed() {
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void validateThrowsWhenTikaDetectsInvalidType() throws IOException {
        when(multipartFile.getOriginalFilename()).thenReturn("file.txt");
        when(multipartFile.getContentType()).thenReturn("text/plain");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(ZIP_BYTES));

        assertThrows(IllegalArgumentException.class, () -> {
            fileValidationService.validate(multipartFile);
        });
    }

    @Test
    void detectMimeTypeReturnsString() throws IOException {
        String result = fileValidationService.detectMimeType(multipartFile);

        assertNotNull(result);
        assertEquals("image/png", result);
    }

    @Test
    void isSupportedReturnsTrue() throws IOException {
        assertTrue(fileValidationService.isSupported(multipartFile));
    }

    @Test
    void isSupportedReturnsFalseDueToExtension() throws IOException {
        when(multipartFile.getOriginalFilename()).thenReturn("file.exe");
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(ZIP_BYTES));

        assertFalse(fileValidationService.isSupported(multipartFile));
    }

    @Test
    void isSupportedReturnsFalseDueToMimeType() throws IOException {
        when(multipartFile.getOriginalFilename()).thenReturn("image.png");
        when(multipartFile.getContentType()).thenReturn("application/binary");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(PNG_BYTES));

        assertFalse(fileValidationService.isSupported(multipartFile));
    }

    @Test
    void isSupportedReturnsFalseDueToTikaDetection() throws IOException {
        when(multipartFile.getOriginalFilename()).thenReturn("file.txt");
        when(multipartFile.getContentType()).thenReturn("text/plain");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(ZIP_BYTES));

        assertFalse(fileValidationService.isSupported(multipartFile));
    }
}