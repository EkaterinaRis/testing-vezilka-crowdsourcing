package mk.ukim.vezilka.backend.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.AppUser;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private int totalPoints;
    private int totalUploads;
    private int totalRewards;
    private int rank;

    public DashboardStatsResponse(AppUser user) {
        totalPoints = user.getPoints();
        totalUploads = user.getUploads().size();
        totalRewards = 0;
        rank = 42;
    }
}
