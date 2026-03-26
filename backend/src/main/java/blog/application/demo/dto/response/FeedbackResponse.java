package blog.application.demo.dto.response;

import java.time.LocalDateTime;

public record FeedbackResponse(
    Long id,
    String rating,
    boolean wouldRecommend,
    String feedbackText,
    LocalDateTime submittedAt
) {}


