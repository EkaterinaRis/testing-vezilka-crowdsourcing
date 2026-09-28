package mk.ukim.vezilka.backend.web.controller;

import mk.ukim.vezilka.backend.service.FileManagementService;
import mk.ukim.vezilka.backend.service.UserService;
import mk.ukim.vezilka.backend.web.response.HomeStatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/home")
public class HomePageController {
    private final UserService userService;
    private final FileManagementService fileManagementService;

    public HomePageController(UserService userService, FileManagementService fileManagementService) {
        this.userService = userService;
        this.fileManagementService = fileManagementService;
    }

    @GetMapping("/stats")
    private ResponseEntity<List<HomeStatResponse>> getHomepageStats() {
        Long numberOfUsers = userService.getNumberOfUsers();
        Long numberOfUploads = fileManagementService.getNumberOfUploads();

        List<HomeStatResponse> result = List.of(
                new HomeStatResponse("Придонесувачи", numberOfUsers),
                new HomeStatResponse("Податоци", numberOfUploads)
        );

        return ResponseEntity.ok(result);
    }
}
