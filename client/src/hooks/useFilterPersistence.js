// hooks/useFilterPersistence.js - Reusable filter state persistence hook
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing filter state persistence across navigation
 * Works for all users (logged in and visitors) using sessionStorage
 * 
 * @param {string} key - Unique key for storing filter state
 * @param {Object} options - Configuration options
 * @returns {Object} Filter persistence methods
 */
const useFilterPersistence = (key, options = {}) => {
  const {
    expiryHours = 24, // How long to keep saved filters (default 24 hours)
    autoSave = true,   // Whether to auto-save on page unload
    debug = process.env.NODE_ENV === 'development'
  } = options;

  const autoSavedRef = useRef(false);

  // Save filter state to sessionStorage
  const saveFilterState = useCallback((filterState) => {
    try {
      const stateToSave = {
        ...filterState,
        timestamp: Date.now(),
        url: window.location.pathname,
        version: '1.0' // For future compatibility
      };

      sessionStorage.setItem(key, JSON.stringify(stateToSave));
      
      if (debug) {
        console.log(`✅ Filter state saved for ${key}:`, stateToSave);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error saving filter state for ${key}:`, error);
      return false;
    }
  }, [key, debug]);

  // Load filter state from sessionStorage
  const loadFilterState = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (!saved) {
        if (debug) {
          console.log(`📭 No saved filter state found for ${key}`);
        }
        return null;
      }

      const parsedState = JSON.parse(saved);
      
      // Check if state is expired
      const isExpired = parsedState.timestamp && 
        (Date.now() - parsedState.timestamp > expiryHours * 60 * 60 * 1000);
      
      if (isExpired) {
        if (debug) {
          console.log(`⏰ Filter state expired for ${key}, clearing...`);
        }
        sessionStorage.removeItem(key);
        return null;
      }

      // Remove metadata before returning
      const { timestamp, url, version, ...filterState } = parsedState;
      
      if (debug) {
        console.log(`✅ Filter state loaded for ${key}:`, {
          filterState,
          savedAt: new Date(timestamp).toISOString(),
          savedUrl: url
        });
      }
      
      return filterState;
    } catch (error) {
      console.error(`❌ Error loading filter state for ${key}:`, error);
      // Clear corrupted data
      try {
        sessionStorage.removeItem(key);
      } catch (clearError) {
        console.error('Error clearing corrupted filter state:', clearError);
      }
      return null;
    }
  }, [key, expiryHours, debug]);

  // Clear saved filter state
  const clearFilterState = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      if (debug) {
        console.log(`🗑️ Filter state cleared for ${key}`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Error clearing filter state for ${key}:`, error);
      return false;
    }
  }, [key, debug]);

  // Check if saved filter state exists
  const hasSavedFilters = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (!saved) return false;

      const parsedState = JSON.parse(saved);
      const isExpired = parsedState.timestamp && 
        (Date.now() - parsedState.timestamp > expiryHours * 60 * 60 * 1000);
      
      return !isExpired;
    } catch (error) {
      return false;
    }
  }, [key, expiryHours]);

  // Get saved filter metadata
  const getFilterMetadata = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (!saved) return null;

      const parsedState = JSON.parse(saved);
      return {
        timestamp: parsedState.timestamp,
        savedAt: parsedState.timestamp ? new Date(parsedState.timestamp) : null,
        url: parsedState.url,
        version: parsedState.version,
        isExpired: parsedState.timestamp && 
          (Date.now() - parsedState.timestamp > expiryHours * 60 * 60 * 1000)
      };
    } catch (error) {
      return null;
    }
  }, [key, expiryHours]);

  // Batch save multiple filter states (useful for complex filter systems)
  const saveBatchFilterState = useCallback((filterStates) => {
    const results = {};
    
    Object.entries(filterStates).forEach(([filterKey, filterState]) => {
      const fullKey = `${key}_${filterKey}`;
      results[filterKey] = saveFilterState(filterState);
    });
    
    return results;
  }, [key, saveFilterState]);

  // Batch load multiple filter states
  const loadBatchFilterState = useCallback((filterKeys) => {
    const results = {};
    
    filterKeys.forEach(filterKey => {
      const fullKey = `${key}_${filterKey}`;
      try {
        const saved = sessionStorage.getItem(fullKey);
        if (saved) {
          const parsedState = JSON.parse(saved);
          const isExpired = parsedState.timestamp && 
            (Date.now() - parsedState.timestamp > expiryHours * 60 * 60 * 1000);
          
          if (!isExpired) {
            const { timestamp, url, version, ...filterState } = parsedState;
            results[filterKey] = filterState;
          }
        }
      } catch (error) {
        console.error(`Error loading batch filter state for ${filterKey}:`, error);
      }
    });
    
    return results;
  }, [key, expiryHours]);

  // Auto-save filter state on page unload (if enabled)
  useEffect(() => {
    if (!autoSave) return;

    const handleBeforeUnload = (event) => {
      // This will be called when user is about to leave the page
      // The actual filter state should be saved by the component using this hook
      if (debug) {
        console.log(`📝 Page unload detected for ${key}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (debug) {
          console.log(`👁️ Page hidden detected for ${key}`);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSave, key, debug]);

  // Cleanup expired states on mount
  useEffect(() => {
    const cleanup = () => {
      try {
        const keysToRemove = [];
        
        // Check all sessionStorage keys that start with our prefix
        for (let i = 0; i < sessionStorage.length; i++) {
          const storageKey = sessionStorage.key(i);
          if (storageKey && storageKey.startsWith(key)) {
            try {
              const saved = sessionStorage.getItem(storageKey);
              if (saved) {
                const parsedState = JSON.parse(saved);
                const isExpired = parsedState.timestamp && 
                  (Date.now() - parsedState.timestamp > expiryHours * 60 * 60 * 1000);
                
                if (isExpired) {
                  keysToRemove.push(storageKey);
                }
              }
            } catch (parseError) {
              // Corrupted data, mark for removal
              keysToRemove.push(storageKey);
            }
          }
        }
        
        // Remove expired/corrupted keys
        keysToRemove.forEach(keyToRemove => {
          sessionStorage.removeItem(keyToRemove);
          if (debug) {
            console.log(`🧹 Cleaned up expired filter state: ${keyToRemove}`);
          }
        });
        
      } catch (error) {
        console.error('Error during filter state cleanup:', error);
      }
    };

    cleanup();
  }, [key, expiryHours, debug]);

  return {
    saveFilterState,
    loadFilterState,
    clearFilterState,
    hasSavedFilters,
    getFilterMetadata,
    saveBatchFilterState,
    loadBatchFilterState
  };
};

export default useFilterPersistence;

// Example usage in a component:
/*
const MyProductsPage = () => {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    category: 'all',
    sortBy: 'relevance'
  });

  const { 
    saveFilterState, 
    loadFilterState, 
    clearFilterState,
    hasSavedFilters 
  } = useFilterPersistence('myProductsFilters');

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = loadFilterState();
    if (savedFilters) {
      setFilters(savedFilters);
    }
  }, [loadFilterState]);

  // Save filters when navigating away
  const handleProductClick = (productId) => {
    saveFilterState(filters);
    navigate(`/product/${productId}`);
  };

  // Save filters when they change
  useEffect(() => {
    saveFilterState(filters);
  }, [filters, saveFilterState]);

  return (
    // Your component JSX
  );
};
*/
