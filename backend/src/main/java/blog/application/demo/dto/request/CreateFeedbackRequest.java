package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateFeedbackRequest(
    @NotNull(message = "Rating is required and cannot be null")
    @NotBlank(message = "Rating cannot be blank or empty")
    String rating, // Radio button: EXCELLENT, GOOD, AVERAGE, POOR
    
    @NotNull(message = "Would recommend field is required")
    boolean wouldRecommend, // Checkbox
    
    @NotNull(message = "Feedback text is required and cannot be null")
    @NotBlank(message = "Feedback text cannot be blank or empty")
    String feedbackText // Text box
) {}


