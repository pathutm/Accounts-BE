const mongoose = require("mongoose");
const { Schema } = mongoose;

const ItemSchema = new Schema({
  item_id: { type: String, required: true },
  item_name: { type: String, required: true },
  hsn_code: { type: String },
  uom: { type: String },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  amount: {
    subtotal: { type: Number, required: true },
    gst_percent: { type: Number, required: true },
    tax_breakup: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 }
    },
    total: { type: Number, required: true }
  }
}, { _id: false });

const PaymentHistorySchema = new Schema({
  payment_id: { type: String },
  amount: { type: Number, required: true },
  payment_date: { type: Date, required: true },
  payment_mode: { type: String }
}, { _id: false });

const InvoiceSchema = new Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  invoice_id: { type: String, required: true, unique: true },
  customer_id: { type: String, required: true, index: true },
  invoice_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
  place_of_supply: { type: String, required: true },
  currency: { type: String, default: "INR" },
  items: { type: [ItemSchema], required: true },
  invoice_summary: {
    subtotal: { type: Number, required: true },
    tax_breakup: {
      total_cgst: { type: Number, default: 0 },
      total_sgst: { type: Number, default: 0 },
      total_igst: { type: Number, default: 0 }
    },
    grand_total: { type: Number, required: true }
  },
  payment: {
    status: {
      type: String,
      enum: ["PAID", "UNPAID", "PARTIALLY_PAID"],
      default: "UNPAID"
    },
    paid_amount: { type: Number, default: 0 },
    pending_amount: { type: Number, required: true },
    last_payment_date: { type: Date }
  },
  payment_history: [PaymentHistorySchema],
  derived_metrics: {
    // days_overdue is now a virtual field
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

InvoiceSchema.virtual('derived_metrics.days_overdue').get(function() {
  if (this.payment && this.payment.status === 'PAID') return 0;
  
  const today = new Date();
  if (this.due_date && today > this.due_date) {
    return Math.ceil((today - this.due_date) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

InvoiceSchema.pre("save", function (next) {
  this.payment.pending_amount = this.invoice_summary.grand_total - this.payment.paid_amount;
  
  if (this.payment.paid_amount === 0) {
    this.payment.status = "UNPAID";
  } else if (this.payment.paid_amount >= this.invoice_summary.grand_total) {
    this.payment.status = "PAID";
  } else {
    this.payment.status = "PARTIALLY_PAID";
  }

  const today = new Date();
  // No longer saving days_overdue to the database
  next();
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
