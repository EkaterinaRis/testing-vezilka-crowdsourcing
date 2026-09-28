package mk.ukim.vezilka.backend.service.impl;
import mk.ukim.vezilka.backend.model.enums.ContentType;
import mk.ukim.vezilka.backend.model.Activity;
import mk.ukim.vezilka.backend.model.ActivityType;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.repository.ActivityRepository;
import mk.ukim.vezilka.backend.repository.ActivityTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ActivityTypeRepository activityTypeRepository;

    @InjectMocks
    private ActivityServiceImpl activityService;

    @Test
    void logUpload_WhenContentIsAudio_ShouldSetAudioDescription() {
        AppUser user = new AppUser();
        Content content = mock(Content.class);
        ActivityType type = new ActivityType();

        when(content.getType()).thenReturn(ContentType.AUDIO);

        Activity savedActivity = new Activity();
        when(activityRepository.save(any(Activity.class))).thenReturn(savedActivity);

        Activity result = activityService.logUpload(user, content, type);

        verify(activityRepository).save(argThat(act -> 
            "Прикачи аудио примерок".equals(act.getDescription()) &&
            act.getUser() == user &&
            act.getType() == type &&
            act.getCreatedAt() != null
        ));
    }

    @Test
    void logUpload_WhenContentIsVideo_ShouldSetVideoDescription() {

        AppUser user = new AppUser();
        Content content = mock(Content.class);
        ActivityType type = new ActivityType();

        when(content.getType()).thenReturn(ContentType.VIDEO);
        when(activityRepository.save(any(Activity.class))).thenReturn(new Activity());

        activityService.logUpload(user, content, type);

        verify(activityRepository).save(argThat(act -> 
            "Прикачи видео примерок".equals(act.getDescription())
        ));
    }

    @Test
    void logUpload_WhenContentIsImage_ShouldSetImageDescription() {
        AppUser user = new AppUser();
        Content content = mock(Content.class);
        ActivityType type = new ActivityType();

        when(content.getType()).thenReturn(ContentType.IMAGE);
        when(activityRepository.save(any(Activity.class))).thenReturn(new Activity());

        activityService.logUpload(user, content, type);

        verify(activityRepository).save(argThat(act -> 
            "Прикачи слика".equals(act.getDescription())
        ));
    }

    @Test
    void logUpload_WhenContentIsDefault_ShouldSetTextDescription() {
        AppUser user = new AppUser();
        Content content = mock(Content.class);
        ActivityType type = new ActivityType();

        when(content.getType()).thenReturn(ContentType.TEXT);
        when(activityRepository.save(any(Activity.class))).thenReturn(new Activity());

        activityService.logUpload(user, content, type);

        verify(activityRepository).save(argThat(act -> 
            "Прикачи текстуален документ".equals(act.getDescription())
        ));
    }

    @Test
    void getActivitiesByUser_ShouldCallRepositoryWithPagination() {

        AppUser user = new AppUser();
        int pageSize = 10;
        List<Activity> mockActivities = List.of(new Activity(), new Activity());
        
        when(activityRepository.findActivityByUserOrderByCreatedAtDesc(eq(user), any(PageRequest.class)))
            .thenReturn(mockActivities);

        List<Activity> result = activityService.getActivitiesByUser(user, pageSize);

        assertEquals(2, result.size());
        verify(activityRepository).findActivityByUserOrderByCreatedAtDesc(eq(user), eq(PageRequest.of(0, pageSize)));
    }

    @Test
    void getActivityByName_WhenTypeExists_ShouldReturnType() {
        String name = "UPLOAD";
        ActivityType type = new ActivityType();
        
        when(activityTypeRepository.findByName(name)).thenReturn(Optional.of(type));

        ActivityType result = activityService.getActivityByName(name);

        assertNotNull(result);
        assertEquals(type, result);
    }

    @Test
    void getActivityByName_WhenTypeDoesNotExist_ShouldThrowException() {
        String name = "UNKNOWN_TYPE";
        
        when(activityTypeRepository.findByName(name)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> {
            activityService.getActivityByName(name);
        });
    }
}