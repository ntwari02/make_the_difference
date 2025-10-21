# Image Storage Best Practices Implementation

## Overview

This document outlines the best practice approach for storing images in the database, which is already implemented in this project.

## ✅ Best Practice Approach

### 1. Store Only File Paths, Not Binary Data

**Why this approach:**
- ✅ **Performance**: Database queries are faster without large binary data
- ✅ **Scalability**: Database size remains manageable
- ✅ **Backup**: Database backups are smaller and faster
- ✅ **Caching**: Static files can be cached by CDN/browser
- ✅ **Bandwidth**: Only serve images when needed

**Implementation:**
```sql
-- Database schema stores only file paths
CREATE TABLE spare_parts (
    id VARCHAR(36) PRIMARY KEY,
    images JSON,  -- Stores array of file paths like ["/uploads/spare-parts/123/image1.webp"]
    -- ... other fields
);
```

### 2. Serve /uploads as Static Files

**Implementation in `server/index.js`:**
```javascript
// Static serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads under /uploads for direct image access
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
}));
```

## Current Implementation Details

### File Structure
```
server/
├── uploads/
│   ├── spare-parts/
│   │   ├── {spare-part-id}/
│   │   │   ├── 1640995200000-image-name.webp
│   │   │   ├── thumb-1640995200000-image-name.webp
│   │   │   └── ...
│   │   └── ...
│   └── cars/
│       └── ...
└── index.js (serves /uploads as static)
```

### Database Storage
```json
{
  "images": [
    "/uploads/spare-parts/abc-123/1640995200000-brake-pad.webp",
    "/uploads/spare-parts/abc-123/1640995200001-brake-pad-side.webp"
  ]
}
```

### Image Processing Features

1. **Automatic Optimization**: Images are converted to WebP format
2. **Multiple Sizes**: Full-size and thumbnail versions created
3. **Quality Control**: 80% quality for full images, 70% for thumbnails
4. **Size Limits**: Max 1600px width for full images, 300px for thumbnails
5. **File Size Limits**: 5MB per file, up to 10 files per upload

## API Endpoints

### Upload Images
```http
POST /api/spare-parts/:id/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- images: File[] (up to 10 files, 5MB each)
```

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded",
  "data": {
    "images": ["/uploads/spare-parts/123/1640995200000-image.webp"],
    "all_images": ["/uploads/spare-parts/123/1640995200000-image.webp"]
  }
}
```

### Get Thumbnails
```http
GET /api/spare-parts/:id/images/thumbnails
```

**Response:**
```json
{
  "success": true,
  "data": {
    "thumbnails": ["/uploads/spare-parts/123/thumb-1640995200000-image.webp"]
  }
}
```

## Frontend Usage

### Displaying Images
```javascript
// Full-size image
<img src="/uploads/spare-parts/123/1640995200000-image.webp" alt="Spare Part" />

// Thumbnail
<img src="/uploads/spare-parts/123/thumb-1640995200000-image.webp" alt="Thumbnail" />
```

### Uploading Images
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const response = await fetch('/api/spare-parts/123/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Uploaded images:', result.data.images);
```

## Security Considerations

1. **Authentication Required**: Only authenticated sellers/admins can upload
2. **Ownership Validation**: Users can only upload to their own spare parts
3. **File Type Validation**: Only image files are processed
4. **Size Limits**: Prevents abuse with file size restrictions
5. **Safe Filenames**: Original filenames are sanitized

## Performance Benefits

1. **Database Performance**: No binary data in queries
2. **Caching**: Static files cached by browser/CDN
3. **Bandwidth**: Images served only when requested
4. **Scalability**: Database size remains manageable
5. **Backup Speed**: Faster database backups

## File Management

### Automatic Cleanup
When spare parts are deleted, associated image files should be cleaned up:

```javascript
// Example cleanup function (to be implemented)
async function cleanupSparePartImages(sparePartId) {
  const partDir = path.join(__dirname, 'uploads', 'spare-parts', sparePartId);
  if (fs.existsSync(partDir)) {
    fs.rmSync(partDir, { recursive: true, force: true });
  }
}
```

### File Organization
- Images are organized by spare part ID
- Timestamps prevent filename conflicts
- WebP format reduces file sizes
- Thumbnails enable fast loading

## Migration from Binary Storage

If migrating from binary storage in database:

1. **Export existing images** from database
2. **Save to file system** in `/uploads` directory
3. **Update database records** with file paths
4. **Remove binary columns** from database schema

## Monitoring and Maintenance

1. **Disk Space**: Monitor `/uploads` directory size
2. **File Count**: Track number of uploaded files
3. **Orphaned Files**: Periodically clean up unused images
4. **Performance**: Monitor static file serving performance

## Conclusion

This implementation follows industry best practices by:
- ✅ Storing only file paths in database
- ✅ Serving images as static files via `/uploads`
- ✅ Optimizing images for web delivery
- ✅ Providing multiple image sizes
- ✅ Implementing proper security measures

The approach ensures optimal performance, scalability, and maintainability for image storage in the application.
