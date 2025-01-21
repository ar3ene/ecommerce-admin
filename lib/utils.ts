import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatters = {
  CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
  JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
  HKD: new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD' })
};

export const formatter = formatters.CNY;