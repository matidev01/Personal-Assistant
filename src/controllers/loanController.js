const Loan = require('../models/Loan');
const User = require('../models/User');

// ─── Create Loan ─────────────────────────────────────────────────────────────
const createLoan = async (req, res) => {
  try {
    const {
      isManual, linkedUserId, personName, phoneNumber,
      loanType, amount, date, dueDate, description, paymentMethod
    } = req.body;

    let resolvedName = personName;
    let resolvedPhone = phoneNumber || '';
    let linkedUser = null;

    if (!isManual && linkedUserId) {
      const user = await User.findById(linkedUserId);
      if (user) {
        linkedUser = user._id;
        resolvedName = `${user.firstName} ${user.lastName}`;
        resolvedPhone = user.phoneNumber || resolvedPhone;
      }
    }

    const loan = await Loan.create({
      isManual: !!isManual,
      linkedUser,
      personName: resolvedName,
      phoneNumber: resolvedPhone,
      loanType,
      amount: Number(amount),
      remainingAmount: Number(amount),
      status: 'Pending',
      date,
      dueDate: dueDate || '',
      description: description || '',
      paymentMethod: paymentMethod || 'Cash',
      payments: [],
      comments: [],
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Loans ────────────────────────────────────────────────────────────
const getLoans = async (req, res) => {
  try {
    const { search, status, loanType, scope, page = 1, limit = 10 } = req.query;
    const isSuperAdmin = req.user.role === 'super-admin';
    const isGlobalView = isSuperAdmin && scope === 'all';

    // Build query
    const query = isGlobalView ? {} : { createdBy: req.user._id };
    if (status) query.status = status;
    if (loanType) query.loanType = loanType;
    if (search) {
      // Find matching users (either creators or linked users) based on search term (name/email)
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const matchingUserIds = matchingUsers.map(u => u._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { personName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { linkedUser: { $in: matchingUserIds } },
          { createdBy: { $in: matchingUserIds } }
        ]
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('linkedUser', 'firstName lastName email phoneNumber')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Stats always reflect the logged-in user's own loans only
    const allOwn = await Loan.find({ createdBy: req.user._id });
    const totalGiven    = allOwn.filter(l => l.loanType === 'given').reduce((s, l) => s + l.amount, 0);
    const totalTaken    = allOwn.filter(l => l.loanType === 'taken').reduce((s, l) => s + l.amount, 0);
    const totalPaid     = allOwn.filter(l => l.loanType === 'given').reduce((s, l) => s + (l.amount - l.remainingAmount), 0);
    const totalReceived = allOwn.filter(l => l.loanType === 'taken').reduce((s, l) => s + (l.amount - l.remainingAmount), 0);

    // Global stats for super admin all-view
    let globalStats = null;
    if (isGlobalView) {
      const allPlatform = await Loan.find({});
      globalStats = {
        totalLoans: allPlatform.length,
        totalGivenPlatform: allPlatform.filter(l => l.loanType === 'given').reduce((s, l) => s + l.amount, 0),
        totalTakenPlatform: allPlatform.filter(l => l.loanType === 'taken').reduce((s, l) => s + l.amount, 0),
        totalPending: allPlatform.filter(l => l.status === 'Pending').length,
        totalCompleted: allPlatform.filter(l => l.status === 'Completed').length,
      };
    }

    res.json({
      success: true,
      loans,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      isGlobalView,
      stats: { totalGiven, totalTaken, totalPaid, totalReceived },
      globalStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Loan ──────────────────────────────────────────────────────────
const getLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('linkedUser', 'firstName lastName email phoneNumber')
      .populate('comments.addedBy', 'firstName lastName');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Loan ──────────────────────────────────────────────────────────────
const updateLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const { personName, phoneNumber, loanType, amount, date, dueDate, returnedDate, description, paymentMethod, status } = req.body;

    if (personName) loan.personName = personName;
    if (phoneNumber !== undefined) loan.phoneNumber = phoneNumber;
    if (loanType) loan.loanType = loanType;
    if (amount !== undefined) {
      const paid = loan.amount - loan.remainingAmount;
      loan.amount = Number(amount);
      loan.remainingAmount = Math.max(0, Number(amount) - paid);
    }
    if (date) loan.date = date;
    if (dueDate !== undefined) loan.dueDate = dueDate;
    if (returnedDate !== undefined) loan.returnedDate = returnedDate;
    if (description !== undefined) loan.description = description;
    if (paymentMethod) loan.paymentMethod = paymentMethod;
    if (status) loan.status = status;

    await loan.save();
    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Loan ──────────────────────────────────────────────────────────────
const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    res.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Payment ──────────────────────────────────────────────────────────────
const addPayment = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const { amount, date, method, note } = req.body;
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    if (paymentAmount > loan.remainingAmount) {
      return res.status(400).json({ success: false, message: `Payment (Rs. ${paymentAmount}) exceeds remaining amount (Rs. ${loan.remainingAmount})` });
    }

    loan.payments.push({ amount: paymentAmount, date, method: method || 'Cash', note: note || '' });
    loan.remainingAmount = Math.max(0, loan.remainingAmount - paymentAmount);

    if (loan.remainingAmount === 0) {
      loan.status = 'Completed';
      if (!loan.returnedDate) loan.returnedDate = date;
    } else {
      loan.status = 'Partially Paid';
    }

    await loan.save();
    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Comment ──────────────────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    loan.comments.push({
      text: req.body.text,
      addedBy: req.user._id,
      addedByName: `${req.user.firstName} ${req.user.lastName}`
    });

    await loan.save();
    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createLoan, getLoans, getLoan, updateLoan, deleteLoan, addPayment, addComment };
