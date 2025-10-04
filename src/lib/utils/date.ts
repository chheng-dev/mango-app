import { format } from "date-fns";

export default function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return "";
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    const isoString = dateObj.toISOString();
    const [datePart] = isoString.split('T'); 
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return "";
  }
}

export function parseDate(dateString: string): Date | undefined {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return undefined; 
  }
  return date;
}

export function humanizeDate(date: Date | string | undefined): string {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return format(dateObj, "MMM d, yyyy");
}