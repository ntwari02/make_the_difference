// Cloudinary File Upload Service for Vercel
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  constructor() {
    this.cloudinary = cloudinary;
  }

  // Upload file to Cloudinary
  async uploadFile(file, options = {}) {
    try {
      const defaultOptions = {
        folder: 'scholarships',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mov'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        ...options
      };

      const result = await this.cloudinary.uploader.upload(file, defaultOptions);
      
      return {
        success: true,
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('❌ File upload failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload image with specific transformations
  async uploadImage(file, transformations = []) {
    const options = {
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...transformations
      ]
    };

    return await this.uploadFile(file, options);
  }

  // Upload document
  async uploadDocument(file) {
    const options = {
      resource_type: 'raw',
      folder: 'scholarships/documents'
    };

    return await this.uploadFile(file, options);
  }

  // Upload video
  async uploadVideo(file) {
    const options = {
      resource_type: 'video',
      folder: 'scholarships/videos',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    return await this.uploadFile(file, options);
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'auto') {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      return {
        success: true,
        result: result.result
      };
    } catch (error) {
      console.error('❌ File deletion failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get optimized URL for image
  getOptimizedUrl(publicId, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    return this.cloudinary.url(publicId, finalOptions);
  }

  // Get responsive image URLs
  getResponsiveUrls(publicId) {
    const sizes = [320, 640, 960, 1280, 1920];
    
    return sizes.map(size => ({
      width: size,
      url: this.cloudinary.url(publicId, {
        width: size,
        crop: 'scale',
        quality: 'auto:good'
      })
    }));
  }

  // Health check
  async healthCheck() {
    try {
      // Try to access Cloudinary configuration
      const config = this.cloudinary.config();
      
      if (config.cloud_name && config.api_key && config.api_secret) {
        return {
          status: 'healthy',
          message: 'Cloudinary configured correctly',
          cloud_name: config.cloud_name
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Missing Cloudinary configuration'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
