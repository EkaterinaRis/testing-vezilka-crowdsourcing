package mk.ukim.vezilka.backend.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HomeStatResponse {
    private String label;
    private Long value;
}