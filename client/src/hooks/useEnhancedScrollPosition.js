// Enhanced Scroll Position Hook with Third-Party Libraries
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWindowScroll, useLocalStorage, useSessionStorage, useDebounce } from 'react-use';
// import useScrollPositionLib from 'use-scroll-position'; // Removed due to compatibility issues
import { useInView } from 'react-intersection-observer';
import { useScrollActions, useScrollPosition as useStoreScrollPosition } from '../stores/scrollStore';

/**
 * Enhanced scroll position hook that combines multiple third-party libraries
 * for maximum reliability and compatibility across all browsers and devices
 */
export const useEnhancedScrollPosition = (key = 'defaultScrollPosition', options = {}) => {
  const {
    enabled = true,
    throttleMs = 100,
    saveThreshold = 100,
    restoreDelay = 100,
    maxRetries = 5,
    enableIntersectionObserver = true,
    enableLocalStorageBackup = true,
    enableDebugLogs = process.env.NODE_ENV === 'development',
  } = options;

  const location = useLocation();
  const {
    saveScrollPosition: saveToStore,
    clearScrollPosition: clearFromStore,
    setNavigationContext,
    getReturnFlag,
    clearReturnFlag,
  } = useScrollActions();

  // Get current scroll position from Zustand store
  const storedPosition = useStoreScrollPosition(key);

  // React-use hooks for multiple scroll tracking methods
  const { x: windowX, y: windowY } = useWindowScroll();
  const [localStoragePosition, setLocalStoragePosition] = useLocalStorage(
    `scroll-${key}`,
    null
  );
  const [sessionStoragePosition, setSessionStoragePosition] = useSessionStorage(
    `scroll-${key}`,
    null
  );

  // State management
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastSavedPosition, setLastSavedPosition] = useState(null);
  const restoreTimeoutRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  // Debounced scroll position for performance
  const debouncedY = useDebounce(windowY, throttleMs);
  const debouncedX = useDebounce(windowX, throttleMs);

  // Intersection Observer for scroll events (alternative detection method)
  const [scrollTriggerRef, inView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Custom scroll position tracking as replacement for problematic library
  const [scrollPositionLib, setScrollPositionLib] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!enabled) return;
    
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScrollPositionLib(prevPos => {
          const newPos = {
            x: window.pageXOffset || document.documentElement.scrollLeft || 0,
            y: window.pageYOffset || document.documentElement.scrollTop || 0,
          };
          // Only update if position actually changed
          if (newPos.x !== prevPos.x || newPos.y !== prevPos.y) {
            return newPos;
          }
          return prevPos;
        });
      }, throttleMs);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [enabled, throttleMs]);

  // Get current scroll position with multiple fallback methods
  const getCurrentScrollPosition = useCallback(() => {
    // Method 1: Use react-use windowScroll
    let x = windowX || 0;
    let y = windowY || 0;

    // Method 2: Fallback to custom scroll tracking
    if (x === 0 && y === 0) {
      x = scrollPositionLib.x || 0;
      y = scrollPositionLib.y || 0;
    }

    // Method 3: Fallback to native browser APIs
    if (x === 0 && y === 0) {
      x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      timestamp: Date.now(),
      url: location.pathname,
      method: x === windowX ? 'react-use' : y === scrollPositionLib.y ? 'custom-scroll' : 'native',
    };
  }, [windowX, windowY, scrollPositionLib.x, scrollPositionLib.y, location.pathname]);

  // Enhanced save function with multiple storage methods
  const saveScrollPosition = useCallback((additionalData = {}) => {
    if (!enabled) return;

    const position = getCurrentScrollPosition();
    
    // Only save if scrolled significantly
    if (position.y < saveThreshold && !additionalData.force) {
      return;
    }

    try {
      // Method 1: Save to Zustand store (primary)
      saveToStore(key, position.x, position.y, {
        ...additionalData,
        savedBy: 'enhanced-hook',
        libraries: ['zustand', 'react-use', 'custom-scroll'],
      });

      // Method 2: Save to localStorage (backup)
      if (enableLocalStorageBackup) {
        setLocalStoragePosition(position);
      }

      // Method 3: Save to sessionStorage (additional backup)
      setSessionStoragePosition(position);

      // Method 4: Save to native sessionStorage (legacy support)
      sessionStorage.setItem(`enhanced-scroll-${key}`, JSON.stringify(position));

      setLastSavedPosition(position);

      if (enableDebugLogs) {
        console.log(`✅ [EnhancedScroll] Saved position for ${key}:`, position);
      }

      return position;
    } catch (error) {
      console.error(`❌ [EnhancedScroll] Failed to save position for ${key}:`, error);
      return null;
    }
  }, [
    enabled,
    saveToStore,
    key,
    saveThreshold,
    enableLocalStorageBackup,
    setLocalStoragePosition,
    setSessionStoragePosition,
    enableDebugLogs,
    windowX,
    windowY,
    scrollPositionLib.x,
    scrollPositionLib.y,
    location.pathname,
  ]);

  // Enhanced restore function with multiple attempts and fallbacks
  const restoreScrollPosition = useCallback(async (options = {}) => {
    if (!enabled || isRestoring) return false;

    const {
      forceRestore = false,
      maxAttempts = maxRetries,
      delay = restoreDelay,
    } = options;

    setIsRestoring(true);
    retryCountRef.current = 0;

    return new Promise((resolve) => {
      const attemptRestore = (attemptNumber = 1) => {
        try {
          // Try multiple sources for position data
          let position = null;

          // Method 1: Get from Zustand store
          if (storedPosition) {
            position = storedPosition;
            if (enableDebugLogs) {
              console.log(`📦 [EnhancedScroll] Using Zustand store position`);
            }
          }

          // Method 2: Fallback to localStorage
          if (!position && localStoragePosition) {
            position = localStoragePosition;
            if (enableDebugLogs) {
              console.log(`💾 [EnhancedScroll] Using localStorage position`);
            }
          }

          // Method 3: Fallback to sessionStorage
          if (!position && sessionStoragePosition) {
            position = sessionStoragePosition;
            if (enableDebugLogs) {
              console.log(`🗃️ [EnhancedScroll] Using sessionStorage position`);
            }
          }

          // Method 4: Fallback to native sessionStorage
          if (!position) {
            try {
              const nativePosition = sessionStorage.getItem(`enhanced-scroll-${key}`);
              if (nativePosition) {
                position = JSON.parse(nativePosition);
                if (enableDebugLogs) {
                  console.log(`🔧 [EnhancedScroll] Using native sessionStorage position`);
                }
              }
            } catch (error) {
              console.warn('Failed to parse native sessionStorage position:', error);
            }
          }

          if (!position) {
            if (enableDebugLogs) {
              console.log(`❌ [EnhancedScroll] No saved position found for ${key}`);
            }
            setIsRestoring(false);
            resolve(false);
            return;
          }

          const { x = 0, y = 0 } = position;

          // Check document readiness
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

          const canScrollToY = y <= (documentHeight - window.innerHeight);
          const canScrollToX = x <= (documentWidth - window.innerWidth);

          if (!canScrollToY || !canScrollToX) {
            if (attemptNumber < maxAttempts) {
              const retryDelay = Math.min(delay * attemptNumber, 2000);
              if (enableDebugLogs) {
                console.log(`⏳ [EnhancedScroll] Document not ready (attempt ${attemptNumber}/${maxAttempts}), retrying in ${retryDelay}ms...`);
              }
              
              restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), retryDelay);
              return;
            } else {
              // Partial restoration
              const safeY = Math.min(y, Math.max(0, documentHeight - window.innerHeight));
              const safeX = Math.min(x, Math.max(0, documentWidth - window.innerWidth));
              
              window.scrollTo({ top: safeY, left: safeX, behavior: 'smooth' });
              
              if (enableDebugLogs) {
                console.log(`⚠️ [EnhancedScroll] Partial restoration to: ${safeX}, ${safeY}`);
              }
            }
          } else {
            // Perfect restoration
            window.scrollTo({ top: y, left: x, behavior: 'smooth' });
            
            if (enableDebugLogs) {
              console.log(`✅ [EnhancedScroll] Restored position: ${x}, ${y} (attempt ${attemptNumber})`);
            }
          }

          // Verify restoration
          setTimeout(() => {
            const actualX = window.pageXOffset || 0;
            const actualY = window.pageYOffset || 0;
            const tolerance = 10;

            const successfulX = Math.abs(actualX - x) <= tolerance;
            const successfulY = Math.abs(actualY - y) <= tolerance;

            if (successfulX && successfulY) {
              setIsRestoring(false);
              resolve(true);
            } else if (attemptNumber < maxAttempts) {
              const retryDelay = Math.min(delay * attemptNumber, 2000);
              restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), retryDelay);
            } else {
              setIsRestoring(false);
              resolve(false);
            }
          }, 100);

        } catch (error) {
          console.error(`❌ [EnhancedScroll] Error during restoration attempt ${attemptNumber}:`, error);
          
          if (attemptNumber < maxAttempts) {
            const retryDelay = Math.min(delay * attemptNumber, 2000);
            restoreTimeoutRef.current = setTimeout(() => attemptRestore(attemptNumber + 1), retryDelay);
          } else {
            setIsRestoring(false);
            resolve(false);
          }
        }
      };

      attemptRestore(1);
    });
  }, [
    enabled,
    isRestoring,
    maxRetries,
    restoreDelay,
    key,
    enableDebugLogs,
  ]);

  // Clear all saved positions
  const clearScrollPosition = useCallback(() => {
    try {
      clearFromStore(key);
      setLocalStoragePosition(null);
      setSessionStoragePosition(null);
      sessionStorage.removeItem(`enhanced-scroll-${key}`);
      setLastSavedPosition(null);

      if (enableDebugLogs) {
        console.log(`🗑️ [EnhancedScroll] Cleared all positions for ${key}`);
      }
    } catch (error) {
      console.error(`❌ [EnhancedScroll] Failed to clear positions for ${key}:`, error);
    }
  }, [clearFromStore, key, setLocalStoragePosition, setSessionStoragePosition, enableDebugLogs]);

  // Auto-save on scroll with debouncing (prevent infinite loops)
  const lastSavedY = useRef(0);
  
  useEffect(() => {
    if (!enabled || debouncedY === lastSavedY.current) return;

    const saveTimeout = setTimeout(() => {
      if (debouncedY > saveThreshold && debouncedY !== lastSavedY.current) {
        lastSavedY.current = debouncedY;
        saveScrollPosition();
      }
    }, 50);

    return () => clearTimeout(saveTimeout);
  }, [debouncedY, enabled, saveThreshold, saveScrollPosition]);

  // Auto-save on page unload (stable references)
  const handleBeforeUnloadRef = useRef();
  const handleVisibilityChangeRef = useRef();
  
  useEffect(() => {
    if (!enabled) return;

    handleBeforeUnloadRef.current = () => {
      const position = getCurrentScrollPosition();
      if (position.y > saveThreshold) {
        saveScrollPosition({ force: true, trigger: 'beforeunload' });
      }
    };

    handleVisibilityChangeRef.current = () => {
      if (document.hidden) {
        const position = getCurrentScrollPosition();
        if (position.y > saveThreshold) {
          saveScrollPosition({ force: true, trigger: 'visibilitychange' });
        }
      }
    };

    const beforeUnloadHandler = () => handleBeforeUnloadRef.current?.();
    const visibilityHandler = () => handleVisibilityChangeRef.current?.();

    window.addEventListener('beforeunload', beforeUnloadHandler);
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [enabled, saveThreshold]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

    if (enableDebugLogs) {
      console.log(`🔝 [EnhancedScroll] Scrolled to top (smooth: ${smooth})`);
    }
  }, [clearScrollPosition, enableDebugLogs]);

  // Check if position exists
  const hasSavedPosition = useCallback(() => {
    return !!(storedPosition || localStoragePosition || sessionStoragePosition);
  }, [storedPosition, localStoragePosition, sessionStoragePosition]);

  // Get debug information
  const getDebugInfo = useCallback(() => {
    return {
      key,
      currentPosition: getCurrentScrollPosition(),
      savedPositions: {
        zustand: storedPosition,
        localStorage: localStoragePosition,
        sessionStorage: sessionStoragePosition,
      },
      state: {
        isRestoring,
        lastSavedPosition,
        retryCount: retryCountRef.current,
      },
      libraries: {
        'react-use': { x: windowX, y: windowY },
        'custom-scroll': scrollPositionLib,
        'intersection-observer': { inView },
      },
      settings: options,
    };
  }, [
    key,
    getCurrentScrollPosition,
    storedPosition,
    localStoragePosition,
    sessionStoragePosition,
    isRestoring,
    lastSavedPosition,
    windowX,
    windowY,
    scrollPositionLib,
    inView,
    options,
  ]);

  return {
    // Core functions
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    scrollToTop,
    
    // State
    currentPosition: getCurrentScrollPosition(),
    isRestoring,
    hasSavedPosition: hasSavedPosition(),
    
    // Utilities
    getDebugInfo,
    
    // Scroll trigger ref for intersection observer
    scrollTriggerRef,
  };
};

export default useEnhancedScrollPosition;