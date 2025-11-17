-- backend/migrations/2025_10_30_add_auth_tables.sql
USE hospital_db;

-- Users table for login and roles
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('PATIENT','DOCTOR','STAFF','ADMIN') NOT NULL DEFAULT 'PATIENT',
  is_locked TINYINT(1) NOT NULL DEFAULT 0,
  failed_login_count INT NOT NULL DEFAULT 0,
  last_failed_at DATETIME NULL,
  locked_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit log for login events
CREATE TABLE IF NOT EXISTS auth_audit (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  username_entered VARCHAR(255),
  event_type ENUM('LOGIN_SUCCESS','LOGIN_FAILURE','LOCKOUT') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  details TEXT,
  INDEX (user_id)
);

-- Session table for express-mysql-session (optional: library can create it too)
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires INT(11) UNSIGNED,
  data TEXT
);