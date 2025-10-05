export type Booking = {
  id: string;
  bookingId?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  venue?: string;
  package?: string;
  date?: string;
  time?: string;
  message?: string;
  createdAt?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  adminNotes?: string;
};

export type Show = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  venue?: string;
  description?: string;
};

export type RTDBShow = {
  title: string;
  start: string;
  end?: string;
  venue?: string;
  description?: string;
};

export type FirestoreShow = {
  title: string;
  start: { seconds: number; nanoseconds: number };
  end?: { seconds: number; nanoseconds: number };
  venue?: string;
  description?: string;
};

export type DBMessage = {
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
};

export type Message = {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
};

export const sounds = {
  newBooking: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  editSaved: "https://www.soundjay.com/misc/sounds/applause.wav",
  deleteAction: "https://www.soundjay.com/misc/sounds/error.wav",
  statusChange: "https://www.soundjay.com/misc/sounds/click.wav",
};