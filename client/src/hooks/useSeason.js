// client/src/hooks/useSeason.js - Updated with API integration
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import seasonAPI from '../api/seasonAPI';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);

  // Initialize season and set up real-time listener
  useEffect(() => {
    let unsubscribe = null;

    const initializeSeason = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to get current season to ensure document exists
        const result = await seasonAPI.getCurrentSeason();
        if (result.success) {
          setCurrentSeason(result.season);
          setLastUpdated(result.lastUpdated);
          setUpdatedBy(result.updatedBy);
        }

        // Set up real-time listener for season changes
        unsubscribe = onSnapshot(
          doc(db, 'settings', 'season'),
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setCurrentSeason(data.current || 'normal');
              setLastUpdated(data.lastUpdated);
              setUpdatedBy(data.updatedBy);
              setError(null);
            } else {
              // If document doesn't exist, create it with default season
              seasonAPI.getCurrentSeason().then((result) => {
                if (result.success) {
                  setCurrentSeason(result.season);
                }
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to season changes:', error);
            setError('Failed to listen to season changes');
            setCurrentSeason('normal'); // Fallback to normal
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error initializing season:', err);
        setError('Failed to initialize season');
        setCurrentSeason('normal'); // Fallback to normal
        setLoading(false);
      }
    };

    initializeSeason();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Update season function
  const updateSeason = useCallback(async (newSeason, updatedBy = 'admin') => {
    if (updating) return { success: false, error: 'Update already in progress' };

    setUpdating(true);
    setError(null);

    try {
      const result = await seasonAPI.updateSeason(newSeason, updatedBy);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update season';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  // Toggle season function
  const toggleSeason = useCallback(async (updatedBy = 'admin') => {
    if (updating) return { success: false, error: 'Update already in progress' };

    setUpdating(true);
    setError(null);

    try {
      const result = await seasonAPI.toggleSeason(updatedBy);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to toggle season';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  // Get season history function
  const getSeasonHistory = useCallback(async () => {
    try {
      return await seasonAPI.getSeasonHistory();
    } catch (error) {
      console.error('Error getting season history:', error);
      return { success: false, error: error.message || 'Failed to get season history' };
    }
  }, []);

  // Reset to normal season function (emergency)
  const resetToNormal = useCallback(async (updatedBy = 'admin') => {
    if (updating) return { success: false, error: 'Update already in progress' };

    setUpdating(true);
    setError(null);

    try {
      const result = await seasonAPI.resetSeasonToNormal(updatedBy);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset season';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  }, [updating]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // Current state
    currentSeason,
    loading,
    updating,
    error,
    lastUpdated,
    updatedBy,
    
    // Computed values
    isGaneshSeason: currentSeason === 'ganesh',
    isNormalSeason: currentSeason === 'normal',
    
    // Actions
    updateSeason,
    toggleSeason,
    getSeasonHistory,
    resetToNormal,
    clearError,
    
    // Season status helpers
    getSeasonStatus: () => ({
      current: currentSeason,
      isGanesh: currentSeason === 'ganesh',
      isNormal: currentSeason === 'normal',
      lastUpdated,
      updatedBy,
      updating,
      error
    }),
    
    // Season display helpers
    getSeasonDisplayName: () => {
      switch (currentSeason) {
        case 'ganesh':
          return 'Ganesh Season';
        case 'normal':
          return 'Normal Season';
        default:
          return 'Unknown Season';
      }
    },
    
    getSeasonIcon: () => {
      switch (currentSeason) {
        case 'ganesh':
          return '🕉️';
        case 'normal':
          return '🏺';
        default:
          return '❓';
      }
    },
    
    getSeasonColor: () => {
      switch (currentSeason) {
        case 'ganesh':
          return '#FF8F00';
        case 'normal':
          return '#D2691E';
        default:
          return '#666666';
      }
    }
  };

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};

// Export individual hooks for specific use cases
export const useSeasonToggle = () => {
  const { toggleSeason, updating, error } = useSeason();
  return { toggleSeason, updating, error };
};

export const useSeasonUpdate = () => {
  const { updateSeason, updating, error } = useSeason();
  return { updateSeason, updating, error };
};

export const useSeasonStatus = () => {
  const { 
    currentSeason, 
    isGaneshSeason, 
    isNormalSeason, 
    loading, 
    error,
    getSeasonStatus,
    getSeasonDisplayName,
    getSeasonIcon,
    getSeasonColor
  } = useSeason();
  
  return {
    currentSeason,
    isGaneshSeason,
    isNormalSeason,
    loading,
    error,
    status: getSeasonStatus(),
    displayName: getSeasonDisplayName(),
    icon: getSeasonIcon(),
    color: getSeasonColor()
  };
};

// Export the context for advanced use cases
export { SeasonContext };