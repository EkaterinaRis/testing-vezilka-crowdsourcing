package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.enums.Role;
import mk.ukim.vezilka.backend.model.exceptions.InvalidFileException;
import mk.ukim.vezilka.backend.model.exceptions.UserNotFoundException;
import mk.ukim.vezilka.backend.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void editUserUpdatesAndSaves() {
        AppUser user = new AppUser();
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        AppUser result = userService.editUser("test@example.com", "John", "Doe", "123", "Loc", "Bio");

        assertNotNull(result);
        assertEquals("John", user.getFirstName());
        verify(appUserRepository).save(user);
    }

    @Test
    void getUserByEmailReturnsUser() {
        AppUser user = new AppUser();
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        AppUser result = userService.getUserByEmail("test@example.com");

        assertEquals(user, result);
    }

    @Test
    void getUserByEmailThrowsWhenNotFound() {
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> {
            userService.getUserByEmail("test@example.com");
        });
    }

    @Test
    void editAvatarPictureSuccess() throws IOException {
        ReflectionTestUtils.setField(userService, "uploadDir", "/tmp/uploads");
        AppUser user = new AppUser();
        user.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getOriginalFilename()).thenReturn("avatar.png");
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        try (MockedStatic<Paths> mockedPaths = mockStatic(Paths.class);
             MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

            Path mockPath = mock(Path.class);
            Path mockResolvedPath = mock(Path.class);
            Path mockUserPath = mock(Path.class);

            mockedPaths.when(() -> Paths.get(anyString())).thenReturn(mockPath);
            when(mockPath.resolve(anyString())).thenReturn(mockResolvedPath);
            when(mockResolvedPath.resolve(anyString())).thenReturn(mockUserPath);
            when(mockUserPath.resolve(anyString())).thenReturn(mockUserPath);

            mockedFiles.when(() -> Files.createDirectories(any(Path.class))).thenReturn(mockUserPath);

            AppUser result = userService.editAvatarPicture("test@example.com", multipartFile);

            assertNotNull(result);
            assertNotNull(user.getAvatarUrl());
            verify(multipartFile).transferTo(any(Path.class));
            verify(appUserRepository).save(user);
        }
    }

    @Test
    void editAvatarPictureThrowsWhenEmpty() {
        when(multipartFile.isEmpty()).thenReturn(true);

        assertThrows(InvalidFileException.class, () -> {
            userService.editAvatarPicture("test@example.com", multipartFile);
        });
    }

    @Test
    void editAvatarPictureThrowsWhenNotImage() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getContentType()).thenReturn("application/pdf");

        assertThrows(InvalidFileException.class, () -> {
            userService.editAvatarPicture("test@example.com", multipartFile);
        });
    }

    @Test
    void getUploadsByUserReturnsList() {
        AppUser user = new AppUser();
        Content content = new Content();
        user.setUploads(List.of(content));

        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        List<Content> result = userService.getUploadsByUser("test@example.com");

        assertEquals(1, result.size());
    }

    @Test
    void removeAvatarPictureSetsUrlToNull() {
        AppUser user = new AppUser();
        user.setAvatarUrl("old_url");

        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        userService.removeAvatarPicture("test@example.com");

        assertNull(user.getAvatarUrl());
        verify(appUserRepository).save(user);
    }

    @Test
    void getNumberOfUsersReturnsCount() {
        when(appUserRepository.count()).thenReturn(10L);

        Long result = userService.getNumberOfUsers();

        assertEquals(10L, result);
    }

    @Test
    void getUsersPaginatedReturnsPage() {
        Page<AppUser> page = new PageImpl<>(List.of(new AppUser()));
        when(appUserRepository.searchUsers(anyString(), any(PageRequest.class))).thenReturn(page);

        Page<AppUser> result = userService.getUsersPaginated("search", 0, 10);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void blockUserSetsBlockedTrue() {
        AppUser user = new AppUser();
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        userService.blockUser("test@example.com");

        assertTrue(user.isBlocked());
        verify(appUserRepository).save(user);
    }

    @Test
    void unblockUserSetsBlockedFalse() {
        AppUser user = new AppUser();
        user.setBlocked(true);

        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        userService.unblockUser("test@example.com");

        assertFalse(user.isBlocked());
        verify(appUserRepository).save(user);
    }

    @Test
    void changeRoleUpdatesRole() {
        AppUser user = new AppUser();
        when(appUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(appUserRepository.save(any(AppUser.class))).thenReturn(user);

        userService.changeRole("test@example.com", Role.ADMIN);

        assertEquals(Role.ADMIN, user.getRole());
        verify(appUserRepository).save(user);
    }
}