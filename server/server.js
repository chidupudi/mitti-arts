// server.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// PhonePe credentials (PRODUCTION)
const CLIENT_ID = 'SU2505151643425467542736';
const CLIENT_SECRET = '7ece42c0-2e64-4509-a2c5-16909f95b777';
// For production, this value should be as received in the credentials email
// If you don't have this value, please check your credentials email from PhonePe
const CLIENT_VERSION = '1'; // Update this if needed for production

// PhonePe API endpoints (PRODUCTION)
const AUTH_API = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PAYMENT_API = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
const STATUS_API = 'https://api.phonepe.com/apis/pg/checkout/v2/order/';

// Cache for the auth token
let authToken = null;
let tokenExpiry = 0;

// Function to get auth token
async function getAuthToken() {
    // Check if we already have a valid token
    if (authToken && tokenExpiry > Date.now() / 1000) {
        return authToken;
    }

    try {
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_version', CLIENT_VERSION);
        params.append('client_secret', CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');

        console.log('Auth API Request:', {
            url: AUTH_API,
            data: {
                client_id: CLIENT_ID,
                client_version: CLIENT_VERSION,
                grant_type: 'client_credentials'
                // Not logging client_secret for security
            }
        });

        const response = await axios.post(AUTH_API, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Auth API Response:', response.data);

        authToken = response.data.access_token;
        tokenExpiry = response.data.expires_at;
        
        console.log('New token obtained, expires at:', new Date(tokenExpiry * 1000));
        return authToken;
    } catch (error) {
        console.error('Error getting auth token:');
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        throw error;
    }
}

// Route to serve the payment form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to create a payment
app.post('/create-payment', async (req, res) => {
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
                    redirectUrl: `${req.protocol}://${req.get('host')}/payment-status/${merchantOrderId}`
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
        res.json(response.data);
    } catch (error) {
        console.error('Error creating payment:');
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Route to check payment status
app.get('/payment-status/:merchantOrderId', async (req, res) => {
    try {
        const { merchantOrderId } = req.params;
        
        // Get auth token
        const token = await getAuthToken();

        // Call PhonePe API to check payment status
        const response = await axios.get(`${STATUS_API}${merchantOrderId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${token}`
            }
        });

        // Display payment status page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payment Status</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .status-card { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
                    .status-success { background-color: #d4edda; color: #155724; }
                    .status-pending { background-color: #fff3cd; color: #856404; }
                    .status-failed { background-color: #f8d7da; color: #721c24; }
                    pre { background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow: auto; }
                </style>
            </head>
            <body>
                <h1>Payment Status</h1>
                <div class="status-card ${
                    response.data.state === 'COMPLETED' ? 'status-success' : 
                    response.data.state === 'PENDING' ? 'status-pending' : 'status-failed'
                }">
                    <h2>Status: ${response.data.state}</h2>
                    <p>Order ID: ${response.data.orderId}</p>
                    <p>Amount: ₹${response.data.amount / 100}</p>
                </div>
                <h3>Payment Details:</h3>
                <pre>${JSON.stringify(response.data, null, 2)}</pre>
                <p><a href="/">Back to Home</a></p>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error checking payment status:');
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});