-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('gov', 'private', 'ngo', 'other') NOT NULL,
    amount DECIMAL(10,2),
    deadline_date DATE NOT NULL,
    requirements TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarship applications table
CREATE TABLE IF NOT EXISTS scholarship_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- Application documents table
CREATE TABLE IF NOT EXISTS application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE
);

-- Insert sample admin user
INSERT INTO users (full_name, email, password, role) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$your_hashed_password', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

-- Insert sample scholarships
INSERT INTO scholarships (title, description, type, amount, deadline_date, requirements) VALUES
('Engineering Excellence Scholarship', 'For outstanding engineering students', 'private', 10000.00, '2024-06-30', 'Must be enrolled in an engineering program'),
('Arts & Culture Grant', 'Supporting artists and cultural initiatives', 'ngo', 5000.00, '2024-07-15', 'Portfolio submission required'),
('Government Merit Scholarship', 'For high academic achievers', 'gov', 15000.00, '2024-08-01', 'Minimum GPA of 3.5 required'); 