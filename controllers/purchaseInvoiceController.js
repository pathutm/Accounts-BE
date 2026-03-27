const PurchaseInvoice = require('../models/PurchaseInvoice');

exports.getVendorInvoices = async (req, res) => {
  try {
    const { role, vendorId: loggedInVendorId, id: userId } = req.user;
    
    console.log(`Backend Invoice Fetch: Role=${role}, VendorId=${loggedInVendorId}, UserId=${userId}`);

    let query = {};
    if (role === 'vendor') {
      query.vendorId = loggedInVendorId;
    } else {
      // Admin or Organization
      query.organizationId = userId;
    }

    let invoices = await PurchaseInvoice.find(query).sort({ createdAt: -1 });
    
    // DEBUG: If empty, try a broader find to see what's in there
    if (invoices.length === 0) {
       console.log("No invoices found for specific query. Checking ALL invoices in collection...");
       const all = await PurchaseInvoice.find({}).limit(5);
       console.log(`TOTAL Docs in collection: ${await PurchaseInvoice.countDocuments({})}`);
       if (all.length > 0) {
          console.log("SAMPLES found in DB:", all.map(i => ({ v: i.vendorId, o: i.organizationId })));
       }
    }

    console.log(`Found ${invoices.length} invoices for query:`, query);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    // Auth check: Is this invoice for the logged-in vendor?
    if (req.user.role === 'vendor' && invoice.vendorId.toString() !== req.user.vendorId.toString()) {
       return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
