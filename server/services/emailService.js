import { getTransporter, getEmailFrom, getClientBaseUrl, isEmailEnabled } from '../config/email.js';

const baseTemplate = (title, body, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#4f46e5;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;font-size:24px">ReMarket</h1>
  </div>
  <div style="background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="color:#111827;margin-top:0">${title}</h2>
    <p>${body}</p>
    ${buttonText && buttonUrl ? `
    <p style="text-align:center;margin:30px 0">
      <a href="${buttonUrl}" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold">
        ${buttonText}
      </a>
    </p>
    <p style="font-size:12px;color:#6b7280;word-break:break-all">Or copy this link: ${buttonUrl}</p>
    ` : ''}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="font-size:12px;color:#9ca3af;margin:0">This is an automated email from ReMarket. Do not share this link with anyone.</p>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log('\n--- EMAIL (dev mode — SMTP not configured) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch) console.log(`Link: ${linkMatch[1]}`);
    console.log('--------------------------------------------\n');
    return { devMode: true };
  }

  await transport.sendMail({
    from: `ReMarket <${getEmailFrom()}>`,
    to,
    subject,
    html,
  });

  return { sent: true };
};

export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${getClientBaseUrl()}/verify-email?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Verify your ReMarket account',
    html: baseTemplate(
      'Verify Your Email',
      `Hi ${user.name},<br><br>Thanks for joining ReMarket! Please verify your email address to activate your account.`,
      'Verify Email',
      verifyUrl
    ),
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${getClientBaseUrl()}/reset-password?token=${token}`;

  return sendEmail({
    to: user.email,
    subject: 'Reset your ReMarket password',
    html: baseTemplate(
      'Reset Your Password',
      `Hi ${user.name},<br><br>You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.<br><br>If you didn't request this, you can safely ignore this email.`,
      'Reset Password',
      resetUrl
    ),
  });
};

export { isEmailEnabled };
