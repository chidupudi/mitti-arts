import sha256 from 'sha256';

const PHONEPE_CONFIG = {
  MERCHANT_ID: 'SU2505151643425467542736',
  SALT_KEY: '7ece42c0-2e64-4509-a2c5-16909f95b777',
  SALT_INDEX: 1,
  ENV: 'UAT'
};


export const initiatePhonePePayment = async (amount, personalInfo, orderDetails) => {
  try {
    const response = await fetch('http://localhost:5000/api/phonepe/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        phone: personalInfo.phone,
        orderDetails
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Payment initiation failed');
    }

    if (!data.success || !data.paymentUrl) {
      console.error('Payment failed response:', data);
      throw new Error(data.error || 'Payment URL not received');
    }

    // Store transaction details
    localStorage.setItem('currentTransaction', JSON.stringify({
      merchantTransactionId: data.merchantTransactionId,
      merchantUserId: data.merchantUserId,
      amount,
      orderDetails
    }));

    // Redirect to PhonePe payment page
    window.location.href = data.paymentUrl;
    return { success: true };

  } catch (error) {
    console.error('Payment error:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || null
    };
  }
};

export const checkPaymentStatus = async (transactionId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/phonepe/status/${transactionId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Status check failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Invalid status response');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};