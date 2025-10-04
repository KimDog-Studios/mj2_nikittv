export type OpeningTime = {
  day: string;
  open: string;
  close: string;
};

export type OpenStatus = {
  status: 'closed' | 'before' | 'open' | 'after';
  message: string;
};

export type Place = {
  name: string;
  area: string;
  price: string;
  image: string;
};