package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.Activity;
import mk.ukim.vezilka.backend.model.AppUser;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findActivityByUserOrderByCreatedAtDesc(AppUser user, Pageable pageable);
}
