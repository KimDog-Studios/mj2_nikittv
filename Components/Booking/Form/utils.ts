import dayjs, { Dayjs } from 'dayjs';

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function normalizeDateToISO(date: Dayjs | null) {
  if (!date || !dayjs.isDayjs(date)) return '';
  return date.format('YYYY-MM-DD');
}

export const locations = ['Bridgend', 'Pontycymer', 'Sarn', 'Maesteg', 'Other'];

export const packages = [
  {
    id: 'basic',
    name: 'Basic Tribute',
    duration: '1+ Hour',
    description: 'Perfect for small gatherings and intimate celebrations',
    price: 10,
    features: [
      '1 hour MJ tribute performance',
      'Classic MJ hits medley'
    ]
  }
];

export const steps = ['Choose Package', 'Your Details', 'Verify Email', 'Final Review'];

export const possibleTimes = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];