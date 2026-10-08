const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'password-reset', 'login'],
      default: 'signup',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document automatically removed by MongoDB after 10 minutes (600 seconds)
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookup
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
