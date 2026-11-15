package vn.drinkool.review;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService service;

    ReviewController(ReviewService service) {
        this.service = service;
    }

    /** R-1 */
    @PostMapping("/orders/{orderId}/review")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto create(@PathVariable Long orderId, @RequestBody ReviewService.CreateReviewRequest req) {
        return service.create(orderId, req);
    }

    /** R-2 */
    @GetMapping("/reviews")
    public ReviewService.ReviewList list(@RequestParam(required = false) Integer rating,
                                         @RequestParam(required = false) Integer page,
                                         @RequestParam(required = false) Integer size) {
        return service.list(rating, page, size);
    }
}
