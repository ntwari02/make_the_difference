// check-sendgrid-setup.js
require('dotenv').config();

const sgMail = require('@sendgrid/mail');

console.log('--- SendGrid Setup Checker ---');

// 1. Check API Key
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is missing from your .env file.');
  process.exit(1);
} else {
  console.log('✅ SENDGRID_API_KEY found.');
}

// 2. Check sender email
const sender = 'myemail@gmail.com';
if (!sender || sender === 'your_verified_sender@yourdomain.com') {
  console.error('❌ Please set your verified sender email in this script.');
  process.exit(1);
} else {
  console.log('✅ Sender email set:', sender);
}

// 3. Try sending a test email
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: sender, // send to yourself for test
  from: sender,
  subject: 'SendGrid Test Email',
  text: 'This is a test email from your Node.js app.',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Test email sent successfully! Check your inbox.');
  })
  .catch((error) => {
    console.error('❌ Failed to send test email.');
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
    process.exit(1);
  });