const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null if manual and not mapped yet
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  role: { type: String, required: true },
  shareType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  shareValue: { type: Number, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 }
}, { _id: false });

const incomeProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    client: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    totalAmount: { type: Number, required: true },
    date: { type: String, default: "" }, // Delivery Date
    status: { type: String, enum: ['Completed', 'In Progress', 'Pending'], default: 'In Progress' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contributors: [contributorSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncomeProject', incomeProjectSchema);
