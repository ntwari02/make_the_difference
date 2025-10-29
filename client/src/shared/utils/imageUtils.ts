// Utility function to convert relative image paths to absolute URLs
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop';
  }
  
  // Already absolute
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Resolve base URL from envs (match PhotoUpload behavior)
  const publicBase = (import.meta as any)?.env?.VITE_PUBLIC_API_BASE_URL || (import.meta as any)?.env?.VITE_API_BASE_URL || (import.meta as any)?.env?.VITE_API_URL || '';
  const normalizedBase = String(publicBase || '').replace(/\/+$/, '').replace(/\/?api\/?$/, '');
  
  // If it's a relative path starting with /uploads, prepend base
  if (imagePath.startsWith('/uploads/')) {
    return `${normalizedBase}${imagePath}`;
  }
  
  // If it's a bare filename or relative without leading slash, serve under /uploads
  return `${normalizedBase}/uploads/${imagePath.replace(/^\/+/, '')}`;
};

// Utility function to process car images array
export const processCarImages = (images: string[] | undefined): string[] => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(image => getImageUrl(image));
};

export default getImageUrl;
