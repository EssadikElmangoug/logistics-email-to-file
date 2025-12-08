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
    const host = process.env.SMTP_HOST || 'unknown';
    
    if (error.code === 'EDNS' || error.code === 'ENOTFOUND') {
      // DNS resolution failed - hostname doesn't exist or isn't accessible
      throw new Error(
        `Cannot connect to mail server: DNS lookup failed for "${host}".\n\n` +
        'Please check your .env file and verify:\n' +
        '1. SMTP_HOST is a valid mail server hostname\n' +
        '2. Common providers:\n' +
        '   - Gmail: smtp.gmail.com\n' +
        '   - Outlook/Office365: smtp.office365.com\n' +
        '   - Yahoo: smtp.mail.yahoo.com\n' +
        '3. If using a custom mail server, ensure it\'s accessible from your network\n' +
        `\nCurrent SMTP_HOST: ${host}`
      );
    }
    
    if (error.code === 'EAUTH') {
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
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Cannot connect to mail server: Connection refused to ${host}.\n\n` +
        'Please check:\n' +
        '1. SMTP_HOST is correct\n' +
        '2. SMTP_PORT is correct (587 for TLS, 465 for SSL)\n' +
        '3. Your firewall isn\'t blocking the connection\n' +
        `\nCurrent configuration:\n` +
        `SMTP_HOST: ${host}\n` +
        `SMTP_PORT: ${process.env.SMTP_PORT || '587'}`
      );
    }
    
    if (error.code === 'ETIMEDOUT') {
      throw new Error(
        `Connection to mail server timed out: ${host}.\n\n` +
        'Please check:\n' +
        '1. Your internet connection\n' +
        '2. The mail server is accessible from your network\n' +
        '3. No firewall is blocking outbound SMTP connections\n' +
        `\nCurrent SMTP_HOST: ${host}`
      );
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

