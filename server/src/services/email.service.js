// Sends email (today only password-reset mail) through Brevo's SMTP relay.
// The provider is a setting (EMAIL_PROVIDER) so another one can be added later without touching the callers.
// Settings (all in server/.env, never logged): EMAIL_PROVIDER=brevo, EMAIL_FROM, BREVO_SMTP_LOGIN, BREVO_SMTP_KEY, CLIENT_URL
const nodemailer = require('nodemailer');

let transport = null;
let transportKey = '';

const settings = () => ({
  provider: process.env.EMAIL_PROVIDER,
  from: process.env.EMAIL_FROM,
  login: process.env.BREVO_SMTP_LOGIN,
  key: process.env.BREVO_SMTP_KEY,
  clientUrl: (process.env.CLIENT_URL || '').replace(/\/+$/, ''),
});

// True when everything needed to send a reset email is set. Callers use this to answer 503 instead of failing silently.
const isEmailConfigured = () => {
  const s = settings();
  return s.provider === 'brevo' && !!(s.from && s.login && s.key && s.clientUrl);
};

// One line for the startup log: says whether email works, never shows a key or an address.
const describeEmail = () => (isEmailConfigured() ? 'email: brevo configured' : 'email: NOT configured (password reset is switched off)');

const getTransport = () => {
  const s = settings();
  const key = `${s.login}:${s.key}`;
  if (!transport || transportKey !== key) {
    transport = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // STARTTLS on port 587
      requireTLS: true,
      auth: { user: s.login, pass: s.key },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    transportKey = key;
  }
  return transport;
};

// Sends one email. Throws on failure (the caller decides what the user is told).
const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) throw new Error('Email is not configured');
  return getTransport().sendMail({ from: settings().from, to, subject, text, html });
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// The reset message. `link` is built from CLIENT_URL plus a one-time token and is the only thing that gives access.
const passwordResetEmail = ({ username, link }) => {
  const name = escapeHtml(username);
  return {
    subject: 'Reset your PrepStack password',
    text:
      `Hi ${username},\n\nSomeone asked to reset the password for your PrepStack account. ` +
      `Open this link within 1 hour to choose a new password:\n\n${link}\n\n` +
      `The link works once. If you did not ask for this, ignore this email: your password stays the same.\n\n- PrepStack`,
    html:
      `<p>Hi ${name},</p><p>Someone asked to reset the password for your PrepStack account. ` +
      `Use the button below within 1 hour to choose a new password.</p>` +
      `<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 18px;background:#ffa116;color:#050505;` +
      `text-decoration:none;border-radius:8px;font-weight:600">Choose a new password</a></p>` +
      `<p>The link works once. If you did not ask for this, ignore this email: your password stays the same.</p><p>- PrepStack</p>`,
  };
};

// For accounts that only use Google sign-in: there is no password to reset, so say how to get in (no link).
const googleOnlyEmail = ({ username }) => {
  const name = escapeHtml(username);
  return {
    subject: 'Signing in to PrepStack',
    text:
      `Hi ${username},\n\nSomeone asked to reset the password for this PrepStack account. ` +
      `This account signs in with Google and has no password, so there is nothing to reset. ` +
      `Go to the login page and choose "Continue with Google".\n\nIf you did not ask for this, ignore this email.\n\n- PrepStack`,
    html:
      `<p>Hi ${name},</p><p>Someone asked to reset the password for this PrepStack account. This account signs in with Google ` +
      `and has no password, so there is nothing to reset. Go to the login page and choose <b>Continue with Google</b>.</p>` +
      `<p>If you did not ask for this, ignore this email.</p><p>- PrepStack</p>`,
  };
};

module.exports = { sendEmail, isEmailConfigured, describeEmail, passwordResetEmail, googleOnlyEmail, settings };
