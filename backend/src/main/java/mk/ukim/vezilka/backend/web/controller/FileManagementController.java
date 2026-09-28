package mk.ukim.vezilka.backend.web.controller;

import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.Review;
import mk.ukim.vezilka.backend.model.Transcription;
import mk.ukim.vezilka.backend.service.ContentService;
import mk.ukim.vezilka.backend.service.FileManagementService;
import mk.ukim.vezilka.backend.service.TranscriptionService;
import mk.ukim.vezilka.backend.web.request.ReviewRequest;
import mk.ukim.vezilka.backend.service.FileValidationService;
import mk.ukim.vezilka.backend.web.request.UploadContentRequest;
import mk.ukim.vezilka.backend.web.response.ContentResponse;
import mk.ukim.vezilka.backend.web.response.ReviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("api/files")
public class FileManagementController {
    private final FileManagementService fileManagementService;
    private final FileValidationService fileValidationService;
    private final TranscriptionService transcriptionService;
    private final ContentService contentService;

    public FileManagementController(FileManagementService fileManagementService, FileValidationService fileValidationService, TranscriptionService transcriptionService, TranscriptionService transcriptionService1, ContentService contentService) {
        this.fileManagementService = fileManagementService;
        this.fileValidationService = fileValidationService;
        this.transcriptionService = transcriptionService1;
        this.contentService = contentService;
    }

    @PostMapping(value = "/upload",consumes = "multipart/form-data")
    public ResponseEntity<?> uploadFile(
            Authentication authentication,
            @ModelAttribute UploadContentRequest request,
            @RequestPart("file") MultipartFile file
            ) throws IOException {
        try {
            fileValidationService.validate(file);
            String email = authentication.getName();
            Content result = fileManagementService.uploadFile(
                    request.getTopic(), request.getDescription(),
                    request.getTranscription(), request.isPrivateContent(),
                    request.getDialectId(), file, email);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ContentResponse>> getPendingFiles() {
        List<Content> result = fileManagementService.getPendingFiles();
        List<ContentResponse> responses=result.stream().map(x->new ContentResponse(x)).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<ContentResponse>> getApprovedFiles() {
        List<Content> result = fileManagementService.getApprovedFiles();
        List<ContentResponse> responses=result.stream().map(x->new ContentResponse(x)).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<ContentResponse>> getRejectedFiles() {
        List<Content> result = fileManagementService.getRejectedFiles();
        List<ContentResponse> responses=result.stream().map(x->new ContentResponse(x)).toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/reject")
    public ResponseEntity<ReviewResponse> rejectFile(@RequestBody ReviewRequest request, Authentication authentication) {
        String email=authentication.getName();
        Review result = fileManagementService.rejectFile(request.getId(),request.getComment(),email, request.getQualityScore(), request.getTranscription());
        ReviewResponse response=new ReviewResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/accept")
    public ResponseEntity<ReviewResponse> acceptFile(@RequestBody ReviewRequest request,Authentication authentication) {
        String email=authentication.getName();
        Review result = fileManagementService.acceptFile(request.getId(),request.getComment(),email, request.getQualityScore(), request.getTranscription());
        ReviewResponse response=new ReviewResponse(result);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transcription/{contentId}")
    public ResponseEntity<String> tryGetTranscriptionForDocument(@PathVariable Long contentId) {
        Transcription transcription = transcriptionService.getTranscriptionFromContentId(contentId);
        String result = transcription != null ? transcription.getText() : "";
        return ResponseEntity.ok(result);
    }

    @GetMapping("/quality-score/{contentId}")
    public ResponseEntity<Double> getQualityScore(@PathVariable Long contentId) {
        Content content = contentService.getContentById(contentId);
        Double result = content != null ? content.getQualityScore() : 0;
        return ResponseEntity.ok(result);
    }
}
