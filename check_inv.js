const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const inv = await Invoice.findOne({ invoice_id: 'INV001' });
  console.log('--- INV001 Verification ---');
  console.log('Due Date:', inv.due_date);
  console.log('Paid Amount:', inv.payment.paid_amount);
  console.log('Pending Amount:', inv.payment.pending_amount);
  console.log('Status:', inv.payment.status);
  console.log('Days Overdue:', inv.derived_metrics.days_overdue);
  
  const today = new Date();
  const diff = Math.ceil((today - inv.due_date) / (1000 * 60 * 60 * 24));
  console.log('Calculated (Real-time):', diff);
  
  process.exit(0);
};

check();
