// client/src/hooks/useScrollPosition.js - Hook for scroll position management
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollPosition = (storageKey = 'scrollPosition') => {
  const location = useLocation();
  const saveTimeoutRef = useRef(null);
  const isRestoringRef = useRef(false);

  // Save scroll position to session storage
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current) return; // Don't save while restoring
    
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem(storageKey, scrollY.toString());
    
    // Also store additional metadata
    const scrollData = {
      position: scrollY,
      timestamp: Date.now(),
      pathname: location.pathname
    };
    sessionStorage.setItem(`${storageKey}_meta`, JSON.stringify(scrollData));
  }, [storageKey, location.pathname]);

  // Restore scroll position from session storage
  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem(storageKey);
    
    if (savedPosition) {
      isRestoringRef.current = true;
      
      const position = parseInt(savedPosition, 10);
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
          
          // Reset the restoring flag after animation completes
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 500);
          
          console.log(`Restored scroll position for ${storageKey}:`, position);
        }, 50);
      });
      
      return true;
    }
    
    return false;
  }, [storageKey]);

  // Clear stored scroll position
  const clearScrollPosition = useCallback(() => {
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(`${storageKey}_meta`);
  }, [storageKey]);

  // Auto-save scroll position on scroll (throttled)
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Throttle saves to every 100ms
      saveTimeoutRef.current = setTimeout(() => {
        saveScrollPosition();
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveScrollPosition]);

  // Save on page unload/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveScrollPosition(); // Save on component unmount
    };
  }, [saveScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition
  };
};

export default useScrollPosition;