# Scholarship Management System

A comprehensive web-based scholarship management system built with Node.js, Express, MySQL, and modern frontend technologies.

## Features

### 🎓 Core Features
- **Scholarship Management**: Create, edit, and manage scholarship opportunities
- **Application System**: Complete application process with document uploads
- **User Management**: Multi-role user system (Admin, User, Secretary)
- **Dashboard Analytics**: Real-time statistics and charts
- **Email Notifications**: Automated email system with customizable templates
- **Document Management**: Secure file upload and storage system

### 🔧 Admin Features
- **Comprehensive Dashboard**: Real-time statistics and analytics
- **User Management**: Create, edit, delete, and manage user accounts
- **Application Management**: Review and process scholarship applications
- **System Monitoring**: Database statistics and system health
- **Data Export**: Export data in CSV format
- **Role-based Access Control**: Secure admin-only features

### 📊 Analytics & Reporting
- **Application Trends**: Monthly application statistics
- **Scholarship Distribution**: Breakdown by type (Government, Private, NGO)
- **User Registration**: User growth analytics
- **Academic Level Statistics**: Undergraduate, Graduate, PhD breakdowns
- **System Performance**: Database size and activity monitoring

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MySQL**: Database management system
- **JWT**: Authentication and authorization
- **Multer**: File upload handling
- **bcryptjs**: Password hashing
- **Nodemailer**: Email functionality

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Styling with Tailwind CSS
- **JavaScript**: Client-side functionality
- **Chart.js**: Data visualization
- **Axios**: HTTP client
- **Font Awesome**: Icons

### Database
- **MySQL 8.0+**: Primary database
- **InnoDB**: Storage engine
- **Foreign Keys**: Referential integrity

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd scholarship-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

**Option 1: Automated Setup (Recommended)**
```bash
npm run setup:database
```

**Option 2: Manual Setup**
1. Create a MySQL database:
```sql
CREATE DATABASE mbappe;
```

2. Import the database schema:
```bash
mysql -u root -p mbappe < config/mbappe.sql
```

📖 **See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup instructions**

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mbappe

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret
```

### 5. Create Upload Directories
```bash
mkdir -p uploads/profile_pictures
mkdir -p uploads/documents
mkdir -p uploads/services
```

### 6. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **scholarships**: Scholarship opportunities
- **scholarship_applications**: Application submissions
- **partners**: Partner organizations
- **roles**: User roles and permissions
- **notifications**: System notifications
- **email_templates**: Email templates
- **contact_messages**: Contact form submissions

### Supporting Tables
- **services**: Available services
- **testimonials**: Partner testimonials
- **newsletter_subscribers**: Newsletter subscriptions
- **payments**: Payment records
- **plans**: Subscription plans
- **general_settings**: System configuration

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/applications` - Application management
- `GET /api/admin/chart-stats` - Chart data
- `GET /api/admin/system-stats` - System statistics
- `GET /api/admin/export/:type` - Data export

### Scholarship Endpoints
- `GET /api/scholarships` - List scholarships
- `POST /api/scholarships` - Create scholarship
- `PUT /api/scholarships/:id` - Update scholarship
- `DELETE /api/scholarships/:id` - Delete scholarship

### Application Endpoints
- `POST /api/applications` - Submit application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application

## User Roles & Permissions

### Admin
- Full system access
- User management
- Application processing
- System configuration
- Data export capabilities

### User
- Submit applications
- View personal dashboard
- Update profile information
- Track application status

### Secretary
- Manage documents
- Process applications
- Limited admin access

## File Structure

```
scholarship-management-system/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── admin.js             # Admin routes
│   ├── auth.js              # Authentication routes
│   ├── applications.js      # Application routes
│   ├── scholarships.js      # Scholarship routes
│   └── ...                  # Other route files
├── public/
│   ├── admin_dashboard.html # Admin dashboard
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client-side JavaScript
│   └── ...                  # Other static files
├── uploads/                 # File uploads
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Problem**: Cannot connect to MySQL database
**Solution**: 
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE mbappe;`

#### 2. File Upload Issues
**Problem**: Files not uploading or accessible
**Solution**:
- Check upload directory permissions
- Verify directory structure exists
- Ensure proper file size limits

#### 3. Authentication Issues
**Problem**: Login not working or token errors
**Solution**:
- Verify JWT_SECRET in `.env`
- Check user credentials in database
- Clear browser cache and localStorage

#### 4. Chart Data Not Loading
**Problem**: Dashboard charts showing no data
**Solution**:
- Check database for existing data
- Verify API endpoints are accessible
- Check browser console for errors

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_applications_date ON scholarship_applications(application_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scholarships_status ON scholarships(status);
```

#### File Upload Optimization
- Implement file compression
- Add file type validation
- Set appropriate file size limits

## Security Considerations

### Authentication & Authorization
- JWT tokens for session management
- Role-based access control
- Password hashing with bcrypt
- Secure password reset flow

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### File Security
- Secure file upload validation
- Virus scanning for uploads
- Access control for sensitive files

## Deployment

### Heroku Deployment (Recommended)

This application is configured for Heroku deployment. See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for detailed instructions.

#### Quick Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set DB_HOST=your-database-host
   heroku config:set DB_USER=your-database-user
   heroku config:set DB_PASSWORD=your-database-password
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Run Migrations**
   ```bash
   heroku run npm run migrate
   ```

#### Build Process

The application uses an automated build process:
- **Pre-build**: Cleans previous build artifacts
- **Build**: Compiles Tailwind CSS and processes assets
- **Post-build**: Runs validation and shows completion status

### Other Deployment Options

- **Docker**: Containerized deployment
- **AWS**: Cloud deployment
- **DigitalOcean**: VPS deployment

## Contributing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

## Changelog

### Version 1.0.0
- Initial release
- Core scholarship management features
- Admin dashboard
- User management system
- Application processing
- Email notifications
- File upload system





























