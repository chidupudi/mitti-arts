// cartUtils.js - Utility functions for cart management

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  doc,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

/**
 * Add item to cart with duplicate prevention
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<{success: boolean, message: string, action: string}>}
 */
export const addToCartSafe = async (userId, productId, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const q = query(
      collection(db, 'cart'), 
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    
    const existingItems = await getDocs(q);
    
    if (existingItems.empty) {
      // Item doesn't exist, add new item
      await addDoc(collection(db, 'cart'), {
        userId,
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Item added to cart',
        action: 'added'
      };
    } else {
      // Item exists, update quantity
      const existingItem = existingItems.docs[0];
      const currentQuantity = existingItem.data().quantity || 0;
      const newQuantity = currentQuantity + quantity;
      
      await updateDoc(doc(db, 'cart', existingItem.id), {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: `Quantity updated to ${newQuantity}`,
        action: 'updated',
        newQuantity
      };
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      message: 'Failed to add item to cart',
      action: 'error',
      error
    };
  }
};

/**
 * Clean up duplicate cart entries for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, cleaned: number, message: string}>}
 */
export const cleanupUserCart = async (userId) => {
  try {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const cartItems = await getDocs(q);
    
    const productGroups = {};
    const itemsData = [];
    
    // Group items by productId
    cartItems.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      itemsData.push(data);
      
      const productId = String(data.productId);
      if (!productGroups[productId]) {
        productGroups[productId] = [];
      }
      productGroups[productId].push(data);
    });
    
    // Find duplicates
    const duplicateGroups = Object.values(productGroups).filter(group => group.length > 1);
    
    if (duplicateGroups.length === 0) {
      return {
        success: true,
        cleaned: 0,
        message: 'No duplicates found'
      };
    }
    
    let cleanedCount = 0;
    const batch = writeBatch(db);
    
    // Process each duplicate group
    for (const group of duplicateGroups) {
      // Sort by addedAt to keep the oldest
      group.sort((a, b) => {
        const dateA = new Date(a.addedAt || 0);
        const dateB = new Date(b.addedAt || 0);
        return dateA - dateB;
      });
      
      const [keepItem, ...duplicates] = group;
      const totalQuantity = group.reduce((sum, item) => sum + (item.quantity || 0), 0);
      
      // Update the item to keep with total quantity
      const keepRef = doc(db, 'cart', keepItem.id);
      batch.update(keepRef, {
        quantity: totalQuantity,
        consolidatedAt: new Date().toISOString()
      });
      
      // Delete duplicates
      duplicates.forEach(duplicate => {
        const duplicateRef = doc(db, 'cart', duplicate.id);
        batch.delete(duplicateRef);
        cleanedCount++;
      });
    }
    
    await batch.commit();
    
    return {
      success: true,
      cleaned: cleanedCount,
      message: `Cleaned up ${cleanedCount} duplicate items`
    };
    
  } catch (error) {
    console.error('Error cleaning up cart:', error);
    return {
      success: false,
      cleaned: 0,
      message: 'Failed to clean up cart',
      error
    };
  }
};

/**
 * Get cart items with duplicate detection
 * @param {string} userId - User ID
 * @returns {Promise<{items: Array, hasDuplicates: boolean, stats: Object}>}
 */
export const getCartItemsWithStats = async (userId) => {
  try {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const cartItems = await getDocs(q);
    
    const items = [];
    const productCounts = {};
    
    cartItems.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      items.push(data);
      
      const productId = String(data.productId);
      productCounts[productId] = (productCounts[productId] || 0) + 1;
    });
    
    const hasDuplicates = Object.values(productCounts).some(count => count > 1);
    const uniqueProducts = Object.keys(productCounts).length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    return {
      items,
      hasDuplicates,
      stats: {
        totalItems: items.length,
        uniqueProducts,
        totalQuantity,
        duplicateProducts: Object.entries(productCounts)
          .filter(([_, count]) => count > 1)
          .map(([productId, count]) => ({ productId, count }))
      }
    };
    
  } catch (error) {
    console.error('Error getting cart stats:', error);
    return {
      items: [],
      hasDuplicates: false,
      stats: {
        totalItems: 0,
        uniqueProducts: 0,
        totalQuantity: 0,
        duplicateProducts: []
      },
      error
    };
  }
};

/**
 * Update cart item quantity safely
 * @param {string} cartItemId - Cart item ID
 * @param {number} newQuantity - New quantity
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateCartItemQuantity = async (cartItemId, newQuantity) => {
  try {
    if (newQuantity < 1) {
      return {
        success: false,
        message: 'Quantity must be at least 1'
      };
    }
    
    await updateDoc(doc(db, 'cart', cartItemId), {
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Quantity updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {
      success: false,
      message: 'Failed to update quantity',
      error
    };
  }
};

/**
 * Remove item from cart
 * @param {string} cartItemId - Cart item ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const removeFromCart = async (cartItemId) => {
  try {
    await deleteDoc(doc(db, 'cart', cartItemId));
    
    return {
      success: true,
      message: 'Item removed from cart'
    };
    
  } catch (error) {
    console.error('Error removing cart item:', error);
    return {
      success: false,
      message: 'Failed to remove item',
      error
    };
  }
};

/**
 * Clear all cart items for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, message: string, itemsRemoved: number}>}
 */
export const clearUserCart = async (userId) => {
  try {
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const cartItems = await getDocs(q);
    
    if (cartItems.empty) {
      return {
        success: true,
        message: 'Cart is already empty',
        itemsRemoved: 0
      };
    }

    const batch = writeBatch(db);
    let itemsCount = 0;

    // Add all cart items to batch for deletion
    cartItems.forEach((cartDoc) => {
      const docRef = doc(db, 'cart', cartDoc.id);
      batch.delete(docRef);
      itemsCount++;
    });

    // Execute batch deletion
    await batch.commit();

    return {
      success: true,
      message: `Successfully cleared ${itemsCount} items from cart`,
      itemsRemoved: itemsCount
    };

  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      message: 'Failed to clear cart',
      itemsRemoved: 0,
      error
    };
  }
};

// Export all functions
export default {
  addToCartSafe,
  cleanupUserCart,
  getCartItemsWithStats,
  updateCartItemQuantity,
  removeFromCart,
  clearUserCart
};