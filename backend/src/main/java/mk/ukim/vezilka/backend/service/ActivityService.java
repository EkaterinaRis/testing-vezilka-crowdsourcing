package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Activity;
import mk.ukim.vezilka.backend.model.ActivityType;
import mk.ukim.vezilka.backend.model.AppUser;
import mk.ukim.vezilka.backend.model.Content;

import java.util.List;

public interface ActivityService {

    Activity logUpload(AppUser user, Content content, ActivityType uploadType);

    List<Activity> getActivitiesByUser(AppUser user,int pageSize);

    ActivityType getActivityByName(String name);
}
