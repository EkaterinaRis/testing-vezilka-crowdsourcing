package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    @Query("""
        SELECT u
        FROM AppUser u
        WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
         ORDER BY u.email
    """)
    Page<AppUser> searchUsers(
            @Param("search") String search,
            Pageable pageable
    );
}
