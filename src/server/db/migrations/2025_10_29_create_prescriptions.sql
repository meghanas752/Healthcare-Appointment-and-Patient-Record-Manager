-- HMPRS-26: base tables (scaffold)
CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT NOT NULL,
  doctor_id  BIGINT NOT NULL,
  notes TEXT NULL,
  items JSON NULL,           -- simple now; can normalize later
  status ENUM('DRAFT','SIGNED') NOT NULL DEFAULT 'SIGNED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);