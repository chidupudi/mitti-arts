// client/src/utils/imagekit-widget.js
// Complete frontend-only solution using ImageKit Upload Widget
// Install: npm install imagekit-javascript

// Simple frontend-only upload using ImageKit's upload widget
export const uploadWithImageKitWidget = () => {
  return new Promise((resolve, reject) => {
    // Create ImageKit upload widget
    const script = document.createElement('script');
    script.src = 'https://upload-widget.imagekit.io/sdk/v1/bundle.js';
    script.onload = () => {
      const uploadWidget = window.ImageKitUploadWidget.create({
        publicKey: "public_12/rKQGfyqwTYKoTiY0Aeo8fKqIJiY=",
        urlEndpoint: "https://ik.imagekit.io/mittiarts",
        
        // Widget configuration
        sources: ['local_file_system', 'url', 'camera'], // Allow local files, URLs, and camera
        folder: '/images/ganesh-idols',
        tags: ['ganesh', 'idol', 'mittiarts'],
        useUniqueFileName: true,
        
        // Styling
        modal: {
          overlay: 'rgba(0, 0, 0, 0.8)',
          background: '#ffffff',
          borderRadius: '8px',
          maxWidth: '600px'
        },
        
        // File restrictions
        accept: 'image/*,video/*',
        maxFileSize: 20 * 1024 * 1024, // 20MB
        
        onSuccess: (result) => {
          console.log('✅ ImageKit upload successful:', result);
          resolve({
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            type: result.fileType.startsWith('image/') ? 'image' : 'video',
            size: result.size,
            width: result.width,
            height: result.height
          });
        },
        
        onError: (error) => {
          console.error('❌ ImageKit upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        }
      });
      
      // Open the upload widget
      uploadWidget.open();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load ImageKit upload widget'));
    };
    
    document.head.appendChild(script);
  });
};

// Simple direct upload function (no authentication needed)
export const simpleImageKitUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', 'public_12/rKQGfyqwTYKoTiY0Aeo8fKqIJiY=');
    formData.append('folder', '/images/ganesh-idols');
    formData.append('fileName', `ganesh_${Date.now()}_${file.name}`);
    
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    const result = await response.json();
    
    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name
    };
    
  } catch (error) {
    console.error('Simple upload error:', error);
    throw error;
  }
};

// Validation functions
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