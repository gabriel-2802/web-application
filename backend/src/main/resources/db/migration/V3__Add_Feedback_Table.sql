CREATE TABLE IF NOT EXISTS feedback (
    feedback_id BIGSERIAL PRIMARY KEY,
    rating VARCHAR(50) NOT NULL,
    would_recommend BOOLEAN NOT NULL,
    feedback_text TEXT NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_rating CHECK (rating IN ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'))
);


