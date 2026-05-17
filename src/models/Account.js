const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    usernameOrEmail: {
      type: String,
      default: null,
      trim: true
    },
    connectedEmail: {
      type: String,
      default: null,
      trim: true
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true
    },
    password: {
      type: String,
      default: null,
      select: false
    },
    recoveryEmail: {
      type: String,
      default: null,
      trim: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);