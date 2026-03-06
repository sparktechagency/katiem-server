"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplate = void 0;
const createAccount = (values) => {
    console.log(values, 'values');
    const data = {
        to: values.email,
        subject: `Verify your account, ${values.name}`,
        html: `
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737711309/download_bjkj2g.png" alt="Logo" style="width: 150px; height: auto;">
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Email Verification</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
            <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #4a4a4a;">${values.otp}</span>
            </div>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px; text-align: center; color: #999999; font-size: 14px;">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `,
    };
    return data;
};
const resetPassword = (values) => {
    const data = {
        to: values.email,
        subject: `Reset your password, ${values.name}`,
        html: `
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737711309/download_bjkj2g.png" alt="Logo" style="width: 150px; height: auto;">
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Password Reset</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">Your password reset code is:</p>
            <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #4a4a4a;">${values.otp}</span>
            </div>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px; text-align: center; color: #999999; font-size: 14px;">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `,
    };
    return data;
};
const resendOtp = (values) => {
    const isReset = values.type === 'resetPassword';
    const data = {
        to: values.email,
        subject: `${isReset ? 'Password Reset' : 'Account Verification'} - New Code`,
        html: `
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737711309/download_bjkj2g.png" alt="Logo" style="width: 150px; height: auto;">
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">New Verification Code</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">
              Hello ${values.name},<br><br>
              You requested a new ${isReset ? 'password reset' : 'verification'} code. Here's your new code:
            </p>
            <div style="background-color: #f0f0f0; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #4a4a4a;">${values.otp}</span>
            </div>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">
              This code will expire in 5 minutes.<br>
              If you didn't request this code, please ignore this email or contact support.
            </p>
            <div style="margin-top: 30px; padding: 15px; background-color: #fff8e1; border-radius: 4px; border-left: 4px solid #ffd54f;">
              <p style="color: #666666; font-size: 14px; margin: 0;">
                For security reasons, never share this code with anyone.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px; text-align: center; color: #999999; font-size: 14px; border-top: 1px solid #eeeeee;">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `,
    };
    return data;
};
const paymentFailed = (values) => {
    const data = {
        to: values.email,
        subject: `Urgent: Payment Failed for your ${values.packageType} subscription`,
        html: `
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <img src="https://res.cloudinary.com/dmvht7o8m/image/upload/v1737711309/download_bjkj2g.png" alt="Logo" style="width: 150px; height: auto;">
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px;">
            <h1 style="color: #d32f2f; font-size: 24px; margin-bottom: 20px;">Payment Failed</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">
              Hello ${values.name},<br><br>
              We were unable to process the payment of <strong>$${values.amount}</strong> for your <strong>${values.packageType}</strong> subscription.
            </p>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">
              To avoid any interruption to your service, please update your payment method or ensure there are sufficient funds available.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://asad.binarybards.online/subscription" style="background-color: #333333; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Manage Subscription</a>
            </div>
            <p style="color: #666666; font-size: 14px;">
              If you have already resolved this issue, please ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 40px; text-align: center; color: #999999; font-size: 14px; border-top: 1px solid #eeeeee;">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  `,
    };
    return data;
};
exports.emailTemplate = {
    createAccount,
    resetPassword,
    resendOtp,
    paymentFailed,
};
