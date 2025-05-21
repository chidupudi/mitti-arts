// api/payment-status/[merchantOrderId].js
const axios = require('axios');
const { getAuthToken, STATUS_API } = require('../utils/auth');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { merchantOrderId } = req.query;
        
        if (!merchantOrderId) {
            return res.status(400).json({ error: 'merchantOrderId is required' });
        }

        // Get auth token
        const token = await getAuthToken();

        // Call PhonePe API to check payment status
        const response = await axios.get(`${STATUS_API}${merchantOrderId}/status`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `O-Bearer ${token}`
            }
        });

        // Return HTML response
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(`
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
        return res.status(500).json({ error: error.response?.data || error.message });
    }
};