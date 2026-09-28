package mk.ukim.vezilka.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transcription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    private Content content;

    private String text;
    private boolean isFinal;
    private LocalDateTime createdAt;

    public Transcription(Content content, String text) {
        this.content = content;
        this.text = text;
        this.isFinal = false;
        this.createdAt = LocalDateTime.now();
    }
}
