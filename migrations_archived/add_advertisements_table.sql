-- Add advertisements table to existing database
USE mbappe;

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    link_url VARCHAR(500),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_date (is_active, start_date, end_date),
    INDEX idx_created_at (created_at),
    INDEX idx_category (category)
);

-- Insert sample advertisement data
INSERT INTO advertisements (title, description, image_url, video_url, link_url, start_date, end_date, is_active, category) VALUES
('Special Scholarship Opportunity', 'Discover amazing scholarship opportunities for international students. Limited time offer!', 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=800', NULL, 'https://example.com/scholarship', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 'scholarship'),
('Study Abroad Guide', 'Get your complete guide to studying abroad with MBAPE Global. Expert advice and support included.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', NULL, 'https://example.com/guide', NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, 'education'),
('Video: Study Abroad Success Stories', 'Watch inspiring stories of students who achieved their dreams with MBAPE Global. Real testimonials from successful graduates.', NULL, 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://example.com/success-stories', NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 1, 'testimonials');
