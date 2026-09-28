package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Activity;
import mk.ukim.vezilka.backend.model.ActivityType;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.repository.ActivityRepository;
import mk.ukim.vezilka.backend.repository.ActivityTypeRepository;
import mk.ukim.vezilka.backend.service.ActivityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityServiceImpl implements ActivityService {
    private final ActivityRepository activityRepository;
    private final ActivityTypeRepository activityTypeRepository;

    public ActivityServiceImpl(ActivityRepository activityRepository, ActivityTypeRepository activityTypeRepository) {
        this.activityRepository = activityRepository;
        this.activityTypeRepository = activityTypeRepository;
    }

    private String getDescriptionFromContent(Content content) {
        switch (content.getType()) {
            case AUDIO: return "Прикачи аудио примерок";
            case VIDEO: return "Прикачи видео примерок";
            case IMAGE: return "Прикачи слика";
            default: return "Прикачи текстуален документ";
        }
    }

    @Override
    public Activity logUpload(AppUser user, Content content, ActivityType uploadType) {

        Activity activity = new Activity();
        String description = getDescriptionFromContent(content);

        activity.setUser(user);
        activity.setType(uploadType);
        activity.setDescription(description);
        activity.setCreatedAt(LocalDateTime.now());

        return activityRepository.save(activity);
    }

    @Override
    public List<Activity> getActivitiesByUser(AppUser user, int pageSize) {
        return activityRepository.findActivityByUserOrderByCreatedAtDesc(user, PageRequest.of(0, pageSize));
    }

    @Override
    public ActivityType getActivityByName(String name) {
        return activityTypeRepository.findByName(name).orElseThrow();
    }
}
