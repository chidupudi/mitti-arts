// Vercel serverless email service
const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
  user: 'noreplymittiarts@gmail.com',
  password: 'tbsvshttpqjyowcg',
  adminEmail: 'chrupesh2425@gmail.com'
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Utility function to format currency
const formatCurrency = (amount) => {
  return `₹${parseFloat(amount || 0).toFixed(2)}`;
};

// Utility function to format date
const formatDate = (date) => {
  try {
    if (!date) return new Date().toLocaleString();
    if (date?.toDate) {
      return date.toDate().toLocaleString();
    }
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return new Date(date).toLocaleString();
  } catch (e) {
    return new Date().toLocaleString();
  }
};

// Generate HTML email template for new order
const generateNewOrderEmailHTML = (order) => {
  const customerName = order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A';
  const customerEmail = order.orderDetails?.personalInfo?.email || order.customerEmail || 'N/A';
  const customerPhone = order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A';
  const orderAmount = order.orderDetails?.totalAmount || 0;
  const orderDate = formatDate(order.createdAt);
  const items = order.orderDetails?.items || [];
  const deliveryAddress = order.orderDetails?.deliveryAddress || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Alert - MittiArts</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #D2691E 0%, #8B4513 100%); color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .alert-badge { background-color: #ff4444; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px; }
        .content { padding: 20px; }
        .order-summary { background-color: #f8f9fa; border-left: 4px solid #D2691E; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .section-title { font-size: 18px; color: #D2691E; margin-bottom: 10px; border-bottom: 2px solid #D2691E; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; color: #D2691E; }
        .total-amount { font-size: 20px; font-weight: bold; color: #D2691E; text-align: center; background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-success { background-color: #d4edda; color: #155724; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ MittiArts</h1>
          <div class="alert-badge">NEW ORDER ALERT</div>
        </div>
        
        <div class="content">
          <div class="order-summary">
            <h2 style="margin: 0 0 10px 0; color: #D2691E;">Order #${order.orderNumber}</h2>
            <p style="margin: 0; color: #666;">Received on ${orderDate}</p>
          </div>

          <div class="customer-info">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${customerName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${customerPhone}</span>
            </div>
          </div>

          ${deliveryAddress.addressLine1 ? `
          <div class="delivery-info">
            <div class="section-title">📍 Delivery Address</div>
            <div class="info-row">
              <span class="label">Address:</span>
              <span class="value">${deliveryAddress.addressLine1}</span>
            </div>
            <div class="info-row">
              <span class="label">City:</span>
              <span class="value">${deliveryAddress.city || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">State:</span>
              <span class="value">${deliveryAddress.state || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Pincode:</span>
              <span class="value">${deliveryAddress.pincode || 'N/A'}</span>
            </div>
          </div>
          ` : ''}

          <div class="order-details">
            <div class="section-title">🛒 Order Details</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name || 'Unknown Item'}</td>
                    <td>${item.quantity || 1}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="total-amount">
            💰 Total Order Amount: ${formatCurrency(orderAmount)}
          </div>

          <div class="order-summary">
            <div class="info-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status-badge ${order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS' ? 'status-success' : 'status-pending'}">
                  ${order.paymentStatus || 'PENDING'}
                </span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Order Status:</span>
              <span class="value">
                <span class="status-badge ${order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? 'status-success' : 'status-pending'}">
                  ${order.status || 'PENDING'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>MittiArts Admin Panel</strong></p>
          <p>Order ID: ${order.id}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send new order notification email
const sendNewOrderNotification = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'MittiArts Order System',
        address: EMAIL_CONFIG.user
      },
      to: EMAIL_CONFIG.adminEmail,
      subject: `🚨 NEW ORDER ALERT - Order #${order.orderNumber} (${formatCurrency(order.orderDetails?.totalAmount)})`,
      html: generateNewOrderEmailHTML(order),
      priority: 'high'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ New order notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send new order notification:', error);
    return { success: false, error: error.message };
  }
};

// Send order status update notification
const sendOrderStatusUpdateNotification = async (order, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'MittiArts Order System',
        address: EMAIL_CONFIG.user
      },
      to: EMAIL_CONFIG.adminEmail,
      subject: `📋 Order Status Updated - #${order.orderNumber} (${oldStatus} → ${newStatus})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #D2691E 0%, #8B4513 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🛍️ MittiArts</h1>
              <div style="background-color: #ff9800; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px;">ORDER STATUS UPDATE</div>
            </div>
            <div style="padding: 20px;">
              <h2 style="color: #D2691E;">Order Status Updated</h2>
              <p><strong>Order #${order.orderNumber}</strong></p>
              <p>Status changed from <strong style="color: #ff9800;">${oldStatus}</strong> to <strong style="color: #4caf50;">${newStatus}</strong></p>
              <p><strong>Customer:</strong> ${order.orderDetails?.personalInfo?.fullName || 'N/A'}</p>
              <p><strong>Amount:</strong> ${formatCurrency(order.orderDetails?.totalAmount)}</p>
              <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://your-domain.com/adminorders" style="background-color: #D2691E; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px;">
              <p><strong>MittiArts Admin Panel</strong></p>
              <p>Order ID: ${order.id}</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order status update notification sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send order status update notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNewOrderNotification,
  sendOrderStatusUpdateNotification
};