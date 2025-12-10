import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const stripLeadingZeros = (value: string | number): string => {
  return String(value).replace(/^0+/, '');
};