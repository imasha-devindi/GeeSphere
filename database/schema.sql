-- ============================================
-- GEESPHERE DATABASE SCHEMA
-- Version: 1.0
-- Sri Lankan Music Streaming Platform
-- ============================================

CREATE DATABASE IF NOT EXISTS geesphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE geesphere;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed',
  role ENUM('user', 'admin') DEFAULT 'user',
  profile_image VARCHAR(255) DEFAULT '/default-avatar.png',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin account (password: admin123)
INSERT INTO users (full_name, email, password, role) 
SELECT 'GeeSphere Admin', 'admin@geesphere.com', '$2a$10$wGFGqALRQIXmtIWPuO/5QOuks0ps7qLh0ZEmoKLBYPFqjQc0KysP6', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@geesphere.com');

-- 2. ARTISTS TABLE
CREATE TABLE IF NOT EXISTS artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_sinhala VARCHAR(150) DEFAULT NULL COMMENT 'Sinhala name',
  bio TEXT DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Artists Seed
INSERT INTO artists (name, name_sinhala, verified) 
SELECT * FROM (
  SELECT 'Sunil Edirisinghe' AS n, 'සුනිල් එදිරිසිංහ' AS ns, TRUE AS v UNION ALL
  SELECT 'Bathiya & Santhush (BnS)', 'බතිය සහ සංතුෂ්', TRUE UNION ALL
  SELECT 'Kasun Kalhara', 'කසුන් කල්හාර', TRUE UNION ALL
  SELECT 'Amarasiri Peiris', 'අමරසිරි පීරිස්', TRUE UNION ALL
  SELECT 'Nanda Malini', 'නන්දා මාලිනී', TRUE UNION ALL
  SELECT 'Unknown Artist', 'නොදන්නා කලාකරු', FALSE
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM artists LIMIT 1);

-- 3. GENRES TABLE
CREATE TABLE IF NOT EXISTS genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  name_sinhala VARCHAR(50) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  
  INDEX idx_genre_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Genres Seed
INSERT INTO genres (name, name_sinhala, description, color)
SELECT * FROM (
  SELECT 'Sinhala Pop', 'සිංහල පොප්', 'Modern Sinhala pop hits', '#3B82F6' UNION ALL
  SELECT 'Sinhala Folk', 'සිංහල ජන ගී', 'Traditional Sinhala folk & classical songs', '#10B981' UNION ALL
  SELECT 'Baila', 'බයිලා', 'Upbeat Sri Lankan baila music', '#F59E0B' UNION ALL
  SELECT 'Film Songs', 'චිත්‍රපට ගී', 'Famous Sri Lankan movie soundtracks', '#EC4899' UNION ALL
  SELECT 'Rock / Alternative', 'රොක්', 'Sri Lankan rock & alternative bands', '#8B5CF6' UNION ALL
  SELECT 'Acoustic / Unplugged', 'ඇකෝස්ටික්', 'Calming unplugged sessions', '#6366F1'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM genres LIMIT 1);

-- 4. ALBUMS TABLE
CREATE TABLE IF NOT EXISTS albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_sinhala VARCHAR(150) DEFAULT NULL,
  artist_id INT,
  cover_image VARCHAR(255) DEFAULT NULL,
  release_year YEAR DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SONGS TABLE
CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  title_sinhala VARCHAR(200) DEFAULT NULL,
  artist_id INT,
  album_id INT DEFAULT NULL,
  genre_id INT,
  mp3_path VARCHAR(255) NOT NULL,
  cover_image VARCHAR(255) DEFAULT '/uploads/covers/default-cover.png',
  youtube_id VARCHAR(50) DEFAULT NULL,
  
  lyrics TEXT DEFAULT NULL,
  lyrics_language ENUM('sinhala', 'english', 'both') DEFAULT 'sinhala',
  
  duration INT DEFAULT 0 COMMENT 'Duration in seconds',
  file_size INT DEFAULT 0,
  allow_download BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  plays INT DEFAULT 0,
  downloads INT DEFAULT 0,
  
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_title (title),
  INDEX idx_plays (plays DESC),
  INDEX idx_uploaded (uploaded_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fav (user_id, song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  cover_image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PLAYLIST_SONGS TABLE
CREATE TABLE IF NOT EXISTS playlist_songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,
  song_id INT NOT NULL,
  position INT DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_playlist_song (playlist_id, song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LISTENING_HISTORY TABLE
CREATE TABLE IF NOT EXISTS listening_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. RATINGS TABLE
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rating (user_id, song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIEWS
CREATE OR REPLACE VIEW songs_detailed AS
SELECT 
  s.*,
  a.name AS artist_name,
  a.name_sinhala AS artist_name_sinhala,
  g.name AS genre_name,
  g.name_sinhala AS genre_name_sinhala,
  g.color AS genre_color,
  al.name AS album_name,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(DISTINCT r.id) AS rating_count,
  COUNT(DISTINCT f.id) AS favorite_count
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
LEFT JOIN genres g ON s.genre_id = g.id
LEFT JOIN albums al ON s.album_id = al.id
LEFT JOIN ratings r ON s.id = r.song_id
LEFT JOIN favorites f ON s.id = f.song_id
GROUP BY s.id;
