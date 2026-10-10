import { Resend } from 'resend';

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Please set RESEND_API_KEY in your environment or .env file');
    process.exit(1);
  }
  const resend = new Resend(apiKey);

  console.log('Sending test email via Resend to aishwarya.pro369@gmail.com...');
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'aishwarya.pro369@gmail.com',
    subject: 'Store Owner Portal — Test Email',
    html: '<p>Congratulations! Your Store Owner Portal email integration is working.</p>',
    text: 'Congratulations! Your Store Owner Portal email integration is working.'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
