// src/utils/imagekit.js

import ImageKit from "imagekit-javascript";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: "YOUR_PUBLIC_KEY", // Replace with your ImageKit public key
  urlEndpoint: "https://ik.imagekit.io/mittiarts", // Your URL-endpoint
  authenticationEndpoint: "https://your-server.com/auth" // Optional: for server-side security
});

/**
 * Validates an image file based on type and size.
 * @param {File} file - The file to validate.
 */
export const validateImageFile = (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please select an image.');
  }
  if (file.size > 20 * 1024 * 1024) { // 20MB
    throw new Error('File size exceeds 20MB.');
  }
  return true;
};

/**
 * Validates a video file based on type and size.
 * @param {File} file - The file to validate.
 */
export const validateVideoFile = (file) => {
  if (!file.type.startsWith('video/')) {
    throw new Error('Invalid file type. Please select a video.');
  }
  if (file.size > 100 * 1024 * 1024) { // 100MB
    throw new Error('File size exceeds 100MB.');
  }
  return true;
};

/**
 * A simple direct upload function.
 * @param {File} file - The file to upload.
 * @param {object} options - Upload options (folder, tags, etc.).
 * @returns {Promise<object>} - A promise that resolves with the upload result.
 */
export const simpleImageKitUpload = (file, options = {}) => {
  return imagekit.upload({
    file: file,
    fileName: file.name,
    ...options,
  });
};

/**
 * Opens the ImageKit Media Library Widget for uploading.
 * @returns {Promise<object>} A promise that resolves with the first selected file's data.
 */
export const uploadWithImageKitWidget = () => {
  return new Promise((resolve, reject) => {
    const scriptId = 'imagekit-media-library-widget-script';
    
    // Check if the script is already loaded
    if (document.getElementById(scriptId)) {
      initializeWidget(resolve, reject);
      return;
    }

    // Load the script dynamically
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/imagekit-media-library-widget/dist/imagekit-media-library-widget.min.js';
    script.async = true;

    script.onload = () => {
      initializeWidget(resolve, reject);
    };

    script.onerror = () => {
      reject(new Error('Failed to load ImageKit upload widget'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Helper to initialize the widget and handle callbacks.
 */
function initializeWidget(resolve, reject) {
  try {
    const mediaLibraryWidget = new window.IKMediaLibraryWidget({
      container: '#media-library-container', // A temporary container is created
      view: 'modal',
      renderOpenButton: false, // We will open it programmatically
      imagekit: imagekit, // Pass the initialized ImageKit instance
      callback: (payload) => {
        if (payload.event === 'close') {
          // You can handle close event if needed
        }
        if (payload.event === 'insert') {
          // Resolve with the first selected item
          if (payload.data && payload.data.length > 0) {
            resolve(payload.data[0]);
          }
        }
      },
    });

    // We need a dummy container for the widget to attach to
    let container = document.getElementById('media-library-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'media-library-container';
      document.body.appendChild(container);
    }
    
    // Open the widget programmatically
    mediaLibraryWidget.open();

  } catch (error) {
    reject(error);
  }
}