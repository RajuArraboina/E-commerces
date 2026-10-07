const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const generateToken = require('../utils/generateToken');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmail,
  sendOtpEmail,
  sendLoginOtpEmail,
} = require('../utils/sendEmail');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // If OTP is provided, verify it against the database
    if (otp) {
      const validOtp = await Otp.findOne({
        email: normalizedEmail,
        purpose: 'signup',
      });

      if (!validOtp || validOtp.otp !== String(otp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired 6-digit OTP code. Please request a new code.',
        });
      }

      // Delete used OTP
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'signup' });
    }

    // Create user (role can be specified as customer or admin)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || {},
      role: role && ['customer', 'admin'].includes(role) ? role : 'customer',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Dispatch welcome email asynchronously (non-blocking)
    sendWelcomeEmail(user).catch((err) =>
      console.error('⚠️ Welcome email notification error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user by normalized email and include password for verification
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    let isMatch = user ? await user.matchPassword(password) : false;
    if (!isMatch && user && user.role === 'admin' && typeof password === 'string') {
      isMatch = await user.matchPassword(password.toLowerCase());
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by an administrator.',
      });
    }

    // If OTP is provided in the login payload, verify and finish login
    if (otp) {
      const validOtp = await Otp.findOne({
        email: normalizedEmail,
        purpose: 'login',
      });

      if (!validOtp || validOtp.otp !== String(otp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired 6-digit verification code. Please request a new code.',
        });
      }

      await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with 10-minute expiry
    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'login' },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Dispatch email asynchronously so client transitions to OTP screen immediately without delay
    sendLoginOtpEmail(normalizedEmail, otpCode, user.name || 'there').catch((err) =>
      console.error('❌ Failed to deliver login OTP email in background:', err.message)
    );

    res.status(200).json({
      success: true,
      requireOtp: true,
      email: normalizedEmail,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (clears client session/token acknowledgement)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove token on client side.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware protect
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset user password (forgot password)
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and your new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Case-insensitive email lookup
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address',
      });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;
    await user.save();

    // Dispatch password reset confirmation email asynchronously
    sendPasswordResetEmail(user).catch((err) =>
      console.error('⚠️ Password reset email notification error:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a test email to verify SMTP configuration
 * @route   POST /api/auth/test-email
 * @access  Public
 */
const testEmail = async (req, res, next) => {
  try {
    const targetEmail = req.body.email || process.env.SMTP_USER;
    const result = await sendEmail({
      to: targetEmail,
      subject: '🎉 ShopSphere SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #6366f1;">ShopSphere SMTP is Active!</h2>
          <p>This is a live test email sent to <strong>${targetEmail}</strong> via Gmail SMTP.</p>
          <p>Sender: ${process.env.SMTP_USER}</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${targetEmail}`,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error || result.reason,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send 6-digit OTP to user email for signup verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendSignupOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Generate random 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Otp collection (auto-expires in 10 minutes)
    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'signup' },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Dispatch email asynchronously for instant user response
    sendOtpEmail(normalizedEmail, otpCode, name || 'there').catch((err) =>
      console.error('❌ Failed to deliver signup OTP email in background:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 6-digit OTP code before completing registration
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifySignupOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and the 6-digit verification code',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'signup',
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired or not found. Please click Resend Code.',
      });
    }

    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect 6-digit verification code. Please check your inbox and try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 6-digit OTP code to complete login
 * @route   POST /api/auth/verify-login-otp
 * @access  Public
 */
const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and the 6-digit verification code',
      });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email address',
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by an administrator.',
      });
    }

    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'login',
    });

    if (!validOtp || validOtp.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit verification code. Please check your inbox or click Resend Code.',
      });
    }

    // Delete verified OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend 6-digit OTP code for login verification
 * @route   POST /api/auth/resend-login-otp
 * @access  Public
 */
const resendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address',
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by an administrator.',
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: 'login' },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Dispatch email asynchronously for instant user response
    sendLoginOtpEmail(normalizedEmail, otpCode, user.name || 'there').catch((err) =>
      console.error('❌ Failed to deliver resend login OTP email in background:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${normalizedEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  logoutUser,
  getMe,
  resetPassword,
  testEmail,
  sendSignupOtp,
  verifySignupOtp,
};
