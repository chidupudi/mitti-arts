// Simple Scroll Position Hook - Stable Version
import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Simple, stable scroll position hook without complex dependencies
 */
export const useSimpleScrollPosition = (key = 'defaultScrollPosition') => {
  const location = useLocation();
  const isRestoringRef = useRef(false);

  // Simple save function
  const saveScrollPosition = useCallback((additionalData = {}) => {
    try {
      const scrollData = {
        x: window.pageXOffset || document.documentElement.scrollLeft || 0,
        y: window.pageYOffset || document.documentElement.scrollTop || 0,
        timestamp: Date.now(),
        url: location.pathname,
        ...additionalData,
      };

      // Save to sessionStorage
      sessionStorage.setItem(key, JSON.stringify(scrollData));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [SimpleScroll] Saved position for ${key}:`, scrollData);
      }

      return scrollData;
    } catch (error) {
      console.error(`❌ [SimpleScroll] Failed to save position for ${key}:`, error);
      return null;
    }
  }, [key, location.pathname]);

  // Simple restore function
  const restoreScrollPosition = useCallback(async (options = {}) => {
    if (isRestoringRef.current) return false;

    const { maxAttempts = 5, delay = 150 } = options;
    isRestoringRef.current = true;

    return new Promise((resolve) => {
      const attemptRestore = (attemptNumber = 1) => {
        try {
          const savedData = sessionStorage.getItem(key);
          if (!savedData) {
            isRestoringRef.current = false;
            resolve(false);
            return;
          }

          const position = JSON.parse(savedData);
          const { x = 0, y = 0 } = position;

          // Check if document is ready
          const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          );

          const canScrollToY = y <= (documentHeight - window.innerHeight);

          if (!canScrollToY && attemptNumber < maxAttempts) {
            setTimeout(() => attemptRestore(attemptNumber + 1), delay * attemptNumber);
            return;
          }

          // Scroll to position
          window.scrollTo({
            top: Math.min(y, Math.max(0, documentHeight - window.innerHeight)),
            left: x,
            behavior: 'smooth'
          });

          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [SimpleScroll] Restored position: ${x}, ${y}`);
          }

          isRestoringRef.current = false;
          resolve(true);

        } catch (error) {
          console.error(`❌ [SimpleScroll] Restore failed:`, error);
          
          if (attemptNumber < maxAttempts) {
            setTimeout(() => attemptRestore(attemptNumber + 1), delay * attemptNumber);
          } else {
            isRestoringRef.current = false;
            resolve(false);
          }
        }
      };

      attemptRestore(1);
    });
  }, [key]);

  // Clear saved position
  const clearScrollPosition = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ [SimpleScroll] Cleared position for ${key}`);
      }
    } catch (error) {
      console.error(`❌ [SimpleScroll] Failed to clear position for ${key}:`, error);
    }
  }, [key]);

  // Get current scroll position
  const getCurrentScrollPosition = useCallback(() => {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || 0,
      timestamp: Date.now(),
      url: location.pathname,
    };
  }, [location.pathname]);

  // Check if saved position exists
  const hasSavedPosition = useCallback(() => {
    try {
      return !!sessionStorage.getItem(key);
    } catch (error) {
      return false;
    }
  }, [key]);

  // Scroll to top
  const scrollToTop = useCallback((options = {}) => {
    const { smooth = true, clearSaved = false } = options;
    
    if (clearSaved) {
      clearScrollPosition();
    }
    
    if (smooth) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [clearScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    getCurrentScrollPosition,
    hasSavedPosition,
    scrollToTop,
    currentPosition: getCurrentScrollPosition(),
    isRestoring: isRestoringRef.current,
  };
};

export default useSimpleScrollPosition;