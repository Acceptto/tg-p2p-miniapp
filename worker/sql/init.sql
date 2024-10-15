CREATE TABLE IF NOT EXISTS instagramProfessionalUser (
    id integer PRIMARY KEY AUTOINCREMENT,
    app_scoped_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    account_type VARCHAR(50),
    profile_picture_url TEXT,
    followers_count INT,
    follows_count INT,
    media_count INT,
    access_token TEXT
);

CREATE TABLE IF NOT EXISTS instagramUserProfile (
    instagram_scoped_id VARCHAR(255) PRIMARY KEY,
    follower_count INTEGER,
    is_business_follow_user BOOLEAN,
    is_user_follow_business BOOLEAN,
    is_verified_user BOOLEAN,
    name VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instagramUserInteraction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instagram_scoped_id VARCHAR(255) NOT NULL,
    professional_user_id VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    additional_data JSON,
    FOREIGN KEY (professional_user_id) REFERENCES instagramProfessionalUser(user_id)
--    FOREIGN KEY (instagram_scoped_id) REFERENCES instagramUserProfile(instagram_scoped_id)
);

-- Create indexes for optimizing queries
CREATE INDEX IF NOT EXISTS idx_instagram_scoped_id ON instagramUserInteraction(instagram_scoped_id);
CREATE INDEX IF NOT EXISTS idx_professional_user_id ON instagramUserInteraction(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON instagramUserInteraction(timestamp);

-- Create indexes for instagramUserProfile
CREATE INDEX IF NOT EXISTS idx_username ON instagramUserProfile(username);
CREATE INDEX IF NOT EXISTS idx_follower_count ON instagramUserProfile(follower_count);
CREATE INDEX IF NOT EXISTS idx_updated_at ON instagramUserProfile(updated_at);
