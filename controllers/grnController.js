const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.createFromWebhook = async (req, res) => {
  try {
    console.log('GRN WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));
    let grnData = req.body;

    // Handle n8n-style payload: { items: [ { json: { ... } } ] }
    if (grnData.items && Array.isArray(grnData.items) && grnData.items[0]?.json) {
      grnData = grnData.items[0].json;
    }

    const {
      grnNumber,
      purchaseOrderId,
      poNumber,
      vendorName,
      receivedDate,
      notes,
      personResponsible,
      receivedPlaceAddress,
      items,
      organizationId,
      status,
      matchStatus
    } = grnData;

    // 1. Store the GRN
    const newGRN = new GRN({
      grnNumber,
      purchaseOrderId,
      poNumber,
      vendorName,
      receivedDate,
      notes,
      personResponsible,
      receivedPlaceAddress,
      items,
      organizationId,
      status: status || 'RECEIVED',
      matchStatus: matchStatus || 'PENDING'
    });

    await newGRN.save();

    // 2. Update the Purchase Order status
    await PurchaseOrder.findByIdAndUpdate(purchaseOrderId, {
      status: 'RECEIVED'
    });

    res.status(201).json({
      success: true,
      message: 'GRN stored and PO status updated to RECEIVED',
      grn: newGRN
    });
  } catch (error) {
    console.error('GRN Storage/Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process GRN',
      error: error.message
    });
  }
};

exports.getGRNs = async (req, res) => {
  try {
    const grns = await GRN.find({}).sort({ _id: -1 });
    console.log(`FETCHED ${grns.length} GRNs FROM 'grn' COLLECTION`);
    res.json(grns);
  } catch (error) {
    console.error('Fetch GRNs Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
