// hooks/useScrollPosition.js - Enhanced version with visitor support
import { useCallback, useEffect, useRef } from 'react';

/**
 * Enhanced scroll position hook that works for all users (logged in and visitors)
 * Provides reliable scroll position saving and restoration with multiple fallback mechanisms
 */
const useScrollPosition = (key = 'defaultScrollPosition') => {
  const isRestoringRef = useRef(false);
  const savedPositionRef = useRef(null);
  const restoreTimeoutRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);

  // Enhanced save scroll position with multiple storage methods
  const saveScrollPosition = useCallback(() => {
    try {
      const scrollData = {
        x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
        y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
        timestamp: Date.now(),
        url: window.location.pathname,
        userAgent: navigator.userAgent.substring(0, 100) // For browser consistency
      };

      // Save to sessionStorage (primary method)
      sessionStorage.setItem(key, JSON.stringify(scrollData));
      
      // Save to memory as fallback
      savedPositionRef.current = scrollData;
      
      console.log(`✅ Scroll position saved for ${key}:`, scrollData);
      
      return scrollData;
    } catch (error) {
      console.error('❌ Error saving scroll position:', error);
      
      // Fallback to memory storage
      const fallbackData = {
        x: window.pageXOffset || 0,
        y: window.pageYOffset || 0,
        timestamp: Date.now(),
        url: window.location.pathname
      };
      
      savedPositionRef.current = fallbackData;
      return fallbackData;
    }
  }, [key]);

  // Enhanced restore scroll position with multiple attempts and fallbacks
  const restoreScrollPosition = useCallback((options = {}) => {
    const {
      maxAttempts = 5,
      initialDelay = 100,
      maxDelay = 2000,
      forceRestore = false
    } = options;

    // Prevent multiple simultaneous restoration attempts
    if (isRestoringRef.current && !forceRestore) {
      console.log('⚠️ Scroll restoration already in progress, skipping...');
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      isRestoringRef.current = true;
      
      const attemptRestore = (attemptNumber = 1) => {
        try {
          // Try to get saved position from sessionStorage first
          let scrollData = null;
          
          try {
            const savedData = sessionStorage.getItem(key);
            if (savedData) {
              scrollData = JSON.parse(savedData);
            }
          } catch (sessionError) {
            console.warn('⚠️ SessionStorage failed, using memory fallback:', sessionError);
          }
          
          // Fallback to memory storage
          if (!scrollData && savedPositionRef.current) {
            scrollData = savedPositionRef.current;
            console.log('📦 Using memory fallback for scroll position');
          }

          if (!scrollData) {
            console.log('❌ No saved scroll position found');
            isRestoringRef.current = false;
            resolve(false);
            return;
          }

          // Validate scroll data
          const { x = 0, y = 0, timestamp, url } = scrollData;
          
          // Check if data is too old (24 hours)
          const isStale = timestamp && (Date.now() - timestamp > 24 * 60 * 60 * 1000);
          if (isStale) {
            console.log('⏰ Scroll position data is stale, skipping restoration');
            isRestoringRef.current = false;
            resolve(false);
            return;
          }

          // Check if URL matches (optional safety check)
          if (url && url !== window.location.pathname) {
            console.log(`🔄 URL mismatch: saved=${url}, current=${window.location.pathname}`);
            // Continue anyway as user might have navigated properly
          }

          // Check if document is ready for scrolling
          const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );

          const documentWidth = Math.max(
            document.body.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.clientWidth,
            document.documentElement.scrollWidth,
            document.documentElement.offsetWidth
          );

          // Check if we can scroll to the saved position
          const canScrollToY = y <= (documentHeight - window.innerHeight);
          const canScrollToX = x <= (documentWidth - window.innerWidth);

          if (!canScrollToY || !canScrollToX) {
            if (attemptNumber < maxAttempts) {
              // Content might still be loading, try again
              const delay = Math.min(initialDelay * attemptNumber, maxDelay);
              console.log(`⏳ Document not ready for scroll (attempt ${attemptNumber}/${maxAttempts}), retrying in ${delay}ms...`);
              console.log(`📊 Document size: ${documentWidth}x${documentHeight}, Target: ${x},${y}, Viewport: ${window.innerWidth}x${window.innerHeight}`);
              
              restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), delay);
              return;
            } else {
              console.log('⚠️ Max attempts reached, performing partial scroll restoration');
              // Perform partial restoration - scroll as far as possible
              const safeY = Math.min(y, Math.max(0, documentHeight - window.innerHeight));
              const safeX = Math.min(x, Math.max(0, documentWidth - window.innerWidth));
              
              window.scrollTo(safeX, safeY);
              console.log(`📍 Partial scroll restored to: ${safeX}, ${safeY} (requested: ${x}, ${y})`);
            }
          } else {
            // Perfect conditions for restoration
            window.scrollTo(x, y);
            console.log(`✅ Scroll position restored to: ${x}, ${y} (attempt ${attemptNumber})`);
          }

          // Verify the scroll actually happened
          const actualX = window.pageXOffset || document.documentElement.scrollLeft || 0;
          const actualY = window.pageYOffset || document.documentElement.scrollTop || 0;
          
          const tolerance = 10; // Allow 10px tolerance
          const successfulX = Math.abs(actualX - x) <= tolerance;
          const successfulY = Math.abs(actualY - y) <= tolerance;

          if (successfulX && successfulY) {
            console.log(`🎯 Scroll restoration successful! Target: (${x}, ${y}), Actual: (${actualX}, ${actualY})`);
            isRestoringRef.current = false;
            resolve(true);
          } else if (attemptNumber < maxAttempts) {
            // Scroll didn't work as expected, try again
            console.log(`🔄 Scroll verification failed (attempt ${attemptNumber}), retrying... Target: (${x}, ${y}), Actual: (${actualX}, ${actualY})`);
            const delay = Math.min(initialDelay * attemptNumber, maxDelay);
            restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), delay);
          } else {
            console.log(`⚠️ Scroll restoration partially successful after ${maxAttempts} attempts. Target: (${x}, ${y}), Final: (${actualX}, ${actualY})`);
            isRestoringRef.current = false;
            resolve(false);
          }

        } catch (error) {
          console.error(`❌ Error during scroll restoration attempt ${attemptNumber}:`, error);
          
          if (attemptNumber < maxAttempts) {
            const delay = Math.min(initialDelay * attemptNumber, maxDelay);
            restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), delay);
          } else {
            isRestoringRef.current = false;
            resolve(false);
          }
        }
      };

      // Start the restoration process
      attemptRestore(1);

      // Fallback timeout to prevent infinite waiting
      fallbackTimeoutRef.current = setTimeout(() => {
        if (isRestoringRef.current) {
          console.log('⏰ Scroll restoration timeout reached, giving up');
          isRestoringRef.current = false;
          resolve(false);
        }
      }, maxDelay * maxAttempts);
    });
  }, [key]);

  // Clear saved scroll position
  const clearScrollPosition = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      savedPositionRef.current = null;
      console.log(`🗑️ Scroll position cleared for ${key}`);
    } catch (error) {
      console.error('❌ Error clearing scroll position:', error);
      // Clear memory fallback anyway
      savedPositionRef.current = null;
    }
  }, [key]);

  // Get current scroll position
  const getCurrentScrollPosition = useCallback(() => {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
      timestamp: Date.now(),
      url: window.location.pathname
    };
  }, []);

  // Check if saved scroll position exists
  const hasSavedPosition = useCallback(() => {
    try {
      const savedData = sessionStorage.getItem(key);
      return !!(savedData || savedPositionRef.current);
    } catch (error) {
      return !!savedPositionRef.current;
    }
  }, [key]);

  // Enhanced scroll to top with smooth animation
  const scrollToTop = useCallback((options = {}) => {
    const { smooth = true, clearSaved = false } = options;
    
    if (clearSaved) {
      clearScrollPosition();
    }
    
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ 
        top: 0, 
        left: 0, 
        behavior: 'smooth' 
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [clearScrollPosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      isRestoringRef.current = false;
    };
  }, []);

  // Auto-save scroll position on page unload (for emergencies)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.pageYOffset > 100) { // Only save if scrolled significantly
        saveScrollPosition();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && window.pageYOffset > 100) {
        saveScrollPosition();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    getCurrentScrollPosition,
    hasSavedPosition,
    scrollToTop,
    isRestoring: isRestoringRef.current
  };
};

export default useScrollPosition;