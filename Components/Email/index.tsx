import { EmailTemplates } from './templates';

export { EmailTemplates } from './templates';
export { EmailService } from './services';
export { default as EmailManager } from './EmailManager';
export type { Email, EmailForm, BookingData } from './types';

// Legacy export for backward compatibility
export default EmailTemplates;