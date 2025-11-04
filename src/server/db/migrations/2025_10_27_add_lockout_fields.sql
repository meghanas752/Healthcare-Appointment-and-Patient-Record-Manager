-- src/backend/db/migrations/2025_10_27_add_lockout_fields.sql

-- Add columns only if they don't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS lockout_until DATETIME NULL;

-- Index only if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_lockout_until ON users (lockout_until);

-- Audit table (user_id type matches users.id = INT)
CREATE TABLE IF NOT EXISTS login_audit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  username VARCHAR(150) NOT NULL,
  ip VARCHAR(45) NULL,
  outcome ENUM('SUCCESS','FAIL','LOCKED') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_audit_user_id (user_id),
  CONSTRAINT fk_login_audit_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
