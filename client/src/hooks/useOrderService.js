// orderService.js - Service for handling order placement with immediate stock deduction
import { db } from '../Firebase/Firebase';
import { 
  collection, 
  addDoc, 
  writeBatch, 
  doc, 
  getDoc, 
  increment, 
  Timestamp, 
  runTransaction 
} from 'firebase/firestore';

/**
 * Place an order with immediate stock deduction upon successful payment
 * @param {Object} orderData - The order data
 * @param {Object} user - The authenticated user
 * @param {string} paymentStatus - Payment status from payment gateway
 * @returns {Promise<{success: boolean, orderId?: string, message: string}>}
 */
export const placeOrderWithStockDeduction = async (orderData, user, paymentStatus = 'PENDING') => {
  try {
    // Validate required data
    if (!orderData || !user) {
      throw new Error('Order data and user information are required');
    }

    const items = orderData.items || orderData.cartData?.items || [];
    if (items.length === 0) {
      throw new Error('No items found in the order');
    }

    // Use a transaction to ensure atomicity
    const result = await runTransaction(db, async (transaction) => {
      // First, check stock availability for all items
      const stockChecks = [];
      for (const item of items) {
        const productId = item.id || item.productId;
        if (!productId) {
          throw new Error(`Product ID not found for item: ${item.name}`);
        }

        const productRef = doc(db, 'products', productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`Product not found: ${item.name}`);
        }

        const productData = productSnap.data();
        const currentStock = productData.stock || 0;
        
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}, Required: ${item.quantity}`);
        }

        stockChecks.push({
          productRef,
          productData,
          item,
          currentStock
        });
      }

      // Create the order document
      const orderRef = doc(collection(db, 'orders'));
      const orderDocData = {
        ...orderData,
        userId: user.uid,
        userEmail: user.email || orderData.personalInfo?.email,
        paymentStatus: paymentStatus,
        status: paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS' ? 'CONFIRMED' : 'PENDING',
        deliveryStatus: 'PENDING',
        stockDeducted: paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      };

      transaction.set(orderRef, orderDocData);

      // If payment is successful, deduct stock immediately
      if (paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
        for (const check of stockChecks) {
          transaction.update(check.productRef, {
            stock: increment(-check.item.quantity),
            updatedAt: Timestamp.now()
          });
        }
      }

      return orderRef.id;
    });

    return {
      success: true,
      orderId: result,
      message: paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS' 
        ? 'Order placed successfully and stock updated' 
        : 'Order placed successfully, awaiting payment confirmation'
    };

  } catch (error) {
    console.error('Error placing order:', error);
    return {
      success: false,
      message: error.message || 'Failed to place order'
    };
  }
};

/**
 * Update order payment status and handle stock deduction if needed
 * @param {string} orderId - The order ID
 * @param {string} newPaymentStatus - New payment status
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateOrderPaymentStatus = async (orderId, newPaymentStatus) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderSnap.data();
      const currentPaymentStatus = orderData.paymentStatus;
      const wasStockDeducted = orderData.stockDeducted || false;

      // Determine if we need to deduct or restore stock
      const isNewStatusPaid = newPaymentStatus === 'COMPLETED' || newPaymentStatus === 'SUCCESS';
      const wasCurrentStatusPaid = currentPaymentStatus === 'COMPLETED' || currentPaymentStatus === 'SUCCESS';

      const items = orderData.orderDetails?.items || orderData.items || [];

      // If changing from unpaid to paid and stock wasn't deducted yet
      if (!wasCurrentStatusPaid && isNewStatusPaid && !wasStockDeducted) {
        // Check stock availability and deduct
        for (const item of items) {
          const productId = item.id || item.productId;
          if (!productId) continue;

          const productRef = doc(db, 'products', productId);
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`Product not found: ${item.name}`);
          }

          const currentStock = productSnap.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}, Required: ${item.quantity}`);
          }

          transaction.update(productRef, {
            stock: increment(-item.quantity),
            updatedAt: Timestamp.now()
          });
        }
      }
      // If changing from paid to unpaid and stock was deducted
      else if (wasCurrentStatusPaid && !isNewStatusPaid && wasStockDeducted) {
        // Restore stock
        for (const item of items) {
          const productId = item.id || item.productId;
          if (!productId) continue;

          const productRef = doc(db, 'products', productId);
          const productSnap = await transaction.get(productRef);
          
          if (productSnap.exists()) {
            transaction.update(productRef, {
              stock: increment(item.quantity),
              updatedAt: Timestamp.now()
            });
          }
        }
      }

      // Update order
      transaction.update(orderRef, {
        paymentStatus: newPaymentStatus,
        status: isNewStatusPaid ? 'CONFIRMED' : 'PENDING',
        stockDeducted: isNewStatusPaid,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: `Payment status updated to ${newPaymentStatus}`
      };
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update payment status'
    };
  }
};

/**
 * Cancel an order and restore stock if needed
 * @param {string} orderId - The order ID
 * @param {string} cancelledBy - Who cancelled the order ('user' or 'admin')
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cancelOrderWithStockRestore = async (orderId, cancelledBy = 'admin') => {
  try {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderSnap.data();
      const wasStockDeducted = orderData.stockDeducted || false;
      const items = orderData.orderDetails?.items || orderData.items || [];

      // If stock was deducted, restore it
      if (wasStockDeducted) {
        for (const item of items) {
          const productId = item.id || item.productId;
          if (!productId) continue;

          const productRef = doc(db, 'products', productId);
          const productSnap = await transaction.get(productRef);
          
          if (productSnap.exists()) {
            transaction.update(productRef, {
              stock: increment(item.quantity), // Add back to stock
              updatedAt: Timestamp.now()
            });
          }
        }
      }

      // Update order to cancelled
      transaction.update(orderRef, {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        deliveryStatus: 'CANCELLED',
        stockDeducted: false,
        cancelledAt: Timestamp.now(),
        cancelledBy: cancelledBy,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: wasStockDeducted 
          ? 'Order cancelled and stock restored successfully' 
          : 'Order cancelled successfully'
      };
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel order'
    };
  }
};

/**
 * Check stock availability for cart items before checkout
 * @param {Array} items - Array of cart items
 * @returns {Promise<{success: boolean, message: string, unavailableItems?: Array}>}
 */
export const checkStockAvailability = async (items) => {
  try {
    const unavailableItems = [];
    
    for (const item of items) {
      const productId = item.id || item.productId;
      if (!productId) continue;

      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        unavailableItems.push({
          ...item,
          reason: 'Product no longer available'
        });
        continue;
      }

      const productData = productSnap.data();
      const currentStock = productData.stock || 0;
      
      if (currentStock < item.quantity) {
        unavailableItems.push({
          ...item,
          reason: `Insufficient stock. Available: ${currentStock}, Required: ${item.quantity}`,
          availableStock: currentStock
        });
      }
    }

    if (unavailableItems.length > 0) {
      return {
        success: false,
        message: 'Some items are not available in the requested quantity',
        unavailableItems
      };
    }

    return {
      success: true,
      message: 'All items are available'
    };

  } catch (error) {
    console.error('Error checking stock availability:', error);
    return {
      success: false,
      message: 'Failed to check stock availability'
    };
  }
};

/**
 * Hook for using order services in React components
 */
export const useOrderService = () => {
  return {
    placeOrderWithStockDeduction,
    updateOrderPaymentStatus,
    cancelOrderWithStockRestore,
    checkStockAvailability
  };
};