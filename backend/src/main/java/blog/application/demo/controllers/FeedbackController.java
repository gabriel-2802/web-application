package blog.application.demo.controllers;

import blog.application.demo.dto.request.CreateFeedbackRequest;
import blog.application.demo.dto.response.FeedbackResponse;
import blog.application.demo.services.FeedbackService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@AllArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;
    
    @PostMapping("/submit")
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody CreateFeedbackRequest request) {
        return feedbackService.createFeedback(request);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        return feedbackService.deleteFeedback(id);
    }
}


