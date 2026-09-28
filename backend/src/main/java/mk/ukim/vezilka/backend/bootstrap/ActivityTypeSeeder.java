package mk.ukim.vezilka.backend.bootstrap;

import mk.ukim.vezilka.backend.model.ActivityType;
import mk.ukim.vezilka.backend.repository.ActivityTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ActivityTypeSeeder implements CommandLineRunner {

    private final ActivityTypeRepository activityTypeRepository;

    public ActivityTypeSeeder(ActivityTypeRepository activityTypeRepository) {
        this.activityTypeRepository = activityTypeRepository;
    }

    @Override
    public void run(String... args) {
        seed("TEXT");
        seed("AUDIO");
        seed("VIDEO");
        seed("IMAGE");
        seed("REVIEW");
    }

    private void seed(String name) {
        if (!activityTypeRepository.existsByName(name)) {
            ActivityType type = new ActivityType();
            type.setName(name);
            activityTypeRepository.save(type);
        }
    }
}