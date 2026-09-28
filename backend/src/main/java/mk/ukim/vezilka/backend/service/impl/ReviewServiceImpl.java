package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Review;
import mk.ukim.vezilka.backend.repository.ReviewRepository;
import mk.ukim.vezilka.backend.service.ReviewService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public Optional<Review> getLatestReviewByContentId(Long contentId) {
        return reviewRepository.findTopByContentIdOrderByCreatedAtDesc(contentId);
    }
}
