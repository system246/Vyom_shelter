import nodemailer from 'nodemailer';

// Built lazily on first actual send — never at module-import time. This
// guarantees GMAIL_USER/GMAIL_PASS are read AFTER dotenv.config() has run,
// regardless of which file imports mailer.js first or in what order.
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendOTP = async (email, otp, name) => {
  await getTransporter().sendMail({
    from: `"Associate Portal" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Verification',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1a3a5c;margin-bottom:8px">Email Verification</h2>
        <p style="color:#6b7280">Hi ${name || 'there'},</p>
        <p style="color:#6b7280">Your OTP for Associate Portal registration is:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a3a5c">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">This OTP expires in <b>10 minutes</b>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Associate Portal · Secure Registration System</p>
      </div>
    `,
  });
};

export const sendWelcome = async (email, name, role) => {
  await getTransporter().sendMail({
    from: `"Associate Portal" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Associate Portal!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1a3a5c;margin-bottom:8px">Welcome, ${name}! 🎉</h2>
        <p style="color:#6b7280">Your email has been <b>verified</b> — you can log in right away.</p>
        <p style="color:#6b7280">Next, complete the Associate Registration form. That submission is what our team reviews and approves.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0">
          <p style="color:#15803d;margin:0;font-size:14px">✅ Email verified — you can log in now</p>
          <p style="color:#15803d;margin:4px 0 0;font-size:14px">📝 Complete your Associate Registration to get approved</p>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Associate Portal · Secure Registration System</p>
      </div>
    `,
  });
};

export const sendApprovalNotification = async (email, name) => {
  await getTransporter().sendMail({
    from: `"Associate Portal" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your Account Has Been Approved!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1a3a5c;margin-bottom:8px">Account Approved! 🎉</h2>
        <p style="color:#6b7280">Hi ${name},</p>
        <p style="color:#6b7280">Your Associate Portal account has been <b>approved</b> by the administrator.</p>
        <p style="color:#6b7280">You can now login and access your dashboard.</p>
        <a href="${process.env.FRONTEND_URL}/login" 
          style="display:inline-block;background:#1a3a5c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
          Login to Portal
        </a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">Associate Portal · Secure Registration System</p>
      </div>
    `,
  });
};
