// Client-side email service - calls Vercel serverless functions
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.mittiarts.com' || 'https://mittiarts.com'
  : '/api';

// Send new order notification
export const sendNewOrderNotification = async (order) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_order',
        order: order
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ New order notification sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send new order notification:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Failed to send new order notification:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update notification
export const sendOrderStatusUpdateNotification = async (order, oldStatus, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'status_update',
        order: order,
        oldStatus: oldStatus,
        newStatus: newStatus
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Order status update notification sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send order status update notification:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Failed to send order status update notification:', error);
    return { success: false, error: error.message };
  }
};

// Test email functionality
export const testEmailConnection = async () => {
  try {
    const testOrder = {
      id: 'test-123',
      orderNumber: 'TEST-001',
      orderDetails: {
        totalAmount: 999.99,
        personalInfo: {
          fullName: 'Test Customer',
          email: 'test@example.com',
          phone: '9999999999'
        },
        items: [
          {
            name: 'Test Product',
            quantity: 1,
            price: 999.99
          }
        ]
      },
      paymentStatus: 'PENDING',
      status: 'PENDING',
      createdAt: new Date()
    };

    const result = await sendNewOrderNotification(testOrder);
    
    if (result.success) {
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Test email failed:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return { success: false, error: error.message };
  }
};