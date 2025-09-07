-- Add performance indexes for frequently used queries

-- Advertisements
CREATE INDEX idx_ads_active_dates ON advertisements (is_active, start_date, end_date);
CREATE INDEX idx_ads_created_at ON advertisements (created_at);

-- Scholarships
CREATE INDEX idx_sch_status ON scholarships (status);
CREATE INDEX idx_sch_deadline ON scholarships (application_deadline);
CREATE INDEX idx_sch_level_type ON scholarships (academic_level, scholarship_type);
CREATE INDEX idx_sch_created_at ON scholarships (created_at);

-- Scholarship applications
CREATE INDEX idx_app_scholarship_id ON scholarship_applications (scholarship_id);
CREATE INDEX idx_app_status ON scholarship_applications (status);
CREATE INDEX idx_app_application_date ON scholarship_applications (application_date);
CREATE INDEX idx_app_list_cover ON scholarship_applications (application_date, status, scholarship_id);

-- Notifications
CREATE INDEX idx_notif_user_email ON notifications (user_id, email);
CREATE INDEX idx_notif_created_at ON notifications (created_at);
CREATE INDEX idx_notif_is_read ON notifications (is_read);

-- Partnership images
CREATE INDEX idx_pimg_active ON partnership_images (is_active);
CREATE INDEX idx_pimg_type ON partnership_images (partner_type);
CREATE INDEX idx_pimg_created_at ON partnership_images (created_at);

-- Partners
CREATE INDEX idx_partners_status ON partners (status);

-- Admin account settings
CREATE INDEX idx_admin_settings_user ON admin_account_settings (user_id);


