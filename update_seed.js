const fs = require('fs');

let content = fs.readFileSync('e:/Accounts/Accounts-BE/seed.js', 'utf8');

// Remove Years_as_Customer
content = content.replace(/, "Years_as_Customer": \d+/g, '');

// Cap invoice_date in April to March 15
content = content.replace(/"invoice_date":"2026-04-\d{2}"/g, '"invoice_date":"2026-03-15"');

fs.writeFileSync('e:/Accounts/Accounts-BE/seed.js', content);
console.log('Successfully updated seed.js');
