// api/create-payment.js
const axios = require('axios');
const crypto = require('crypto'); // Add this for crypto operations
const { getAuthToken, PAYMENT_API } = require('./utils/auth');
const { 
    generateChecksum, 
    verifyChecksum, // Import the verifyChecksum function
    isValidOrigin, 
    validateAmount,
    rateLimiter 
} = require('./utils/security');

// If SECRET_KEY isn't exported from utils/security, define it here
const SECRET_KEY = process.env.SECRET_KEY || 'your-very-strong-secret-key-min-32-chars'; // Use environment variable for security

module.exports = async (req, res) => {
    // Improved CORS - only allow specific origins
    const origin = req.headers.origin;
    if (isValidOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else {
        // For security, still process the request but don't set CORS headers
        console.warn(`Request from unauthorized origin: ${origin}`);
    }

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed' 
        });
    }
    
    // Get client IP for rate limiting
    const clientIp = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress;
    
    // Apply rate limiting
    if (!rateLimiter.checkLimit(clientIp, 5)) { // 5 requests per minute
        return res.status(429).json({
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
        });
    }

    try {
        const { amount, merchantOrderId, userId, checksum } = req.body;
        
        // Log request with masked data
        console.log('Payment request received:', {
            merchantOrderId,
            amount: amount ? '✓' : '✗',
            userId: userId ? '✓' : '✗',
            checksum: checksum ? '✓' : '✗',
        });
        
        // Validate required inputs
        if (!amount || !merchantOrderId || !userId || !checksum) {
            return res.status(400).json({
                success: false,
                code: 'MISSING_PARAMETERS',
                message: 'Amount, merchantOrderId, userId and checksum are required'
            });
        }
        
        // Verify checksum to ensure data integrity
        const checksumValid = verifyChecksum(
            { amount, merchantOrderId, userId, timestamp: req.body.timestamp }, 
            checksum
        );
        
        if (!checksumValid) {
            // Log potential tampering attempt
            console.error('SECURITY ALERT: Invalid checksum detected', {
                ip: clientIp,
                merchantOrderId,
                userId
            });
            
            return res.status(400).json({
                success: false,
                code: 'INVALID_CHECKSUM',
                message: 'Security verification failed'
            });
        }
        
        // Validate amount (additional security)
        if (!validateAmount(amount)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_AMOUNT',
                message: 'Invalid amount'
            });
        }

        // Get auth token
        const token = await getAuthToken();

        // Create payment payload with our own integrity hash
        const timestamp = Date.now();
        const integrityHash = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(`${merchantOrderId}-${amount}-${timestamp}`)
            .digest('hex');
            
        const payload = {
            merchantOrderId,
            amount: parseInt(amount) * 100, // Convert to paisa
            expireAfter: 1200, // 20 minutes
            integrityHash, // Add our internal hash for verification later
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment for your order",
                merchantUrls: {
                    redirectUrl: `https://mittiarts.com/payment-status/${merchantOrderId}`
                }
            }
        };

        // Call PhonePe API to create payment
        const response = await axios.post(PAYMENT_API, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${token}`
            }
        });

        // Add our checksum to the response for frontend verification
        const responseWithChecksum = {
            ...response.data,
            securityHash: generateChecksum({
                ...response.data,
                originalAmount: amount,
                timestamp: Date.now()
            })
        };

        return res.status(200).json(responseWithChecksum);
    } catch (error) {
        console.error('Error creating payment:', {
            status: error.response?.status,
            data: error.response?.data
        });
        
        return res.status(500).json({
            success: false,
            code: 'PAYMENT_CREATE_ERROR',
            message: 'Error creating payment'
        });
    }
};