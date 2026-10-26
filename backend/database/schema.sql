-- Skema Database QC-Dokumentasi (MySQL)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'guest') NOT NULL DEFAULT 'guest',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS part_monthly_documents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  customer VARCHAR(50) NOT NULL,
  status ENUM('Release', 'Proses', 'Review Status') NOT NULL DEFAULT 'Proses',
  doc_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer (customer),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_folders (
  id VARCHAR(100) PRIMARY KEY,
  customer VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customer_folder (customer, name),
  INDEX idx_customer (customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_files (
  id VARCHAR(150) PRIMARY KEY,
  customer VARCHAR(50) NOT NULL,
  folder_name VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
  file_size VARCHAR(50) NOT NULL DEFAULT '0 MB',
  doc_type VARCHAR(50) NOT NULL DEFAULT 'Drawing',
  file_url VARCHAR(500) NOT NULL,
  doc_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_folder (customer, folder_name),
  CONSTRAINT fk_customer_folder
    FOREIGN KEY (customer, folder_name)
    REFERENCES customer_folders (customer, name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

