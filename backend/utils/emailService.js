import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Use environment variables for email configuration
  // For Gmail, you can use OAuth2 or App Password
  // For other services, adjust accordingly
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmailWithPDF = async (toEmail, pdfBuffer, customerName) => {
  try {
    const transporter = createTransporter();

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Shipment_Order_${date}_${time}.pdf`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: `Shipment Request Order - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Shipment Request Order</h2>
          <p>Dear Pricing Team,</p>
          <p>Please find attached the shipment request order for <strong>${customerName}</strong>.</p>
          <p>Please review and provide pricing for this shipment.</p>
          <br>
          <p>Best regards,<br>Logistics Email-to-File System</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

