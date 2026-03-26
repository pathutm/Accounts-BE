const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');
const Customer = require('./models/Customer');

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const customerId = 'C001';
    const customer = await Customer.findOne({ Customer_ID: customerId });
    if (!customer) {
      console.log('Customer not found');
      process.exit(1);
    }

    const invoices = await Invoice.find({ customer_id: customerId });
    console.log(`Found ${invoices.length} invoices for ${customerId}`);

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.payment.pending_amount, 0);
    
    // Calculate overdue metrics logic (similar to frontend/backend virtual)
    const today = new Date();
    const overdueInvoices = invoices.filter(inv => {
      return inv.payment.status !== 'PAID' && inv.due_date && today > inv.due_date;
    });
    
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.payment.pending_amount, 0);
    
    const totalOverdueDays = overdueInvoices.reduce((sum, inv) => {
      const diff = Math.ceil((today - inv.due_date) / (1000 * 60 * 60 * 24));
      return sum + diff;
    }, 0);
    
    const avgDelayDays = overdueInvoices.length > 0 ? Math.round(totalOverdueDays / overdueInvoices.length) : 0;

    console.log('--- DB SUMMARY ---');
    console.log('Total Invoices:', invoices.length);
    console.log('Total Outstanding:', totalOutstanding);
    console.log('Overdue Amount:', overdueAmount);
    console.log('Avg Delay Days:', avgDelayDays);
    
    console.log('\n--- INVOICE DETAILS ---');
    invoices.forEach(inv => {
      const diff = (inv.payment.status !== 'PAID' && inv.due_date && today > inv.due_date) 
        ? Math.ceil((today - inv.due_date) / (1000 * 60 * 60 * 24)) 
        : 0;
      console.log(`ID: ${inv.invoice_id}, Status: ${inv.payment.status}, Due: ${inv.due_date.toISOString().split('T')[0]}, Pending: ${inv.payment.pending_amount}, Overdue Days: ${diff}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
