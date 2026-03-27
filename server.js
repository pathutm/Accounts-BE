const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const poRoutes = require('./routes/poRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const purchaseInvoiceRoutes = require('./routes/purchaseInvoiceRoutes');
const grnRoutes = require('./routes/grnRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/purchase-invoices', purchaseInvoiceRoutes);
app.use('/api/grns', grnRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Cashflow Optimization API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
