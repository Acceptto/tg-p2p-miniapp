CREATE TABLE IF NOT EXISTS instagramProfessionalUser (
    id SERIAL PRIMARY KEY,                          -- Auto-incremented primary key
    user_id VARCHAR(255) NOT NULL UNIQUE,           -- Instagram Professional User IGID
    username VARCHAR(255) NOT NULL UNIQUE,          -- Instagram username
    name VARCHAR(255),                              -- User's name
    account_type VARCHAR(50),                       -- Account type (Business or Media_Creator)
    profile_picture_url TEXT,                       -- URL for the profile picture
    followers_count INT,                            -- Number of followers
    follows_count INT,                              -- Number of accounts followed
    media_count INT,                                -- Number of Media objects
    secret_token VARCHAR(255) NOT NULL UNIQUE,      -- Special secret token per user
    access_token TEXT                               -- Encrypted access token for future use
);

-- CREATE UNIQUE INDEX IF NOT EXISTS userSelectedDatesIndex ON selectedDates (userId, calendarId);

-- CREATE UNIQUE INDEX IF NOT EXISTS tokenHashIndex ON tokens (tokenHash);
-- CREATE UNIQUE INDEX IF NOT EXISTS telegramIdIndex ON users (telegramId);
