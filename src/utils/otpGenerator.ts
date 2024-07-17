import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Function to generate a 6-digit OTP
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  console.log('otp generated',otp)
  return otp;
};

// Function to send an OTP email
export const sendOtpEmail = async (name: string,email: string, otp: string): Promise<void> => {
  // Create a transporter object using SMTP transport
  try{
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_srvc, // Corrected the environment variable name
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS, 
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: email, 
    subject: 'Your OTP Code', 
    text: `Dear ${name}, your OTP code is ${otp}`,
    html:  `<p>Dear ${name},</p><p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`, 
  };

  // Send email using the transporter object
  await transporter.sendMail(mailOptions);
  console.log('OTP email sent successfully.');
} catch (error) {
  console.error('Error sending OTP email:', error);
  throw new Error('Failed to send OTP email.');
}
};
