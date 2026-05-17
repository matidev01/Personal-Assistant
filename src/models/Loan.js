const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  method: { type: String, enum: ['Cash', 'Bank', 'JazzCash', 'EasyPaisa', 'Other'], default: 'Cash' },
  note: { type: String, default: '' }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedByName: { type: String }
}, { timestamps: true });

const loanSchema = new mongoose.Schema({
  // Person info
  isManual: { type: Boolean, default: false },
  linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  personName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, default: '' },

  // Loan details
  loanType: { type: String, enum: ['given', 'taken'], required: true },
  amount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Partially Paid', 'Completed'], default: 'Pending' },

  // Dates
  date: { type: String, required: true },
  dueDate: { type: String, default: '' },
  returnedDate: { type: String, default: '' },

  // Payment info
  paymentMethod: { type: String, enum: ['Cash', 'Bank', 'JazzCash', 'EasyPaisa', 'Other'], default: 'Cash' },

  // Description & history
  description: { type: String, default: '' },
  payments: [paymentSchema],
  comments: [commentSchema],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
