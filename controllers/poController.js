const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseInvoice = require('../models/PurchaseInvoice');
const GRN = require('../models/GRN');
const Vendor = require('../models/Vendor');

exports.createPO = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const {
      vendorId,
      po_number,
      po_date,
      delivery_date,
      items,
      grand_total,
      notes,
      webhook_message
    } = req.body;

    const po = new PurchaseOrder({
      organizationId,
      vendorId,
      po_number,
      po_date: po_date || undefined,
      delivery_date: delivery_date || undefined,
      items,
      grand_total,
      notes,
      webhook_response: {
        message: webhook_message
      }
    });

    await po.save();
    res.status(201).json(po);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'PO number already exists' });
    }
    console.error('Error creating PO:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPOs = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const { role, vendorId: loggedInVendorId } = req.user;

    console.log(`Fetching POs for OrgId: ${organizationId}, Role: ${role}`);

    // Base Filter: All organization's POs
    const orgFilter = {
      $or: [
        { organizationId: organizationId },
        { organizationId: organizationId.toString() }
      ]
    };

    // Define final query
    let query;
    if (role === 'vendor' && loggedInVendorId) {
      // Vendors only see POs assigned to them
      query = { $and: [orgFilter, { vendorId: loggedInVendorId }] };
    } else {
      // Organization/Admin sees all
      query = orgFilter;
    }

    const pos = await PurchaseOrder.find(query).sort({ created_at: -1 }).lean();

    // Manually populate vendor details
    const Vendor = require('../models/Vendor');
    const enrichedPOs = await Promise.all(pos.map(async (po) => {
      const vendorData = await Vendor.findById(po.vendorId).select('vendor_legal_name product_info.category').lean();
      return {
        ...po,
        vendorId: vendorData || { vendor_legal_name: 'Unknown Vendor', product_info: { category: 'N/A' } }
      };
    }));

    res.json(enrichedPOs);
  } catch (err) {
    console.error('Error fetching POs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPOById = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const { role, vendorId: loggedInVendorId } = req.user;
    const { id } = req.params;

    let baseQuery = {
      _id: id,
      $or: [
        { organizationId: organizationId },
        { organizationId: organizationId.toString() }
      ]
    };

    // If vendor, they can only see their own PO
    if (role === 'vendor' && loggedInVendorId) {
      baseQuery.vendorId = loggedInVendorId;
    }

    const po = await PurchaseOrder.findOne(baseQuery).lean();

    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // Manually populate vendor details
    const Vendor = require('../models/Vendor');
    const vendorData = await Vendor.findById(po.vendorId).lean();

    res.json({
      ...po,
      vendorId: vendorData || { vendor_legal_name: 'Unknown Vendor', product_info: { category: 'N/A' } }
    });
  } catch (err) {
    console.error('Error fetching PO by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMatchData = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Purchase Order
    const po = await PurchaseOrder.findById(id).lean();
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    // 2. Fetch all Invoices linked to this PO
    // Handle both ObjectId and String formats due to potential raw database insertions
    const invoices = await PurchaseInvoice.find({ 
      $or: [
        { purchaseOrderId: id },
        { purchaseOrderId: new mongoose.Types.ObjectId(id) }
      ]
    }).lean();

    // 3. Fetch all GRNs linked to this PO
    const grns = await GRN.find({ 
      $or: [
        { purchaseOrderId: id },
        { purchaseOrderId: new mongoose.Types.ObjectId(id) },
        { poNumber: po.po_number } // Extra layer of redundancy if ID is missing but number exists
      ]
    }).lean();

    // 4. Enrich with Vendor Info
    const vendorData = await Vendor.findById(po.vendorId).lean();

    res.json({
      purchase_order: {
        ...po,
        vendor: vendorData || { vendor_legal_name: 'Unknown Vendor' }
      },
      purchase_invoices: invoices,
      grns: grns
    });
  } catch (err) {
    console.error('Error fetching match data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
