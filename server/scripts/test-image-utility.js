// Test the image utility function
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop';
  }
  
  // If it's already an absolute URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (imagePath.startsWith('/uploads/')) {
    const API_BASE_URL = 'http://localhost:3001/api';
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
  
  // Fallback to placeholder image
  return 'https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop';
};

// Test cases
console.log('=== TESTING IMAGE UTILITY ===');

const testCases = [
  '/uploads/cars/f4b42e58-514c-469d-8724-383c0d9e776b/1761049917952-adidas-nova-iii-infinity.png.webp',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
  undefined,
  null,
  '',
  '/invalid/path'
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase}`);
  console.log(`Result: ${getImageUrl(testCase)}`);
  console.log('---');
});

console.log('=== TEST COMPLETE ===');
