package mk.ukim.vezilka.backend.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditUserRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Pattern(
            regexp = "^(\\+[1-9]\\d{7,14})?$",
            message = "Phone number must be in international format (e.g. +38971234567)"
    )
    private String phoneNumber;

    private String location;

    @Size(max = 500, message = "Biography must be at most 500 characters")
    private String biography;
}
