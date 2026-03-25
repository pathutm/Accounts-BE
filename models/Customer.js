const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  Customer_ID: { type: String, required: true, unique: true },
  Company_Name: String,
  Industry: String,
  Country: String,
  City: String,
  Customer_Since: String,
  Credit_Limit: Number,
  Credit_Score: Number,
  Risk_Category: String,
  Preferred_Contact: String,
  Account_Manager: String,
  Contract_Type: String,
  Currency: String,
  Tax_ID: String,
  Primary_Contact: String,
  Contact_Email: String
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
