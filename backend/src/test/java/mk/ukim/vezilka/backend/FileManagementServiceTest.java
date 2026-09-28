package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.model.Review;
import mk.ukim.vezilka.backend.model.enums.ContentStatus;
import mk.ukim.vezilka.backend.model.enums.ContentType;
import mk.ukim.vezilka.backend.model.enums.ReviewDecision;
import mk.ukim.vezilka.backend.model.exceptions.InvalidFileException;
import mk.ukim.vezilka.backend.repository.ContentRepository;
import mk.ukim.vezilka.backend.repository.ReviewRepository;
import mk.ukim.vezilka.backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileManagementServiceTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private UserService userService;

    @Mock
    private TranscriptionService transcriptionService;

    @Mock
    private ActivityService activityService;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private DialectService dialectService;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private FileManagementServiceImpl fileManagementService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileManagementService, "uploadDir", "/tmp/uploads");
    }

    @Test
    void uploadFileSuccessWithTranscription() throws IOException {
        String email = "user@example.com";
        Long dialectId = 1L;
        String topic = "Topic";
        String description = "Desc";
        String transcription = "Trans text";
        boolean isPrivate = false;

        AppUser user = new AppUser();
        user.setId(1L);
        Dialect dialect = new Dialect();
        Content content = new Content();
        content.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getOriginalFilename()).thenReturn("test.png");
        when(multipartFile.getContentType()).thenReturn("image/png");

        when(userService.getUserByEmail(email)).thenReturn(user);
        when(dialectService.getDialectById(dialectId)).thenReturn(dialect);
        when(contentRepository.save(any(Content.class))).thenReturn(content);

        Path tempUploadDir = Files.createTempDirectory("upload-test");
        ReflectionTestUtils.setField(fileManagementService, "uploadDir", tempUploadDir.toString());

        try (MockedStatic<UUID> mockedUUID = mockStatic(UUID.class)) {
            UUID mockUuid = UUID.fromString("00000000-0000-0000-0000-000000000001");
            mockedUUID.when(UUID::randomUUID).thenReturn(mockUuid);

            doAnswer(invocation -> {
                Path target = invocation.getArgument(0);
                Files.createDirectories(target.getParent());
                Files.write(target, "test-content".getBytes());
                return null;
            }).when(multipartFile).transferTo(any(Path.class));

            Content result = fileManagementService.uploadFile(topic, description, transcription, isPrivate, dialectId, multipartFile, email);

            assertNotNull(result);
            verify(contentRepository, times(2)).save(any(Content.class));
            verify(transcriptionService).saveTranscription(any());
            verify(activityService).logUpload(eq(user), any(), any());
        }
    }

    @Test
    void uploadFileThrowsWhenFileIsEmpty() {
        when(multipartFile.isEmpty()).thenReturn(true);

        assertThrows(InvalidFileException.class, () -> {
            fileManagementService.uploadFile("topic", "desc", null, false, 1L, multipartFile, "user@example.com");
        });
    }

    @Test
    void uploadFileHandlesUnknownContentType() throws IOException {
        String email = "user@example.com";
        AppUser user = new AppUser();
        user.setId(1L);
        Dialect dialect = new Dialect();
        Content content = new Content();

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getOriginalFilename()).thenReturn("test.xyz");
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");

        when(userService.getUserByEmail(email)).thenReturn(user);
        when(dialectService.getDialectById(1L)).thenReturn(dialect);
        when(contentRepository.save(any(Content.class))).thenReturn(content);

        Path tempUploadDir = Files.createTempDirectory("upload-test-unknown");
        ReflectionTestUtils.setField(fileManagementService, "uploadDir", tempUploadDir.toString());

        try (MockedStatic<UUID> mockedUUID = mockStatic(UUID.class)) {
            UUID fixedUuid = UUID.fromString("00000000-0000-0000-0000-000000000002");
            mockedUUID.when(UUID::randomUUID).thenReturn(fixedUuid);

            doAnswer(invocation -> {
                Path target = invocation.getArgument(0);
                Files.createDirectories(target.getParent());
                Files.write(target, "test-content".getBytes());
                return null;
            }).when(multipartFile).transferTo(any(Path.class));

            fileManagementService.uploadFile("topic", "desc", null, false, 1L, multipartFile, email);

            verify(contentRepository).save(argThat(c -> c.getType() == ContentType.TEXT));
        }
    }

    @Test
    void loadFileAsResourceSecurityCheckFailure() {
        String maliciousPath = "../../system_file.txt";

        try (MockedStatic<Paths> mockedPaths = mockStatic(Paths.class)) {
            Path basePath = mock(Path.class);
            Path resolvedPath = mock(Path.class);

            mockedPaths.when(() -> Paths.get("/tmp/uploads")).thenReturn(basePath);
            when(basePath.toAbsolutePath()).thenReturn(basePath);
            when(basePath.normalize()).thenReturn(basePath);

            when(basePath.resolve(maliciousPath)).thenReturn(resolvedPath);
            when(resolvedPath.normalize()).thenReturn(resolvedPath);

            when(resolvedPath.startsWith(basePath)).thenReturn(false);

            assertThrows(RuntimeException.class, () -> {
                fileManagementService.loadFileAsResource(maliciousPath);
            });
        }
    }

    @Test
    void getPendingFiles() {
        Content content = new Content();
        when(contentRepository.getContentByStatus(ContentStatus.PENDING)).thenReturn(Optional.of(List.of(content)));

        List<Content> result = fileManagementService.getPendingFiles();

        assertEquals(1, result.size());
        assertEquals(content, result.get(0));
    }

    @Test
    void getApprovedFiles() {
        when(contentRepository.getContentByStatus(ContentStatus.APPROVED)).thenReturn(Optional.of(List.of()));

        List<Content> result = fileManagementService.getApprovedFiles();

        assertTrue(result.isEmpty());
    }

    @Test
    void acceptFile() {
        Long contentId = 1L;
        String email = "admin@example.com";
        AppUser reviewer = new AppUser();
        Content content = new Content();
        Review review = new Review();

        when(contentRepository.getContentById(contentId)).thenReturn(Optional.of(content));
        when(userService.getUserByEmail(email)).thenReturn(reviewer);
        when(contentRepository.save(any(Content.class))).thenReturn(content);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Review result = fileManagementService.acceptFile(contentId, "Good job", email, 9.5, "New transcription");

        assertNotNull(result);
        assertEquals(ContentStatus.APPROVED, content.getStatus());
        assertEquals(9.5, content.getQualityScore());
        assertEquals(ReviewDecision.APPROVE, result.getDecision());
        verify(transcriptionService).editTranscriptionOfContent(contentId, "New transcription");
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void rejectFile() {
        Long contentId = 1L;
        String email = "admin@example.com";
        AppUser reviewer = new AppUser();
        Content content = new Content();
        Review review = new Review();

        when(contentRepository.getContentById(contentId)).thenReturn(Optional.of(content));
        when(userService.getUserByEmail(email)).thenReturn(reviewer);
        when(contentRepository.save(any(Content.class))).thenReturn(content);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Review result = fileManagementService.rejectFile(contentId, "Bad quality", email, 2.0, "Fixed text");

        assertNotNull(result);
        assertEquals(ContentStatus.REJECTED, content.getStatus());
        assertEquals(ReviewDecision.REJECT, result.getDecision());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void getNumberOfUploads() {
        when(contentRepository.count()).thenReturn(42L);

        Long result = fileManagementService.getNumberOfUploads();

        assertEquals(42L, result);
    }
}