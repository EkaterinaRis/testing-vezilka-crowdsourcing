package mk.ukim.vezilka.backend.web.controller;

import mk.ukim.vezilka.backend.model.Review;
import mk.ukim.vezilka.backend.service.ReviewService;
import mk.ukim.vezilka.backend.web.response.ReviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/review")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<ReviewResponse> getReviewByContentId(@PathVariable Long contentId) {
        Review review = reviewService.getLatestReviewByContentId(contentId).orElse(null);
        if(review == null) return ResponseEntity.badRequest().build();
        ReviewResponse response = new ReviewResponse(review);
        return ResponseEntity.ok(response);
    }
}
