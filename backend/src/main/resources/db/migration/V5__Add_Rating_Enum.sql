CREATE TYPE feedback_rating AS ENUM ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR');

ALTER TABLE feedback ALTER COLUMN rating TYPE feedback_rating USING rating::feedback_rating;

