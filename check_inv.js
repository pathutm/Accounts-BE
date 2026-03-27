const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const invoices = await Invoice.find({});
  console.log('Total Invoices in DB:', invoices.length);
  invoices.forEach(inv => {
    console.log(`Invoice ID: ${inv.invoice_id}, Customer ID: ${inv.customer_id}, Org ID: ${inv.organizationId}`);
  });
  mongoose.disconnect();
}

check();
