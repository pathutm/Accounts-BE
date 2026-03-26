const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  vendor_legal_name: {
    type: String,
    required: true,
    trim: true
  },
  business_trading_name: {
    type: String,
    trim: true
  },
  business_structure: {
    type: String,
    enum: ['Sole Proprietorship', 'Partnership', 'Private Limited Company', 'Public Limited Company', 'Other'],
    default: 'Other'
  },
  registration_number: String,
  year_established: Number,
  website: String,
  description: String,
  
  address: {
    headquarters: String,
    mailing: String,
    country: { type: String, default: 'India' },
    state: String,
    city: String,
    postal_code: String
  },
  
  primary_contact: {
    name: { type: String, required: true },
    job_title: String,
    email: { type: String, required: true },
    phone: String,
    mobile: String
  },
  
  secondary_contacts: {
    sales: String,
    technical: String
  },
  
  tax_info: {
    tin: String,
    gst_vat: String,
    pan_ein: String,
    certificate_url: String
  },
  
  bank_info: {
    bank_name: String,
    account_number: String,
    branch: String,
    swift_code: String,
    ifsc_code: String,
    preferred_payment_method: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Check', 'Cash', 'Other'],
      default: 'Bank Transfer'
    },
    currency: { type: String, default: 'INR' }
  },
  
  product_info: {
    category: {
      type: String,
      required: true // e.g., "Office Supplies", "IT Services"
    },
    description: String,
    catalog_url: String,
    pricing_model: String,
    moq: Number,
    lead_time: String,
    coverage_area: String
  },
  
  compliance: {
    business_license_url: String,
    insurance_certificate_url: String,
    certifications: [String],
    nda_url: String,
    compliance_declaration: String
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'],
    default: 'ACTIVE'
  },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

VendorSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Vendor', VendorSchema);
