const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection('purchase_invoice');
  const count = await collection.countDocuments({});
  console.log('COUNT:', count);
  
  const all = await collection.find({}).toArray();
  all.forEach((inv, i) => {
    console.log(`INV ${i}: V=${inv.vendorId}, O=${inv.organizationId}, #=${inv.invoiceNumber}, PO_ID=${inv.purchaseOrderId}`);
  });

  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  users.forEach((u, i) => {
    console.log(`USER ${i}: R=${u.role}, V=${u.vendorId}, O=${u.organizationId}, E=${u.email}`);
  });

  await mongoose.disconnect();
}

check();
