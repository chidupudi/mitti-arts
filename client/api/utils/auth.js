// api/utils/auth.js
const axios = require('axios');

// PhonePe credentials (PRODUCTION)
const CLIENT_ID = 'SU2505151643425467542736';
const CLIENT_SECRET = '7ece42c0-2e64-4509-a2c5-16909f95b777';
const CLIENT_VERSION = '1';

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


module.exports = {
    getAuthToken,
    PAYMENT_API,
    STATUS_API
};