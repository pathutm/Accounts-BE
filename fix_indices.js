const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function fixIndices() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await mongoose.connection.db.collection('invoices').dropIndex('invoice_id_1');
    console.log('Successfully dropped old unique invoice_id index');
  } catch (e) {
    if (e.codeName === 'IndexNotFound') {
      console.log('Index invoice_id_1 already removed');
    } else {
      console.error('Error dropping index:', e.message);
    }
  }
  mongoose.disconnect();
}

fixIndices();
