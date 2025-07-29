// api/imagekit-auth.js - Create this in your backend (Express.js/Vercel/Netlify)
// This endpoint generates authentication parameters for ImageKit uploads

const ImageKit = require('imagekit');

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_12/rKQGfyqwTYKoTiY0Aeo8fKqIJiY=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_YOUR_PRIVATE_KEY_HERE", // Add your private key
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mittiarts"
});

// For Express.js
app.get('/api/imagekit-auth', (req, res) => {
  try {
    // Generate authentication parameters
    const authParams = imagekit.getAuthenticationParameters();
    
    // Add CORS headers if needed
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json(authParams);
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    res.status(500).json({ error: 'Failed to generate authentication parameters' });
  }
});

// For Vercel serverless function (create as api/imagekit-auth.js)
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json(authParams);
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    res.status(500).json({ error: 'Failed to generate authentication parameters' });
  }
}

// For Netlify function (create as netlify/functions/imagekit-auth.js)
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const authParams = imagekit.getAuthenticationParameters();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authParams)
    };
  } catch (error) {
    console.error('Error generating ImageKit auth params:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate authentication parameters' })
    };
  }
};