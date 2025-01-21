import { formatter } from "./utils";

export type CurrencyType = "CNY" | "USD" | "EUR" | "JPY" | "HKD";

interface ExchangeRateResponse {
  rates: {
    [key: string]: number;
  };
}

export async function getExchangeRates(base: CurrencyType = "CNY"): Promise<ExchangeRateResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_EXCHANGE_API_URL;

    if (!apiUrl) {
        throw new Error("Exchange rate API URL is not configured");
    }
    const response = await fetch(
        `${apiUrl}${base}`,
        { 
          next: { revalidate: 3600 },
          headers: {
            'Accept': 'application/json'
          }
        }
    );
  
    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    return response.json();
}

export function convertCurrency(
    amount: number,
    fromCurrency: CurrencyType,
    toCurrency: CurrencyType,
    rates: { [key: string]: number }
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = rates[toCurrency];

  if (!rate) {
    throw new Error(`Exchange rate not found for ${toCurrency}`);
  }

  return amount * rate;
}

export function formatPrice(amount: number, currency: CurrencyType): string {
  return formatter[currency].format(amount);
}