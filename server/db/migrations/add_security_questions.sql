-- Migration to add security questions functionality
-- Similar to Microsoft Windows security questions

-- Create security_questions table to store predefined questions
CREATE TABLE IF NOT EXISTS security_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    question_text TEXT NOT NULL,
    category ENUM('personal', 'family', 'childhood', 'education', 'work', 'location', 'preference') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Create user_security_questions table to store user's selected questions and answers
CREATE TABLE IF NOT EXISTS user_security_questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    answer_hash VARCHAR(255) NOT NULL, -- Hashed answer for security
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES security_questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_question (user_id, question_id),
    INDEX idx_user_id (user_id),
    INDEX idx_question_id (question_id)
);

-- Insert predefined security questions (similar to Microsoft Windows)
INSERT INTO security_questions (question_text, category) VALUES
-- Personal Information
('What is your mother\'s maiden name?', 'family'),
('What is your father\'s middle name?', 'family'),
('What is your oldest sibling\'s middle name?', 'family'),
('What is your youngest sibling\'s first name?', 'family'),

-- Childhood
('What was the name of your first pet?', 'childhood'),
('What was the name of your childhood best friend?', 'childhood'),
('What was the name of the street you grew up on?', 'location'),
('What was the name of your elementary school?', 'education'),
('What was the name of your high school?', 'education'),

-- Personal Preferences
('What is your favorite color?', 'preference'),
('What is your favorite food?', 'preference'),
('What is your favorite movie?', 'preference'),
('What is your favorite book?', 'preference'),
('What is your favorite song?', 'preference'),

-- Work/Education
('What was your first job?', 'work'),
('What was the name of your first boss?', 'work'),
('What was the name of your college or university?', 'education'),
('What was your major in college?', 'education'),

-- Location
('What city were you born in?', 'location'),
('What state or province were you born in?', 'location'),
('What country were you born in?', 'location'),
('What is your favorite vacation destination?', 'location'),

-- Personal Details
('What is your favorite hobby?', 'preference'),
('What is your favorite sport?', 'preference'),
('What is your favorite season?', 'preference'),
('What is your favorite holiday?', 'preference'),
('What is your favorite animal?', 'preference'),

-- Family Details
('What is your grandmother\'s first name?', 'family'),
('What is your grandfather\'s first name?', 'family'),
('What is your aunt\'s first name?', 'family'),
('What is your uncle\'s first name?', 'family'),

-- Work History
('What was the name of your first company?', 'work'),
('What was your first car?', 'personal'),
('What was the name of your first teacher?', 'education'),
('What was the name of your favorite teacher?', 'education');
