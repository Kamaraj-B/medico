require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Function to send email using nodemailer
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} [html] - The optional HTML body of the email.
 * @param {Array} [attachments] - Optional attachments array.
 * @returns {Promise} - Resolves with the email info if successful, rejects with an error if failed.
 */
async function sendEmail(to, subject, text, html = '', attachments = []) {
  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: true,
            secureProtocol: "TLSv1_2_method"
        },
    });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,    // Sender address
    to: to,                          // Recipient address
    subject: subject,                // Subject line
    text: text,                      // Plain text body
    html: html,                      // HTML body (optional)
    attachments: attachments         // Attachments (optional)
  };

  // Send email and return the result
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error occurred: ' + error.message);
    throw error;
  }
}

module.exports = sendEmail;
