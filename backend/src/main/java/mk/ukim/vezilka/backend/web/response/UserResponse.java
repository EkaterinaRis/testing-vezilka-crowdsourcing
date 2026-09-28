package mk.ukim.vezilka.backend.web.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.enums.Role;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime createdAt;
    private String phoneNumber;
    private String location;
    private String biography;
    private String avatarUrl;
    private Role role;
    private boolean isBlocked;

    public UserResponse(AppUser user) {
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.createdAt = user.getCreatedAt();
        this.phoneNumber = user.getPhoneNumber();
        this.location = user.getLocation();
        this.biography = user.getBiography();
        this.avatarUrl = user.getAvatarUrl();
        this.role = user.getRole();
        this.isBlocked = user.isBlocked();
    }
}
