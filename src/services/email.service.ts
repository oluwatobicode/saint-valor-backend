import { resend } from "../config";
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
        /* Email Client Resets */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body { margin: 0; padding: 0; background-color: #F9F7F2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9F7F2;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9F7F2;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-collapse: separate;">
              
              <tr>
                <td align="center" style="background-color: #4A0E0E; padding: 30px 20px;">
                  <h1 style="margin: 0; color: #D4AF37; font-size: 24px; font-weight: normal; letter-spacing: 1px;">SAINT VALOR</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px; color: #2B2B2B; line-height: 1.6; font-size: 16px;">
                  <h2 style="color: #4A0E0E; margin-top: 0; font-weight: 600;">${title}</h2>
                  ${content}
                  
                  ${
                    cta
                      ? `
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-top: 25px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#D4AF37" style="border-radius: 4px;">
                              <a href="${cta.url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #2B2B2B; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${cta.text}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  `
                      : ""
                  }
                  
                </td>
              </tr>
              
              <tr>
                <td align="center" style="background-color: #F9F7F2; padding: 20px; font-size: 12px; color: #777777; border-top: 1px solid #eaeaea;">
                  &copy; ${new Date().getFullYear()} Saint Valor. All rights reserved.<br>
                  Premium quality, delivered.
                </td>
              </tr>
              
            </table>
            </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// sending welcome email
// sending welcome email
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const html = generateEmailTemplate(
      "Welcome to Saint Valor",
      `
        <p style="font-size: 18px; font-weight: 600; color: #4A0E0E;">Hi ${name},</p>
        <p>Welcome to the Saint Valor family. We are absolutely thrilled to have you join our exclusive community.</p>
        <p>Our commitment is to bring you uncompromising quality and timeless style. As a registered member, you will now be the first to know about our newest arrivals, limited-edition drops, and insider-only events.</p>
        <p>To start your journey with us, we invite you to explore our latest collection. Your signature look awaits.</p>
      `,
      {
        text: "Explore the Collection",
        url: "https://saintvalorconcepts.com/shop",
      },
    );

    await resend.emails.send({
      from: "Support <saintvalor@oluwatobii.xyz>",
      to: email,
      subject: "Welcome to the Saint Valor Community",
      html,
    });
  } catch (error) {
    console.log(error);
  }
};

// sending otp email
export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    const html = generateEmailTemplate(
      "Verify Your Email",
      `<p>Please use the verification code below to confirm your email address. This code will expire in <strong>10 minutes</strong>.</p>
       <div style="text-align:center;margin:28px 0;">
         <span style="display:inline-block;padding:16px 36px;background:#4A0E0E;color:#D4AF37;font-size:32px;font-weight:bold;letter-spacing:10px;border-radius:6px;">${otp}</span>
       </div>
       <p style="font-size:13px;color:#777;">If you did not create a Saint Valor account, you can safely ignore this email.</p>`,
    );

    await resend.emails.send({
      from: "Support <saintvalor@oluwatobii.xyz>",
      to: email,
      subject: "Your Saint Valor Verification Code",
      html,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }
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
