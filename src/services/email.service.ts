import resend from "../config/email.config";

// Base Email Template

const generateEmailTemplate = (
  title: string,
  content: string,
  cta?: { text: string; url: string },
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9F7F2; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #4A0E0E; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #D4AF37; font-size: 24px; font-weight: normal; letter-spacing: 1px; }
        .body { padding: 40px 30px; color: #2B2B2B; line-height: 1.6; font-size: 16px; }
        .footer { background-color: #F9F7F2; padding: 20px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #eaeaea; }
        .btn { display: inline-block; background-color: #D4AF37; color: #2B2B2B; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold; margin-top: 25px; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; }
        .otp-box { background-color: #F9F7F2; border: 1px dashed #D4AF37; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #4A0E0E; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SAINT VALOR</h1>
        </div>
        <div class="body">
          <h2 style="color: #4A0E0E; margin-top: 0;">${title}</h2>
          ${content}
          ${cta ? `<div style="text-align: center;"><a href="${cta.url}" class="btn">${cta.text}</a></div>` : ""}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Saint Valor. All rights reserved.<br>
          Premium quality, delivered.
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- Email Sending Functions ---

// sending welcome email
export const sendWelcomeEmail = async (email: string) => {
  try {
    const html = generateEmailTemplate(
      "Welcome to Saint Valor",
      "<p>Thank you for joining our exclusive community. We are thrilled to have you with us and can't wait for you to experience our collection.</p>",
      { text: "Shop Now", url: "https://saintvalorconcepts.com/shop" },
    );

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Saint Valor",
      html,
    });
  } catch (error) {
    console.log(error);
  }
};

// sending otp email
export const sendOtpEmail = async (email: string, otp: string) => {
  const html = generateEmailTemplate(
    "Verification Required",
    `<p>Please use the verification code below to complete your authentication. This code will expire in 10 minutes.</p>
     <div class="otp-box">${otp}</div>`,
  );

  await resend.emails.send({
    from: "saintvalor@oluwatobii.xyz",
    to: email,
    subject: "Your Saint Valor Verification Code",
    html,
  });
};

// sending forget password email
export const forgetPasswordEmail = async (email: string, resetLink: string) => {
  const html = generateEmailTemplate(
    "Reset Your Password",
    "<p>We received a request to reset the password for your Saint Valor account. If you made this request, click the button below to choose a new password.</p><p>If you didn't make this request, you can safely ignore this email.</p>",
    { text: "Reset Password", url: resetLink },
  );

  await resend.emails.send({
    from: "saintvalor@oluwatobii.xyz",
    to: email,
    subject: "Reset Your Password - Saint Valor",
    html,
  });
};

// sending order received email
export const orderRecievedEmail = async (
  email: string,
  orderNumber: string,
) => {
  const html = generateEmailTemplate(
    "Order Received",
    `<p>Thank you for your purchase. We have received your order <strong>#${orderNumber}</strong> and are currently processing it.</p>
     <p>We will send you another update as soon as your items have shipped.</p>`,
    {
      text: "View Order Status",
      url: `https://saintvalor.com/orders/${orderNumber}`,
    },
  );

  await resend.emails.send({
    from: "saintvalor@oluwatobii.xyz",
    to: email,
    subject: `Order Confirmation #${orderNumber}`,
    html,
  });
};

// sending order shipped email
export const orderShippedEmail = async (
  email: string,
  orderNumber: string,
  trackingLink: string,
) => {
  const html = generateEmailTemplate(
    "Your Order is on the Way",
    `<p>Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is currently on its way to you.</p>
     <p>You can track your package's journey using the link below.</p>`,
    { text: "Track Package", url: trackingLink },
  );

  await resend.emails.send({
    from: "saintvalor@oluwatobii.xyz",
    to: email,
    subject: `Your Order #${orderNumber} Has Shipped`,
    html,
  });
};
