package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.Dialect;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DialectRepository extends JpaRepository<Dialect, Long> {
    boolean existsByName(String name);
}
