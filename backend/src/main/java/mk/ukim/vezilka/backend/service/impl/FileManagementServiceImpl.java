package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.*;
import mk.ukim.vezilka.backend.model.enums.ContentStatus;
import mk.ukim.vezilka.backend.model.enums.ContentType;
import mk.ukim.vezilka.backend.model.enums.ReviewDecision;
import mk.ukim.vezilka.backend.model.exceptions.ContentNotFoundException;
import mk.ukim.vezilka.backend.model.exceptions.InvalidFileException;
import mk.ukim.vezilka.backend.repository.ActivityTypeRepository;
import mk.ukim.vezilka.backend.repository.ContentRepository;
import mk.ukim.vezilka.backend.repository.ReviewRepository;
import mk.ukim.vezilka.backend.service.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileManagementServiceImpl implements FileManagementService {
    private final ContentRepository contentRepository;
    private final UserService userService;
    private final TranscriptionService transcriptionService;
    private final ActivityService activityService;
    private final ReviewRepository reviewRepository;
    private final DialectService dialectService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileManagementServiceImpl(ContentRepository contentRepository, UserService userService, TranscriptionService transcriptionService, ActivityTypeRepository activityTypeRepository, ActivityService activityService, ReviewRepository reviewRepository, DialectService dialectService) {
        this.contentRepository = contentRepository;
        this.userService = userService;
        this.transcriptionService = transcriptionService;
        this.activityService = activityService;
        this.reviewRepository = reviewRepository;
        this.dialectService = dialectService;
    }

    private Content createContentEntity(String originalFilename, ContentType type, String fileUrl, String topic, Long dialectId, String description, String transcription, boolean isPrivate, AppUser user) {
        Dialect dialect = dialectService.getDialectById(dialectId);
        Content content = new Content(originalFilename, type, fileUrl, topic, dialect, description, isPrivate, user);
        content = contentRepository.save(content);

        if (transcription != null && !transcription.isEmpty()) {
            Transcription subs = new Transcription(content, transcription);

            subs = transcriptionService.saveTranscription(subs);

            content.setTranscription(subs);
            content = contentRepository.save(content);
        }

        return content;
    }

    @Override
    public Content uploadFile(String topic, String description, String transcription, boolean isPrivate, Long dialectId, MultipartFile file, String userEmail) throws IOException {
        if (file.isEmpty()) {
            throw new InvalidFileException();
        }
        AppUser user = userService.getUserByEmail(userEmail);
        ContentType contentType = determineContentType(file.getContentType());
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        String finalFilename = UUID.randomUUID() + "_" + originalFilename;
        String relativePath = Paths
                .get("media")
                .resolve("uploads")
                .resolve("users")
                .resolve(String.valueOf(user.getId()))
                .resolve("data")
                .resolve(finalFilename)
                .toString()
                .replace("\\", "/");

        Path filePath = Paths.get(uploadDir).resolve(relativePath).normalize();

        Files.createDirectories(filePath.getParent());
        file.transferTo(filePath);

        Content content = createContentEntity(originalFilename, contentType, relativePath, topic, dialectId, description, transcription, isPrivate, user);

        ActivityType activityType = activityService.getActivityByName(contentType.name());
        activityService.logUpload(user, content, activityType);

        return content;
    }

    @Override
    public Resource loadFileAsResource(String path) {
        try {
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(path).normalize();
            if (!filePath.startsWith(basePath)) {
                throw new RuntimeException("Access denied (invalid path)");
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found: " + path);
            }

            return resource;

        } catch (Exception ex) {
            throw new RuntimeException("Error loading file: " + path, ex);
        }
    }

    private ContentType determineContentType(String mimeType) {
        if (mimeType == null) return ContentType.TEXT;

        if (mimeType.startsWith("image/")) return ContentType.IMAGE;
        if (mimeType.startsWith("audio/")) return ContentType.AUDIO;
        if (mimeType.startsWith("video/")) return ContentType.VIDEO;
        if (mimeType.startsWith("text/") || mimeType.contains("pdf")) return ContentType.TEXT;

        return ContentType.TEXT;
    }

    @Override
    public List<Content> getPendingFiles() {
        return contentRepository.getContentByStatus(ContentStatus.PENDING).orElse(new ArrayList<>());
    }

    @Override
    public List<Content> getApprovedFiles() {
        return contentRepository.getContentByStatus(ContentStatus.APPROVED).orElse(new ArrayList<>());
    }

    @Override
    public List<Content> getRejectedFiles() {
        return contentRepository.getContentByStatus(ContentStatus.REJECTED).orElse(new ArrayList<>());
    }

    @Override
    public Review acceptFile(Long id, String comment, String email, Double qualityScore, String transcription) {
        Content content = contentRepository.getContentById(id).orElse(null);
        AppUser user = userService.getUserByEmail(email);

        content.setStatus(ContentStatus.APPROVED);
        content.setQualityScore(qualityScore);
        transcriptionService.editTranscriptionOfContent(id, transcription);

        Review newReview = new Review();
        newReview.setComment(comment);
        newReview.setDecision(ReviewDecision.APPROVE);
        newReview.setContent(content);
        newReview.setCreatedAt(LocalDateTime.now());
        newReview.setReviewer(user);

        contentRepository.save(content);
        return reviewRepository.save(newReview);
    }

    @Override
    public Review rejectFile(Long id, String comment, String email, Double qualityScore, String transcription) {
        Content content = contentRepository.getContentById(id).orElse(null);
        AppUser user = userService.getUserByEmail(email);

        content.setStatus(ContentStatus.REJECTED);
        content.setQualityScore(qualityScore);
        transcriptionService.editTranscriptionOfContent(id, transcription);

        Review newReview = new Review();
        newReview.setComment(comment);
        newReview.setDecision(ReviewDecision.REJECT);
        newReview.setContent(content);
        newReview.setCreatedAt(LocalDateTime.now());
        newReview.setReviewer(user);

        contentRepository.save(content);
        return reviewRepository.save(newReview);
    }

    @Override
    public Long getNumberOfUploads() {
        return contentRepository.count();
    }
}
