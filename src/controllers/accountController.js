const Account = require('../models/Account');
const { encryptText, decryptText } = require('../utils/crypto');

const createAccount = async (req, res) => {
  try {
    const {
      name,
      category,
      usernameOrEmail,
      password,
      connectedEmail,
      phoneNumber,
      recoveryEmail,
      description
    } = req.body;

    if (!name?.trim() || !category?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'name, category and description are required'
      });
    }

    const account = await Account.create({
      user: req.user._id,
      name: name.trim(),
      category: category.trim(),
      usernameOrEmail: usernameOrEmail
        ? usernameOrEmail.trim().toLowerCase()
        : null,
      connectedEmail: connectedEmail
        ? connectedEmail.trim().toLowerCase()
        : null,
      phoneNumber: phoneNumber ? phoneNumber.trim() : null,
      password: password?.trim() ? encryptText(password.trim()) : null,
      recoveryEmail: recoveryEmail
        ? recoveryEmail.trim().toLowerCase()
        : null,
      description: encryptText(description.trim())
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      account: {
        _id: account._id,
        name: account.name,
        category: account.category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};

const getAllAccounts = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'super-admin') {
      query.user = req.user._id;
    }

    // Support search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { usernameOrEmail: searchRegex },
        { connectedEmail: searchRegex }
      ];
    }

    // Support category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalAccounts = await Account.countDocuments(query);
    const totalPages = Math.ceil(totalAccounts / limit);

    const accounts = await Account.find(query)
      .populate('user', 'firstName lastName')
      .select('+password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = accounts.map((acc) => ({
      _id: acc._id,
      user: acc.user,
      addedBy: acc.user ? `${acc.user.firstName} ${acc.user.lastName}`.trim() : 'System',
      name: acc.name,
      category: acc.category,
      usernameOrEmail: acc.usernameOrEmail,
      password: acc.password ? decryptText(acc.password) : null,
      connectedEmail: acc.connectedEmail,
      phoneNumber: acc.phoneNumber,
      recoveryEmail: acc.recoveryEmail,
      description: decryptText(acc.description),
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      totalAccounts,
      totalPages,
      currentPage: page,
      limit,
      accounts: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};

const getSingleAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findById(id).select('+password');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (
      req.user.role !== 'super-admin' &&
      account.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      account: {
        _id: account._id,
        user: account.user,
        name: account.name,
        category: account.category,
        usernameOrEmail: account.usernameOrEmail,
        password: account.password ? decryptText(account.password) : null,
        connectedEmail: account.connectedEmail,
        phoneNumber: account.phoneNumber,
        recoveryEmail: account.recoveryEmail,
        description: decryptText(account.description),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      usernameOrEmail,
      password,
      connectedEmail,
      phoneNumber,
      recoveryEmail,
      description
    } = req.body;

    const account = await Account.findById(id).select('+password');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (
      req.user.role !== 'super-admin' &&
      account.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'name cannot be empty'
        });
      }
      account.name = name.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'category cannot be empty'
        });
      }
      account.category = category.trim();
    }

    if (usernameOrEmail !== undefined) {
      account.usernameOrEmail = usernameOrEmail
        ? usernameOrEmail.trim().toLowerCase()
        : null;
    }

    if (connectedEmail !== undefined) {
      account.connectedEmail = connectedEmail
        ? connectedEmail.trim().toLowerCase()
        : null;
    }

    if (phoneNumber !== undefined) {
      account.phoneNumber = phoneNumber ? phoneNumber.trim() : null;
    }

    if (recoveryEmail !== undefined) {
      account.recoveryEmail = recoveryEmail
        ? recoveryEmail.trim().toLowerCase()
        : null;
    }

    if (password !== undefined) {
      account.password = password?.trim() ? encryptText(password.trim()) : null;
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'description cannot be empty'
        });
      }
      account.description = encryptText(description.trim());
    }

    await account.save();

    res.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        _id: account._id,
        name: account.name,
        category: account.category,
        usernameOrEmail: account.usernameOrEmail,
        connectedEmail: account.connectedEmail,
        phoneNumber: account.phoneNumber,
        recoveryEmail: account.recoveryEmail,
        description: decryptText(account.description),
        updatedAt: account.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (
      req.user.role !== 'super-admin' &&
      account.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await account.deleteOne();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong'
    });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getSingleAccount,
  updateAccount,
  deleteAccount
};