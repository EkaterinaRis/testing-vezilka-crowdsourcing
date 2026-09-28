package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.Review;
import org.hibernate.event.internal.ReattachVisitor;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileManagementService {
    Content uploadFile(String topic, String description, String transcription, boolean isPrivate, Long dialectId, MultipartFile file, String userEmail) throws IOException;

    Resource loadFileAsResource(String path);
    List<Content> getPendingFiles();
    List<Content> getApprovedFiles();
    List<Content> getRejectedFiles();
    Review acceptFile(Long id, String comment, String email, Double qualityScore, String transcription);
    Review rejectFile(Long id,String comment, String email, Double qualityScore, String transcription);

    Long getNumberOfUploads();
}
