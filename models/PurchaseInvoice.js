const mongoose = require('mongoose');

const PurchaseInvoiceSchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  organizationId: { type: String, required: true },
  purchaseOrderId: { type: String },
  
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  status: { type: String, default: 'SUBMITTED' },
  
  billFrom: {
    name: String,
    address: String,
    gstin: String,
    contact: String
  },
  
  billTo: {
    name: String,
    address: String,
    gstin: String
  },
  
  subtotal: { type: Number, required: true },
  taxTotal: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      discountRate: Number,
      taxRate: Number,
      taxableValue: Number,
      total: Number
    }
  ],
  
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifsc: String
  },
  
  terms: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'purchase_invoice' });

module.exports = mongoose.models.PurchaseInvoice || mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema);
