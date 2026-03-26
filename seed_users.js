const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Move organization to User collection
    const orgs = await Organization.find();
    for (let org of orgs) {
      const existingUser = await User.findOne({ email: org.email });
      if (!existingUser) {
        const newUser = new User({
          name: org.name,
          email: org.email,
          password: org.password,
          role: 'organization',
          organizationId: org._id.toString()
        });
        await newUser.save();
        console.log(`Migrated Org: ${org.name}`);
      }
    }

    // 2. Create logins for each Vendor
    const vendors = await Vendor.find();
    for (let vendor of vendors) {
      const email = `${vendor.vendor_legal_name.toLowerCase().split(' ')[0]}@vendor.mysns.ai`;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('vendor123', 10);
        const newUser = new User({
          name: vendor.vendor_legal_name,
          email: email,
          password: hashedPassword,
          role: 'vendor',
          vendorId: vendor._id.toString(),
          organizationId: vendor.organizationId
        });
        await newUser.save();
        console.log(`Created Vendor User: ${vendor.vendor_legal_name} (${email})`);
      }
    }

    console.log('Vendor logins deployed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
