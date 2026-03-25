const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ organizationId: req.user.id });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
