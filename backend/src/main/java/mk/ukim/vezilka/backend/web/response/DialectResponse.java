package mk.ukim.vezilka.backend.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.Dialect;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DialectResponse {
    private Long id;
    private String region;
    private String name;

    public DialectResponse(Dialect dialect) {
        this.id = dialect.getId();
        this.region = dialect.getRegion();
        this.name = dialect.getName();
    }
}
