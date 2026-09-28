package mk.ukim.vezilka.backend.service;

import mk.ukim.vezilka.backend.model.Review;

import java.util.Optional;

public interface ReviewService {
    Optional<Review> getLatestReviewByContentId(Long contentId);
}
