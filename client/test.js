// test-email.js - FIXED VERSION
const nodemailer = require('nodemailer');

// FIXED: Your Gmail app password without spaces
const EMAIL_USER = 'noreplymittiarts@gmail.com';
const EMAIL_PASSWORD = 'tbsvshttpqjyowcg'; // Removed spaces: bvtx dxsj gzml zezz -> bvtxdxsjgzmlzezz

async function testEmailSetup() {
    console.log('🧪 Testing email setup...');
    console.log('Email:', EMAIL_USER);
    console.log('Password length:', EMAIL_PASSWORD.length);
    console.log('Nodemailer version:', require('nodemailer/package.json').version);

    try {
        // FIXED: Correct method is createTransport (not createTransporter)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD
            }
        });

        console.log('✅ Transporter created successfully');

        // Verify connection
        await transporter.verify();
        console.log('✅ Email connection verified');

        // Send test email
        const info = await transporter.sendMail({
            from: {
                name: 'MittiArts Test',
                address: EMAIL_USER
            },
            to: 'mittiarts0@gmail.com', // Send to your recovery email
            subject: '🧪 Test Email from MittiArts',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>🏺 MittiArts Email Test</h2>
                    <p>✅ Email system is working correctly!</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>From:</strong> ${EMAIL_USER}</p>
                    <p><strong>App Password Used:</strong> ${EMAIL_PASSWORD.substring(0, 4)}****</p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('🎉 Email setup is working correctly!');

    } catch (error) {
        console.error('❌ Email setup error:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔧 SOLUTION:');
            console.log('1. Make sure 2-Step Verification is ON in your Google account');
            console.log('2. Generate a new App Password:');
            console.log('   - Go to Google Account Settings');
            console.log('   - Security → 2-Step Verification → App passwords');
            console.log('   - Generate new password for "Mail"');
            console.log('   - Use the 16-character password (without spaces)');
        }
    }
}

// Check if nodemailer is installed
try {
    console.log('📦 Checking nodemailer installation...');
    const nodeMailerPackage = require('nodemailer/package.json');
    console.log('✅ Nodemailer installed, version:', nodeMailerPackage.version);
} catch (error) {
    console.error('❌ Nodemailer not installed! Run: npm install nodemailer');
    process.exit(1);
}

// Run the test
testEmailSetup();