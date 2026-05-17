const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/token');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const { email } = req.params;
    const { role, isBlocked, firstName, lastName, phoneNumber, password } = req.body;

    const updateData = {};

    if (role !== undefined) {
      const allowedRoles = ['super-admin', 'admin', 'user'];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      updateData.role = role;
    }

    if (isBlocked !== undefined) {
      if (typeof isBlocked !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isBlocked must be true or false'
        });
      }

      updateData.isBlocked = isBlocked;
    }

    if (firstName !== undefined) {
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName;
    }

    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }

    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nothing to update'
      });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User info updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user info'
    });
  }
};

const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const deletedUser = await User.findOneAndDelete({
      email: email.toLowerCase()
    });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      user: {
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        email: deletedUser.email,
        phoneNumber: deletedUser.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
  deleteUserByEmail,
  updateUserInfo,
  changePassword,
  adminResetPassword
};