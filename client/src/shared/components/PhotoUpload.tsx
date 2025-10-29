import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface PhotoUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  uploadEndpoint?: string;
  entityId?: string;
  entityType?: 'profile' | 'spare-part' | 'car';
  disabled?: boolean;
  showPreview?: boolean;
  previewHeight?: number;
  aspectRatio?: string;
  label?: string;
  description?: string;
  profileMode?: boolean; // New prop for profile photo mode
  avatarSize?: number; // Size for profile avatar
  showLabel?: boolean; // Whether to show the label
  fallbackText?: string; // Text to show when no image (e.g., business name initial)
  // New props
  hideOverlayActions?: boolean; // Hide edit/delete overlay in grid mode
  replaceOnUpload?: boolean; // Replace existing images with the newly uploaded one(s)
  newestFirst?: boolean; // When appending, place new images first
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  uploadEndpoint,
  entityId,
  entityType = 'profile',
  disabled = false,
  showPreview = true,
  previewHeight = 120,
  aspectRatio = '16/9',
  label = 'Upload Photos',
  description = 'Click to upload images or drag and drop',
  profileMode = false,
  avatarSize = 80,
  showLabel = true,
  fallbackText = '',
  hideOverlayActions = false,
  replaceOnUpload = false,
  newestFirst = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; image: string; index: number }>({
    open: false,
    image: '',
    index: -1,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve image src to support production deployments behind a different origin
  const publicBase = (import.meta as any)?.env?.VITE_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';
  const resolveSrc = (raw: string) => {
    if (!raw) return raw;
    if (raw.startsWith('data:')) return raw;
    if (raw.startsWith('http')) return raw;
    if (raw.startsWith('/uploads')) return `${publicBase}${raw}`;
    return `${publicBase}/uploads/${raw.replace(/^\/+/, '')}`;
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`;
    }
    return null;
  };

  const uploadToServer = async (files: File[]): Promise<string[]> => {
    if (!uploadEndpoint || !entityId) {
      throw new Error('Upload endpoint or entity ID not provided');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      // Get token from localStorage with fallback options
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');

      console.log('PhotoUpload: Token found:', token ? 'Yes' : 'No');
      console.log('PhotoUpload: Upload endpoint:', uploadEndpoint);
      console.log('PhotoUpload: Entity ID:', entityId);

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Clean token (remove quotes and whitespace)
      const cleanToken = token.trim().replace(/^"+|"+$/g, '');

      const response = await axios.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${cleanToken}`,
        },
      });

      const uploaded = response.data?.data?.images || response.data?.images || [];
      if (!Array.isArray(uploaded) || uploaded.length === 0) {
        throw new Error('Upload succeeded but no images returned');
      }
      return uploaded;
    } catch (error: any) {
      console.error('PhotoUpload: Upload error:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || error.message || 'Upload failed');
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
    }

    // If not replacing, check capacity
    if (!replaceOnUpload && maxImages > 0) {
      if (images.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let newImageUrls: string[] = [];

      if (uploadEndpoint && entityId) {
        // Upload to server
        newImageUrls = await uploadToServer(files);
      } else {
        // Convert to base64 for local preview
        newImageUrls = await Promise.all(files.map(convertToBase64));
      }

      // Replacement or ordering strategy
      if (replaceOnUpload || maxImages === 1) {
        const latest = newImageUrls[newImageUrls.length - 1];
        onImagesChange(latest ? [latest] : []);
      } else {
        const combined = newestFirst ? [...newImageUrls, ...images] : [...images, ...newImageUrls];
        const limited = maxImages > 0 ? combined.slice(0, maxImages) : combined;
        onImagesChange(limited);
      }
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    console.log('🗑️ Attempting to delete image:', imageToRemove);
    console.log('📝 All images:', images);
    
    // Remove from local state immediately for better UX
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // If we have an upload endpoint, delete from server
    if (uploadEndpoint && imageToRemove && !imageToRemove.startsWith('data:')) {
      try {
        const token = localStorage.getItem('access_token') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('authToken') || 
                      localStorage.getItem('accessToken') || 
                      localStorage.getItem('userToken');

        if (!token) {
          console.warn('No auth token found, deleting locally only');
          toast.success('Image removed');
          return;
        }

        const cleanToken = token.trim().replace(/^"+|"+$/g, '');
        
        // Convert upload endpoint to delete endpoint
        // Use the exact same endpoint for DELETE
        const deleteEndpoint = uploadEndpoint;
        console.log('🌐 Sending DELETE to:', deleteEndpoint);
        console.log('📦 Request data:', { imageUrls: [imageToRemove] });
        
        const response = await axios({
          method: 'DELETE',
          url: deleteEndpoint,
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            imageUrls: [imageToRemove]
          }
        });
        
        console.log('✅ Delete response:', response.data);
        
        console.log('✅ Image deleted successfully from server');
        toast.success('Image deleted successfully');
        
        // Reload the profile to get updated image list from server
        try {
          // Reload the profile from the API to get the latest images
          const token = localStorage.getItem('access_token') || 
                        localStorage.getItem('token') || 
                        localStorage.getItem('authToken') || 
                        localStorage.getItem('accessToken') || 
                        localStorage.getItem('userToken');
          
          if (token) {
            const cleanToken = token.trim().replace(/^"+|"+$/g, '');
            const profileResponse = await axios.get('/api/seller/profile', {
              headers: { 'Authorization': `Bearer ${cleanToken}` }
            });
            
            const updatedImages = profileResponse.data?.data?.images || [];
            console.log('🔄 Updated images from server:', updatedImages);
            onImagesChange(updatedImages);
          }
        } catch (reloadErr) {
          console.error('Failed to reload profile:', reloadErr);
        }
      } catch (error: any) {
        console.error('❌ Failed to delete image from server:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || 'Failed to delete image');
        // Revert to original images if delete failed
        onImagesChange(images);
      }
    } else {
      console.log('ℹ️ No upload endpoint or base64 image, deleting locally only');
      toast.success('Image removed');
    }
  };

  const openPreview = (image: string, index: number) => {
    setPreviewDialog({ open: true, image, index });
  };

  const closePreview = () => {
    setPreviewDialog({ open: false, image: '', index: -1 });
  };

  // Profile mode rendering
  if (profileMode) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: '50%',
              border: '3px dashed',
              borderColor: disabled ? 'grey.300' : 'primary.main',
              backgroundColor: disabled ? 'grey.50' : 'primary.50',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              '&:hover': disabled ? {} : {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.100',
                transform: 'scale(1.02)',
              },
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={disabled}
            />

            {images.length > 0 ? (
              <Box
                component="img"
                src={resolveSrc(images[0])}
                alt="Profile"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openPreview(images[0], 0);
                }}
              />
            ) : fallbackText ? (
              <Typography
                sx={{
                  fontSize: avatarSize * 0.4,
                  fontWeight: 700,
                  color: disabled ? 'grey.400' : 'primary.main',
                }}
              >
                {fallbackText}
              </Typography>
            ) : (
              <UploadIcon sx={{ fontSize: avatarSize * 0.4, color: disabled ? 'grey.400' : 'primary.main' }} />
            )}

            {/* Photo icon overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                width: avatarSize * 0.3,
                height: avatarSize * 0.3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  fileInputRef.current?.click();
                }
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: avatarSize * 0.15, color: 'white' }} />
            </Box>

            {uploading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
              >
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ width: '60%', color: 'white' }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {showLabel && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {disabled ? 'Upload disabled' : 'Click to upload profile photo'}
          </Typography>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={previewDialog.open}
          onClose={closePreview}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Profile Photo Preview</Typography>
            <IconButton onClick={closePreview}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={resolveSrc(previewDialog.image)}
                alt="Profile Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closePreview}>Close</Button>
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                removeImage(previewDialog.index);
                closePreview();
              }}
              disabled={disabled}
            >
              Remove Photo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      {showLabel && (
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          {label}
        </Typography>
      )}
      {description && showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      {/* Upload Area */}
      <Box
        sx={{
          border: '2px dashed',
          borderColor: disabled ? 'grey.300' : 'primary.main',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: disabled ? 'grey.50' : 'primary.50',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': disabled ? {} : {
            borderColor: 'primary.dark',
            backgroundColor: 'primary.100',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <UploadIcon sx={{ fontSize: 48, color: disabled ? 'grey.400' : 'primary.main', mb: 1 }} />
        <Typography variant="body1" color={disabled ? 'grey.500' : 'primary.main'} gutterBottom>
          {disabled ? 'Upload disabled' : 'Click to upload or drag and drop'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxFileSize}MB each
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {images.length}/{maxImages} images uploaded
        </Typography>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Uploading...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Image Previews */}
      {showPreview && images.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Images ({images.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {images.map((image, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: { xs: '48%', sm: '30%', md: '22%' },
                  aspectRatio,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                }}
                onClick={() => openPreview(image, index)}
              >
                <Box
                  component="img"
                  src={resolveSrc(image)}
                  alt={`Upload ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e: any) => {
                    console.error('❌ Failed to load image:', image, e);
                  }}
                  onLoad={() => {
                    console.log('✅ Successfully loaded:', image);
                  }}
                />
                
                {/* Overlay Actions */}
                {!hideOverlayActions && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(image, index);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          sx={{ color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          disabled={disabled}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Image Preview</Typography>
          <IconButton onClick={closePreview}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={resolveSrc(previewDialog.image)}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              removeImage(previewDialog.index);
              closePreview();
            }}
            disabled={disabled}
          >
            Remove Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoUpload;
