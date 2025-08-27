# Advertisement System Documentation

## Overview

The advertisement system has been successfully implemented on the MBAPE Global website. It includes a 60-second countdown timer with skip functionality that becomes available after 5 seconds. Advertisements are shown every 30 minutes and support both images and videos.

## Features

### Frontend Features
- **30-minute interval display** - Advertisements appear every 30 minutes automatically
- **60-second countdown timer** - Shows remaining time before advertisement can be skipped
- **Skip functionality** - Available after 5 seconds for images, after 50% for videos
- **Video support** - Full video advertisement support with autoplay and controls
- **Video progress tracking** - Skip button becomes available after 50% of video is watched
- **Responsive design** - Works on all device sizes
- **Dark mode support** - Compatible with the site's dark mode theme
- **Image and video support** - Can display both images and videos
- **Click tracking** - Tracks when users click on advertisements
- **Video event handling** - Pauses countdown when video is paused, resumes when played

### Backend Features
- **RESTful API** - Complete CRUD operations for advertisements
- **Active advertisement retrieval** - Only shows currently active advertisements
- **Date-based scheduling** - Advertisements can be scheduled with start and end dates
- **Admin management interface** - Full admin panel for managing advertisements
- **Database persistence** - MySQL database with proper indexing

## Files Created/Modified

### Backend Files
- `routes/advertisements.js` - API routes for advertisement management
- `server.js` - Added advertisement routes
- `migrations/add_advertisements_table.sql` - Database migration
- `run_advertisement_migration.js` - Migration runner script

### Frontend Files
- `public/js/advertisement.js` - Advertisement display logic
- `public/admin-advertisements.html` - Admin management interface
- `public/js/admin-advertisements.js` - Admin interface functionality
- `public/home.html` - Added advertisement script
- `public/test-advertisement.html` - Test page for demonstration

## Database Schema

```sql
CREATE TABLE advertisements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    link_url VARCHAR(500),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_date (is_active, start_date, end_date),
    INDEX idx_created_at (created_at)
);
```

## API Endpoints

### Public Endpoints
- `GET /api/advertisements/active` - Get currently active advertisement
- `POST /api/advertisements/track-view` - Track advertisement views/clicks

### Admin Endpoints
- `GET /api/advertisements` - Get all advertisements
- `POST /api/advertisements` - Create new advertisement
- `PUT /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement
- `PATCH /api/advertisements/:id/toggle` - Toggle advertisement status

## How to Use

### For Users
1. Visit any page on the website
2. Advertisements will automatically appear every 30 minutes
3. For image ads: Wait 5 seconds for the skip button to become available
4. For video ads: Skip button becomes available after watching 50% of the video
5. Click "Skip Ad" or wait for the countdown/video to complete
6. Advertisements will appear again after 30 minutes

### For Administrators
1. Access the admin panel at `/admin-advertisements.html`
2. Click "Add New Advertisement" to create a new ad
3. Fill in the required fields:
   - Title (required)
   - Description
   - Image URL or Video URL
   - Link URL (optional)
   - Start and End dates (required)
   - Active status
4. Save the advertisement
5. Use the toggle button to activate/deactivate advertisements
6. Edit or delete advertisements as needed

## Testing

### Test the Advertisement System
1. Visit `http://localhost:3000/test-advertisement.html`
2. The advertisement should appear automatically
3. Use the "Clear Session" button to test the advertisement again
4. Use the "Test API" button to see the API response

### Test the Admin Interface
1. Visit `http://localhost:3000/admin-advertisements.html`
2. Create, edit, and manage advertisements
3. Test the toggle functionality
4. Verify that changes are reflected in the frontend

## Configuration

### Advertisement Display Settings
- **Display interval**: 30 minutes (configurable in `advertisement.js`)
- **Countdown duration**: 60 seconds (configurable in `advertisement.js`)
- **Skip delay**: 5 seconds for images, 50% for videos (configurable in `advertisement.js`)
- **Session storage key**: 'lastAdTime' (configurable in `advertisement.js`)

### Database Configuration
- Ensure MySQL is running
- Database name: `mbappe`
- Table name: `advertisements`

## Sample Data

The migration includes three sample advertisements:
1. "Special Scholarship Opportunity" - Image ad, active for 30 days
2. "Study Abroad Guide" - Image ad, active for 15 days
3. "Video: Study Abroad Success Stories" - Video ad, active for 45 days

## Security Considerations

- Admin endpoints should be protected with authentication
- Input validation is implemented on all endpoints
- SQL injection protection through parameterized queries
- XSS protection through proper HTML escaping

## Future Enhancements

- Analytics dashboard for advertisement performance
- A/B testing capabilities
- Geographic targeting
- User behavior tracking
- Multiple advertisement rotation
- Custom countdown durations per advertisement

## Troubleshooting

### Common Issues
1. **Advertisement not showing**: Check if there are active advertisements in the database and if 30 minutes have passed since last ad
2. **Skip button not working**: Ensure 5 seconds have passed for images or 50% of video has been watched
3. **Video not playing**: Check video URL and browser compatibility
4. **API errors**: Check server logs and database connection
5. **Admin interface not loading**: Verify authentication and permissions

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding correctly
3. Check database for active advertisements
4. Clear browser session storage to reset advertisement state
5. Check video URLs for accessibility and format compatibility
6. Verify 30-minute interval timing in session storage
