package mk.ukim.vezilka.backend.service.impl;

import mk.ukim.vezilka.backend.model.Review;
import mk.ukim.vezilka.backend.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Test
    void getLatestReviewByContentIdReturnsReview() {
        Review review = new Review();
        when(reviewRepository.findTopByContentIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(review));

        Optional<Review> result = reviewService.getLatestReviewByContentId(1L);

        assertEquals(Optional.of(review), result);
    }

    @Test
    void getLatestReviewByContentIdReturnsEmpty() {
        when(reviewRepository.findTopByContentIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());

        Optional<Review> result = reviewService.getLatestReviewByContentId(1L);

        assertEquals(Optional.empty(), result);
    }
}