package mk.ukim.vezilka.backend.web.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadContentRequest {
    @NotBlank
    private String topic;
    private String description;
    private boolean privateContent;
    private String transcription;
    private Long dialectId;
}
