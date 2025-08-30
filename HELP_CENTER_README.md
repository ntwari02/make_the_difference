# Help Center System

## Overview
The Help Center system provides a comprehensive way for users to submit help requests and for administrators to manage them. It includes both user-facing and admin interfaces.

## Features

### User Features
- **Submit Help Requests**: Users can submit help requests with categories, priorities, and detailed messages
- **View Requests**: Users can view all their submitted help requests
- **Request Details**: Detailed view of each help request including status and admin responses
- **Update Requests**: Users can update open requests (subject, message, priority)
- **Cancel Requests**: Users can cancel open requests

### Admin Features
- **View All Requests**: Admins can see all help requests from all users
- **Request Management**: Accept, resolve, or dismiss help requests
- **Password Resets**: Handle password reset requests directly
- **Statistics**: View help request statistics and metrics
- **User Support**: Generate help tokens for users to skip security questions

## Database Schema

### help_requests Table
```sql
CREATE TABLE `help_requests` (
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
);
```

## API Endpoints

### User Help Endpoints (`/api/help`)
- `POST /submit` - Submit a new help request
- `GET /user-requests/:userId` - Get user's help requests
- `GET /request/:requestId` - Get specific request details
- `PUT /request/:requestId` - Update a help request
- `DELETE /request/:requestId` - Cancel a help request

### Admin Help Endpoints (`/api/admin-help`)
- `GET /requests` - Get all help requests
- `GET /stats` - Get help system statistics
- `POST /accept` - Accept a help request
- `POST /resolve` - Resolve a help request
- `POST /reset-password` - Reset user password
- `POST /dismiss-request` - Dismiss a help request

## Pages

### User Pages
- **`/help-center.html`** - Main help center page for users
  - Submit help requests
  - View existing requests
  - Request details modal

### Admin Pages
- **`/admin_help.html`** - Admin help management page
  - View all help requests
  - Manage request status
  - Handle password resets
  - View statistics

## Setup Instructions

### 1. Database Setup
The help_requests table should already exist in your database. If not, run:
```bash
npm run setup:database
```

### 2. Seed Sample Data (Optional)
To add sample help requests for testing:
```bash
npm run seed:help
```

### 3. Start the Server
```bash
npm run dev
```

## Usage

### For Users
1. Navigate to `/help-center.html`
2. Fill out the help request form
3. Submit your request
4. View your requests and their status
5. Update or cancel open requests as needed

### For Admins
1. Navigate to `/admin_help.html`
2. View all help requests
3. Click on requests to view details
4. Accept, resolve, or dismiss requests
5. Handle password reset requests

## Categories
- **General Support** - General questions about services
- **Scholarship Help** - Scholarship application assistance
- **Technical Issues** - Website or login problems
- **Account Issues** - Account-related problems
- **Payment Issues** - Payment or billing problems
- **Other** - Miscellaneous issues

## Priorities
- **Low** - General questions, non-urgent
- **Normal** - Standard support needed
- **High** - Urgent issues requiring immediate attention

## Statuses
- **Open** - New request, not yet addressed
- **In Progress** - Request is being worked on
- **Resolved** - Request has been completed

## Security Features
- **Authentication Required** - All help endpoints require valid user authentication
- **User Isolation** - Users can only see and modify their own requests
- **Admin Authorization** - Only admins can manage all requests
- **Input Validation** - All inputs are validated and sanitized

## Customization

### Adding New Categories
1. Update the category validation in `routes/user-help.js`
2. Update the category options in `help-center.html`
3. Update the admin help page if needed

### Adding New Priorities
1. Update the priority validation in `routes/user-help.js`
2. Update the priority options in `help-center.html`
3. Update the priority badge styling

### Adding New Statuses
1. Update the database enum in the help_requests table
2. Update the status validation in the routes
3. Update the status badge styling

## Troubleshooting

### Common Issues
1. **"User not authenticated"** - Ensure user is logged in
2. **"Unauthorized"** - Check user permissions
3. **"Request not found"** - Verify request ID exists
4. **Database connection errors** - Check database configuration

### Debug Mode
Enable debug logging by setting environment variable:
```env
DEBUG=true
```

## Future Enhancements
- Email notifications for status changes
- File attachments for help requests
- Help request templates
- Automated responses for common issues
- Integration with ticketing systems
- Help request analytics and reporting

## Support
For technical support with the help center system, please contact the development team or create an issue in the project repository.
