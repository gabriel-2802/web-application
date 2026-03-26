package blog.application.demo.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long id;
    
    @Column(nullable = false)
    private String rating; // Radio button: EXCELLENT, GOOD, AVERAGE, POOR
    
    @Column(nullable = false)
    private boolean wouldRecommend; // Checkbox
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String feedbackText; // Text box
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
