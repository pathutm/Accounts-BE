const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  category: {
    type: String,
    required: true // e.g., "IT Hardware", "Cloud Services", "Office Supplies"
  },
  fiscal_year: {
    type: String,
    required: true // e.g., "2025-26"
  },
  total_budget: {
    type: Number,
    required: true,
    min: 0
  },
  spent_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  allocated_amount: {
    type: Number,
    default: 0, // Amount committed in approved POs but not yet fully settled
    min: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXHAUSTED', 'CLOSED'],
    default: 'ACTIVE'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Virtual for remaining budget
BudgetSchema.virtual('remaining_budget').get(function() {
  return this.total_budget - this.spent_amount - this.allocated_amount;
});

BudgetSchema.set('toJSON', { virtuals: true });
BudgetSchema.set('toObject', { virtuals: true });

BudgetSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  if (this.spent_amount >= this.total_budget) {
    this.status = 'EXHAUSTED';
  }
  next();
});

module.exports = mongoose.model('Budget', BudgetSchema);
