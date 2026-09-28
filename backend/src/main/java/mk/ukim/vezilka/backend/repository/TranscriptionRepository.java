package mk.ukim.vezilka.backend.repository;

import mk.ukim.vezilka.backend.model.Transcription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TranscriptionRepository extends JpaRepository<Transcription, Long> {
    Optional<Transcription> getByContent_Id(Long contentId);
}
