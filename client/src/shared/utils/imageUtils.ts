// Utility function to convert relative image paths to absolute URLs
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop';
  }
  
  // If it's already an absolute URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (imagePath.startsWith('/uploads/')) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
  
  // Fallback to placeholder image
  return 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop';
};

// Utility function to process car images array
export const processCarImages = (images: string[] | undefined): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(image => getImageUrl(image));
};

export default getImageUrl;
