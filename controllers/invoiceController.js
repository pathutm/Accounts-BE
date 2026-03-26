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
