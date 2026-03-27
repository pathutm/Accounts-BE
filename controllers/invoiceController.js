const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
  try {
    const { customer_id } = req.query;
    const query = { organizationId: req.user.id };
    if (customer_id) query.customer_id = customer_id;
    
    const invoices = await Invoice.find(query);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    console.log('Creating invoice for user:', req.user.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const newInvoice = new Invoice({
      ...req.body,
      organizationId: req.user.id
    });
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error',
      details: error.errors ? Object.keys(error.errors).map(k => error.errors[k].message) : []
    });
  }
};
