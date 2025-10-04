// Base email template
const getBaseTemplate = (headerColor: string, title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - MJ2 Studios</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, ${headerColor}, ${headerColor}dd);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
            position: relative;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
            background-color: #ffffff;
            border-radius: 0 0 8px 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #eeeeee;
            background-color: #fafafa;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: ${headerColor};
            text-decoration: none;
        }
        .footer .contact-info {
            margin: 10px 0;
        }
        .social-links {
            margin: 10px 0;
        }
        .social-links span {
            margin: 0 10px;
            text-decoration: none;
            font-size: 14px;
            color: ${headerColor};
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #2196f3, #1976d2);
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 2px;
        }
        .checklist {
            margin: 20px 0;
            padding-left: 20px;
        }
        .checklist li {
            margin-bottom: 8px;
            position: relative;
        }
        .checklist li:before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            position: absolute;
            left: -20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${headerColor};
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .testimonial {
            background-color: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            font-style: italic;
            color: #333;
        }
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes checkmark {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
            100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        .content {
            animation: fadeIn 0.6s ease-out;
        }
        .code {
            animation: pulse 2s infinite;
        }
        .checklist li:before {
            animation: checkmark 0.8s ease-out;
        }
        .checklist li:nth-child(1):before { animation-delay: 0.1s; }
        .checklist li:nth-child(2):before { animation-delay: 0.3s; }
        .checklist li:nth-child(3):before { animation-delay: 0.5s; }
        .button {
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; padding: 10px; }
            .header { padding: 20px 10px; }
            .header h1 { font-size: 24px; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MJ2 Studios</h1>
            <p>Professional Michael Jackson Tribute Performances</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>MJ2 Studios</strong></p>
            <p>Michael Jackson Tribute Specialists</p>
            <div class="contact-info">
                <p>Email: <a href="mailto:info@mj2-studios.co.uk">info@mj2-studios.co.uk</a> | Phone: <a href="tel:+441234567890">+44 123 456 7890</a></p>
                <p>Business Hours: Mon-Fri 9:00 AM - 6:00 PM GMT</p>
            </div>
            <div class="social-links">
                <span>Facebook</span> |
                <span>Instagram</span> |
                <span>Twitter</span>
            </div>
            <p>Visit us at <a href="https://mj2-studios.co.uk" target="_blank">mj2-studios.co.uk</a></p>
            <p>&copy; 2025 MJ2 Studios. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

import { BookingData } from './types';

export const EmailTemplates = {
  // Email template generators - return HTML strings, not send emails

  // Generate verification code email HTML
  getVerificationCodeHtml: (code: string): string => {
    const content = `
      <h2 style="color: #2196f3; margin-bottom: 20px;">Email Verification Required</h2>
      <p>Dear Valued Customer,</p>
      <p>To ensure the security of your booking and complete the process safely, we require email verification.</p>
      <p>Please enter the following verification code in the booking form:</p>
      <div class="code">${code}</div>
      <p><strong>Important:</strong> This code will expire in 10 minutes for security reasons. If you did not initiate this booking request, please disregard this email.</p>
      <p>If you encounter any issues, feel free to contact our support team.</p>
      <a href="https://mj2-studios.co.uk/pages/booking" class="button" target="_blank">Continue to Booking</a>
      <p>Thank you for choosing MJ2 Studios.</p>
    `;

    return getBaseTemplate('#2196f3', 'Email Verification', content);
  },

  // Generate verification success email HTML
  getVerificationSuccessHtml: (name: string): string => {
    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 48px; color: #4caf50;">✓</span>
      </div>
      <h2 style="color: #4caf50; margin-bottom: 20px;">Email Verification Successful</h2>
      <p>Dear ${name || 'Valued Customer'},</p>
      <p>Thank you for verifying your email address. Your email has been successfully authenticated for your booking with MJ2 Studios.</p>
      <p>You may now proceed to complete your booking form submission. We are delighted to assist you in organizing an unforgettable Michael Jackson tribute performance.</p>
      <p><strong>Next Steps:</strong></p>
      <ul class="checklist">
        <li>Complete the reCAPTCHA security verification</li>
        <li>Submit your booking form with all required details</li>
        <li>You will receive a booking confirmation email shortly after</li>
      </ul>
      <p>Should you have any inquiries or require assistance, please do not hesitate to contact our team.</p>
      <p>Best regards,<br><strong>The MJ2 Studios Team</strong></p>
    `;

    return getBaseTemplate('#4caf50', 'Email Verified', content);
  },

  // Generate booking confirmation email HTML
  getBookingConfirmationHtml: (booking: BookingData): string => {
    const detailsList = [
      `<li><strong>Booking ID:</strong> ${booking.bookingId || 'Pending Assignment'}</li>`,
      `<li><strong>Name:</strong> ${booking.name}</li>`,
      `<li><strong>Email:</strong> ${booking.email}</li>`,
      booking.phone ? `<li><strong>Phone:</strong> ${booking.phone}</li>` : '',
      booking.location ? `<li><strong>Location:</strong> ${booking.location}</li>` : '',
      booking.venue ? `<li><strong>Venue:</strong> ${booking.venue}</li>` : '',
      booking.date ? `<li><strong>Preferred Date:</strong> ${booking.date}</li>` : '',
      booking.time ? `<li><strong>Preferred Time:</strong> ${booking.time}</li>` : '',
      booking.message ? `<li><strong>Additional Notes:</strong> ${booking.message}</li>` : '',
    ].filter(Boolean).join('');

    const content = `
      <h2 style="color: #1e1e1e; margin-bottom: 20px;">Booking Confirmation</h2>
      <p>Dear ${booking.name},</p>
      <p>Thank you for selecting MJ2 Studios for your Michael Jackson tribute performance requirements. We appreciate your interest in our professional entertainment services.</p>
      <p>We have successfully received your booking inquiry and are currently reviewing the details. Our dedicated team will contact you within 24-48 business hours to confirm availability, discuss specifics, and provide any additional information needed to finalize your booking.</p>
      <p><strong>Submitted Booking Details:</strong></p>
      <ul style="background-color: #f8f8f8; padding: 15px; border-radius: 5px;">${detailsList}</ul>
      <p>In the meantime, if you have any questions or require further assistance, please do not hesitate to contact us.</p>
      <a href="https://mj2-studios.co.uk/pages/contact" class="button" target="_blank">Contact Us</a>
      ${booking.bookingId ? `<a href="https://mj2-studios.co.uk/pages/booking_status?bookingId=${booking.bookingId}" class="button" target="_blank" style="background-color: #4caf50; margin-left: 10px;">Track Your Booking</a>` : ''}
      <p>We are excited about the opportunity to work with you and bring the magic of Michael Jackson to your event.</p>
      <p>Best regards,<br><strong>The MJ2 Studios Team</strong></p>
    `;

    return getBaseTemplate('#1e1e1e', 'Booking Confirmation', content);
  },

  // Generate status update email HTML
  getStatusUpdateHtml: (booking: BookingData, status: 'confirmed' | 'cancelled', cancellationReason?: string): string => {
    const headerColor = status === 'confirmed' ? '#4caf50' : '#f44336';
    const statusTitle = status === 'confirmed' ? 'Booking Confirmed' : 'Booking Cancelled';
    const statusMessage = status === 'confirmed'
      ? 'We are pleased to inform you that your booking has been confirmed.'
      : 'We regret to inform you that your booking has been cancelled.';

    const detailsList = [
      `<li><strong>Name:</strong> ${booking.name}</li>`,
      `<li><strong>Email:</strong> ${booking.email}</li>`,
      booking.phone ? `<li><strong>Phone:</strong> ${booking.phone}</li>` : '',
      booking.location ? `<li><strong>Location:</strong> ${booking.location}</li>` : '',
      booking.venue ? `<li><strong>Venue:</strong> ${booking.venue}</li>` : '',
      booking.date ? `<li><strong>Preferred Date:</strong> ${booking.date}</li>` : '',
      booking.time ? `<li><strong>Preferred Time:</strong> ${booking.time}</li>` : '',
      booking.message ? `<li><strong>Additional Notes:</strong> ${booking.message}</li>` : '',
    ].filter(Boolean).join('');

    const additionalContent = status === 'confirmed'
      ? '<p>We are excited to bring the legendary performances of Michael Jackson to your event. Our team will be in touch shortly with final arrangements and preparation details.</p><p>Thank you for choosing MJ2 Studios for your entertainment needs.</p>'
      : `<p>${cancellationReason ? `Reason for cancellation: ${cancellationReason}` : 'For any questions or to discuss alternative arrangements, please contact us.'}</p><p>We apologize for any inconvenience this may cause and hope to assist you with future bookings.</p>`;

    const content = `
      <h2 style="color: ${headerColor}; margin-bottom: 20px;">${statusTitle}</h2>
      <p>Dear ${booking.name},</p>
      <p>We have an important update regarding your booking request.</p>
      <p><strong>${statusMessage}</strong></p>
      ${cancellationReason ? `<p><strong>Cancellation Details:</strong> ${cancellationReason}</p>` : ''}
      <p><strong>Booking Details:</strong></p>
      <ul style="background-color: #f8f8f8; padding: 15px; border-radius: 5px;">${detailsList}</ul>
      <p><strong>Current Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
      ${additionalContent}
      <p>If you require any further information, please do not hesitate to contact our team.</p>
      ${status === 'confirmed'
        ? '<a href="https://mj2-studios.co.uk/pages/manage_booking" class="button" target="_blank">Manage Your Booking</a>'
        : '<a href="https://mj2-studios.co.uk/pages/booking" class="button" target="_blank">Book Again</a>'}
      <p>Best regards,<br><strong>The MJ2 Studios Team</strong></p>
    `;

    return getBaseTemplate(headerColor, 'Booking Status Update', content);
  },

  // Generate sign-in notification email HTML
  getSignInNotificationHtml: (name: string, email: string, signInTime: string): string => {
    const content = `
      <h2 style="color: #2196f3; margin-bottom: 20px;">Sign-In Successful</h2>
      <p>Dear ${name},</p>
      <p>You have successfully signed in to your MJ2 Studios account.</p>
      <p><strong>Sign-In Details:</strong></p>
      <ul style="background-color: #f8f8f8; padding: 15px; border-radius: 5px;">
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Sign-In Time:</strong> ${signInTime}</li>
      </ul>
      <p>If this sign-in was not initiated by you, please contact our support team immediately.</p>
      <p>You can now access your bookings and manage your account.</p>
      <a href="https://mj2-studios.co.uk/pages/manage_bookings" class="button" target="_blank">Manage Your Bookings</a>
      <p>Thank you for choosing MJ2 Studios.</p>
      <p>Best regards,<br><strong>The MJ2 Studios Team</strong></p>
    `;

    return getBaseTemplate('#2196f3', 'Sign-In Notification', content);
  },
};