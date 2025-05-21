// api/create-payment.js
const axios = require('axios');
const { getAuthToken, PAYMENT_API } = require('./utils/auth');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, merchantOrderId } = req.body;
        
        // Validate inputs
        if (!amount || !merchantOrderId) {
            return res.status(400).json({ error: 'Amount and merchantOrderId are required' });
        }

        // Get auth token
        const token = await getAuthToken();

        // Create payment payload
        const payload = {
            merchantOrderId,
            amount: parseInt(amount) * 100, // Convert to paisa
            expireAfter: 1200, // 20 minutes
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment for your order",
                merchantUrls: {
                    // Important: This URL needs to be your actual deployed domain
                    redirectUrl: `${req.headers.host.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/payment-status/${merchantOrderId}`
                }
            }
        };

        console.log('Creating payment with payload:', payload);

        // Call PhonePe API to create payment
        const response = await axios.post(PAYMENT_API, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${token}`
            }
        });

        console.log('Create Payment Response:', response.data);
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error creating payment:');
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        return res.status(500).json({ error: error.response?.data || error.message });
    }
};