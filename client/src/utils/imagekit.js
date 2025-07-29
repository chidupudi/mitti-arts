// client/src/utils/imagekit.js - UPDATED with proper authentication
import ImageKit from 'imagekit-javascript';

// Initialize ImageKit client
const imagekit = new ImageKit({
  publicKey: "public_12/rKQGfyqwTYKoTiY0Aeo8fKqIJiY=",
  urlEndpoint: "https://ik.imagekit.io/mittiarts",
  // Authentication endpoint that fetches signature from your backend
  authenticationEndpoint: process.env.NODE_ENV === 'production' 
    ? "https://your-domain.com/api/imagekit-auth"  // Replace with your production domain
    : "http://localhost:3001/api/imagekit-auth"    // Your local backend
});

// Upload to ImageKit with proper authentication
export const uploadToImageKit = async (file, options = {}) => {
  try {
    console.log('🚀 Starting ImageKit upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate file
    validateImageFile(file);

    // Prepare upload options
    const uploadOptions = {
      file: file,
      fileName: options.fileName || `ganesh_image_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      folder: options.folder || "/images/ganesh-idols",
      tags: options.tags || ["ganesh", "idol", "mittiarts"],
      useUniqueFileName: true,
      responseFields: "tags,customCoordinates,isPrivateFile,metadata",
      
      // Progress callback
      onProgress: (progress) => {
        console.log(`📊 Upload progress: ${progress.loaded}/${progress.total} (${Math.round(progress.loaded/progress.total*100)}%)`);
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    };

    // Upload using ImageKit SDK (it will automatically get auth params from authenticationEndpoint)
    const result = await imagekit.upload(uploadOptions);
    
    console.log('✅ ImageKit upload successful:', result);
    
    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      width: result.width,
      height: result.height,
      metadata: result
    };

  } catch (error) {
    console.error('❌ Error uploading to ImageKit:', error);
    
    // Handle specific error types
    if (error.message?.includes('authentication')) {
      throw new Error('ImageKit authentication failed. Please check your authentication endpoint.');
    } else if (error.message?.includes('file size')) {
      throw new Error('File size exceeds the maximum limit (20MB for images).');
    } else if (error.message?.includes('file type')) {
      throw new Error('Unsupported file type. Please upload JPEG, PNG, GIF, WebP, or BMP images.');
    }
    
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

// Video upload to ImageKit
export const uploadVideoToImageKit = async (file, options = {}) => {
  try {
    console.log('🎥 Starting ImageKit video upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Validate video file
    validateVideoFile(file);

    const uploadOptions = {
      file: file,
      fileName: options.fileName || `ganesh_video_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      folder: options.folder || "/videos/ganesh-idols",
      tags: options.tags || ["ganesh", "idol", "video", "mittiarts"],
      useUniqueFileName: true,
      responseFields: "tags,customCoordinates,isPrivateFile,metadata",
      
      onProgress: (progress) => {
        console.log(`📊 Video upload progress: ${progress.loaded}/${progress.total} (${Math.round(progress.loaded/progress.total*100)}%)`);
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    };

    const result = await imagekit.upload(uploadOptions);
    
    console.log('✅ ImageKit video upload successful:', result);
    
    return {
      type: 'video',
      src: result.url,
      thumbnail: `${result.url}?tr=so-1.0`, // Generate thumbnail at 1 second
      title: options.title || `Video ${Date.now()}`,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      format: result.fileType,
      uploadedAt: new Date().toISOString(),
      metadata: result
    };

  } catch (error) {
    console.error('❌ Error uploading video to ImageKit:', error);
    throw new Error(`ImageKit video upload failed: ${error.message}`);
  }
};

// Image validation (supports ImageKit limits)
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 20 * 1024 * 1024; // 20MB for ImageKit free plan

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, WebP, or BMP images.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 20MB for images.');
  }

  return true;
};

// Video validation (supports ImageKit limits)
export const validateVideoFile = (file) => {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];
  
  const maxSize = 100 * 1024 * 1024; // 100MB for ImageKit free plan

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video file type. Please upload MP4, WebM, OGG, AVI, MOV, or WMV videos.');
  }

  if (file.size > maxSize) {
    throw new Error('Video file size too large. Maximum size is 100MB.');
  }

  return true;
};

// Generate optimized ImageKit URL
export const generateImageKitUrl = (path, transformations = []) => {
  try {
    return imagekit.url({
      path: path,
      transformation: transformations
    });
  } catch (error) {
    console.error('Error generating ImageKit URL:', error);
    return path; // Return original path as fallback
  }
};

// Generate responsive image URLs
export const generateResponsiveUrls = (path) => {
  return {
    thumbnail: generateImageKitUrl(path, [{ width: 150, height: 150, crop: 'maintain_ratio' }]),
    small: generateImageKitUrl(path, [{ width: 300, height: 220, crop: 'maintain_ratio' }]),
    medium: generateImageKitUrl(path, [{ width: 600, height: 400, crop: 'maintain_ratio' }]),
    large: generateImageKitUrl(path, [{ width: 1200, height: 800, crop: 'maintain_ratio' }]),
    original: generateImageKitUrl(path)
  };
};

// Get video metadata (client-side) - ADDED MISSING EXPORT
export const getVideoMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight
      });
      
      window.URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = window.URL.createObjectURL(file);
  });
};

// Format video duration - ADDED MISSING EXPORT
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return null;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `0:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Media type detection - ADDED MISSING EXPORT
export const getMediaType = (file) => {
  if (!file || !file.type) return 'unknown';
  
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
};

// Test ImageKit connection
export const testImageKitConnection = async () => {
  try {
    // Try to generate a simple URL to test connection
    const testUrl = generateImageKitUrl('/test-image.jpg', [{ width: 100, height: 100 }]);
    
    console.log('✅ ImageKit connection test successful');
    console.log('Test URL:', testUrl);
    
    return { success: true, testUrl };
  } catch (error) {
    console.error('❌ ImageKit connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Utility functions for media detection (keeping compatibility with existing code)
export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv'];
  const videoIndicators = ['/videos/', 'video/upload', 'ik.imagekit.io'];
  const lowerUrl = url.toLowerCase();
  
  const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext));
  const hasVideoIndicator = videoIndicators.some(indicator => lowerUrl.includes(indicator));
  
  return hasVideoExtension || hasVideoIndicator;
};

export const countImages = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => {
    if (!item) return false;
    
    if (typeof item === 'object') {
      return item.type === 'image';
    }
    
    if (typeof item === 'string' && item.trim() !== '') {
      return !isVideoUrl(item);
    }
    
    return false;
  }).length;
};

export const countVideos = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => {
    if (!item) return false;
    
    if (typeof item === 'object') {
      return item.type === 'video';
    }
    
    if (typeof item === 'string' && item.trim() !== '') {
      return isVideoUrl(item);
    }
    
    return false;
  }).length;
};