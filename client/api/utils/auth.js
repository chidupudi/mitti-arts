// api/utils/auth.js
const axios = require('axios');
require('dotenv').config();

// PhonePe credentials from environment variables
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID || 'SU2505151643425467542736';
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '7ece42c0-2e64-4509-a2c5-16909f95b777';
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';

// PhonePe API endpoints
const AUTH_API = process.env.PHONEPE_AUTH_API || 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PAYMENT_API = process.env.PHONEPE_PAYMENT_API || 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
const STATUS_API = process.env.PHONEPE_STATUS_API || 'https://api.phonepe.com/apis/pg/checkout/v2/order/';

// Cache for the auth token with added security
let authToken = null;
let tokenExpiry = 0;

// Function to get auth token
async function getAuthToken() {
    // Check if we already have a valid token
    if (authToken && tokenExpiry > Date.now() / 1000 + 60) { // Add 60-second buffer
        return authToken;
    }

    try {
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_version', CLIENT_VERSION);
        params.append('client_secret', CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');

        // More secure logging
        console.log('Requesting new auth token');

        const response = await axios.post(AUTH_API, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Mask sensitive data in logs
        console.log('Auth token received, expires in:', 
            Math.floor((response.data.expires_at - Date.now()/1000)/60), 'minutes');

        authToken = response.data.access_token;
        tokenExpiry = response.data.expires_at;
        
        return authToken;
    } catch (error) {
        console.error('Error getting auth token:', {
            status: error.response?.status,
            message: error.message
        });
        throw error;
    }
}

module.exports = {
    getAuthToken,
    PAYMENT_API,
    STATUS_API
};
