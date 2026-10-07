const nodemailer = require('nodemailer');

/**
 * Create reusable Nodemailer transporter instance
 */
let cachedTransporter = null;

const createTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  cachedTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port === 567 ? 465 : port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    family: 4, // Force IPv4 to prevent IPv6 DNS timeout delays on Windows
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  return cachedTransporter;
};

/**
 * Base email sender function
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not found in environment variables. Email skipped.');
    return { success: false, reason: 'SMTP not configured' };
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"ShopSphere" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || '',
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Send Welcome Email upon User Registration
 */
const sendWelcomeEmail = async (user) => {
  const subject = `Welcome to ShopSphere, ${user.name}! 🛍️`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 15px; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .badge-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 16px 20px; margin: 20px 0; text-align: center; }
        .badge-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #4f46e5; letter-spacing: 1px; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; margin: 20px 0 10px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ShopSphere</h1>
          <p>Your premier destination for smart shopping</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hi ${user.name},</h2>
          <p>Thank you for joining <strong>ShopSphere</strong>! We are delighted to have you as part of our shopping community.</p>
          <p>Here is your registered account information:</p>
          <ul style="color: #475569; padding-left: 20px;">
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Account Role:</strong> ${user.role || 'customer'}</li>
            <li><strong>Joined:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          
          <div class="badge-box">
            <div style="font-size: 13px; color: #6366f1; font-weight: 600; text-transform: uppercase;">Exclusive Welcome Gift</div>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">Use coupon code below at checkout for 10% off your first purchase:</p>
            <div class="badge-code">WELCOME10</div>
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:3000/products" class="btn">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.<br>
          Sent with ❤️ from Raju Arraboina
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * 2. Send Password Reset Alert Email
 */
const sendPasswordResetEmail = async (user) => {
  const subject = '🔒 ShopSphere - Password Reset Confirmation';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .alert-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; color: #166534; font-weight: 500; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin:0; font-size: 24px;">ShopSphere Security Alert</h1>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hello ${user.name},</h2>
          <div class="alert-box">
            ✅ Your ShopSphere account password has been successfully updated.
          </div>
          <p>This action was performed on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If you made this change, you can safely disregard this email and log in with your new password.</p>
          <p style="color: #ef4444; font-size: 14px;"><strong>Warning:</strong> If you did not authorize this change, please contact support immediately to secure your account.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere Security Team
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * 3. Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order, user) => {
  const subject = `Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()} 📦`;
  
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
          <strong>${item.name}</strong>
          ${item.variant?.title ? `<br><small style="color:#64748b;">${item.variant.title}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .order-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 18px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
        .total-box { text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid #e2e8f0; font-size: 16px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 26px;">Order Confirmed!</h1>
          <p style="margin: 6px 0 0; opacity: 0.95;">Thank you for your purchase with ShopSphere</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hi ${user.name || 'Valued Customer'},</h2>
          <p>We've received your order and we're getting it ready for shipment! Here is your order summary:</p>
          
          <div class="order-info">
            <p style="margin: 0 0 6px;"><strong>Order ID:</strong> #${order._id.toString().toUpperCase()}</p>
            <p style="margin: 0 0 6px;"><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
            <p style="margin: 0 0 6px;"><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
            <p style="margin: 0;"><strong>Shipping To:</strong> ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            ${order.discountAmount > 0 ? `<div style="color: #10b981; font-size: 14px; margin-bottom: 4px;">Discount: -₹${Number(order.discountAmount).toFixed(2)}</div>` : ''}
            <div><strong>Total Paid: <span style="font-size: 20px; color: #6366f1;">₹${Number(order.totalAmount).toFixed(2)}</span></strong></div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere. If you have questions, reply to this email!
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * 4. Send Order Status Update Email
 */
const sendOrderStatusEmail = async (order, user, newStatus) => {
  const statusColors = {
    Placed: '#3b82f6',
    Confirmed: '#6366f1',
    Processing: '#8b5cf6',
    Shipped: '#06b6d4',
    'Out for Delivery': '#f59e0b',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
  };

  const currentColor = statusColors[newStatus] || '#6366f1';
  const subject = `Order Status Update: ${newStatus} #${order._id.toString().slice(-8).toUpperCase()}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: ${currentColor}; padding: 32px 24px; text-align: center; color: #ffffff; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .status-badge { display: inline-block; background: ${currentColor}; color: #ffffff; padding: 8px 18px; border-radius: 20px; font-weight: bold; font-size: 15px; margin: 12px 0; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
          <p style="margin: 4px 0 0; opacity: 0.9;">Order #${order._id.toString().toUpperCase()}</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hello ${user.name || 'Valued Customer'},</h2>
          <p>Your order status has been updated:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div class="status-badge">${newStatus}</div>
          </div>
          <p><strong>Total Amount:</strong> ₹${Number(order.totalAmount).toFixed(2)}</p>
          <p><strong>Items:</strong> ${order.items.length} item(s)</p>
          <p>Thank you for choosing ShopSphere. We are working hard to deliver the best shopping experience to you!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere Customer Care
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, html });
};

/**
 * 5. Send 6-Digit OTP Email for Signup Verification
 */
const sendOtpEmail = async (email, otp, name = 'there') => {
  const subject = `Your ShopSphere Verification Code: ${otp} 🔐`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 28px; line-height: 1.6; text-align: center; }
        .otp-container { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; margin: 24px auto; max-width: 340px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 10px; margin: 0; }
        .expiry-note { font-size: 13px; color: #64748b; margin-top: 14px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ShopSphere</h1>
          <p>Email Verification</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hello ${name},</h2>
          <p style="color: #475569; font-size: 15px; margin-bottom: 8px;">
            Thank you for creating an account on ShopSphere! Use the 6-digit verification code below to verify your email address:
          </p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>

          <p class="expiry-note">
            ⏳ This code is valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
          </p>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            If you didn't initiate this request, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere. Protected by Google SMTP.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * 6. Send 6-Digit OTP Email for Login Verification (2FA)
 */
const sendLoginOtpEmail = async (email, otp, name = 'there') => {
  const subject = `Your ShopSphere Login Code: ${otp} 🔐`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #334155; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 28px; line-height: 1.6; text-align: center; }
        .otp-container { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; margin: 24px auto; max-width: 340px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #4f46e5; letter-spacing: 12px; margin: 0; }
        .expiry-note { font-size: 13px; color: #64748b; margin-top: 14px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ShopSphere</h1>
          <p>Login Verification</p>
        </div>
        <div class="body">
          <h2 style="margin-top: 0; color: #1e293b;">Hello ${name},</h2>
          <p style="color: #475569; font-size: 15px; margin-bottom: 8px;">
            A login request was made for your ShopSphere account. Use the 6-digit verification code below to sign in:
          </p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>

          <p class="expiry-note">
            ⏳ This code is valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
          </p>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            If you did not attempt to sign in, please secure your account immediately or reset your password.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShopSphere. Protected by Google SMTP.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOtpEmail,
  sendLoginOtpEmail,
};

