// Add to a utilities file or payment processing file
import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

export const updateInventoryAfterPayment = async (orderId) => {
  try {
    // Get the order data
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderSnap.data();
    
    // Check for items in multiple possible locations
    let items = [];
    if (orderData.orderDetails?.items && orderData.orderDetails.items.length > 0) {
      items = orderData.orderDetails.items;
    } else if (orderData.orderDetails?.cartData?.items && orderData.orderDetails.cartData.items.length > 0) {
      items = orderData.orderDetails.cartData.items;
    } else if (orderData.items && orderData.items.length > 0) {
      items = orderData.items;
    }
    
    if (items.length === 0) {
      throw new Error('No items found in this order');
    }
    
    // Use batch write to update product stock for all items in the order
    const batch = writeBatch(db);
    
    // Process each item in the order
    for (const item of items) {
      // Get product ID from either id or productId field
      const productId = item.id || item.productId;
      
      if (!productId) {
        console.warn('Product ID not found for item:', item);
        continue;
      }
      
      // Reference to the product
      const productRef = doc(db, 'products', productId);
      
      // Verify the product exists before updating
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        console.warn(`Product ${productId} not found in database`);
        continue;
      }
      
      // Update stock by decrementing the quantity
      batch.update(productRef, {
        stock: increment(-item.quantity) // Decrement stock by quantity ordered
      });
      
      console.log(`Updating stock for product ${productId}, decreasing by ${item.quantity}`);
    }
    
    // Add a flag to the order to indicate inventory has been updated
    batch.update(orderRef, {
      inventoryUpdated: true
    });
    
    // Commit all updates
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error updating inventory after payment:', error);
    return false;
  }
};