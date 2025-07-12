// Updated cloudinary.js - Adding video support to existing file
const CLOUDINARY_CLOUD_NAME = "dca26n68n";
const CLOUDINARY_API_KEY = "524321917376112";
const CLOUDINARY_UPLOAD_PRESET = "mitti_arts"; // Note: preset names are usually lowercase
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// EXISTING: Image upload function
export const uploadToCloudinary = async (file) => {
  try {
    // Validate file before upload
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

// UPDATED: Image validation - increased to 10MB and added BMP support
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 10 * 1024 * 1024; // 10MB (increased from 5MB)

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

// NEW: Video upload function
export const uploadVideoToCloudinary = async (file, options = {}) => {
  try {
    // Validate video file before upload
    validateVideoFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video'); // Specify video resource type
    
    // Video-specific options
    if (options.quality) {
      formData.append('quality', options.quality); // auto, best, good, low
    }
    
    if (options.format) {
      formData.append('format', options.format); // mp4, webm, mov, etc.
    }
    
    // Generate thumbnail at specific time (default: 1 second)
    const thumbnailTime = options.thumbnailTime || 1;
    formData.append('eager', `c_fill,h_300,w_400/so_${thumbnailTime}`);
    
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
    
    // Return structured video data
    return {
      id: data.public_id,
      src: data.secure_url,
      thumbnail: data.eager && data.eager.length > 0 ? data.eager[0].secure_url : generateVideoThumbnailUrl(data.public_id),
      duration: data.duration ? formatDuration(data.duration) : null,
      format: data.format,
      width: data.width,
      height: data.height,
      size: data.bytes,
      created_at: data.created_at,
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
      
      // Clean up
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
    time = 1, // Time in seconds
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

// EXISTING: Media validation (enhanced to include videos)
export const validateMediaFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const videoTypes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 
    'video/mov', 'video/wmv', 'video/flv', 'video/3gp'
  ];

  if (imageTypes.includes(file.type)) {
    return validateImageFile(file);
  } else if (videoTypes.includes(file.type)) {
    return validateVideoFile(file);
  } else {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG, AVI, MOV, WMV, FLV, 3GP) file.');
  }
};

// EXISTING: Utility functions (keeping existing ones)
export const countImages = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => 
    typeof item === 'string' || 
    (typeof item === 'object' && item?.type === 'image')
  ).length;
};

export const countVideos = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return 0;
  return mediaArray.filter(item => 
    typeof item === 'object' && item?.type === 'video'
  ).length;
};

export const getMediaType = (file) => {
  if (!file || !file.type) return 'unknown';
  
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'unknown';
};

export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.3gp'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const validateUploadConstraints = (files) => {
  if (!Array.isArray(files)) {
    files = [files];
  }
  
  const constraints = {
    maxFiles: 13, // 8 images + 5 videos
    maxTotalSize: 500 * 1024 * 1024, // 500MB total
    maxImageSize: 10 * 1024 * 1024, // 10MB per image
    maxVideoSize: 100 * 1024 * 1024, // 100MB per video
  };
  
  if (files.length > constraints.maxFiles) {
    throw new Error(`Too many files. Maximum ${constraints.maxFiles} files allowed.`);
  }
  
  let totalSize = 0;
  
  for (const file of files) {
    totalSize += file.size;
    
    const mediaType = getMediaType(file);
    
    if (mediaType === 'image' && file.size > constraints.maxImageSize) {
      throw new Error(`Image "${file.name}" is too large. Maximum ${constraints.maxImageSize / (1024 * 1024)}MB per image.`);
    }
    
    if (mediaType === 'video' && file.size > constraints.maxVideoSize) {
      throw new Error(`Video "${file.name}" is too large. Maximum ${constraints.maxVideoSize / (1024 * 1024)}MB per video.`);
    }
  }
  
  if (totalSize > constraints.maxTotalSize) {
    throw new Error(`Total file size too large. Maximum ${constraints.maxTotalSize / (1024 * 1024)}MB total.`);
  }
  
  return true;
};