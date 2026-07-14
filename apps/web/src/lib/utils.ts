import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSafeDate(date: string | Date | null | undefined, formatStr: string = 'PPP'): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, formatStr);
  } catch (e) {
    return 'N/A';
  }
}
