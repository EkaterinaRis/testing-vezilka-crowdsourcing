package mk.ukim.vezilka.backend.web.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private String comment;
    private Long id;
    private Double qualityScore;
    private String transcription;
}
