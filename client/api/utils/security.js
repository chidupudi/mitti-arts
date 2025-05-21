// api/utils/security.js - New file for security utilities
const crypto = require('crypto');
require('dotenv').config();

// Move these to environment variables in production
const SECRET_KEY = process.env.SECRET_KEY || 'your-very-strong-secret-key-min-32-chars';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['https://mittiarts.com'];

// Generate HMAC checksum for data integrity
function generateChecksum(data) {
    // Sort keys to ensure consistent order regardless of input order
    const sortedData = sortObjectKeys(data);
    
    // Convert object to string
    const dataString = JSON.stringify(sortedData);
    
    // Create HMAC using SHA-256
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(dataString)
        .digest('hex');
}

// Verify checksum
function verifyChecksum(data, providedChecksum) {
    // Remove checksum from data before verification
    const { checksum, ...dataWithoutChecksum } = data;
    
    // Generate new checksum and compare
    const calculatedChecksum = generateChecksum(dataWithoutChecksum);
    return crypto.timingSafeEqual(
        Buffer.from(calculatedChecksum, 'hex'),
        Buffer.from(providedChecksum, 'hex')
    );
}

// Sort object keys recursively for consistent checksum generation
function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
        }, {});
}

// Validate CORS origin
function isValidOrigin(origin) {
    if (!origin) return false;
    return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*');
}

// Validate amount to ensure it's a positive number
function validateAmount(amount) {
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount < 1000000; // Set reasonable limits
}

// Generate a secure merchantOrderId with timestamp
function generateSecureOrderId(userId, timestamp = Date.now()) {
    const hmac = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(`${userId}-${timestamp}`)
        .digest('hex');
    return `${userId}-${timestamp}-${hmac.substring(0, 8)}`;
}

// Rate limiting data (simple in-memory implementation)
const rateLimiter = {
    requests: {},
    
    // Check if IP is allowed to make another request
    checkLimit(ip, limit = 10, timeWindow = 60000) {
        const now = Date.now();
        
        // Initialize if first request
        if (!this.requests[ip]) {
            this.requests[ip] = { count: 0, firstRequest: now };
        }
        
        // Reset if outside time window
        if (now - this.requests[ip].firstRequest > timeWindow) {
            this.requests[ip] = { count: 0, firstRequest: now };
        }
        
        // Increment and check
        this.requests[ip].count++;
        return this.requests[ip].count <= limit;
    }
};

module.exports = {
    generateChecksum,
    verifyChecksum,
    isValidOrigin,
    validateAmount,
    generateSecureOrderId,
    rateLimiter
};