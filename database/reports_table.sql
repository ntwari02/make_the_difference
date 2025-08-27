-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'reviewed', 'exported', 'archived') DEFAULT 'pending',
    data JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    exported_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_created_by ON reports(created_by);

-- Insert some sample reports for testing
INSERT INTO reports (name, category, description, status, data, created_by) VALUES
('Monthly Applications Summary', 'applications', 'Summary of all applications received this month', 'completed', '{"metadata": {"generatedAt": "2024-01-15T10:30:00Z", "elements": ["applications"], "dateRange": "thisMonth"}, "data": {"applications": {"total": 45, "applications": []}}}', 1),
('User Growth Report', 'analytics', 'Analysis of user registration trends', 'completed', '{"metadata": {"generatedAt": "2024-01-15T11:00:00Z", "elements": ["analytics"], "dateRange": "last30days"}, "data": {"analytics": {"userGrowth": []}}}', 1),
('Scholarship Performance Overview', 'scholarships', 'Performance metrics for all active scholarships', 'reviewed', '{"metadata": {"generatedAt": "2024-01-15T12:00:00Z", "elements": ["scholarships", "analytics"], "dateRange": "all"}, "data": {"scholarships": {"total": 12, "scholarships": []}, "analytics": {"scholarshipPerformance": []}}}', 1);
