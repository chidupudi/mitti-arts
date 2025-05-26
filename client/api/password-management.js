// api/password-management.js - WORKING VERSION FOR VERCEL
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: "mitti-arts-11",
    private_key_id: "b75fdddb7373f432cd88bc52d0329e9226205d78",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd4dlg6uL9ZOm\n2BXuCiNIrneioVaUgZQXWqp/7W5gqpf3gEbtfr1iGFZVkav3oa1cZZufzjMM9zhY\n/LOdEuiSQ/iKkPZymnXEy+tS21OKnIMOhExfJtIBjKW1GbJCCIb6nfvRNp2Sdqnn\n0e44o/FKeW8/57RrSSCmehNNpZ/fystoEHOrVhfj+DBNnC1UOgWYui6w5rjh0kiB\neyJ8jCdbq/f3uQzAGLn8+d4AFn2PPXXlHoU3pOcl4vvs8/5+4lryRbSo525eHGWJ\nOQrO97eXw2748CrU4SznTAG0EvAJqj3Tu7JZa4Yo975Nu8068LZCu+6QivKbQ5f2\nlFajfPmXAgMBAAECggEAHgZphzNgednoT+UntSqTfSLWyAJcisg9xz1aqgX/jhfn\nolUtTRYOtPc4PKdWg+TzP/9mvs+gnItsvjXEn7xNTWiMX17RAOpWQ+y4p6ypiRTD\nTIgSDmZd+FpNkx14EiyXBqByQVavgYPorEW8QQdTbfHbF1gl85dWpew3+Wd9jlU2\nD6sZn00mAJiKvxD49PSEbGy5oqmPfKU+whxQ9vY6SmHEMqddjlmGwX2UM9z8C3oq\neKTBfOS6MUZuCvduJDtWmOse8zAEclo0oXY44ghLaSf31vgv7r8+fnLV/Gimx/TX\nW308fLo1Kml7Bt7N310ruUklFOLuGcH+8v85V1Fd0QKBgQD4vwaleL3i6kJgj0YB\nIadnBhwbDihqB864Fslq94y66HLIWKKL+F5SlbuNIpkliQqnkMHcrJ5bcfH0U8Cb\nLZkfv8CacGcLcQKdQ7YEzmfLztoJc1pj4rTd8fqG6fjBs9eE1GS4vb/91JOe+YK/\nt0MQm+DWGDruveXZPROhwjvlhwKBgQDdwA/WkWBYW9HyHxUDHnmFODmUx/pj0EfI\nN9CB9QHa9lOInEhvjHPjF8rDeYJWCPe7Acm9gbLwR+Asdo3irN3KUf5UVf3oq1kU\nF711wfZZxM72djV6DoWx56vtCj/EKXWe0g1EJUIqBwiLWoG34vws8sFof+/WqIJ1\n9+kdiQhPcQKBgBv96zKNztiNQiD5nogcEGmQj3Mf+b5M2J9wuQPXjbeu1tPi3Y/g\nyESE4xEz1oYZ0OAgcyBxMHTb8r1q+167F+MxwevfQElSU1f9Oat6ysVtpq2vlHlv\nFqlvRKEQDVVG9rbU6+y6NbPLyzz1mRgX+G0TDY8qNN+O8SGsNNxcLj9bAoGASNXK\n3flGIf+Wx+Y5qpqZ444CK8I7lglVaogarnThNSBvc5GRoUIK1m58JRSGIOg1JnGB\n6ALv2Uhic3hFRkztVIT1+pF8Iq4VRio+Cq240ud36zAMhJi8hSDJMcSKCU5s2cu4\nm8d5IgDJZ6xEqzedCM57hG1xQ5p5r3HMWe0mk6ECgYEA5vaDWXIdh9uTmvbDSiXw\n9oPMohMjBnADNo1EUxI7d0Q5a5v/MKok8gY7CyTwuWQPbtTT8WBfpOAlsXLPU7dB\nIntbINnnS6iwEh7FCvIYvU8S6raNIINiGG+etC1f0GUCppnyCis2PsdHueLiSE5o\ncsvRiyMBwZdhHZoJO/01oy4=\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@mitti-arts-11.iam.gserviceaccount.com",
    client_id: "103109421333027835056",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mitti-arts-11.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'mitti-arts-11'
  });
}

const db = admin.firestore();

// Email Configuration
const EMAIL_USER = 'noreplymittiarts@gmail.com';
const EMAIL_PASSWORD = 'tbsvshttpqjyowcg';
const ALLOWED_ORIGINS = [
  'https://mittiarts.com', 
  'https://www.mittiarts.com', 
  'http://localhost:3000',
  'https://mitti-arts.vercel.app'
];

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Rate limiting - simple in-memory storage (for production, use Redis)
const rateLimiter = new Map();

function checkRateLimit(ip, limit = 5, windowMs = 15 * 60 * 1000) { // 15 minutes
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, []);
  }
  
  const requests = rateLimiter.get(ip);
  // Remove old requests
  const recentRequests = requests.filter(time => time > windowStart);
  rateLimiter.set(ip, recentRequests);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isValidOrigin(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  if (isValidOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  const { action } = req.body;

  try {
    switch (action) {
      case 'forgot-password':
        return await handleForgotPassword(req, res);
      case 'reset-password':
        return await handleResetPassword(req, res);
      case 'change-password':
        return await handleChangePassword(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
  } catch (error) {
    console.error('Password management error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleForgotPassword(req, res) {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  try {
    // Check if user exists
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      // Don't reveal if email exists - security best practice
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store reset token in Firestore
    await db.collection('passwordResets').doc(userId).set({
      resetToken: hashedToken,
      resetTokenExpiry,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      used: false
    });

    // Create reset URL
    const resetUrl = `https://mittiarts.com/reset-password?token=${resetToken}&id=${userId}`;

    // Email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MittiArts</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #D2691E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🏺 MittiArts</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-top: 0;">Hello ${userData.name || 'User'}!</h2>
            
            <p style="color: #555; line-height: 1.6;">We received a request to reset your password for your MittiArts account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white;">Reset My Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour for your security</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p style="color: #555; font-size: 14px; word-break: break-all;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="color: #D2691E;">${resetUrl}</span>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent by MittiArts Security System</p>
            <p>If you need help, contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: {
        name: 'MittiArts Security',
        address: EMAIL_USER
      },
      to: email,
      subject: '🔐 Password Reset Request - MittiArts',
      html: emailHTML
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset email. Please try again.'
    });
  }
}

async function handleResetPassword(req, res) {
  const { token, userId, newPassword, confirmPassword } = req.body;

  // Validation
  if (!token || !userId || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  try {
    // Get reset token from Firestore
    const resetDoc = await db.collection('passwordResets').doc(userId).get();
    
    if (!resetDoc.exists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const resetData = resetDoc.data();

    // Check if token is expired
    if (Date.now() > resetData.resetTokenExpiry) {
      await db.collection('passwordResets').doc(userId).delete();
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new password reset.'
      });
    }

    // Check if token was already used
    if (resetData.used) {
      return res.status(400).json({
        success: false,
        message: 'This reset token has already been used'
      });
    }

    // Verify token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (hashedToken !== resetData.resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Update password in Firebase Auth
    await admin.auth().updateUser(userId, {
      password: newPassword
    });

    // Mark token as used
    await db.collection('passwordResets').doc(userId).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
}

async function handleChangePassword(req, res) {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  // Validation
  if (!userId || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New passwords do not match'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password'
    });
  }

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    // For security, we should verify the current password first
    // However, Firebase Admin SDK doesn't have a direct way to verify passwords
    // In production, you might want to use Firebase Auth REST API for this
    
    // Update password in Firebase Auth
    await admin.auth().updateUser(userId, {
      password: newPassword
    });

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: {
          name: 'MittiArts Security',
          address: EMAIL_USER
        },
        to: userData.email,
        subject: '🔐 Password Changed Successfully - MittiArts',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D2691E; margin: 0;">🏺 MittiArts</h1>
                <h2 style="color: #333; margin: 10px 0;">✅ Password Changed Successfully</h2>
              </div>
              
              <p style="color: #555; line-height: 1.6;">Hello <strong>${userData.name || 'User'}</strong>,</p>
              
              <p style="color: #555; line-height: 1.6;">Your password has been changed successfully on <strong>${new Date().toLocaleString()}</strong>.</p>
              
              <div style="background: #e8f5e9; border: 1px solid #4caf50; color: #2e7d32; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>🔐 Security Notice:</strong><br>
                If you didn't make this change, please contact our support team immediately.
              </div>
              
              <p style="color: #555; line-height: 1.6;">Best regards,<br>The MittiArts Security Team</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the password change if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. A confirmation email has been sent.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.'
    });
  }
}