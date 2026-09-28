package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.Content;
import mk.ukim.vezilka.backend.model.enums.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    @Query("SELECT c FROM Content c LEFT JOIN c.dialect d " +
            "WHERE c.isPrivate = false AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(c.topic) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.originalFileName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))" +
            "ORDER BY c.createdAt DESC ")
    Page<Content> getAllByIsPrivateIsFalse(@Param("search") String search, Pageable pageable);

    Optional<Content> getContentById(Long id);
    Optional<List<Content>> getContentByStatus(ContentStatus status);
}
