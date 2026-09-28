package mk.ukim.vezilka.backend.web.response;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.Dialect;
import mk.ukim.vezilka.backend.model.enums.ContentStatus;
import mk.ukim.vezilka.backend.model.enums.ContentType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentResponse {
    private Long id;
    private String originalFileName;
    private ContentType type;
    private String fileUrl;
    private String topic;
    private Dialect dialect;
    private String description;
    private ContentStatus status;
    private double qualityScore;
    private LocalDateTime createdAt;
    private String uploaderFullName;
    private String avatarUrl;

    public ContentResponse(Content content) {
        this.id = content.getId();
        this.originalFileName = content.getOriginalFileName();
        this.type = content.getType();
        this.fileUrl = content.getFileUrl();
        this.topic = content.getTopic();
        this.dialect = content.getDialect();
        this.description = content.getDescription();
        this.status = content.getStatus();
        this.qualityScore = content.getQualityScore();
        this.createdAt = content.getCreatedAt();
        this.uploaderFullName = content.getUploader().getFullName();
        this.avatarUrl = content.getUploader().getAvatarUrl();
    }
}
