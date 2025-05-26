// api/password-management.js - Single file for all password operations
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase Admin Setup
const serviceAccount = {
  "type": "service_account",
  "project_id": "mitti-arts-11",
  "private_key_id": "b75fdddb7373f432cd88bc52d0329e9226205d78",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd4dlg6uL9ZOm\n2BXuCiNIrneioVaUgZQXWqp/7W5gqpf3gEbtfr1iGFZVkav3oa1cZZufzjMM9zhY\n/LOdEuiSQ/iKkPZymnXEy+tS21OKnIMOhExfJtIBjKW1GbJCCIb6nfvRNp2Sdqnn\n0e44o/FKeW8/57RrSSCmehNNpZ/fystoEHOrVhfj+DBNnC1UOgWYui6w5rjh0kiB\neyJ8jCdbq/f3uQzAGLn8+d4AFn2PPXXlHoU3pOcl4vvs8/5+4lryRbSo525eHGWJ\nOQrO97eXw2748CrU4SznTAG0EvAJqj3Tu7JZa4Yo975Nu8068LZCu+6QivKbQ5f2\nlFajfPmXAgMBAAECggEAHgZphzNgednoT+UntSqTfSLWyAJcisg9xz1aqgX/jhfn\nolUtTRYOtPc4PKdWg+TzP/9mvs+gnItsvjXEn7xNTWiMX17RAOpWQ+y4p6ypiRTD\nTIgSDmZd+FpNkx14EiyXBqByQVavgYPorEW8QQdTbfHbF1gl85dWpew3+Wd9jlU2\nD6sZn00mAJiKvxD49PSEbGy5oqmPfKU+whxQ9vY6SmHEMqddjlmGwX2UM9z8C3oq\neKTBfOS6MUZuCvduJDtWmOse8zAEclo0oXY44ghLaSf31vgv7r8+fnLV/Gimx/TX\nW308fLo1Kml7Bt7N310ruUklFOLuGcH+8v85V1Fd0QKBgQD4vwaleL3i6kJgj0YB\nIadnBhwbDihqB864Fslq94y66HLIWKKL+F5SlbuNIpkliQqnkMHcrJ5bcfH0U8Cb\nLZkfv8CacGcLcQKdQ7YEzmfLztoJc1pj4rTd8fqG6fjBs9eE1GS4vb/91JOe+YK/\nt0MQm+DWGDruveXZPROhwjvlhwKBgQDdwA/WkWBYW9HyHxUDHnmFODmUx/pj0EfI\nN9CB9QHa9lOInEhvjHPjF8rDeYJWCPe7Acm9gbLwR+Asdo3irN3KUf5UVf3oq1kU\nF711wfZZxM72djV6DoWx56vtCj/EKXWe0g1EJUIqBwiLWoG34vws8sFof+/WqIJ1\n9+kdiQhPcQKBgBv96zKNztiNQiD5nogcEGmQj3Mf+b5M2J9wuQPXjbeu1tPi3Y/g\nyESE4xEz1oYZ0OAgcyBxMHTb8r1q+167F+MxwevfQElSU1f9Oat6ysVtpq2vlHlv\nFqlvRKEQDVVG9rbU6+y6NbPLyzz1mRgX+G0TDY8qNN+O8SGsNNxcLj9bAoGASNXK\n3flGIf+Wx+Y5qpqZ444CK8I7lglVaogarnThNSBvc5GRoUIK1m58JRSGIOg1JnGB\n6ALv2Uhic3hFRkztVIT1+pF8Iq4VRio+Cq240ud36zAMhJi8hSDJMcSKCU5s2cu4\nm8d5IgDJZ6xEqzedCM57hG1xQ5p5r3HMWe0mk6ECgYEA5vaDWXIdh9uTmvbDSiXw\n9oPMohMjBnADNo1EUxI7d0Q5a5v/MKok8gY7CyTwuWQPbtTT8WBfpOAlsXLPU7dB\nIntbINnnS6iwEh7FCvIYvU8S6raNIINiGG+etC1f0GUCppnyCis2PsdHueLiSE5o\ncsvRiyMBwZdhHZoJO/01oy4=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@mitti-arts-11.iam.gserviceaccount.com",
  "client_id": "103109421333027835056",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mitti-arts-11.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'mitti-arts-11'
  });
}
const db = getFirestore();

// Email Configuration
const EMAIL_USER = 'noreplymittiarts@gmail.com';
const EMAIL_PASSWORD = 'bvtx dxsj gzml zezz';
const SECRET_KEY = 'mitti-arts-super-secure-secret-key-for-password-reset-2024';
const ALLOWED_ORIGINS = ['https://mittiarts.com', 'https://www.mittiarts.com', 'http://localhost:3000'];

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Rate limiting storage
const rateLimiter = {
  requests: {},
  checkLimit(ip, limit = 5, timeWindow = 900000) { // 15 minutes
    const now = Date.now();
    if (!this.requests[ip]) {
      this.requests[ip] = { count: 0, firstRequest: now };
    }
    if (now - this.requests[ip].firstRequest > timeWindow) {
      this.requests[ip] = { count: 0, firstRequest: now };
    }
    this.requests[ip].count++;
    return this.requests[ip].count <= limit;
  }
};

// Utility functions
function isValidOrigin(origin) {
  return !origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*');
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Main handler function
module.exports = async (req, res) => {
  // CORS handling
  const origin = req.headers.origin;
  if (isValidOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed'
    });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!rateLimiter.checkLimit(clientIp, 5)) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
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
          code: 'INVALID_ACTION',
          message: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Password management error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred. Please try again.'
    });
  }
};

// Handle forgot password
async function handleForgotPassword(req, res) {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Please provide a valid email address'
    });
  }

  try {
    // Check if user exists
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      // Don't reveal if email exists - security
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

    // Store reset token
    await db.collection('passwordResets').doc(userId).set({
      resetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
      resetTokenExpiry,
      email,
      createdAt: new Date().toISOString(),
      used: false
    });

    // Create reset URL
    const resetUrl = `https://mittiarts.com/reset-password?token=${resetToken}&id=${userId}`;

    // Email template
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MittiArts</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .reset-button { display: inline-block; background: #D2691E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .reset-button:hover { background: #A0522D; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            .security-tip { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏺 MittiArts</div>
                <div class="subtitle">Crafting Traditions, Creating Memories</div>
            </div>
            
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello <strong>${userData.name || 'Valued Customer'}</strong>,</p>
                
                <p>We received a request to reset the password for your MittiArts account associated with <strong>${email}</strong>.</p>
                
                <p>Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Reset My Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This link will expire in <strong>1 hour</strong></li>
                        <li>You can only use this link once</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                    </ul>
                </div>
                
                <div class="security-tip">
                    <strong>🔐 Security Tip:</strong> Always create strong passwords with a mix of uppercase, lowercase, numbers, and special characters.
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                    ${resetUrl}
                </p>
                
                <p>If you have any questions or concerns, please contact our support team.</p>
                
                <p>Best regards,<br>
                <strong>The MittiArts Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated email from MittiArts. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} MittiArts. All rights reserved.</p>
                <p>If you're having trouble with the link above, contact us at support@mittiarts.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email
    await transporter.sendMail({
      from: {
        name: 'MittiArts',
        address: EMAIL_USER
      },
      to: email,
      subject: '🔐 Password Reset Request - MittiArts',
      html: emailTemplate
    });

    console.log(`Password reset email sent to: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
}

// Handle reset password
async function handleResetPassword(req, res) {
  const { token, userId, newPassword, confirmPassword } = req.body;

  if (!token || !userId || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_PARAMETERS',
      message: 'All fields are required'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 'PASSWORDS_MISMATCH',
      message: 'Passwords do not match'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      code: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters long'
    });
  }

  try {
    // Check reset token
    const resetDoc = await db.collection('passwordResets').doc(userId).get();
    
    if (!resetDoc.exists) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    const resetData = resetDoc.data();

    // Check expiry
    if (Date.now() > resetData.resetTokenExpiry) {
      await db.collection('passwordResets').doc(userId).delete();
      return res.status(400).json({
        success: false,
        code: 'EXPIRED_TOKEN',
        message: 'Reset token has expired. Please request a new password reset.'
      });
    }

    // Check if used
    if (resetData.used) {
      return res.status(400).json({
        success: false,
        code: 'TOKEN_USED',
        message: 'This reset token has already been used'
      });
    }

    // Verify token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (hashedToken !== resetData.resetToken) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
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
      usedAt: new Date().toISOString()
    });

    console.log(`Password reset successful for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

// Handle change password
async function handleChangePassword(req, res) {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  if (!userId || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_PARAMETERS',
      message: 'All fields are required'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      code: 'PASSWORDS_MISMATCH',
      message: 'New passwords do not match'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      code: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters long'
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      code: 'SAME_PASSWORD',
      message: 'New password must be different from current password'
    });
  }

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Update password in Firebase Auth
    await admin.auth().updateUser(userId, {
      password: newPassword
    });

    // Send confirmation email
    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - MittiArts</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .success-badge { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .security-info { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏺 MittiArts</div>
                <div class="subtitle">Crafting Traditions, Creating Memories</div>
            </div>
            
            <div class="content">
                <h2>✅ Password Successfully Changed</h2>
                
                <div class="success-badge">
                    <strong>🎉 Great news!</strong> Your password has been updated successfully.
                </div>
                
                <p>Hello <strong>${userData.name || 'Valued Customer'}</strong>,</p>
                
                <p>This email confirms that the password for your MittiArts account (<strong>${userData.email}</strong>) has been successfully changed.</p>
                
                <div class="security-info">
                    <strong>🔐 Security Details:</strong>
                    <ul>
                        <li><strong>Date & Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</li>
                        <li><strong>Changed from:</strong> Your account profile page</li>
                        <li><strong>Account:</strong> ${userData.email}</li>
                    </ul>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Didn't make this change?</strong><br>
                    If you didn't change your password, please contact our support team immediately at <strong>support@mittiarts.com</strong>.
                </div>
                
                <h3>🛡️ Security Recommendations:</h3>
                <ul>
                    <li>Never share your password with anyone</li>
                    <li>Use a unique password for your MittiArts account</li>
                    <li>Consider using a password manager</li>
                    <li>Log out from shared devices</li>
                </ul>
                
                <p>Thank you for keeping your account secure!</p>
                
                <p>Best regards,<br>
                <strong>The MittiArts Security Team</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated security notification from MittiArts.</p>
                <p>© ${new Date().getFullYear()} MittiArts. All rights reserved.</p>
                <p>If you have any questions, contact us at support@mittiarts.com</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send confirmation email
    await transporter.sendMail({
      from: {
        name: 'MittiArts Security',
        address: EMAIL_USER
      },
      to: userData.email,
      subject: '🔐 Password Changed Successfully - MittiArts',
      html: emailTemplate
    });

    console.log(`Password changed successfully for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. A confirmation email has been sent.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}