// client/api/season-management.js
import { db } from '../Firebase/Firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Get current season from Firestore
 * @returns {Promise<{success: boolean, season?: string, error?: string}>}
 */
export const getCurrentSeason = async () => {
  try {
    const seasonDoc = await getDoc(doc(db, 'settings', 'season'));
    
    if (seasonDoc.exists()) {
      const data = seasonDoc.data();
      return {
        success: true,
        season: data.current || 'normal',
        lastUpdated: data.lastUpdated,
        updatedBy: data.updatedBy
      };
    } else {
      // If document doesn't exist, create it with default season
      await setDoc(doc(db, 'settings', 'season'), {
        current: 'normal',
        lastUpdated: serverTimestamp(),
        updatedBy: 'system',
        createdAt: serverTimestamp()
      });
      
      return {
        success: true,
        season: 'normal'
      };
    }
  } catch (error) {
    console.error('Error getting current season:', error);
    return {
      success: false,
      error: error.message || 'Failed to get current season'
    };
  }
};

/**
 * Update current season in Firestore
 * @param {string} newSeason - 'normal' or 'ganesh'
 * @param {string} updatedBy - Who is updating the season (admin username/id)
 * @returns {Promise<{success: boolean, error?: string, season?: string}>}
 */
export const updateSeason = async (newSeason, updatedBy = 'admin') => {
  try {
    // Validate season value
    if (!['normal', 'ganesh'].includes(newSeason)) {
      return {
        success: false,
        error: 'Invalid season. Must be either "normal" or "ganesh"'
      };
    }

    // Get current season first to check if it's actually changing
    const currentSeasonResult = await getCurrentSeason();
    if (!currentSeasonResult.success) {
      return currentSeasonResult;
    }

    if (currentSeasonResult.season === newSeason) {
      return {
        success: true,
        season: newSeason,
        message: `Season is already set to ${newSeason}`
      };
    }

    // Update the season
    const seasonData = {
      current: newSeason,
      lastUpdated: serverTimestamp(),
      updatedBy: updatedBy,
      previousSeason: currentSeasonResult.season,
      updateHistory: {
        from: currentSeasonResult.season,
        to: newSeason,
        timestamp: serverTimestamp(),
        updatedBy: updatedBy
      }
    };

    await setDoc(doc(db, 'settings', 'season'), seasonData);

    // Log the season change
    console.log(`✅ Season changed from ${currentSeasonResult.season} to ${newSeason} by ${updatedBy}`);

    return {
      success: true,
      season: newSeason,
      message: `Season successfully changed to ${newSeason}`
    };

  } catch (error) {
    console.error('Error updating season:', error);
    return {
      success: false,
      error: error.message || 'Failed to update season'
    };
  }
};

/**
 * Toggle between normal and ganesh seasons
 * @param {string} updatedBy - Who is toggling the season
 * @returns {Promise<{success: boolean, error?: string, season?: string}>}
 */
export const toggleSeason = async (updatedBy = 'admin') => {
  try {
    const currentSeasonResult = await getCurrentSeason();
    if (!currentSeasonResult.success) {
      return currentSeasonResult;
    }

    const newSeason = currentSeasonResult.season === 'normal' ? 'ganesh' : 'normal';
    return await updateSeason(newSeason, updatedBy);
  } catch (error) {
    console.error('Error toggling season:', error);
    return {
      success: false,
      error: error.message || 'Failed to toggle season'
    };
  }
};

/**
 * Get season change history (if you want to track changes)
 * @returns {Promise<{success: boolean, history?: Array, error?: string}>}
 */
export const getSeasonHistory = async () => {
  try {
    const seasonDoc = await getDoc(doc(db, 'settings', 'season'));
    
    if (seasonDoc.exists()) {
      const data = seasonDoc.data();
      return {
        success: true,
        current: data.current,
        lastUpdated: data.lastUpdated,
        updatedBy: data.updatedBy,
        previousSeason: data.previousSeason,
        updateHistory: data.updateHistory
      };
    } else {
      return {
        success: true,
        current: 'normal',
        history: []
      };
    }
  } catch (error) {
    console.error('Error getting season history:', error);
    return {
      success: false,
      error: error.message || 'Failed to get season history'
    };
  }
};

/**
 * Reset season to normal (emergency function)
 * @param {string} updatedBy - Who is resetting the season
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const resetSeasonToNormal = async (updatedBy = 'admin') => {
  try {
    return await updateSeason('normal', updatedBy);
  } catch (error) {
    console.error('Error resetting season:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset season'
    };
  }
};

// Export all functions as default object for easier importing
const seasonAPI = {
  getCurrentSeason,
  updateSeason,
  toggleSeason,
  getSeasonHistory,
  resetSeasonToNormal
};

export default seasonAPI;