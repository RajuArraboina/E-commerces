require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
  console.log('--- Testing SMTP with Nodemailer ---');
  console.log('Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('Port:', process.env.SMTP_PORT || 465);
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('✅ SMTP Server Connection Verified Successfully!');

    console.log('Sending test email to:', process.env.SMTP_USER);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"EShop" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: '🎉 EShop SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">EShop</h1>
            <p style="margin: 4px 0 0; opacity: 0.9;">SMTP Email Integration Active</p>
          </div>
          <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
            <p>Hello Raju,</p>
            <p>Congratulations! Your Gmail SMTP configuration is working perfectly on EShop.</p>
            <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #1e293b;">Configuration Details:</p>
              <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 14px; color: #64748b;">
                <li>Host: smtp.gmail.com</li>
                <li>Port: 465 (SSL/TLS)</li>
                <li>Sender: ${process.env.SMTP_USER}</li>
                <li>Timestamp: ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            <p>You can now send automated emails for registration, password reset, and order status updates!</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} EShop. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log('✅ Test Email Sent Successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ SMTP Connection/Send Error:', error);
  }
}

testSmtp();
