const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res) => {
  try {
    const organizationId = req.user.id; // From auth middleware
    const vendors = await Vendor.find({ organizationId }).sort({ vendor_legal_name: 1 });
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
