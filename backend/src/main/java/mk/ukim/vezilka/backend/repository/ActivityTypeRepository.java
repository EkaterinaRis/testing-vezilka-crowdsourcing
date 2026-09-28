package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActivityTypeRepository extends JpaRepository<ActivityType, Long> {
    boolean existsByName(String name);

    Optional<ActivityType> findByName(String name);
}
