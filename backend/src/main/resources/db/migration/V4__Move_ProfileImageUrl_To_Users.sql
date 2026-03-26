ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(1000);

ALTER TABLE writers DROP COLUMN IF EXISTS profile_image_url;

ALTER TABLE viewers DROP COLUMN IF EXISTS profile_image_url;

