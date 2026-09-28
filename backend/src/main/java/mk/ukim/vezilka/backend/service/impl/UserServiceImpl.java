package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.enums.Role;
import mk.ukim.vezilka.backend.model.exceptions.InvalidFileException;
import mk.ukim.vezilka.backend.model.exceptions.UserNotFoundException;
import mk.ukim.vezilka.backend.repository.AppUserRepository;
import mk.ukim.vezilka.backend.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private final AppUserRepository appUserRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public UserServiceImpl(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public AppUser editUser(String email, String firstName, String lastName, String phoneNumber, String location, String biography) {
        AppUser user = getUserByEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setLocation(location);
        user.setBiography(biography);
        return appUserRepository.save(user);
    }

    @Override
    public AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }

    @Override
    public AppUser editAvatarPicture(String email, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new InvalidFileException();
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException();
        }

        AppUser user = getUserByEmail(email);
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String finalFilename = UUID.randomUUID().toString() + "_" + originalFilename;
        String relativePath = Paths.get("media")
                .resolve("uploads")
                .resolve("users")
                .resolve(String.valueOf(user.getId()))
                .resolve("profile")
                .resolve(finalFilename)
                .toString()
                .replace("\\", "/");

        Path userStoragePath = Paths.get(uploadDir)
                .resolve("users")
                .resolve(String.valueOf(user.getId()))
                .resolve("profile");
        Files.createDirectories(userStoragePath);

        Path targetLocation = userStoragePath.resolve(finalFilename);
        file.transferTo(targetLocation);

        user.setAvatarUrl(relativePath);

        return appUserRepository.save(user);
    }

    @Override
    public List<Content> getUploadsByUser(String email) {
        AppUser user = getUserByEmail(email);
        return user.getUploads();
    }

    @Override
    public AppUser removeAvatarPicture(String email) {
        AppUser user = getUserByEmail(email);
        user.setAvatarUrl(null);
        return appUserRepository.save(user);
    }

    @Override
    public Long getNumberOfUsers() {
        return appUserRepository.count();
    }

    @Override
    public Page<AppUser> getUsersPaginated(String search, int pageNum, int pageSize) {
        return appUserRepository.searchUsers(search, PageRequest.of(pageNum, pageSize));
    }

    @Override
    public AppUser blockUser(String email) {
        AppUser user = getUserByEmail(email);
        user.setBlocked(true);
        return appUserRepository.save(user);
    }

    @Override
    public AppUser unblockUser(String email) {
        AppUser user = getUserByEmail(email);
        user.setBlocked(false);
        return appUserRepository.save(user);
    }

    @Override
    public AppUser changeRole(String email, Role role) {
        AppUser user = getUserByEmail(email);
        user.setRole(role);
        return appUserRepository.save(user);
    }
}
