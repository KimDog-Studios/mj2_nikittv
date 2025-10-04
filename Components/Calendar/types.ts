export type Show = {
  id: string;
  title: string;
  start: Date;
  end?: Date | null;
  venue?: string;
  description?: string;
};