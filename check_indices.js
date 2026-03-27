const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');

dotenv.config();

async function checkIndices() {
  await mongoose.connect(process.env.MONGO_URI);
  const indices = await Invoice.collection.indexes();
  console.log('Indices for Invoices collection:', JSON.stringify(indices, null, 2));
  mongoose.disconnect();
}

checkIndices();
