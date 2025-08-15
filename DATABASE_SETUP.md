# Database Setup Guide

This guide will help you set up the MySQL database for the Mbappe project.

## Prerequisites

- MySQL Server installed and running
- Node.js and npm installed
- Access to MySQL with appropriate permissions

## Quick Setup

1. **Configure Environment Variables**
   Create a `.env` file in the project root with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=mbappe
   ```

2. **Run Database Setup**
   ```bash
   npm run setup:database
   ```
   
   Or directly with Node:
   ```bash
   node setup_database.js
   ```

## What Gets Created

The setup script will create a complete database with **25 tables** including:

### Core Tables
- `users` - User accounts and authentication
- `roles` - User role definitions
- `user_roles` - User-role assignments
- `permissions` - Permission definitions

### Admin Tables
- `admin_users` - Admin user details
- `admin_account_settings` - Admin account preferences
- `admin_login_security` - Security settings for admin accounts
- `admin_password_history` - Password change history

### Scholarship System
- `scholarships` - Available scholarship programs
- `scholarship_applications` - Student applications
- `reports` - System reports and analytics

### Communication
- `notifications` - System notifications
- `conversations` - User-admin conversations
- `replies` - Conversation replies
- `email_templates` - Email template management

### Content Management
- `services` - Service offerings
- `partners` - Partnership information
- `contact_messages` - Contact form submissions
- `newsletter_subscribers` - Newsletter subscriptions

### Security & Settings
- `security_questions` - Available security questions
- `user_security_answers` - User security question answers
- `general_settings` - System configuration

### Payments (Future Use)

- `payments` - Payment records
- `plans` - Subscription plans
- `plan_subscriptions` - User subscriptions

## Sample Data

The setup includes sample data for:
- ✅ 1 Admin account
- ✅ 21 Users
- ✅ 4 Scholarships
- ✅ 11 Scholarship applications
- ✅ 12 Email templates
- ✅ 10 Security questions
- ✅ 6 Reports
- ✅ 4 Partners
- ✅ 3 Services
- ✅ 6 Notifications

## Verification

After setup, you can verify the installation by checking:

1. **Database exists**: Log into MySQL and run `SHOW DATABASES;`
2. **Tables created**: Use the database and run `SHOW TABLES;`
3. **Sample data**: Check any table with `SELECT COUNT(*) FROM users;`

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure database user has proper permissions

2. **Permission Denied**
   - Grant necessary privileges to database user:
     ```sql
     GRANT ALL PRIVILEGES ON mbappe.* TO 'your_user'@'localhost';
     FLUSH PRIVILEGES;
     ```

3. **Tables Already Exist**
   - The script handles this gracefully
   - Existing data will be preserved
   - Only missing tables will be created

### Manual Setup

If automated setup fails, you can manually run the SQL dump:

```bash
mysql -u root -p mbappe < config/mbappe.sql
```

## Database Schema

The database follows a well-structured design with:
- Proper foreign key relationships
- Indexed columns for performance
- UTF8MB4 character set for full Unicode support
- Timestamps for audit trails
- Enum types for data validation

## Security Features

- Password hashing with bcrypt
- Security questions for account recovery
- Login attempt tracking and account locking
- Password history to prevent reuse
- Two-factor authentication support (admin accounts)

## Next Steps

After database setup:
1. Start the server: `npm start` or `npm run dev`
2. Access the application at `http://localhost:3000`
3. Use admin credentials to access admin panel
4. Configure email templates and system settings
