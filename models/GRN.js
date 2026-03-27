const mongoose = require('mongoose');

const GRNItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  orderedQuantity: { type: Number, required: true },
  receivedQuantity: { type: Number, required: true }
});

const GRNSchema = new mongoose.Schema({
  grnNumber: { type: String, required: true, unique: true },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  poNumber: { type: String, required: true },
  vendorName: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  notes: String,
  personResponsible: { type: String, required: true },
  receivedPlaceAddress: { type: String, required: true },
  items: [GRNItemSchema],
  submittedAt: { type: Date, default: Date.now },
  organizationId: { type: String, required: true },
  status: { type: String, default: 'RECEIVED' },
  matchStatus: { type: String, default: 'PENDING' }
}, { 
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'grn'
});

module.exports = mongoose.model('GRN', GRNSchema);
