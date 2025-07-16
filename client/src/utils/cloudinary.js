// Updated cloudinary.js - Enhanced with video support and proper detection
const CLOUDINARY_CLOUD_NAME = "dca26n68n";
const CLOUDINARY_API_KEY = "524321917376112";
const CLOUDINARY_UPLOAD_PRESET = "mitti_arts";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// EXISTING: Image upload function
export const uploadToCloudinary = async (file) => {
  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
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

// UPDATED: Image validation - increased to 10MB
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or BMP image.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  return true;
};

// NEW: Video validation function
export const validateVideoFile = (file) => {
  const validTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/3gp'
  ];
  
  const maxSize = 100 * 1024 * 1024; // 100MB for videos

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video file type. Please upload MP4, WebM, OGG, AVI, MOV, WMV, FLV, or 3GP video files.');
  }

  if (file.size > maxSize) {
    throw new Error('Video file size too large. Maximum size is 100MB.');
  }

  return true;
};

// NEW: Video upload function (FIXED - with proper type)
export const uploadVideoToCloudinary = async (file, options = {}) => {
  try {
    // Validate video file before upload
    validateVideoFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video'); // Specify video resource type
    
    // Video-specific options (only allowed parameters for unsigned upload)
    if (options.quality) {
      formData.append('quality', options.quality); // auto, best, good, low
    }
    
    if (options.format) {
      formData.append('format', options.format); // mp4, webm, mov, etc.
    }
    
    // Video optimization settings
    formData.append('video_codec', 'h264'); // Optimize for web
    formData.append('audio_codec', 'aac'); // Web-compatible audio
    
    console.log('Uploading video to Cloudinary...');
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary Video Upload Error:', errorData);
      throw new Error(errorData.error?.message || 'Video upload failed');
    }

    const data = await response.json();
    console.log('Video upload successful:', data);
    
    // Generate thumbnail URL manually (since we can't use eager with unsigned upload)
    const thumbnailTime = options.thumbnailTime || 2;
    const thumbnailUrl = generateVideoThumbnailUrl(data.public_id, {
      width: 400,
      height: 300,
      time: thumbnailTime
    });
    
    // Return structured video data with proper type
    return {
      type: 'video', // Important for counting and detection
      id: data.public_id,
      src: data.secure_url,
      thumbnail: thumbnailUrl,
      title: `Video ${Date.now()}`,
      duration: data.duration ? formatDuration(data.duration) : null,
      format: data.format,
      width: data.width,
      height: data.height,
      size: data.bytes,
      created_at: data.created_at,
      uploadedAt: new Date().toISOString(),
      // Add multiple quality URLs for responsive video
      qualities: {
        auto: data.secure_url,
        low: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:low/${data.public_id}.${data.format}`,
        good: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:good/${data.public_id}.${data.format}`,
        best: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/${data.public_id}.${data.format}`
      }
    };
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

// NEW: Get video metadata (client-side)
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

// NEW: Generate video thumbnail URL
export const generateVideoThumbnailUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 300,
    time = 1,
    format = 'jpg'
  } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/c_fill,h_${height},w_${width}/so_${time}/${publicId}.${format}`;
};

// NEW: Format video duration
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

// ENHANCED: Media type detection
export const getMediaType = (file) => {
  if (!file || !file.type) return 'unknown';
  
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
};

// ENHANCED: Video URL detection with Cloudinary support
export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.3gp'];
  const videoIndicators = [
    '/video/upload/',
    'video/upload',
    'resource_type=video',
    '/v_',
    'cloudinary.com/video',
    'res.cloudinary.com/video'
  ];
  const lowerUrl = url.toLowerCase();
  
  // Check for video file extensions
  const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext));
  
  // Check for Cloudinary video indicators
  const hasVideoIndicator = videoIndicators.some(indicator => lowerUrl.includes(indicator));
  
  return hasVideoExtension || hasVideoIndicator;
};

// ENHANCED: Count images (exclude video objects and URLs)
export const countImages = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => {
    if (!item) return false;
    
    // If it's an object, check the type property
    if (typeof item === 'object') {
      return item.type === 'image';
    }
    
    // If it's a string, check if it's NOT a video URL
    if (typeof item === 'string' && item.trim() !== '') {
      return !isVideoUrl(item);
    }
    
    return false;
  }).length;
};

// ENHANCED: Count videos (include video objects and video URLs)
export const countVideos = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => {
    if (!item) return false;
    
    // If it's an object, check the type property
    if (typeof item === 'object') {
      return item.type === 'video';
    }
    
    // If it's a string, check if it's a video URL
    if (typeof item === 'string' && item.trim() !== '') {
      return isVideoUrl(item);
    }
    
    return false;
  }).length;
};

// NEW: Helper function to get media type from item
export const getMediaTypeFromItem = (item) => {
  if (!item) return 'unknown';
  
  if (typeof item === 'object') {
    return item.type || 'unknown';
  }
  
  if (typeof item === 'string') {
    return isVideoUrl(item) ? 'video' : 'image';
  }
  
  return 'unknown';
};

// NEW: Media validation for mixed upload
export const validateMediaFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const videoTypes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 
    'video/mov', 'video/wmv', 'video/flv', 'video/3gp'
  ];

  if (imageTypes.includes(file.type)) {
    return validateImageFile(file);
  } else if (videoTypes.includes(file.type)) {
    return validateVideoFile(file);
  } else {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP, BMP) or video (MP4, WebM, OGG, AVI, MOV, WMV, FLV, 3GP) file.');
  }
};

// ENHANCED: Upload constraints validation
export const validateUploadConstraints = (files) => {
  if (!Array.isArray(files)) {
    files = [files];
  }
  
  const constraints = {
    maxFiles: 13, // 8 images + 5 videos
    maxTotalSize: 500 * 1024 * 1024, // 500MB total
    maxImageSize: 10 * 1024 * 1024, // 10MB per image
    maxVideoSize: 100 * 1024 * 1024, // 100MB per video
    maxVideos: 5,
    maxImages: 8
  };
  
  if (files.length > constraints.maxFiles) {
    throw new Error(`Too many files. Maximum ${constraints.maxFiles} files allowed.`);
  }
  
  let totalSize = 0;
  let videoCount = 0;
  let imageCount = 0;
  
  for (const file of files) {
    totalSize += file.size;
    
    const mediaType = getMediaType(file);
    
    if (mediaType === 'image') {
      imageCount++;
      if (file.size > constraints.maxImageSize) {
        throw new Error(`Image "${file.name}" is too large. Maximum ${constraints.maxImageSize / (1024 * 1024)}MB per image.`);
      }
      if (imageCount > constraints.maxImages) {
        throw new Error(`Too many images. Maximum ${constraints.maxImages} images allowed.`);
      }
    }
    
    if (mediaType === 'video') {
      videoCount++;
      if (file.size > constraints.maxVideoSize) {
        throw new Error(`Video "${file.name}" is too large. Maximum ${constraints.maxVideoSize / (1024 * 1024)}MB per video.`);
      }
      if (videoCount > constraints.maxVideos) {
        throw new Error(`Too many videos. Maximum ${constraints.maxVideos} videos allowed.`);
      }
    }
  }
  
  if (totalSize > constraints.maxTotalSize) {
    throw new Error(`Total file size too large. Maximum ${constraints.maxTotalSize / (1024 * 1024)}MB total.`);
  }
  
  return true;
};

// NEW: Helper to check if media array is mixed (has both images and videos)
export const hasMixedMedia = (mediaArray) => {
  const imageCount = countImages(mediaArray);
  const videoCount = countVideos(mediaArray);
  return imageCount > 0 && videoCount > 0;
};

// NEW: Get media statistics
export const getMediaStats = (mediaArray) => {
  const imageCount = countImages(mediaArray);
  const videoCount = countVideos(mediaArray);
  const totalCount = imageCount + videoCount;
  
  return {
    totalCount,
    imageCount,
    videoCount,
    hasMixed: imageCount > 0 && videoCount > 0,
    hasImages: imageCount > 0,
    hasVideos: videoCount > 0,
    isEmpty: totalCount === 0
  };
};