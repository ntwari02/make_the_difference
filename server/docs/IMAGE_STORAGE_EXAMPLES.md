# Image Storage Usage Examples

This document provides practical examples of how to use the image storage system in the spare parts module.

## Frontend Examples

### 1. Upload Images (React/JavaScript)

```javascript
// Image upload component
import React, { useState } from 'react';

const ImageUpload = ({ sparePartId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    // Validate file sizes (5MB limit)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/spare-parts/${sparePartId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setProgress(100);
        onUploadSuccess(result.data.images);
        alert(`Successfully uploaded ${result.data.images.length} image(s)`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

### 2. Display Images with Thumbnails

```javascript
// Image gallery component
import React, { useState, useEffect } from 'react';

const ImageGallery = ({ sparePartId }) => {
  const [images, setImages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [sparePartId]);

  const fetchImages = async () => {
    try {
      // Fetch spare part data to get images
      const response = await fetch(`/api/spare-parts/${sparePartId}`);
      const result = await response.json();
      
      if (result.success && result.data.images) {
        setImages(result.data.images);
        
        // Fetch thumbnails
        const thumbResponse = await fetch(`/api/spare-parts/${sparePartId}/images/thumbnails`);
        const thumbResult = await thumbResponse.json();
        
        if (thumbResult.success) {
          setThumbnails(thumbResult.data.thumbnails);
        }
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageUrl) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/spare-parts/${sparePartId}/images`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrls: [imageUrl] })
      });

      const result = await response.json();
      
      if (result.success) {
        setImages(result.data.remaining_images);
        // Refresh thumbnails
        fetchImages();
        alert('Image deleted successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  if (loading) return <div>Loading images...</div>;

  return (
    <div className="image-gallery">
      <h3>Images ({images.length})</h3>
      
      {images.length === 0 ? (
        <p>No images uploaded yet</p>
      ) : (
        <div className="gallery-grid">
          {images.map((imageUrl, index) => (
            <div key={index} className="image-item">
              <img
                src={imageUrl}
                alt={`Spare part image ${index + 1}`}
                className="main-image"
                loading="lazy"
              />
              <div className="image-actions">
                <button onClick={() => deleteImage(imageUrl)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Thumbnail view */}
      {thumbnails.length > 0 && (
        <div className="thumbnail-gallery">
          <h4>Thumbnails</h4>
          <div className="thumbnail-grid">
            {thumbnails.map((thumbUrl, index) => (
              <img
                key={index}
                src={thumbUrl}
                alt={`Thumbnail ${index + 1}`}
                className="thumbnail"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
```

### 3. CSS Styles for Image Gallery

```css
/* Image Gallery Styles */
.image-gallery {
  margin: 20px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.image-item {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #f9f9f9;
}

.main-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions button {
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.image-actions button:hover {
  background: rgba(255, 0, 0, 1);
}

.thumbnail-gallery {
  margin-top: 30px;
}

.thumbnail-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* Upload Progress */
.progress {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-bar {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}
```

## Backend API Examples

### 1. Complete Spare Part with Images

```javascript
// Example: Creating a spare part with initial images
const sparePartData = {
  sku: 'BRAKE-PAD-001',
  name: 'Premium Brake Pads',
  description: 'High-quality ceramic brake pads for improved stopping power',
  category_id: 'cat1', // Brake System
  brand_id: 'brand1', // Example brand
  price: 89.99,
  currency: 'USD',
  seller_id: 'user123',
  images: [
    '/uploads/spare-parts/abc-123/1640995200000-brake-pad-front.webp',
    '/uploads/spare-parts/abc-123/1640995200001-brake-pad-side.webp'
  ],
  quantity_available: 50,
  vehicle_compatibility: [
    {
      make: 'Toyota',
      model: 'Camry',
      year_from: 2018,
      year_to: 2023
    }
  ]
};

// Create spare part
const sparePart = await sparePartsService.createSparePart(sparePartData);
```

### 2. Image Management Service

```javascript
// Image management utility service
class ImageManagementService {
  static async uploadImages(sparePartId, files, userId, userRole) {
    // Validate ownership
    if (userRole !== 'admin') {
      const part = await sparePartsService.getSparePartById(sparePartId);
      if (!part || part.seller_id !== userId) {
        throw new Error('Not authorized to upload images');
      }
    }

    // Process files
    const uploadsRoot = path.join(__dirname, 'uploads');
    const partDir = path.join(uploadsRoot, 'spare-parts', sparePartId);
    fs.mkdirSync(partDir, { recursive: true });

    const publicUrls = [];
    
    for (const file of files) {
      const filename = `${Date.now()}-${file.originalname}.webp`;
      const filePath = path.join(partDir, filename);
      
      // Process with Sharp
      await sharp(file.buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);
      
      // Create thumbnail
      const thumbPath = path.join(partDir, `thumb-${filename}`);
      await sharp(file.buffer)
        .resize({ width: 300, withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(thumbPath);
      
      publicUrls.push(`/uploads/spare-parts/${sparePartId}/${filename}`);
    }

    return publicUrls;
  }

  static async deleteImages(sparePartId, imageUrls, userId, userRole) {
    // Validate ownership
    if (userRole !== 'admin') {
      const part = await sparePartsService.getSparePartById(sparePartId);
      if (!part || part.seller_id !== userId) {
        throw new Error('Not authorized to delete images');
      }
    }

    const uploadsRoot = path.join(__dirname, 'uploads');
    
    for (const imageUrl of imageUrls) {
      const filePath = path.join(uploadsRoot, imageUrl.replace('/uploads/', ''));
      const thumbPath = filePath.replace(/([^/]+)$/, 'thumb-$1');
      
      // Delete files
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
  }
}
```

## Testing Examples

### 1. Unit Test for Image Upload

```javascript
// Test image upload functionality
describe('Image Upload', () => {
  test('should upload images successfully', async () => {
    const mockFile = {
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
      size: 1024
    };

    const mockSparePart = {
      id: 'test-id',
      seller_id: 'user123',
      images: []
    };

    // Mock dependencies
    jest.spyOn(sparePartsService, 'getSparePartById').mockResolvedValue(mockSparePart);
    jest.spyOn(sparePartsService, 'updateSparePart').mockResolvedValue({});
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(sharp.prototype, 'toFile').mockResolvedValue({});

    const req = {
      params: { id: 'test-id' },
      user: { id: 'user123', role: 'seller' },
      files: [mockFile]
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Call the upload route handler
    await uploadImagesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('Successfully uploaded')
      })
    );
  });
});
```

### 2. Integration Test

```javascript
// Integration test for complete image workflow
describe('Image Storage Integration', () => {
  test('complete image workflow', async () => {
    // 1. Create spare part
    const sparePart = await sparePartsService.createSparePart({
      name: 'Test Part',
      category_id: 'cat1',
      brand_id: 'brand1',
      price: 100,
      seller_id: 'user123'
    });

    // 2. Upload images
    const formData = new FormData();
    formData.append('images', createMockImageFile('test1.jpg'));
    formData.append('images', createMockImageFile('test2.jpg'));

    const uploadResponse = await request(app)
      .post(`/api/spare-parts/${sparePart.id}/images`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('images', createMockImageFile('test1.jpg'))
      .attach('images', createMockImageFile('test2.jpg'));

    expect(uploadResponse.status).toBe(201);
    expect(uploadResponse.body.success).toBe(true);

    // 3. Verify images are accessible
    const imageUrl = uploadResponse.body.data.images[0];
    const imageResponse = await request(app).get(imageUrl);
    expect(imageResponse.status).toBe(200);

    // 4. Get thumbnails
    const thumbResponse = await request(app)
      .get(`/api/spare-parts/${sparePart.id}/images/thumbnails`);
    
    expect(thumbResponse.status).toBe(200);
    expect(thumbResponse.body.data.thumbnails).toHaveLength(2);

    // 5. Delete images
    const deleteResponse = await request(app)
      .delete(`/api/spare-parts/${sparePart.id}/images`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ imageUrls: [imageUrl] });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});
```

## Performance Considerations

### 1. Image Optimization Settings

```javascript
// Optimized Sharp configuration
const imageProcessingConfig = {
  fullSize: {
    width: 1600,
    quality: 80,
    format: 'webp',
    effort: 6
  },
  thumbnail: {
    width: 300,
    quality: 70,
    format: 'webp',
    effort: 6
  }
};

// Use different settings based on use case
const processImage = async (buffer, config) => {
  return await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .resize({ 
      width: config.width, 
      withoutEnlargement: true 
    })
    .webp({ 
      quality: config.quality, 
      effort: config.effort 
    })
    .toBuffer();
};
```

### 2. Caching Strategy

```javascript
// Cache static files with appropriate headers
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d', // Cache for 7 days
  setHeaders: (res, path) => {
    // Set cache headers based on file type
    if (path.includes('thumb-')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days for thumbnails
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days for full images
    }
  }
}));
```

## Error Handling

### 1. Comprehensive Error Handling

```javascript
// Error handling middleware for image operations
const handleImageError = (error, operation) => {
  console.error(`Image ${operation} error:`, error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return { success: false, message: 'File too large. Maximum size is 5MB.' };
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return { success: false, message: 'Too many files. Maximum is 10 files.' };
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return { success: false, message: 'Unexpected file field name.' };
  }
  
  if (error.message.includes('Sharp')) {
    return { success: false, message: 'Invalid image format or corrupted file.' };
  }
  
  return { success: false, message: 'Image processing failed.' };
};
```

This comprehensive example shows how to implement the image storage best practices in a real-world application with proper error handling, validation, and user experience considerations.
