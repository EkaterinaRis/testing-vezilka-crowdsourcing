package mk.ukim.vezilka.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.enums.ContentStatus;
import mk.ukim.vezilka.backend.model.enums.ContentType;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String originalFileName;

    @Enumerated(EnumType.STRING)
    private ContentType type;

    private String fileUrl;
    private String topic;

    @ManyToOne
    private Dialect dialect;

    private String description;

    @Enumerated(EnumType.STRING)
    private ContentStatus status;

    private double qualityScore;

    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "content")
    private Transcription transcription;

    private boolean isPrivate;

    @ManyToOne
    private AppUser uploader;

    public Content(String originalFileName, ContentType type, String fileUrl, String topic, Dialect dialect, String description, boolean isPrivate, AppUser uploader) {
        this.originalFileName = originalFileName;
        this.type = type;
        this.fileUrl = fileUrl;
        this.topic = topic;
        this.dialect = dialect;
        this.description = description;
        this.status = ContentStatus.PENDING;
        this.qualityScore = 0;
        this.isPrivate = isPrivate;
        this.createdAt = LocalDateTime.now();
        this.uploader = uploader;
    }
}
