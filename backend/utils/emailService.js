import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Use environment variables for email configuration
  // Supports Gmail, Outlook/Office365, and other SMTP services
  
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE;

  if (!smtpHost) {
    throw new Error('SMTP_HOST must be set in environment variables (e.g., smtp.office365.com for Outlook or smtp.gmail.com for Gmail)');
  }

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in environment variables');
  }

  // Log configuration for debugging (without password)
  console.log('Creating email transporter with:', {
    host: smtpHost,
    port: smtpPort || '587',
    secure: smtpSecure === 'true',
    user: smtpUser,
    passLength: smtpPass ? smtpPass.length : 0,
  });

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || '587'),
    secure: smtpSecure === 'true', // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Add debug option
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  return transporter;
};

export const sendEmailWithPDF = async (toEmail, pdfBuffer, options) => {
  try {
    // Verify email configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email configuration is missing. Please set SMTP_USER and SMTP_PASS in your .env file.');
    }

    // Log configuration (without password) for debugging
    console.log('Email config check:', {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    });

    const transporter = createTransporter();
    
    // Verify connection before sending
    console.log('Verifying email connection...');
    await transporter.verify();
    console.log('Email connection verified successfully');

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Shipment_Order_${date}_${time}.pdf`;

    // Format subject: Username, Shipper City, province- Receiver city, province — customer name
    const { username, shipper, receiver, customerName } = options;
    const shipperLocation = `${shipper.city}, ${shipper.stateOrProvince}`;
    const receiverLocation = `${receiver.city}, ${receiver.stateOrProvince}`;
    const subject = `${username}, ${shipperLocation}- ${receiverLocation} — ${customerName}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
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
    
    // Provide more helpful error messages
    if (error.code === 'EAUTH') {
      const host = process.env.SMTP_HOST || 'unknown';
      const isOutlook = host.includes('office365') || host.includes('outlook');
      const isGmail = host.includes('gmail');
      
      let troubleshooting = '';
      if (isOutlook) {
        troubleshooting = 
          'Email authentication failed. Please check:\n' +
          '1. SMTP_USER is your full Outlook/Office365 email (e.g., yourname@outlook.com)\n' +
          '2. SMTP_PASS is your Microsoft App Password (not your regular password)\n' +
          '3. Enable 2-Step Verification in your Microsoft account\n' +
          '4. Generate an App Password: Microsoft Account > Security > Advanced security options > App passwords\n' +
          `Current SMTP_HOST: ${host}\n` +
          `Current SMTP_USER: ${process.env.SMTP_USER ? process.env.SMTP_USER : 'NOT SET'}`;
      } else if (isGmail) {
        troubleshooting = 
          'Email authentication failed. Please check:\n' +
          '1. SMTP_USER is your full Gmail address (e.g., yourname@gmail.com)\n' +
          '2. SMTP_PASS is a 16-character App Password (not your regular password)\n' +
          '3. 2-Step Verification is enabled on your Google account\n' +
          '4. App Password was generated correctly (Settings > Security > App passwords)\n' +
          `Current SMTP_HOST: ${host}\n` +
          `Current SMTP_USER: ${process.env.SMTP_USER ? process.env.SMTP_USER : 'NOT SET'}`;
      } else {
        troubleshooting = 
          'Email authentication failed. Please check:\n' +
          '1. SMTP_USER is your full email address\n' +
          '2. SMTP_PASS is correct (may need App Password if 2FA is enabled)\n' +
          '3. SMTP_HOST is correct for your email provider\n' +
          `Current SMTP_HOST: ${host}\n` +
          `Current SMTP_USER: ${process.env.SMTP_USER ? process.env.SMTP_USER : 'NOT SET'}`;
      }
      
      throw new Error(troubleshooting);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

