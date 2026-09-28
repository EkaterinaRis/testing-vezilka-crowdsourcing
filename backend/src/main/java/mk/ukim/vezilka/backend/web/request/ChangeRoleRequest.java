package mk.ukim.vezilka.backend.web.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mk.ukim.vezilka.backend.model.enums.Role;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangeRoleRequest {
    private String email;
    private Role role;
}
