// api/payment-status/[merchantOrderId].js
const axios = require('axios');
const { getAuthToken, STATUS_API } = require('../utils/auth');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Allow both GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Get merchantOrderId from query params or request body
        const merchantOrderId = req.query.merchantOrderId || 
                               (req.body && req.body.merchantOrderId);
                  
        if (!merchantOrderId) {
            return res.status(400).json({ 
                success: false,
                code: 'MISSING_ORDER_ID',
                message: 'merchantOrderId is required' 
            });
        }
        
        // Get auth token for PhonePe API
        const token = await getAuthToken();
        
        // Call PhonePe API to check payment status
        const response = await axios.get(`${STATUS_API}${merchantOrderId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${token}`
            }
        });
        
        // Map PhonePe status to our application status
        let paymentStatus = 'PENDING';
        let code = 'PAYMENT_PENDING';
        let message = 'Your payment is being processed.';
        
        if (response.data.state === 'COMPLETED' || response.data.state === 'SUCCESS') {
            paymentStatus = 'SUCCESS';
            code = 'PAYMENT_SUCCESS';
            message = 'Payment completed successfully.';
        } else if (response.data.state === 'FAILED' || response.data.state === 'FAILURE') {
            paymentStatus = 'FAILED';
            code = 'PAYMENT_FAILED';
            message = 'Payment failed. Please try again.';
        }
        
        // Format the amount from paisa to rupees
        const amountInRupees = response.data.amount ? response.data.amount / 100 : 0;
        
        // Return JSON response with all relevant information
        return res.status(200).json({
            success: paymentStatus === 'SUCCESS',
            code,
            message,
            data: {
                orderId: response.data.orderId,
                merchantOrderId,
                transactionId: response.data.transactionId || response.data.orderId,
                amount: amountInRupees,
                status: paymentStatus,
                rawStatus: response.data.state,
                paymentDetails: response.data.paymentDetails || [],
                expireAt: response.data.expireAt,
                updatedAt: response.data.updatedAt || new Date().toISOString(),
                // Include full response for debugging if needed
                fullResponse: response.data
            }
        });
    } catch (error) {
        console.error('Error checking payment status:');
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        
        return res.status(500).json({
            success: false,
            code: 'PAYMENT_CHECK_ERROR',
            message: 'Error checking payment status.',
            error: error.response?.data?.message || error.message,
            merchantOrderId: req.query.merchantOrderId || (req.body && req.body.merchantOrderId)
        });
    }
};