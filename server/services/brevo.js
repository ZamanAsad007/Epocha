const axios = require('axios');

const getEnv = (...keys) => keys.map((key) => process.env[key]).find(Boolean);

const getBrevoConfig = () => {
  const apiKey = getEnv('BREVO_API_KEY', 'BREVO_APIKEY', 'BREVOAPIKEY');
  const senderEmail = getEnv('BREVO_SENDER_EMAIL', 'SENDER_EMAIL', 'SENDEREMAIL');
  const senderName = getEnv('BREVO_SENDER_NAME', 'SENDER_NAME') || 'Epocha';

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is missing');
  }

  return { apiKey, senderEmail, senderName };
};

const sendVerificationEmail = async ({ to, displayName, verificationUrl }) => {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();

  const recipientName = displayName || to;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;background:#0d0d0d;color:#f5f5f5;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
        <h1 style="margin:0 0 16px;color:#c9a84c;font-size:24px;letter-spacing:.08em;text-transform:uppercase">Verify your Epocha email</h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#e8e1d4">Hi ${recipientName}, click the button below to verify your email address and activate local login.</p>
        <p style="margin:0 0 28px">
          <a href="${verificationUrl}" style="display:inline-block;background:#c9a84c;color:#0d0d0d;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase">Verify email</a>
        </p>
        <p style="font-size:13px;line-height:1.6;margin:0;color:#a7a7a7">If the button does not work, paste this link into your browser:</p>
        <p style="font-size:13px;word-break:break-all;color:#c9a84c">${verificationUrl}</p>
      </div>
    </div>
  `;

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to, name: recipientName }],
      subject: 'Verify your Epocha email',
      htmlContent,
      textContent: `Verify your Epocha email: ${verificationUrl}`,
    },
    {
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
      },
    }
  );
};

module.exports = {
  sendVerificationEmail,
};