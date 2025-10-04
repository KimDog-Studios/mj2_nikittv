import { OpeningTime, OpenStatus, Place } from './types';

export const openingTimes: OpeningTime[] = [
  { day: 'Monday', open: '09:00', close: '16:00' },
  { day: 'Tuesday', open: '09:00', close: '16:00' },
  { day: 'Wednesday', open: '09:00', close: '16:00' },
  { day: 'Thursday', open: '09:00', close: '16:00' },
  { day: 'Friday', open: '09:00', close: '16:00' },
  { day: 'Saturday', open: '12:00', close: '16:00' },
  { day: 'Sunday', open: 'Closed', close: '' },
];

export const places: Place[] = [
  {
    name: 'Bridgend',
    area: 'Wales',
    price: '£20 | Per Show',
    image: 'https://cdn.britannica.com/29/144829-050-35D6B000/Bridgend-Wales.jpg',
  },
  {
    name: 'Pontycymer',
    area: 'Wales',
    price: '£10 | Per Show',
    image: 'https://alchetron.com/cdn/pontycymer-f52ca3b6-835b-43b7-95b7-26d697b9633-resize-750.jpeg',
  },
  {
    name: 'Sarn',
    area: 'Wales',
    price: '£15 | Per Show',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/St_Ffraid%27s_Church%2C_Sarn_-_geograph.org.uk_-_4985105.jpg/960px-St_Ffraid%27s_Church%2C_Sarn_-_geograph.org.uk_-_4985105.jpg',
  },
  {
    name: 'Maesteg',
    area: 'Wales',
    price: '£20 | Per Show',
    image: 'https://i2-prod.walesonline.co.uk/incoming/article21622288.ece/ALTERNATES/s298/0_rbp_mai100821maesteg_10825JPG.jpg',
  },
];

export function getCurrentTimeParts() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return { hours, minutes, seconds };
}

export function pad2(n: number) { return String(n).padStart(2, '0'); }

export function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h ? h + 'h ' : ''}${pad2(m)}m ${pad2(s)}s`;
}

export function getOpenStatus(today: OpeningTime, now: Date): OpenStatus {
  if (today.open === 'Closed') return { status: 'closed', message: 'Closed today' };
  const [openH, openM] = today.open.split(':').map(Number);
  const [closeH, closeM] = today.close.split(':').map(Number);
  const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const openSecs = openH * 3600 + openM * 60;
  const closeSecs = closeH * 3600 + closeM * 60;
  if (nowSecs < openSecs) {
    const secs = openSecs - nowSecs;
    return { status: 'before', message: `Opens in ${formatHMS(secs)}` };
  } else if (nowSecs >= openSecs && nowSecs < closeSecs) {
    const secs = closeSecs - nowSecs;
    return { status: 'open', message: `Open Now, closes in ${formatHMS(secs)}` };
  } else {
    return { status: 'after', message: 'Closed Today' };
  }
}