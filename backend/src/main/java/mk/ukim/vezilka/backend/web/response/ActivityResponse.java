package mk.ukim.vezilka.backend.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.Activity;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActivityResponse {
    private LocalDateTime createdAt;
    private String type;
    private String description;

    public ActivityResponse(Activity activity) {
        this.createdAt = activity.getCreatedAt();
        this.type = activity.getType().getName().toLowerCase();
        this.description = activity.getDescription();
    }
}
