import config from "../../../config";

/**
 * Generates an email template for verification
 * @param {string} emailVerificationLink - The verification URL with the token
 * @returns {string} - The HTML template
 */
export const generateEmailVerifyTemplate = (emailVerificationLink: string) => {
	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; line-height: 1.6;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FF7600, #45a049); padding: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h2>
            </div>

            <!-- Body -->
            <div style="padding: 30px; text-align: center;">
                <p style="font-size: 18px; color: #333; margin-bottom: 10px;">Hello,</p>
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Thank you for signing up! To complete your registration, please verify your email address by clicking the button below.
                </p>
                
                <a href="${emailVerificationLink}" 
                   style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #FF7600; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                   Verify Email
                </a>

                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                    This link is valid for <strong>30 minutes</strong>. If you did not request this, please ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                <p style="margin: 0;">© 2025 Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const emailVerifiedSuccessTemplate = () => {
	const templateSuccess = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified Successfully</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        
        <div style="background: linear-gradient(135deg, #28a745, #218838); padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Email Verified Successfully</h2>
        </div>

        <div style="padding: 30px; text-align: center;">
            <p style="font-size: 18px; color: #333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Your email has been successfully verified. You can now access all features of our platform.
            </p>
            
            <a href="${config.frontend_url}/auth/login" 
               style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #28a745; text-decoration: none; border-radius: 8px; margin: 20px 0;">
               Login to Your Account
            </a>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If you did not request this, please contact our support team immediately.
            </p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© 2025 Your Company Name. All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`;

	return templateSuccess;
};
export const emailVerifiedFailedTemplate = () => {
	// Expired Token Error Template
	const templateError = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Link Expired</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        
        <div style="background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Verification Link Expired</h2>
        </div>

        <div style="padding: 30px; text-align: center;">
            <p style="font-size: 18px; color: #333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Your email verification link has expired or is invalid. Please request a new verification email.
            </p>
            
            <a href="${config.frontend_url}/login" 
               style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #dc3545; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Log in to request a new verification email
            </a>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If you continue to experience issues, please contact our support team.
            </p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">© 2025 Investor.io . All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`;

	return templateError;
};
