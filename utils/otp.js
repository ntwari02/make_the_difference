import crypto from 'crypto';
import db from '../config/database.js';

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email
 * @param {string} email - User's email address
 * @param {string} otp - The OTP to send
 * @param {string} purpose - Purpose of the OTP (e.g., 'password_reset', 'security_login')
 * @returns {Promise<boolean>} Success status
 */
async function sendOTPEmail(email, otp, purpose = 'security_login') {
    try {
        // Get transporter from notifications.js (uses .env)
        const { getMailer } = await import('../routes/notifications.js');
        const transporter = getMailer();
        
        if (!transporter) {
            console.warn('Email not sent: SMTP not configured');
            console.log('📧 OTP for development:', otp);
            console.log('📧 To receive emails, add SMTP settings to your .env file:');
            console.log('📧 SMTP_HOST=smtp.gmail.com');
            console.log('📧 SMTP_PORT=587');
            console.log('📧 SMTP_USER=your-email@gmail.com');
            console.log('📧 SMTP_PASS=your-app-password');
            console.log('📧 SMTP_FROM=your-email@gmail.com');
            return true; // Return true for development even without SMTP
        }

        const subject = purpose === 'password_reset' 
            ? 'Password Reset OTP - Make The Difference'
            : 'Security Login OTP - Make The Difference';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Make The Difference</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Security Verification</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Your Security Code</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.5;">
                        You requested a security code for ${purpose === 'password_reset' ? 'password reset' : 'security login'}. 
                        Use the code below to verify your identity:
                    </p>
                    
                    <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                            ${otp}
                        </div>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                        <strong>Important:</strong>
                        <br>• This code expires in 10 minutes
                        <br>• Do not share this code with anyone
                        <br>• If you didn't request this code, please ignore this email
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                    <p>This is an automated message from Make The Difference</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: html
        });

        console.log(`OTP email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
}

/**
 * Store OTP in database
 * @param {number} userId - User ID
 * @param {string} otp - The OTP to store
 * @param {number} expiryMinutes - Expiry time in minutes (default: 10)
 * @returns {Promise<boolean>} Success status
 */
async function storeOTP(userId, otp, expiryMinutes = 10) {
    try {
        const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
        
        await db.query(
            'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE id = ?',
            [otp, expiry, userId]
        );
        
        console.log(`OTP stored for user ${userId}, expires at ${expiry}`);
        return true;
    } catch (error) {
        console.error('Error storing OTP:', error);
        return false;
    }
}

/**
 * Verify OTP from database
 * @param {number} userId - User ID
 * @param {string} providedOTP - OTP provided by user
 * @returns {Promise<{valid: boolean, expired: boolean}>} Verification result
 */
async function verifyOTP(userId, providedOTP) {
    try {
        const [users] = await db.query(
            'SELECT reset_otp, reset_otp_expiry FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return { valid: false, expired: false };
        }
        
        const user = users[0];
        
        if (!user.reset_otp || !user.reset_otp_expiry) {
            return { valid: false, expired: false };
        }
        
        const now = new Date();
        const expiry = new Date(user.reset_otp_expiry);
        
        if (now > expiry) {
            return { valid: false, expired: true };
        }
        
        const isValid = user.reset_otp === providedOTP;
        
        if (isValid) {
            // Clear OTP after successful verification
            await db.query(
                'UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
                [userId]
            );
        }
        
        return { valid: isValid, expired: false };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { valid: false, expired: false };
    }
}

/**
 * Clear OTP from database
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
async function clearOTP(userId) {
    try {
        await db.query(
            'UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
            [userId]
        );
        return true;
    } catch (error) {
        console.error('Error clearing OTP:', error);
        return false;
    }
}

/**
 * Generate and send OTP for security login
 * @param {string} email - User's email
 * @param {string} purpose - Purpose of the OTP
 * @returns {Promise<{success: boolean, message: string, otp?: string}>} Result
 */
async function generateAndSendOTP(email, purpose = 'security_login') {
    try {
        // Find user by email
        const [users] = await db.query(
            'SELECT id, email FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            console.log('❌ User not found for email:', email);
            return {
                success: false,
                message: 'Email not found in our system'
            };
        }
        
        const user = users[0];
        const otp = generateOTP();
        console.log('✅ User found, generating OTP:', otp);
        
        // Store OTP in database
        const stored = await storeOTP(user.id, otp, 10);
        console.log('✅ OTP stored in database:', stored);
        if (!stored) {
            return {
                success: false,
                message: 'Failed to generate security code. Please try again.'
            };
        }
        
        // Send OTP via email
        const sent = await sendOTPEmail(email, otp, purpose);
        console.log('📧 Email sent status:', sent);
        
        // For development, always return success even if email fails
        if (!sent) {
            console.log('⚠️ Email failed but continuing for development');
        }
        
        return {
            success: true,
            message: 'Security code sent to your email address. Please check your inbox.',
            otp: otp // Always return OTP for development
        };
    } catch (error) {
        console.error('Error generating and sending OTP:', error);
        return {
            success: false,
            message: 'An error occurred. Please try again later.'
        };
    }
}

export {
    generateOTP,
    sendOTPEmail,
    storeOTP,
    verifyOTP,
    clearOTP,
    generateAndSendOTP
};
