import { Dayjs } from 'dayjs';

export interface Package {
  id: string;
  name: string;
  duration: string;
  description: string;
  price: number;
  features: string[];
}

export interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  venue: string;
  package: string;
  date: Dayjs | null;
  time: Dayjs | null;
  message: string;
  acceptTerms: boolean;
}

export interface Props {
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
}

export interface StepContentProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Partial<Record<keyof FormState, string>>;
  activeStep: number;
  sendingVerification: boolean;
  sendVerificationCode: () => Promise<void>;
  verifyingCode: boolean;
  verifyCode: () => Promise<void>;
  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  expectedVerificationCode: string | null;
  emailVerified: boolean;
  timeLeft: number;
  handleLocationChange: (e: any) => void;
  possibleTimes: string[];
  availableTimes: string[];
  dateCounts: Map<string, Map<string, number>>;
  submitting: boolean;
  recaptchaToken: string | null;
  handleRecaptchaChange: (token: string | null) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}