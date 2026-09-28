package mk.ukim.vezilka.backend.web.controller;

import jakarta.validation.Valid;
import mk.ukim.vezilka.backend.model.Activity;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.enums.Role;
import mk.ukim.vezilka.backend.service.ActivityService;
import mk.ukim.vezilka.backend.service.UserService;
import mk.ukim.vezilka.backend.web.request.ChangeRoleRequest;
import mk.ukim.vezilka.backend.web.request.EditUserRequest;
import mk.ukim.vezilka.backend.web.response.*;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidParameterException;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    private final ActivityService activityService;

    public UserController(UserService userService, ActivityService activityService) {
        this.userService = userService;
        this.activityService = activityService;
    }

    @GetMapping("/uploads")
    public ResponseEntity<List<ContentResponse>> getUploads(Authentication authentication) {
        String email = authentication.getName();
        List<Content> posts = userService.getUploadsByUser(email);
        List<ContentResponse> result = posts.stream().map(ContentResponse::new).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/details")
    public ResponseEntity<UserResponse> getUserDetails(Authentication authentication) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        UserResponse response = new UserResponse(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStas(Authentication authentication) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        DashboardStatsResponse response = new DashboardStatsResponse(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/edit")
    public ResponseEntity<UserResponse> editUser(Authentication authentication,
                                                 @Valid @RequestBody EditUserRequest request) {
        String email = authentication.getName();
        AppUser user = userService.editUser(
                email,
                request.getFirstName(),
                request.getLastName(),
                request.getPhoneNumber(),
                request.getLocation(),
                request.getBiography()
        );

        UserResponse response = new UserResponse(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/avatar")
    public ResponseEntity<UserResponse> setAvatarPicture(Authentication authentication,
                                                         @RequestParam("file") MultipartFile file) throws IOException {
        String email = authentication.getName();
        AppUser user =  userService.editAvatarPicture(email, file);
        UserResponse response = new UserResponse(user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<UserResponse> removeAvatarPicture(Authentication authentication) {
        String email = authentication.getName();
        AppUser user = userService.removeAvatarPicture(email);
        UserResponse response = new UserResponse(user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityResponse>> getActivity(Authentication authentication,
                                                              @RequestParam(value = "pageSize", defaultValue = "5") int pageSize) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);

        List<Activity> activities = activityService.getActivitiesByUser(user, pageSize);
        List<ActivityResponse> responses = activities.stream().map(ActivityResponse::new).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Authentication authentication,
                                                          @RequestParam(name = "pageNumber", defaultValue = "0") int pageNumber,
                                                          @RequestParam(name = "pageSize", defaultValue = "12") int pageSize,
                                                          @RequestParam(name = "search", required = false, defaultValue = "") String search) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        if(user.getRole() != Role.ADMIN)
            throw new InvalidParameterException("You do not have admin permissions!");

        Page<AppUser> users = userService.getUsersPaginated(search, pageNumber, pageSize);
        Page<UserResponse> responses = users.map(UserResponse::new);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all/roles")
    public ResponseEntity<?> getAllRoles(Authentication authentication) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        if(user.getRole() != Role.ADMIN)
            throw new InvalidParameterException("You do not have admin permissions!");

        return ResponseEntity.ok(Role.values());
    }

    @PostMapping("/block")
    public ResponseEntity<UserResponse> blockUser(Authentication authentication,
                                                  @RequestBody String emailToBlock) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        if(user.getRole() != Role.ADMIN)
            throw new InvalidParameterException("You do not have admin permissions!");

        AppUser userToBlock = userService.blockUser(emailToBlock);
        UserResponse response = new UserResponse(userToBlock);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unblock")
    public ResponseEntity<UserResponse> unblockUser(Authentication authentication,
                                                  @RequestBody String emailToUnblock) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        if(user.getRole() != Role.ADMIN)
            throw new InvalidParameterException("You do not have admin permissions!");

        AppUser userToUnblock = userService.unblockUser(emailToUnblock);
        UserResponse response = new UserResponse(userToUnblock);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/role")
    public ResponseEntity<UserResponse> changeRole(Authentication authentication,
                                                    @RequestBody ChangeRoleRequest request) {
        String email = authentication.getName();
        AppUser user = userService.getUserByEmail(email);
        if(user.getRole() != Role.ADMIN)
            throw new InvalidParameterException("You do not have admin permissions!");

        AppUser changedUser = userService.changeRole(request.getEmail(), request.getRole());
        UserResponse response = new UserResponse(changedUser);
        return ResponseEntity.ok(response);
    }
}
