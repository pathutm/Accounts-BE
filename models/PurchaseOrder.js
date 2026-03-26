const mongoose = require('mongoose');

const PurchaseOrderItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true }
});

const PurchaseOrderSchema = new mongoose.Schema({
  organizationId: {
    type: String, // Flexible to handle strings or objectId strings
    required: true
  },
  vendorId: {
    type: String, // Flexible to handle strings or objectId strings
    required: true
  },
  po_number: {
    type: String,
    required: true,
    unique: true
  },
  po_date: {
    type: Date,
    default: Date.now
  },
  delivery_date: Date,
  items: [PurchaseOrderItemSchema],
  grand_total: {
    type: Number,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID', 'SENT'],
    default: 'PENDING_APPROVAL'
  },
  webhook_response: {
    message: String,
    analysis_date: { type: Date, default: Date.now }
  },
}, {
  timestamps: true,
  collection: 'purchase_orders'
});

PurchaseOrderSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
