const CLOUDINARY_CLOUD_NAME = "dca26n68n";
const CLOUDINARY_API_KEY = "524321917376112";
const CLOUDINARY_UPLOAD_PRESET = "mitti_arts"; // Note: preset names are usually lowercase
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

export const uploadToCloudinary = async (file, resourceType = 'auto') => {
  try {
    // Validate file before upload - no need to pass currentFiles here since validation happens in components
    validateMediaFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', resourceType); // 'auto' detects image/video automatically
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary Error Details:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const validateMediaFile = (file, currentFiles = [], index = null) => {
  // Supported file types
  const supportedImageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp', 'image/bmp'
  ];
  
  const supportedVideoTypes = [
    'video/mp4', 'video/webm', 'video/mov', 
    'video/avi', 'video/quicktime'
  ];

  const isImage = supportedImageTypes.includes(file.type);
  const isVideo = supportedVideoTypes.includes(file.type);

  if (!isImage && !isVideo) {
    throw new Error('Please upload a valid image (JPEG, PNG, GIF, WebP, BMP) or video (MP4, WebM, MOV, AVI) file');
  }

  // Different size limits for images and videos
  const imageMaxSize = 10 * 1024 * 1024; // 10MB for images
  const videoMaxSize = 100 * 1024 * 1024; // 100MB for videos

  if (isImage && file.size > imageMaxSize) {
    throw new Error('Image file size must be under 10MB');
  }

  if (isVideo && file.size > videoMaxSize) {
    throw new Error('Video file size must be under 100MB');
  }

  // Count existing videos in current files (if provided)
  if (isVideo && currentFiles && currentFiles.length > 0) {
    const existingVideos = currentFiles.filter((fileUrl, idx) => {
      // Don't count the current slot being replaced
      if (index !== null && idx === index) return false;
      
      // Check if the URL indicates a video file
      return fileUrl && (
        fileUrl.includes('.mp4') || 
        fileUrl.includes('.webm') || 
        fileUrl.includes('.mov') || 
        fileUrl.includes('.avi') ||
        fileUrl.includes('video/') ||
        // Cloudinary video URLs often contain '/video/'
        fileUrl.includes('/video/')
      );
    }).length;

    if (existingVideos >= 2) {
      throw new Error('Maximum 2 videos allowed. You can have:\n• 6 images + 2 videos\n• 7 images + 1 video\n• 8 images + 0 videos');
    }
  }

  return {
    isValid: true,
    fileType: isVideo ? 'video' : 'image',
    size: file.size,
    fileName: file.name,
    mimeType: file.type
  };
};

// Helper function to detect if a URL is a video
export const isVideoUrl = (url) => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('/video/') || 
         lowerUrl.includes('video/');
};

// Helper function to get media type from URL
export const getMediaType = (url) => {
  return isVideoUrl(url) ? 'video' : 'image';
};

// Helper function to count videos in an array of URLs
export const countVideos = (files = []) => {
  return files.filter(file => file && isVideoUrl(file)).length;
};

// Helper function to count images in an array of URLs
export const countImages = (files = []) => {
  return files.filter(file => file && !isVideoUrl(file) && file !== 'loading').length;
};

// Helper function to validate upload constraints
export const validateUploadConstraints = (currentFiles = [], newFileType = 'image') => {
  const videoCount = countVideos(currentFiles);
  const imageCount = countImages(currentFiles);
  
  if (newFileType === 'video') {
    if (videoCount >= 2) {
      return {
        canUpload: false,
        message: 'Maximum 2 videos allowed. Remove a video to upload another.'
      };
    }
  }
  
  const totalFiles = currentFiles.filter(file => file && file !== 'loading').length;
  if (totalFiles >= 8) {
    return {
      canUpload: false,
      message: 'Maximum 8 files allowed. Remove a file to upload another.'
    };
  }
  
  return {
    canUpload: true,
    message: `Can upload ${newFileType}. Current: ${imageCount} images, ${videoCount} videos`
  };
};

// Keep the old function name for backward compatibility
export const validateImageFile = validateMediaFile;