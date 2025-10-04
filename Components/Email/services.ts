import { Email } from './types';

// Email sending service
export const EmailService = {
  // Send email via API
  async sendEmail(emailData: { to: string; subject: string; body: string }): Promise<boolean> {
    try {
      const fetchPromise = fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Email sending timed out. Please try again.')), 10000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to send email:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  },

  // Legacy function for backward compatibility
  async sendEmailLegacy(email: Email): Promise<boolean> {
    return this.sendEmail({
      to: email.to,
      subject: email.subject,
      body: email.body,
    });
  },
};