const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import Modular Models
const Organization = require('./models/Organization');
const Category = require('./models/Category');
const Customer = require('./models/Customer');
const Invoice = require('./models/Invoice');

dotenv.config();

const categoriesData = [
  {
    "type": "REGULAR",
    "label": "Regular (On-Time)",
    "behavior": "Always pays",
    "risk": "LOW",
    "strategy": { "title": "Early Payment Incentive", "action": "Offer 1–2% discount if paid early" },
    "outcome": { "best_case": "Faster cash inflow", "worst_case": "No need to escalate" }
  },
  {
    "type": "SLIGHT_DELAY",
    "label": "Slight Delay",
    "behavior": "3–5 days late",
    "risk": "MEDIUM_LOW",
    "strategy": { "title": "Auto Payment Setup", "action": "Enable mandate / UPI AutoPay" },
    "outcome": { "best_case": "Eliminates delay pattern", "worst_case": "Apply late fee after threshold" }
  },
  {
    "type": "CHRONIC_LATE",
    "label": "Chronic Late",
    "behavior": "10–15 days delay",
    "risk": "MEDIUM",
    "strategy": { "title": "Credit Limit Tightening", "action": "Block new orders if overdue" },
    "outcome": { "best_case": "Forces timely payment", "worst_case": "Stop new sales until cleared" }
  },
  {
    "type": "NEW_CUSTOMER",
    "label": "New Customer",
    "behavior": "No history",
    "risk": "UNKNOWN",
    "strategy": { "title": "Advance Payment", "action": "Collect 30–50% upfront" },
    "outcome": { "best_case": "Reduces risk", "worst_case": "Move to full advance model" }
  },
  {
    "type": "HIGH_VALUE_ENTERPRISE",
    "label": "High-Value Enterprise",
    "behavior": "Large invoices",
    "risk": "MEDIUM",
    "strategy": { "title": "Invoice Approval Mapping", "action": "Align with internal approvers" },
    "outcome": { "best_case": "Faster approvals internally", "worst_case": "Escalate to senior finance chain" }
  },
  {
    "type": "DISPUTE_PRONE",
    "label": "Dispute-Prone",
    "behavior": "Frequent issues",
    "risk": "HIGH",
    "strategy": { "title": "Pre-Approved Invoice System", "action": "Client validates before billing" },
    "outcome": { "best_case": "Avoid disputes and faster payment", "worst_case": "Pause billing until agreement" }
  },
  {
    "type": "CASH_STRUGGLING",
    "label": "Cash-Struggling",
    "behavior": "Irregular payments",
    "risk": "HIGH",
    "strategy": { "title": "Structured Payment Plan", "action": "Provide EMI-style repayment" },
    "outcome": { "best_case": "Gradual recovery", "worst_case": "Legal recovery or write-off" }
  },
  {
    "type": "RELATIONSHIP_BASED",
    "label": "Relationship-Based",
    "behavior": "Pays on relationship",
    "risk": "MEDIUM",
    "strategy": { "title": "Executive Intervention", "action": "Senior-level follow-up call" },
    "outcome": { "best_case": "Payment released quickly", "worst_case": "Relationship pressure escalation" }
  },
  {
    "type": "HIGH_RISK_DEFAULT",
    "label": "High-Risk / Default",
    "behavior": "30+ days delay",
    "risk": "VERY_HIGH",
    "strategy": { "title": "Service Restriction", "action": "Suspend service until payment" },
    "outcome": { "best_case": "Immediate attention", "worst_case": "Legal notice or collections agency" }
  },
  {
    "type": "SEASONAL",
    "label": "Seasonal Business",
    "behavior": "Pays in cycles",
    "risk": "MEDIUM",
    "strategy": { "title": "Align Billing with Revenue Cycle", "action": "Match billing to cash inflow cycle" },
    "outcome": { "best_case": "Better payment timing", "worst_case": "Strict cycle enforcement" }
  }
];

const customersData = [
  { "Customer_ID": "C001", "Company_Name": "Shree Ceramics Pvt Ltd", "Industry": "Manufacturing", "Country": "India", "City": "Morbi", "Customer_Since": "2019-02-14", "Credit_Limit": 1500000, "Credit_Score": 82, "Risk_Category": "LOW", "Preferred_Contact": "Phone", "Account_Manager": "Sandeep Mehta", "Contract_Type": "Annual", "Currency": "INR", "Tax_ID": "24AAACS1234A1Z1", "Primary_Contact": "Rajesh Varma", "Contact_Email": "rajesh@shreeceramics.in" },
  { "Customer_ID": "C002", "Company_Name": "Blue Water Logistix", "Industry": "Logistics", "Country": "India", "City": "Chennai", "Customer_Since": "2021-05-20", "Credit_Limit": 500000, "Credit_Score": 75, "Risk_Category": "MEDIUM", "Preferred_Contact": "Email", "Account_Manager": "Priya Nair", "Contract_Type": "Monthly", "Currency": "INR", "Tax_ID": "33AABCL5678B1Z2", "Primary_Contact": "Karthik Raja", "Contact_Email": "karthik@bluewater.co" },
  { "Customer_ID": "C003", "Company_Name": "Apex Software Hub", "Industry": "Technology", "Country": "India", "City": "Hyderabad", "Customer_Since": "2020-11-10", "Credit_Limit": 2000000, "Credit_Score": 90, "Risk_Category": "LOW", "Preferred_Contact": "Email", "Account_Manager": "Anjali Rao", "Contract_Type": "Enterprise", "Currency": "INR", "Tax_ID": "36AAACH9012C1Z3", "Primary_Contact": "Srinivas Goud", "Contact_Email": "srinivas@apexhub.io" },
  { "Customer_ID": "C004", "Company_Name": "Green Valley Agro", "Industry": "Agriculture", "Country": "India", "City": "Nashik", "Customer_Since": "2018-07-25", "Credit_Limit": 300000, "Credit_Score": 62, "Risk_Category": "HIGH", "Preferred_Contact": "Phone", "Account_Manager": "Vikram Patil", "Contract_Type": "Seasonal", "Currency": "INR", "Tax_ID": "27AAACG3456D1Z4", "Primary_Contact": "Sanjay Deshmukh", "Contact_Email": "sanjay@gvagro.com" },
  { "Customer_ID": "C005", "Company_Name": "Modern Retail Point", "Industry": "Retail", "Country": "India", "City": "Delhi", "Customer_Since": "2022-03-15", "Credit_Limit": 100000, "Credit_Score": 45, "Risk_Category": "VERY_HIGH", "Preferred_Contact": "WhatsApp", "Account_Manager": "Rohit Khanna", "Contract_Type": "Pay-as-you-go", "Currency": "INR", "Tax_ID": "07AAACR7890E1Z5", "Primary_Contact": "Praveen Gupta", "Contact_Email": "praveen@modernretail.in" },
  { "Customer_ID": "C006", "Company_Name": "BuildFast Infra", "Industry": "Construction", "Country": "India", "City": "Bangalore", "Customer_Since": "2017-09-12", "Credit_Limit": 4500000, "Credit_Score": 88, "Risk_Category": "MEDIUM_LOW", "Preferred_Contact": "Email", "Account_Manager": "Deepak Hegde", "Contract_Type": "Project-based", "Currency": "INR", "Tax_ID": "29AAACB1234F1Z6", "Primary_Contact": "Shiva Kumar", "Contact_Email": "shiva@buildfast.com" },
  { "Customer_ID": "C007", "Company_Name": "Sunrise Textiles", "Industry": "Textiles", "Country": "India", "City": "Surat", "Customer_Since": "2015-12-05", "Credit_Limit": 1200000, "Credit_Score": 79, "Risk_Category": "LOW", "Preferred_Contact": "Phone", "Account_Manager": "Meera Patel", "Contract_Type": "Annual", "Currency": "INR", "Tax_ID": "24AAACT5678G1Z7", "Primary_Contact": "Bhavesh Bhai", "Contact_Email": "bhavesh@sunrisetextiles.in" },
  { "Customer_ID": "C008", "Company_Name": "HealthWise MedStore", "Industry": "Healthcare", "Country": "India", "City": "Kochi", "Customer_Since": "2023-01-20", "Credit_Limit": 200000, "Credit_Score": 55, "Risk_Category": "MEDIUM", "Preferred_Contact": "In-Person", "Account_Manager": "Thomas Kurian", "Contract_Type": "Standard", "Currency": "INR", "Tax_ID": "32AAACH9012H1Z8", "Primary_Contact": "Mini Joseph", "Contact_Email": "mini@healthwise.co.in" },
  { "Customer_ID": "C009", "Company_Name": "Oceanic Maritech", "Industry": "Marine", "Country": "India", "City": "Visakhapatnam", "Customer_Since": "2016-04-01", "Credit_Limit": 800000, "Credit_Score": 72, "Risk_Category": "MEDIUM", "Preferred_Contact": "Email", "Account_Manager": "Venkatesh Babu", "Contract_Type": "Annual", "Currency": "INR", "Tax_ID": "37AAAC O3456I1Z9", "Primary_Contact": "Girish Naidu", "Contact_Email": "girish@oceanic.in" },
  { "Customer_ID": "C010", "Company_Name": "Swift Delivery Sol", "Industry": "Services", "Country": "India", "City": "Jaipur", "Customer_Since": "2020-08-30", "Credit_Limit": 150000, "Credit_Score": 38, "Risk_Category": "HIGH", "Preferred_Contact": "Phone", "Account_Manager": "Arjun Sharma", "Contract_Type": "Pay-as-you-go", "Currency": "INR", "Tax_ID": "08AAACS7890J1Z0", "Primary_Contact": "Mukesh Saini", "Contact_Email": "mukesh@swiftdeliver.in" }
];

const sampleInvoices = [
  {"invoice_id":"INV001","customer_id":"C001","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":100000,"tax_breakup":{"total_cgst":9000,"total_sgst":9000,"total_igst":0},"grand_total":118000},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":118000},"derived_metrics":{"days_overdue":20}},
  {"invoice_id":"INV002","customer_id":"C001","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":80000,"tax_breakup":{"total_cgst":7200,"total_sgst":7200,"total_igst":0},"grand_total":94400},"payment":{"status":"PARTIALLY_PAID","paid_amount":40000,"pending_amount":54400},"derived_metrics":{"days_overdue":10}},
  {"invoice_id":"INV003","customer_id":"C001","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":90000,"tax_breakup":{"total_cgst":8100,"total_sgst":8100,"total_igst":0},"grand_total":106200},"payment":{"status":"PAID","paid_amount":106200,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV004","customer_id":"C001","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":110000,"tax_breakup":{"total_cgst":9900,"total_sgst":9900,"total_igst":0},"grand_total":129800},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":129800},"derived_metrics":{"days_overdue":5}},
  {"invoice_id":"INV005","customer_id":"C002","invoice_date":"2026-01-05","due_date":"2026-02-05","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":70000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":12600},"grand_total":82600},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":82600},"derived_metrics":{"days_overdue":25}},
  {"invoice_id":"INV006","customer_id":"C002","invoice_date":"2026-02-05","due_date":"2026-03-05","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":85000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":15300},"grand_total":100300},"payment":{"status":"PARTIALLY_PAID","paid_amount":30000,"pending_amount":70300},"derived_metrics":{"days_overdue":15}},
  {"invoice_id":"INV007","customer_id":"C002","invoice_date":"2026-03-05","due_date":"2026-04-05","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":75000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":13500},"grand_total":88500},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":88500},"derived_metrics":{"days_overdue":5}},
  {"invoice_id":"INV008","customer_id":"C002","invoice_date":"2026-03-15","due_date":"2026-05-05","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":95000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":17100},"grand_total":112100},"payment":{"status":"PARTIALLY_PAID","paid_amount":50000,"pending_amount":62100},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV009","customer_id":"C003","invoice_date":"2026-01-10","due_date":"2026-02-10","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":10000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":10000},"payment":{"status":"PAID","paid_amount":10000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV010","customer_id":"C003","invoice_date":"2026-02-10","due_date":"2026-03-10","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":12000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":12000},"payment":{"status":"PAID","paid_amount":12000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV011","customer_id":"C003","invoice_date":"2026-03-10","due_date":"2026-04-10","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":14000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":14000},"payment":{"status":"PAID","paid_amount":14000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV012","customer_id":"C003","invoice_date":"2026-03-15","due_date":"2026-05-10","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":11000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":11000},"payment":{"status":"PAID","paid_amount":11000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV013","customer_id":"C004","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":90000,"tax_breakup":{"total_cgst":8100,"total_sgst":8100,"total_igst":0},"grand_total":106200},"payment":{"status":"PARTIALLY_PAID","paid_amount":50000,"pending_amount":56200},"derived_metrics":{"days_overdue":18}},
  {"invoice_id":"INV014","customer_id":"C004","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":95000,"tax_breakup":{"total_cgst":8550,"total_sgst":8550,"total_igst":0},"grand_total":112100},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":112100},"derived_metrics":{"days_overdue":20}},
  {"invoice_id":"INV015","customer_id":"C004","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":100000,"tax_breakup":{"total_cgst":9000,"total_sgst":9000,"total_igst":0},"grand_total":118000},"payment":{"status":"PARTIALLY_PAID","paid_amount":60000,"pending_amount":58000},"derived_metrics":{"days_overdue":8}},
  {"invoice_id":"INV016","customer_id":"C004","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":105000,"tax_breakup":{"total_cgst":9450,"total_sgst":9450,"total_igst":0},"grand_total":123900},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":123900},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV017","customer_id":"C005","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":150000,"tax_breakup":{"total_cgst":13500,"total_sgst":13500,"total_igst":0},"grand_total":177000},"payment":{"status":"PAID","paid_amount":177000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV018","customer_id":"C005","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":140000,"tax_breakup":{"total_cgst":12600,"total_sgst":12600,"total_igst":0},"grand_total":165200},"payment":{"status":"PAID","paid_amount":165200,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV019","customer_id":"C005","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":130000,"tax_breakup":{"total_cgst":11700,"total_sgst":11700,"total_igst":0},"grand_total":153400},"payment":{"status":"PAID","paid_amount":153400,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV020","customer_id":"C005","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":160000,"tax_breakup":{"total_cgst":14400,"total_sgst":14400,"total_igst":0},"grand_total":188800},"payment":{"status":"PAID","paid_amount":188800,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV021","customer_id":"C006","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":80000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":14400},"grand_total":94400},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":94400},"derived_metrics":{"days_overdue":30}},
  {"invoice_id":"INV022","customer_id":"C006","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":90000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":16200},"grand_total":106200},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":106200},"derived_metrics":{"days_overdue":25}},
  {"invoice_id":"INV023","customer_id":"C006","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":85000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":15300},"grand_total":100300},"payment":{"status":"PARTIALLY_PAID","paid_amount":20000,"pending_amount":80300},"derived_metrics":{"days_overdue":15}},
  {"invoice_id":"INV024","customer_id":"C006","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":95000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":17100},"grand_total":112100},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":112100},"derived_metrics":{"days_overdue":5}},
  {"invoice_id":"INV025","customer_id":"C007","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":70000,"tax_breakup":{"total_cgst":6300,"total_sgst":6300,"total_igst":0},"grand_total":82600},"payment":{"status":"PARTIALLY_PAID","paid_amount":30000,"pending_amount":52600},"derived_metrics":{"days_overdue":10}},
  {"invoice_id":"INV026","customer_id":"C007","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":75000,"tax_breakup":{"total_cgst":6750,"total_sgst":6750,"total_igst":0},"grand_total":88500},"payment":{"status":"PAID","paid_amount":88500,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV027","customer_id":"C007","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":80000,"tax_breakup":{"total_cgst":7200,"total_sgst":7200,"total_igst":0},"grand_total":94400},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":94400},"derived_metrics":{"days_overdue":8}},
  {"invoice_id":"INV028","customer_id":"C007","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":82000,"tax_breakup":{"total_cgst":7380,"total_sgst":7380,"total_igst":0},"grand_total":96760},"payment":{"status":"PARTIALLY_PAID","paid_amount":40000,"pending_amount":56760},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV029","customer_id":"C008","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":60000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":10800},"grand_total":70800},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":70800},"derived_metrics":{"days_overdue":22}},
  {"invoice_id":"INV030","customer_id":"C008","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":65000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":11700},"grand_total":76700},"payment":{"status":"PARTIALLY_PAID","paid_amount":20000,"pending_amount":56700},"derived_metrics":{"days_overdue":15}},
  {"invoice_id":"INV031","customer_id":"C008","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":70000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":12600},"grand_total":82600},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":82600},"derived_metrics":{"days_overdue":8}},
  {"invoice_id":"INV032","customer_id":"C008","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Karnataka","currency":"INR","invoice_summary":{"subtotal":72000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":12960},"grand_total":84960},"payment":{"status":"PARTIALLY_PAID","paid_amount":30000,"pending_amount":54960},"derived_metrics":{"days_overdue":2}},
  {"invoice_id":"INV033","customer_id":"C009","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":20000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":20000},"payment":{"status":"PAID","paid_amount":20000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV034","customer_id":"C009","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":18000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":18000},"payment":{"status":"PAID","paid_amount":18000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV035","customer_id":"C009","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":22000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":22000},"payment":{"status":"PAID","paid_amount":22000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV036","customer_id":"C009","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"UK","currency":"GBP","invoice_summary":{"subtotal":21000,"tax_breakup":{"total_cgst":0,"total_sgst":0,"total_igst":0},"grand_total":21000},"payment":{"status":"PAID","paid_amount":21000,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV037","customer_id":"C010","invoice_date":"2026-01-01","due_date":"2026-01-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":50000,"tax_breakup":{"total_cgst":4500,"total_sgst":4500,"total_igst":0},"grand_total":59000},"payment":{"status":"PARTIALLY_PAID","paid_amount":20000,"pending_amount":39000},"derived_metrics":{"days_overdue":12}},
  {"invoice_id":"INV038","customer_id":"C010","invoice_date":"2026-02-01","due_date":"2026-02-28","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":55000,"tax_breakup":{"total_cgst":4950,"total_sgst":4950,"total_igst":0},"grand_total":64900},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":64900},"derived_metrics":{"days_overdue":10}},
  {"invoice_id":"INV039","customer_id":"C010","invoice_date":"2026-03-01","due_date":"2026-03-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":60000,"tax_breakup":{"total_cgst":5400,"total_sgst":5400,"total_igst":0},"grand_total":70800},"payment":{"status":"PAID","paid_amount":70800,"pending_amount":0},"derived_metrics":{"days_overdue":0}},
  {"invoice_id":"INV040","customer_id":"C010","invoice_date":"2026-03-15","due_date":"2026-04-30","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":65000,"tax_breakup":{"total_cgst":5850,"total_sgst":5850,"total_igst":0},"grand_total":76700},"payment":{"status":"PARTIALLY_PAID","paid_amount":30000,"pending_amount":46700}},
  {"invoice_id":"INV041","customer_id":"C001","invoice_date":"2025-12-01","due_date":"2025-12-31","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":42372.88,"tax_breakup":{"total_cgst":3813.56,"total_sgst":3813.56,"total_igst":0},"grand_total":50000},"payment":{"status":"PAID","paid_amount":50000,"pending_amount":0}},
  {"invoice_id":"INV042","customer_id":"C001","invoice_date":"2025-12-05","due_date":"2026-01-04","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":63559.32,"tax_breakup":{"total_cgst":5720.34,"total_sgst":5720.34,"total_igst":0},"grand_total":75000},"payment":{"status":"PAID","paid_amount":75000,"pending_amount":0}},
  {"invoice_id":"INV043","customer_id":"C001","invoice_date":"2025-12-10","due_date":"2026-01-09","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":50847.46,"tax_breakup":{"total_cgst":4576.27,"total_sgst":4576.27,"total_igst":0},"grand_total":60000},"payment":{"status":"PAID","paid_amount":60000,"pending_amount":0}},
  {"invoice_id":"INV044","customer_id":"C001","invoice_date":"2025-12-15","due_date":"2026-01-14","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":76271.19,"tax_breakup":{"total_cgst":6864.41,"total_sgst":6864.41,"total_igst":0},"grand_total":90000},"payment":{"status":"PARTIALLY_PAID","paid_amount":40000,"pending_amount":50000}},
  {"invoice_id":"INV045","customer_id":"C001","invoice_date":"2025-12-20","due_date":"2026-01-19","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":101694.92,"tax_breakup":{"total_cgst":9152.54,"total_sgst":9152.54,"total_igst":0},"grand_total":120000},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":120000}},
  {"invoice_id":"INV046","customer_id":"C001","invoice_date":"2025-12-27","due_date":"2026-01-26","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":38135.59,"tax_breakup":{"total_cgst":3432.2,"total_sgst":3432.2,"total_igst":0},"grand_total":45000},"payment":{"status":"PAID","paid_amount":45000,"pending_amount":0}},
  {"invoice_id":"INV047","customer_id":"C001","invoice_date":"2026-01-05","due_date":"2026-02-04","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":25423.73,"tax_breakup":{"total_cgst":2288.14,"total_sgst":2288.14,"total_igst":0},"grand_total":30000},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":30000}},
  {"invoice_id":"INV048","customer_id":"C001","invoice_date":"2026-01-12","due_date":"2026-02-11","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":93220.34,"tax_breakup":{"total_cgst":8389.83,"total_sgst":8389.83,"total_igst":0},"grand_total":110000},"payment":{"status":"PARTIALLY_PAID","paid_amount":50000,"pending_amount":60000}},
  {"invoice_id":"INV049","customer_id":"C001","invoice_date":"2026-01-20","due_date":"2026-02-19","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":72033.9,"tax_breakup":{"total_cgst":6483.05,"total_sgst":6483.05,"total_igst":0},"grand_total":85000},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":85000}},
  {"invoice_id":"INV050","customer_id":"C001","invoice_date":"2026-01-25","due_date":"2026-02-24","place_of_supply":"Tamil Nadu","currency":"INR","invoice_summary":{"subtotal":80508.47,"tax_breakup":{"total_cgst":7245.76,"total_sgst":7245.76,"total_igst":0},"grand_total":95000},"payment":{"status":"UNPAID","paid_amount":0,"pending_amount":95000}}
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Successfully');

    // 1. Seed Organization
    const email = 'admin@gmail.com';
    const password = 'Admin@123';
    let existingOrg = await Organization.findOne({ email });
    let orgId;

    if (!existingOrg) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingOrg = new Organization({ name: 'Main Organization', email, password: hashedPassword });
      const savedOrg = await existingOrg.save();
      orgId = savedOrg._id;
    } else {
      orgId = existingOrg._id;
    }

    // 2. Seed Categories
    await Category.deleteMany({});
    await Category.insertMany(categoriesData);
    console.log('Categories seeded successfully');

    // 3. Seed Customers
    await Customer.deleteMany({});
    const customersWithOrg = customersData.map(c => ({ ...c, organizationId: orgId }));
    const savedCustomers = await Customer.insertMany(customersWithOrg);
    console.log('Customers seeded successfully');

    // 4. Seed Invoices (User Defined)
    await Invoice.deleteMany({});
    
    const invoicesToSeed = sampleInvoices.map(inv => {
      // Helper to generate items that match the user's summary
      const items = [{
        item_id: `ITM-DUMMY-${inv.invoice_id}`,
        item_name: "Technical Services",
        hsn_code: "9983",
        uom: "Units",
        quantity: 1,
        unit_price: inv.invoice_summary.subtotal,
        amount: {
          subtotal: inv.invoice_summary.subtotal,
          gst_percent: inv.currency === "INR" ? 18 : 0,
          tax_breakup: {
            cgst: inv.invoice_summary.tax_breakup.total_cgst,
            sgst: inv.invoice_summary.tax_breakup.total_sgst,
            igst: inv.invoice_summary.tax_breakup.total_igst
          },
          total: inv.invoice_summary.grand_total
        }
      }];

      // Dynamic calculation for seed (since insertMany bypasses hooks)
      const grandTotal = inv.invoice_summary.grand_total;
      const paidAmount = inv.payment.paid_amount;
      const pendingAmount = grandTotal - paidAmount;
      
      let status = "UNPAID";
      if (paidAmount >= grandTotal) status = "PAID";
      else if (paidAmount > 0) status = "PARTIALLY_PAID";

      const dueDate = new Date(inv.due_date);
      const today = new Date();
      let daysOverdue = 0;
      if (status !== "PAID" && today > dueDate) {
        daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      }

      return {
        ...inv,
        organizationId: orgId,
        items,
        payment: {
          ...inv.payment,
          status,
          pending_amount: pendingAmount
        },
        derived_metrics: {
          days_overdue: daysOverdue
        },
        payment_history: paidAmount > 0 ? [{
          payment_id: `PAY-${inv.invoice_id}`,
          amount: paidAmount,
          payment_date: new Date(new Date(inv.invoice_date).getTime() + 7 * 24 * 60 * 60 * 1000),
          payment_mode: "Bank Transfer"
        }] : []
      };
    });

    await Invoice.insertMany(invoicesToSeed);
    console.log(`${invoicesToSeed.length} Invoices seeded successfully based on sample data`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
