-- Performance indexes for high-traffic usage
-- MySQL 8.0+: Use IF EXISTS/IF NOT EXISTS where supported

-- Scholarships table
CREATE INDEX `idx_sch_status` ON `scholarships` (`status`);
CREATE INDEX `idx_sch_deadline` ON `scholarships` (`application_deadline`);
CREATE INDEX `idx_sch_level_type` ON `scholarships` (`academic_level`, `scholarship_type`);

-- Scholarship applications table
CREATE INDEX `idx_app_scholarship_id` ON `scholarship_applications` (`scholarship_id`);
CREATE INDEX `idx_app_status` ON `scholarship_applications` (`status`);
CREATE INDEX `idx_app_created_at` ON `scholarship_applications` (`application_date`);

-- Covering index for admin list view (status/date ordering)
CREATE INDEX `idx_app_list_cover` ON `scholarship_applications` (`application_date`, `status`, `scholarship_id`);

-- Scholarship documents table
CREATE INDEX `idx_sdoc_category` ON `scholarship_documents` (`category`);
CREATE INDEX `idx_sdoc_created_at` ON `scholarship_documents` (`created_at`);

-- Partnership images table
CREATE INDEX `idx_pimg_type` ON `partnership_images` (`partner_type`);
CREATE INDEX `idx_pimg_created_at` ON `partnership_images` (`created_at`);

-- Notifications table
CREATE INDEX `idx_notif_is_read` ON `notifications` (`is_read`);
CREATE INDEX `idx_notif_user_email` ON `notifications` (`user_id`, `email`, `is_read`);

-- Conversations table
CREATE INDEX `idx_conv_updated_at` ON `conversations` (`updated_at`);


