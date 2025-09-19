import { format } from "date-fns";

export default function formatDate(date: Date | undefined): string {
  if (!date) return "";
  const isoString = date instanceof Date
    ? date.toISOString()
    : new Date(date).toISOString();
  const [datePart] = isoString.split('T'); 
  const [year, month, day] = datePart.split('-');
  return `${day}-${month}-${year}`;
}

export function parseDate(dateString: string): Date | undefined {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return undefined; 
  }
  return date;
}

export function humanizeDate(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "MMM d, yyyy");
}