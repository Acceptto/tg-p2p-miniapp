CREATE TABLE IF NOT EXISTS instagramProfessionalUser (
    id integer PRIMARY KEY AUTOINCREMENT,           -- Auto-incremented primary key
    app_scoped_id VARCHAR(255) NOT NULL UNIQUE,     -- App-scoped ID from the API
    user_id VARCHAR(255) NOT NULL UNIQUE,           -- Instagram Professional User IGID
    username VARCHAR(255) NOT NULL UNIQUE,          -- Instagram username
    name VARCHAR(255),                              -- User's name
    account_type VARCHAR(50),                       -- Account type (Business or Media_Creator)
    profile_picture_url TEXT,                       -- URL for the profile picture
    followers_count INT,                            -- Number of followers
    follows_count INT,                              -- Number of accounts followed
    media_count INT,                                -- Number of Media objects
    access_token TEXT                               -- Encrypted access token for future use
);

-- CREATE UNIQUE INDEX IF NOT EXISTS userSelectedDatesIndex ON selectedDates (userId, calendarId);

-- CREATE UNIQUE INDEX IF NOT EXISTS tokenHashIndex ON tokens (tokenHash);
-- CREATE UNIQUE INDEX IF NOT EXISTS telegramIdIndex ON users (telegramId);
