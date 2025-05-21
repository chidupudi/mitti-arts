// api/payment-status/[merchantOrderId].js
const axios = require('axios');
const { getAuthToken, STATUS_API } = require('../utils/auth');
const { verifyChecksum, generateChecksum, isValidOrigin } = require('../utils/security');

module.exports = async (req, res) => {
    // Improved CORS - only allow specific origins
    const origin = req.headers.origin;
    if (isValidOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Allow both GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed' 
        });
    }
    
    try {
        // Get merchantOrderId from query params or request body
        const merchantOrderId = req.query.merchantOrderId || 
                               (req.body && req.body.merchantOrderId);
        
        // Get frontend verification data if available
        const verificationData = req.body && req.body.verificationData;
        const clientChecksum = req.body && req.body.checksum;
                  
        if (!merchantOrderId) {
            return res.status(400).json({ 
                success: false,
                code: 'MISSING_ORDER_ID',
                message: 'merchantOrderId is required' 
            });
        }
        
        // Verify client checksum if provided
        if (verificationData && clientChecksum) {
            const isValid = verifyChecksum(verificationData, clientChecksum);
            if (!isValid) {
                console.error('SECURITY ALERT: Invalid verification data in status check', {
                    merchantOrderId,
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                });
                
                return res.status(400).json({
                    success: false,
                    code: 'SECURITY_VERIFICATION_FAILED',
                    message: 'Security verification failed'
                });
            }
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
        
        // Check the integrityHash if it was included in the original request
        // This is to verify the amount hasn't been tampered with
        if (response.data.integrityHash) {
            // Recreate the hash to verify
            const timestamp = response.data.createTime || Date.now();
            const expectedHash = crypto
                .createHmac('sha256', SECRET_KEY)
                .update(`${merchantOrderId}-${response.data.amount}-${timestamp}`)
                .digest('hex');
            
            if (expectedHash !== response.data.integrityHash) {
                console.error('SECURITY ALERT: Transaction data may have been tampered with', {
                    merchantOrderId,
                    requestedAmount: response.data.amount,
                    status: response.data.state
                });
                
                return res.status(400).json({
                    success: false,
                    code: 'SECURITY_VERIFICATION_FAILED',
                    message: 'Transaction verification failed'
                });
            }
        }
        
        // Response with our own checksum
        const responseData = {
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
                updatedAt: response.data.updatedAt || new Date().toISOString()
            }
        };
        
        // Add security checksum to verify response integrity on client
        responseData.checksum = generateChecksum(responseData);
        
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Error checking payment status:', {
            status: error.response?.status,
            data: error.response?.data
        });
        
        return res.status(500).json({
            success: false,
            code: 'PAYMENT_CHECK_ERROR',
            message: 'Error checking payment status.',
            error: error.response?.data?.message || error.message,
            merchantOrderId: req.query.merchantOrderId || (req.body && req.body.merchantOrderId)
        });
    }
};