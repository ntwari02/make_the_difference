-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mbappe
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_account_settings`
--

DROP TABLE IF EXISTS `admin_account_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_account_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `bio` text,
  `timezone` varchar(50) DEFAULT 'UTC',
  `language` varchar(10) DEFAULT 'en',
  `theme_preference` enum('light','dark','auto') DEFAULT 'auto',
  `profile_picture_path` varchar(255) DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `push_notifications` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`user_id`),
  CONSTRAINT `fk_admin_account_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- -----------------------------------------------------
-- Table structure for table `help_requests`
-- Tracks general help requests from users; linked to `users`
-- -----------------------------------------------------
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `help_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text,
  `status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
  `priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_help_requests_user_id` (`user_id`),
  KEY `idx_help_requests_status` (`status`),
  KEY `idx_help_requests_created_at` (`created_at`),
  CONSTRAINT `fk_help_requests_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_help_requests_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_account_settings`
--

LOCK TABLES `admin_account_settings` WRITE;
/*!40000 ALTER TABLE `admin_account_settings` DISABLE KEYS */;
INSERT INTO `admin_account_settings` VALUES (1,5,'Tyler Shooter','tyler@gmail.com','07888889','super admin','private notery','UTC','en','auto','/uploads/profile_pictures/profile-1754215578516-992288435.jpg',1,1,0,'2025-08-03 10:06:18','2025-08-03 12:35:45'),(2,31,'System Administrator','admin@system.com',NULL,'System Administrator','Primary system administrator with full access','UTC','en','auto',NULL,1,0,1,'2025-08-15 10:31:52','2025-08-15 10:31:52');
/*!40000 ALTER TABLE `admin_account_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_login_security`
--

DROP TABLE IF EXISTS `admin_login_security`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_login_security` (
  `user_id` int NOT NULL,
  `last_password_change` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `last_failed_login` timestamp NULL DEFAULT NULL,
  `account_locked_until` timestamp NULL DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_method` enum('email','sms','authenticator') DEFAULT NULL,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_login_security_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_login_security`
--

LOCK TABLES `admin_login_security` WRITE;
/*!40000 ALTER TABLE `admin_login_security` DISABLE KEYS */;
INSERT INTO `admin_login_security` VALUES (5,'2025-08-03 10:08:46',0,NULL,NULL,0,NULL,NULL),(31,NULL,0,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `admin_login_security` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_password_history`
--

DROP TABLE IF EXISTS `admin_password_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_password_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by_ip` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_password_history_user` (`user_id`),
  CONSTRAINT `fk_password_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_password_history`
--

LOCK TABLES `admin_password_history` WRITE;
/*!40000 ALTER TABLE `admin_password_history` DISABLE KEYS */;
INSERT INTO `admin_password_history` VALUES (1,5,'$2b$12$J76Eg.Wk8UMwF9Jz20NmfONSSbidijw2X74B9bPy6POUxInMt6dnO','2025-08-03 10:08:46','::1');
/*!40000 ALTER TABLE `admin_password_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `admin_level` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `permissions` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_admin_level` (`admin_level`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,5,'Tyler','tyler@gmail.com','super_admin','{\"can_manage_users\": true, \"can_view_reports\": true}',1,'2025-08-12 14:15:28','2025-07-29 19:14:48','2025-08-12 14:15:28'),(2,28,'Test Admin','admin@example.com','admin',NULL,1,'2025-08-15 10:32:01','2025-08-15 08:54:01','2025-08-15 10:32:01'),(3,31,'System Administrator','admin@system.com','super_admin','{\"users\": [\"read\", \"write\", \"delete\"], \"reports\": [\"read\", \"write\"], \"settings\": [\"read\", \"write\"], \"analytics\": [\"read\"], \"admin_users\": [\"read\", \"write\", \"delete\"], \"applications\": [\"read\", \"write\", \"delete\"], \"scholarships\": [\"read\", \"write\", \"delete\"], \"email_templates\": [\"read\", \"write\", \"delete\"]}',1,'2025-08-15 10:38:59','2025-08-15 10:31:51','2025-08-15 10:38:59');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `submission_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'titi','titi@gmail.com','login failed','2025-07-19 11:31:11'),(2,'thierry','tyler@gmail.com','applying is not working','2025-07-22 19:27:23'),(3,'thierry','jonathan@gmail.com','login failed','2025-07-22 19:27:51'),(4,'didas','didas@gmail.com','contactus failed','2025-07-24 11:09:58'),(5,'didas','didas@gmail.com','I need help\n','2025-08-09 09:06:16'),(6,'didas','didas@gmail.com','I need help\n','2025-08-09 09:06:38'),(7,'didas','didas@gmail.com','I need help\n','2025-08-09 09:09:23'),(8,'didas','didas@gmail.com','hello','2025-08-09 09:13:46');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_notification_id` (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,5,22,'didas@gmail.com',5,'Application Under Review','active','2025-07-31 18:50:26','2025-07-31 18:50:26'),(2,6,NULL,'didas12@gmail.com',5,'Application Approved','active','2025-08-02 18:19:00','2025-08-02 18:19:00');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'custom',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES (1,'Application Received','Your Application Has Been Received','<p>Dear {{name}},</p><p>&nbsp;</p><p>Thank you for submitting your application for {{scholarship}}. We have received your application and it is currently under review.</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>Submission Date: {{date}}</p><p>&nbsp;</p><p>We will contact you soon with further updates regarding your application status.</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(2,'Application Approved','Congratulations! Your Application Has Been Approved','<p>Dear {{name}},</p><p>&nbsp;</p><p>We are pleased to inform you that your application for {{scholarship}} has been approved!</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>Award Amount: ${{amount}}</p><p>&nbsp;</p><p>You will receive further instructions regarding the disbursement process.</p><p>&nbsp;</p><p>Congratulations!</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(3,'Application Rejected','Application Status Update','<p>Dear {{name}},</p><p>&nbsp;</p><p>We regret to inform you that your application for {{scholarship}} has not been approved at this time.</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>&nbsp;</p><p>We encourage you to apply for other available scholarships that may be a better fit for your qualifications.</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(4,'Password Reset','Password Reset Request','<p>Dear {{name}},</p><p>&nbsp;</p><p>You have requested a password reset for your account.</p><p>&nbsp;</p><p>Click the link below to reset your password:</p><p><a href=\"{{resetLink}}\">Reset Password</a></p><p>&nbsp;</p><p>If you did not request this reset, please ignore this email.</p><p>&nbsp;</p><p>Best regards,</p><p>Support Team</p>','system',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(5,'Newsletter','Monthly Newsletter - {{date}}','<p>Dear {{name}},</p><p>&nbsp;</p><p>Here is your monthly newsletter with the latest updates and opportunities.</p><p>&nbsp;</p><p>New Scholarships Available:</p><ul><li>STEM Scholarship Program</li><li>Arts and Humanities Award</li><li>International Student Grant</li></ul><p>&nbsp;</p><p>Stay tuned for more opportunities!</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','marketing',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(6,'Welcome Email','Welcome to {{organization}}!','<p>Dear {{name}},</p><p>&nbsp;</p><p>Welcome to {{organization}}! We are excited to have you as part of our community.</p><p>&nbsp;</p><p>Your account has been successfully created and you can now:</p><ul><li>Browse available scholarships</li><li>Submit applications</li><li>Track your application status</li></ul><p>&nbsp;</p><p>If you have any questions, please don\'t hesitate to contact our support team.</p><p>&nbsp;</p><p>Best regards,</p><p>{{organization}} Team</p>','system',1,'2025-08-04 15:01:24','2025-08-04 15:01:24'),(7,'Application Received','Your Application Has Been Received','<p>Dear {{name}},</p><p>&nbsp;</p><p>Thank you for submitting your application for {{scholarship}}. We have received your application and it is currently under review.</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>Submission Date: {{date}}</p><p>&nbsp;</p><p>We will contact you soon with further updates regarding your application status.</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:02:50','2025-08-04 15:02:50'),(8,'Application Approved','Congratulations! Your Application Has Been Approved','<p>Dear {{name}},</p><p>&nbsp;</p><p>We are pleased to inform you that your application for {{scholarship}} has been approved!</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>Award Amount: ${{amount}}</p><p>&nbsp;</p><p>You will receive further instructions regarding the disbursement process.</p><p>&nbsp;</p><p>Congratulations!</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:02:51','2025-08-04 15:02:51'),(9,'Application Rejected','Application Status Update','<p>Dear {{name}},</p><p>&nbsp;</p><p>We regret to inform you that your application for {{scholarship}} has not been approved at this time.</p><p>&nbsp;</p><p>Application ID: {{user_id}}</p><p>&nbsp;</p><p>We encourage you to apply for other available scholarships that may be a better fit for your qualifications.</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','system',1,'2025-08-04 15:02:51','2025-08-04 15:02:51'),(10,'Password Reset','Password Reset Request','<p>Dear {{name}},</p><p>&nbsp;</p><p>You have requested a password reset for your account.</p><p>&nbsp;</p><p>Click the link below to reset your password:</p><p><a href=\"{{resetLink}}\">Reset Password</a></p><p>&nbsp;</p><p>If you did not request this reset, please ignore this email.</p><p>&nbsp;</p><p>Best regards,</p><p>Support Team</p>','system',1,'2025-08-04 15:02:51','2025-08-04 15:02:51'),(11,'Newsletter','Monthly Newsletter - {{date}}','<p>Dear {{name}},</p><p>&nbsp;</p><p>Here is your monthly newsletter with the latest updates and opportunities.</p><p>&nbsp;</p><p>New Scholarships Available:</p><ul><li>STEM Scholarship Program</li><li>Arts and Humanities Award</li><li>International Student Grant</li></ul><p>&nbsp;</p><p>Stay tuned for more opportunities!</p><p>&nbsp;</p><p>Best regards,</p><p>Scholarship Team</p>','marketing',1,'2025-08-04 15:02:51','2025-08-04 15:02:51'),(12,'Welcome Email','Welcome to {{organization}}!','<p>Dear {{name}},</p><p>&nbsp;</p><p>Welcome to {{organization}}! We are excited to have you as part of our community.</p><p>&nbsp;</p><p>Your account has been successfully created and you can now:</p><ul><li>Browse available scholarships</li><li>Submit applications</li><li>Track your application status</li></ul><p>&nbsp;</p><p>If you have any questions, please don\'t hesitate to contact our support team.</p><p>&nbsp;</p><p>Best regards,</p><p>{{organization}} Team</p>','system',1,'2025-08-04 15:02:51','2025-08-04 15:02:51');
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_settings`
--

DROP TABLE IF EXISTS `general_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_title` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `site_description` text,
  `homepage_content` text,
  `homepage_banner` text,
  `maintenance_mode` enum('on','off') DEFAULT NULL,
  `facebook_link` varchar(255) DEFAULT NULL,
  `twitter_link` varchar(255) DEFAULT NULL,
  `instagram_link` varchar(255) DEFAULT NULL,
  `services` text,
  `logo_url` varchar(255) DEFAULT NULL,
  `favicon_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_settings`
--

LOCK TABLES `general_settings` WRITE;
/*!40000 ALTER TABLE `general_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_email` (`email`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,'Scholarship approved','Dear user your Scholarship is approved',1,'2025-07-29 16:51:44',NULL),(2,22,'Scholarship approved','dear didas your Scholarship has  approved.',1,'2025-07-29 18:48:07',NULL),(3,NULL,'Application Approved','Congratulations! Your scholarship application has been approved. We are pleased to inform you that your application has met all our requirements and you have been selected for the scholarship. You will receive further details about the next steps via email. Thank you for your interest in our program.',0,'2025-07-31 18:27:02','doel12@gmail.com'),(4,22,'Application Approved','Congratulations! Your scholarship application has been approved. We are pleased to inform you that your application has met all our requirements and you have been selected for the scholarship. You will receive further details about the next steps via email. Thank you for your interest in our program.',1,'2025-07-31 18:31:01','didas@gmail.com'),(5,22,'Application Under Review','Your scholarship application is currently under review by our selection committee. This process typically takes 2-3 weeks. We will notify you as soon as a decision has been made. Thank you for your patience.',1,'2025-07-31 18:50:26','didas@gmail.com'),(6,NULL,'Application Approved','Congratulations! Your scholarship application has been approved. We are pleased to inform you that your application has met all our requirements and you have been selected for the scholarship. You will receive further details about the next steps via email. Thank you for your interest in our program.',0,'2025-08-02 18:19:00','didas12@gmail.com');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
INSERT INTO `partners` VALUES (1,'thierry','tyler@gmail.com','UR','0787057751','we can collaborate','2025-06-06 20:45:31'),(2,'ALU','alu@gmail.com','ALU','0787057752','we can work together','2025-06-26 03:30:29'),(3,'African Leadership University','alu@gmail.com','ALU','0787057754','we are here to achive more','2025-06-26 16:56:35'),(4,'Elyssa','elyssa@gmail.com','Kist','0788888999','We can work together','2025-07-19 11:40:10'),(5,'ben','ben@gmail.com','UNILAK','07877656565','To achive more\n','2025-08-09 09:02:39');
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) NOT NULL,
  `description` text,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_name` (`permission_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_subscriptions`
--

DROP TABLE IF EXISTS `plan_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `plan_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plan_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_subscriptions`
--

LOCK TABLES `plan_subscriptions` WRITE;
/*!40000 ALTER TABLE `plan_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `features` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `replies`
--

DROP TABLE IF EXISTS `replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_type` enum('user','admin') NOT NULL,
  `sender_id` int DEFAULT NULL,
  `sender_email` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_type` (`sender_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `replies_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `replies`
--

LOCK TABLES `replies` WRITE;
/*!40000 ALTER TABLE `replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` enum('finance','operations','marketing','applications','scholarships','users','generated','custom') NOT NULL DEFAULT 'custom',
  `data` json DEFAULT NULL,
  `status` enum('pending','in_progress','completed','reviewed','exported','archived') NOT NULL DEFAULT 'pending',
  `type` enum('generated','custom','scheduled') NOT NULL DEFAULT 'custom',
  `created_by` int DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `exported_at` timestamp NULL DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_reports_type` (`type`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,'Monthly Applications Report','Comprehensive report of all scholarship applications for the current month','applications','{\"period\": \"30\", \"pending\": 75, \"approved\": 45, \"rejected\": 30, \"total_applications\": 150}','completed','generated',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL),(2,'Scholarship Performance Analysis','Analysis of scholarship performance and success rates','scholarships','{\"avg_applications\": 12.5, \"total_scholarships\": 25, \"active_scholarships\": 18}','reviewed','generated',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL),(3,'User Activity Summary','Summary of user activity and engagement metrics','users','{\"total_users\": 500, \"active_users\": 320, \"new_users_this_month\": 45}','pending','generated',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL),(4,'Financial Overview Q1','Financial overview for the first quarter','finance','{\"profit\": 15000, \"revenue\": 50000, \"expenses\": 35000}','completed','custom',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL),(5,'Marketing Campaign Results','Results from recent marketing campaigns','marketing','{\"campaigns\": 5, \"conversions\": 250, \"total_reach\": 10000}','in_progress','custom',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL),(6,'Operations Efficiency Report','Analysis of operational efficiency and process improvements','operations','{\"completion_rate\": 85, \"satisfaction_score\": 4.2, \"avg_processing_time\": 3.2}','reviewed','generated',1,NULL,'2025-07-30 12:20:59','2025-07-30 12:20:59',NULL,NULL,NULL);
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Profile Management: Creating and managing a personal profile within the system. This includes entering personal information, contact details, and academic history. Many systems allow this data to be pre-filled for future applications..\n\nApplication Submission: Searching for and applying for scholarships they are eligible for. The system should provide a user-friendly interface for filling out forms, uploading required documents (transcripts, essays, etc.), and tracking the progress of their applications.\n\nStatus Tracking: Checking the real-time status of their applications, from submission to final decision. This provides transparency and reduces the need for manual communication.\n\nCommunication: Receiving automated notifications and updates from the scholarship administrators.','2025-05-31 14:42:45','2025-07-31 13:17:16'),(2,'user','view the system info','2025-05-31 14:46:37','2025-05-31 14:46:37');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholarship_applications`
--

DROP TABLE IF EXISTS `scholarship_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholarship_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('female','male','other') NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `preferred_university` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `academic_level` enum('undergraduate','graduate','phd') NOT NULL,
  `intended_major` varchar(255) DEFAULT NULL,
  `gpa_academic_performance` varchar(50) DEFAULT NULL,
  `uploaded_documents_json` text,
  `extracurricular_activities` text,
  `parent_guardian_name` varchar(255) DEFAULT NULL,
  `parent_guardian_contact` varchar(50) DEFAULT NULL,
  `financial_need_statement` text,
  `how_heard_about` varchar(255) DEFAULT NULL,
  `scholarship_id` int DEFAULT NULL,
  `motivation_statement` text,
  `terms_agreed` tinyint(1) NOT NULL DEFAULT '0',
  `application_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `reviewer_notes` text,
  `processing_days` int DEFAULT NULL,
  `review_days` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `email_address` (`email_address`),
  KEY `idx_application_dates` (`application_date`,`reviewed_at`,`completed_at`),
  KEY `fk_scholarship_application_scholarship_id` (`scholarship_id`),
  CONSTRAINT `fk_scholarship_application_scholarship_id` FOREIGN KEY (`scholarship_id`) REFERENCES `scholarships` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholarship_applications`
--

LOCK TABLES `scholarship_applications` WRITE;
/*!40000 ALTER TABLE `scholarship_applications` DISABLE KEYS */;
INSERT INTO `scholarship_applications` VALUES (1,'uploads/profile_pictures/1749239923227-910999197-971.jpg','Thierry Ntwari','thierry@gmail.com','2002-02-20','male','0787057751','Kigali, Rwanda',NULL,'Rwanda','graduate',NULL,NULL,'[\"uploads/documents/1749239923268-20288261-CURRICULUM VITAE1.pdf\"]',NULL,NULL,NULL,NULL,NULL,1,NULL,1,'2025-06-06 19:58:43','2025-06-09 19:58:43','2025-06-11 19:58:43','Excellent academic performance and strong motivation statement',5,3,'approved'),(4,'uploads/profile_pictures/1749244534072-736882297-2202758.jpg','Ishimwe Eric','eric@gmail.com','1909-10-10','male','078707970','Kigali, Rwanda','Mount Kigali',NULL,'graduate','PCM','70/100','[\"uploads/documents/1749244534086-198334833-CURRICULUM VITAE1.pdf\"]','Dancer','James','+250 787977970','I need support','School counselor',2,'To gain more knowledge',1,'2025-06-06 21:15:34','2025-06-09 21:15:34','2025-06-11 21:15:34','Excellent academic performance and strong motivation statement',5,3,'approved'),(5,'uploads/profile_pictures/1752867169888-68098900-WhatsApp Image 2025-07-01 at 19.15.28_436c2bbe.jpg','john','jo@gmail.com','2025-07-20','male','7877777777','Iprc','IPRC kk',NULL,'graduate','sod','89','[\"uploads/documents/1752867169934-313549175-CERTIFICATE.pdf\"]','dancing\r\n','joseph','07777778887','not more','school',1,'i can',1,'2025-07-18 19:32:50','2025-07-21 19:32:50','2025-07-23 19:32:50','Excellent academic performance and strong motivation statement',5,3,'approved'),(6,'uploads/profile_pictures/1752871858969-864139758-WhatsApp Image 2025-07-01 at 19.15.34_778365d5.jpg','patrick','patrick@gmail.com','2025-07-27','male','787777000','Iprc kk','Mount Kigali',NULL,'graduate','csa','99','[\"uploads/documents/1752871859054-765514577-CURRICULUM VITAE1.docx\"]','i will get more','joseph m','077755778887','poor','school',2,'to get more knowledge',1,'2025-07-18 20:50:59','2025-07-20 20:50:59','2025-07-20 20:50:59','Incomplete documentation provided',2,2,'rejected'),(14,'uploads/profile_pictures/1753010079374-650959556-Screenshot 2025-05-14 005637.png','sam','sam@gmail.com','2025-07-10','male','078909709','Iprc','Mount Kigali','Rwanda','graduate','sod','89','[\"uploads/documents/1753010079513-318860974-CURRICULUM VITAE1.pdf\"]','Playing football','joseph m','07777778887','poor','school',2,'to get knowledge',1,'2025-07-20 11:14:39',NULL,NULL,NULL,NULL,NULL,'pending'),(15,'uploads/documents/1753109353542-288659007-WhatsAppImage2025-07-01at19.15.35_3f27149a.jpg','doe','doel@gmail.com','2025-07-09','male','089798789','Iprc kk','Mount Kigali','Rwanda','graduate','bdc','98','[\"uploads/documents/1753109353799-183167829-CERTIFICATE.pdf\"]','singer','joseph mu','07777778887','poor','school',2,'skills improvement',1,'2025-07-21 14:49:13',NULL,NULL,NULL,NULL,NULL,'pending'),(19,'uploads/profile_pictures/1753552043174-721217450-Screenshot 2025-07-21 125708.png','sam','samuel@gmail.com','2025-07-17','male','0784306583','kigali','IPRC kk','','undergraduate','csa','99','[\"uploads/documents/1753552043179-682269613-CURRICULUM VITAE1.pdf\"]','singing\r\n','samuel','077778888','poor','School',1,'To gain knowlegde',1,'2025-07-26 17:47:23','2025-07-31 13:40:44','2025-07-31 13:40:44','you are approved',5,5,'approved'),(20,'uploads/documents/1753969556664-44090510-adidasnovaIIIinfinity.png','samel','doel12@gmail.com','2025-07-02','male','078888980','kigali','IPRC kk','Algeria','graduate','Lsv','78','[\"uploads/documents/1753969556974-48465629-CURRICULUMVITAE1.pdf\"]','singing\r\n','joseph mu','077777788','no help','school',1,'to get skills',1,'2025-07-31 13:45:57',NULL,NULL,'you have been approved',NULL,NULL,'approved'),(21,'uploads/documents/1753986613526-486481965-adidasnovaIII.png','didas','didas@gmail.com','2025-07-02','male','0787057751','kigali','ALU','Honduras','graduate','bdc','55','[\"uploads/documents/1753986613628-206513138-CERTIFICATE.pdf\"]','dancing','joseph','07777778887','poorly','school',3,'to gain skills',1,'2025-07-31 18:30:13',NULL,NULL,'you are approved\n',NULL,NULL,'approved'),(22,'uploads/documents/1754070823433-165328088-WhatsAppImage2025-07-01at19.15.38_ca8f42d1.jpg','samel','didas12@gmail.com','2025-07-29','male','0787057751','kigali','Global Scholars Award','Israel','phd','bdc','4','[\"uploads/documents/1754070823438-48224069-Suredrivinglicence(1).pdf\"]','Fashion','jose','07777778887','poor','school',1,'skills',1,'2025-08-01 17:53:45',NULL,NULL,NULL,NULL,NULL,'approved'),(25,'uploads/profile_pictures/1754331966170-264312529-WhatsApp Image 2025-07-01 at 19.15.30_b5033eba.jpg','didas','thierry21@gmail.com','2025-08-14','male','0789097097','kigali','Global Scholars Award','','graduate','lsv','2','[]','dancing','samuel','077778887','poor','School',1,'skliis',1,'2025-08-04 18:26:06',NULL,NULL,NULL,NULL,NULL,'pending');
/*!40000 ALTER TABLE `scholarship_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scholarships`
--

DROP TABLE IF EXISTS `scholarships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scholarships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `eligibility_criteria` text NOT NULL,
  `application_deadline` date NOT NULL,
  `award_amount` decimal(10,2) NOT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `number_of_awards` int NOT NULL,
  `academic_level` varchar(50) NOT NULL,
  `field_of_study` varchar(255) DEFAULT NULL,
  `sponsor` varchar(255) DEFAULT NULL,
  `link_to_application` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
  `min_gpa` decimal(3,2) DEFAULT NULL,
  `documents_required` text,
  `scholarship_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scholarships`
--

LOCK TABLES `scholarships` WRITE;
/*!40000 ALTER TABLE `scholarships` DISABLE KEYS */;
INSERT INTO `scholarships` VALUES (1,'Global Scholars Award','Supports international students pursuing graduate studies.','Open to all non-domestic students with a GPA of 3.2 or higher.','2026-02-28',15000.00,0,5,'Graduate',NULL,NULL,NULL,NULL,'2025-08-01 17:33:52','2025-08-01 17:33:52','active',NULL,NULL,NULL),(2,'STEM Research Grant','A competitive grant for students in STEM fields to fund research projects.','Requires a detailed research proposal and faculty recommendation.','2026-05-15',20000.00,0,1,'PhD',NULL,NULL,NULL,NULL,'2025-08-01 17:34:05','2025-08-01 17:34:05','inactive',NULL,NULL,'Merit-based'),(3,'Student Volunteer Scholarship','Rewards students with a strong history of community service and volunteering.','Requires a minimum of 50 hours of verified volunteer work.','2026-04-20',3000.00,0,8,'Undergraduate',NULL,NULL,NULL,NULL,'2025-08-01 17:34:15','2025-08-01 17:34:15','active',NULL,NULL,NULL),(4,'Rwanda scholarships','offering scholarships to high perfomed  students','GPA','2025-08-16',5000.00,1,700000,'High School','swd','MINEDUC',NULL,'thierry@gmail.com','2025-08-01 17:42:16','2025-08-01 17:42:16','active',4.00,NULL,'Athletic');
/*!40000 ALTER TABLE `scholarships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_questions`
--

DROP TABLE IF EXISTS `security_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_questions`
--

LOCK TABLES `security_questions` WRITE;
/*!40000 ALTER TABLE `security_questions` DISABLE KEYS */;
INSERT INTO `security_questions` VALUES (1,'What was the name of your first pet?',1,'2025-08-03 20:59:12'),(2,'In which city were you born?',1,'2025-08-03 20:59:12'),(3,'What was your mother\'s maiden name?',1,'2025-08-03 20:59:12'),(4,'What was the name of your first school?',1,'2025-08-03 20:59:12'),(5,'What is your favorite color?',1,'2025-08-03 20:59:12'),(6,'What was the make of your first car?',1,'2025-08-03 20:59:12'),(7,'What is the name of the street you grew up on?',1,'2025-08-03 20:59:12'),(8,'What was your childhood nickname?',1,'2025-08-03 20:59:12'),(9,'What is your favorite movie?',1,'2025-08-03 20:59:12'),(10,'What is the name of your favorite teacher?',1,'2025-08-03 20:59:12');
/*!40000 ALTER TABLE `security_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'FOREX TRADING','Trading funds','uploads/services/1753122863560-987154980-WhatsApp_Image_2025-07-01_at_19.15.34_3c327dd0.jpg','2025-07-21 18:34:23'),(2,'Scholarship apply','Allow students to apply for universities and get scholarship','uploads/services/1753126143845-187623631-2202765.jpg','2025-07-21 19:29:03'),(3,'Project analysis','Analyis all requirements of the project','uploads/services/1753130738409-560973441-Screenshot_2025-05-22_015506.png','2025-07-21 20:45:38');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_security_answers`
--

DROP TABLE IF EXISTS `user_security_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_security_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `user_security_answers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_security_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `security_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_security_answers`
--

LOCK TABLES `user_security_answers` WRITE;
/*!40000 ALTER TABLE `user_security_answers` DISABLE KEYS */;
INSERT INTO `user_security_answers` VALUES (1,24,2,'kgl','2025-08-03 21:15:59','2025-08-03 21:15:59'),(2,24,5,'green','2025-08-03 21:15:59','2025-08-03 21:15:59'),(3,24,6,'ford','2025-08-03 21:15:59','2025-08-03 21:15:59'),(4,25,2,'kgl','2025-08-04 14:51:04','2025-08-04 14:51:04'),(5,25,5,'green','2025-08-04 14:51:04','2025-08-04 14:51:04'),(6,25,6,'ford','2025-08-04 14:51:04','2025-08-04 14:51:04'),(7,26,2,'rgna','2025-08-12 14:13:30','2025-08-12 14:13:30'),(8,26,5,'green','2025-08-12 14:13:30','2025-08-12 14:13:30'),(9,26,4,'Espoir','2025-08-12 14:13:30','2025-08-12 14:13:30'),(10,27,1,'Fluffy','2025-08-15 08:25:41','2025-08-15 08:25:41'),(11,27,2,'New York','2025-08-15 08:25:41','2025-08-15 08:25:41'),(12,27,3,'Smith','2025-08-15 08:25:41','2025-08-15 08:25:41'),(13,28,1,'Max','2025-08-15 08:54:01','2025-08-15 08:54:01'),(14,28,2,'Los Angeles','2025-08-15 08:54:01','2025-08-15 08:54:01'),(15,28,3,'Johnson','2025-08-15 08:54:01','2025-08-15 08:54:01'),(16,29,1,'Test Pet','2025-08-15 09:20:55','2025-08-15 09:20:55'),(17,29,2,'Test City','2025-08-15 09:20:55','2025-08-15 09:20:55'),(18,29,3,'Test Maiden','2025-08-15 09:20:55','2025-08-15 09:20:55'),(19,30,2,'kgl','2025-08-15 09:27:21','2025-08-15 09:27:21'),(20,30,7,'kk','2025-08-15 09:27:21','2025-08-15 09:27:21'),(21,30,10,'jd','2025-08-15 09:27:21','2025-08-15 09:27:21'),(22,31,1,'Admin Pet','2025-08-15 10:31:52','2025-08-15 10:31:52'),(23,31,2,'Admin City','2025-08-15 10:31:52','2025-08-15 10:31:52'),(24,31,3,'Admin Maiden','2025-08-15 10:31:52','2025-08-15 10:31:52');
/*!40000 ALTER TABLE `user_security_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `status` enum('active','inactive') DEFAULT 'active',
  `security_questions_setup` tinyint(1) DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `help_token` varchar(255) DEFAULT NULL,
  `help_token_expiry` datetime DEFAULT NULL,
  `help_requested_at` datetime DEFAULT NULL,
  `password_reset_by_admin` tinyint(1) DEFAULT '0',
  `admin_notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_password_reset_by_admin` (`password_reset_by_admin`),
  KEY `idx_users_help_token` (`help_token`),
  KEY `idx_users_help_requested_at` (`help_requested_at`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'john kalebu','john2@example.com','$2b$10$TLPSL7UoNbrYU43KA14czeyU40DCdO/pwjarUXPk6chLKRmBZcUfO','user','inactive',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(4,'shooter','shooter@example.com','$2b$10$0dUmUhjj2vJYWUeVPmjleuSRePgWeqM4pIW0TdDEIATraVCi/C3r6','admin','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48','2025-08-04 19:36:12',0,NULL,NULL,NULL,NULL,0,NULL),(5,'Tyler','tyler@gmail.com','$2b$12$J76Eg.Wk8UMwF9Jz20NmfONSSbidijw2X74B9bPy6POUxInMt6dnO','admin','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,1,NULL,NULL,NULL,NULL,0,NULL),(6,'tiger','tiger@gmail.com','12','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(7,'Thierry','shooter1@gmail.com','$2b$10$XFcaJQ8.Q7Z3H7jYfLNmse.FS78TVoxCQ4vSVa2UsW32JGI.IJ30y','admin','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(10,'mutsinzi','gustave@gmail.com','$2b$10$KGi61mTklOTO2ZpHIUOi3OXmmpOKaadL4QgI30VnLP.2PX6cV8vb6','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(11,'Thierry Ntwari','shooter2@gmail.com','jajh5o8m','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(12,'ana','ana@gmail.com','8iw8nr4k','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(13,'gustave','gustave2@gmail.com','obsc5idg','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(14,'Erenest','ernest@gmail.com','$2b$10$85Xae12NKjoN6ShEK3q36ef1ObaxOSeMuej87afTKRgNkYXWnvUz6','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(15,'eric','eric@gmail.com','$2b$10$.onpHWzGapqc.6n8mlqBm.gSme15sipfFs1xFKKIEd4vyFT7o3BFC','admin','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(16,'cedro','cedro@gmail.com','$2b$10$64an8k6PxAsDUVCAExDnmOltU8ld0zXv909Fe3Dr/4TYbVzW.pV7G','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(17,'Patrick','patrick@gmail.com','$2b$10$3oPsgAGp9Dw2QanMHh0GWejnIId2Zzm2k5WBwesyOTcsJ3lHjaUOK','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(18,'Anitha','anitha@gmail.com','zy8nr4po','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(19,'nshuti','nshutipatrick@gmail.com','$2b$10$fVJ6a/ejvdN3fxa7qqZNxuHptrPrLMFu0u3gGr1WXpOVVS8zI4aO2','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(20,'titi','titi@gmail.com','$2b$10$6qjyzQbNi8ZAPn5q02Ujqus9ELlQIhQX95v8b9KcDLtCwPV9iCnPm','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(21,'jonathan','jonathan@gmail.com','$2b$10$urvNb7USKTbwBPHiMV505OcCpJMxIm30xdyzWqjw57lDNwT8fZ.6u','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(22,'didas','didas@gmail.com','$2b$10$7gZ5sfcpiH6yKdO8tgxKMuugfZVQOFMyplz8qHM9NWFfmEMMifHDG','user','active',0,NULL,NULL,NULL,NULL,'2025-07-29 19:14:48',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(23,'didass','didas2@gmail.com','$2b$10$GENv2fW2B.afjKlqO18m.OMMt1pvlm/yZ01qoYhDuI7PMvf04dEUu','admin','inactive',0,NULL,NULL,NULL,NULL,'2025-07-31 12:09:14',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(24,'Thiery','thierryntwari02@gmail.com','$2b$10$pV5Iy7ODazfv.nN7jPI8R.Z6HL.mKMxotgYzwi8JK6XPySobaFiRm','user','active',1,NULL,NULL,NULL,NULL,'2025-08-03 21:15:59',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(25,'Shooter','shooter02@gmail.com','$2b$10$vwrZoUIgCP.Xw3sfnDbgKe8A6GZ9.UWJmcYfvNX6bp0TGaBGPtWN6','admin','active',1,'5dfeac39012f83a989b0970e20e6976cfa99030642af7aa612979ec3666bfcda','2025-08-06 00:05:26',NULL,NULL,'2025-08-04 14:51:04','2025-08-04 19:39:03',0,NULL,'b07c6a3d11ef760ad705c8169a7a26f78706a87664b5497d99da5d7f8a06af28','2025-08-06 23:50:54','2025-08-05 23:50:53',0,NULL),(26,'Enoc','enoc@gmail.com','$2b$10$ovPVjLMnZdEsFjSdb7d06.EXvZly/9xkgOmH.elOoOD11ot8Q3P5e','user','active',1,NULL,NULL,NULL,NULL,'2025-08-12 14:13:30',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(27,'Test User','test@example.com','$2b$10$BeqggT3viYpe8p88NEVvqOZVRnT9zZCOE369cNpa4q19uE/JKW5cO','user','active',1,NULL,NULL,NULL,NULL,'2025-08-15 08:25:41',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(28,'Test Admin','admin@example.com','$2b$10$W.Y59Wg1jTS0nhZvrckOtOaehZpq4HmlBHKr5FSzYkhcwScQZNeQ6','admin','active',1,NULL,NULL,NULL,NULL,'2025-08-15 08:54:01',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(29,'Test User Signup','signup-test@example.com','$2b$10$a9tkyCfYNA7Rr.tGTf..f.krZcIrqJPY24RTX.cP4dT7eX9Or54FW','user','active',1,NULL,NULL,NULL,NULL,'2025-08-15 09:20:55',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(30,'Enoc','tyler1@gmail.com','$2b$10$gPUzwBwtaGI00M/9M1AgXe6oNyzFQU5nD2nncT/ZteUGSKDDXmSDO','user','active',1,NULL,NULL,NULL,NULL,'2025-08-15 09:27:21',NULL,0,NULL,NULL,NULL,NULL,0,NULL),(31,'System Administrator','admin@system.com','$2b$10$ZX6egJZbdEYYcLhunEJbiO.zIKG5mLOPUNHD6aj2Kg61OsY4sWvfK','admin','active',1,NULL,NULL,NULL,NULL,'2025-08-15 10:31:51',NULL,0,NULL,NULL,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Table structure for user profile pictures
DROP TABLE IF EXISTS `user_profile_pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile_pictures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `profile_picture_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_user_profile_pictures_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `user_profile_pictures`
LOCK TABLES `user_profile_pictures` WRITE;
/*!40000 ALTER TABLE `user_profile_pictures` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_profile_pictures` ENABLE KEYS */;
UNLOCK TABLES;

-- Dump completed on 2025-08-15 14:18:34
