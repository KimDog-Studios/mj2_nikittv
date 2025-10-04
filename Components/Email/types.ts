export interface BookingData {
  name?: string;
  email: string;
  phone?: string;
  location?: string;
  venue?: string;
  date?: string;
  time?: string;
  message?: string;
  bookingId?: string;
}

export interface Email {
  id?: string;
  to: string;
  subject: string;
  body: string;
  sent?: boolean;
  createdAt: Date;
}

export interface EmailForm {
  to: string;
  subject: string;
  body: string;
}