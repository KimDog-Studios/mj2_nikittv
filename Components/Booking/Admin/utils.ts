import { sounds } from './types';

export const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch(err => console.log('Audio play failed:', err));
};