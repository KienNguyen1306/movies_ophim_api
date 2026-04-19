-- =====================================================================
-- CineTube – MySQL Schema
-- Chạy file này một lần để tạo database và các bảng
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cinetube CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinetube;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  created_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Comments ─────────────────────────────────────────────────────────────────
-- user_id     NULL  → khách (guest)
-- guest_name  NULL  → khách ẩn danh (không điền tên)
-- parent_id   NULL  → bình luận gốc; có giá trị → reply
CREATE TABLE IF NOT EXISTS comments (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  movie_slug  VARCHAR(255)  NOT NULL,
  user_id     INT UNSIGNED  NULL,
  guest_name  VARCHAR(100)  NULL,
  content     TEXT          NOT NULL,
  parent_id   INT UNSIGNED  NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,

  INDEX idx_movie_slug (movie_slug),
  INDEX idx_parent_id  (parent_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
