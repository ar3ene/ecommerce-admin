import { formatter } from "./utils";

export type CurrencyType = "CNY" | "USD" | "EUR" | "JPY" | "HKD";

interface ExchangeRateResponse {
    base: string;
    date: string;
    rates: {
      [key in Uppercase<CurrencyType>]: number;  
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
    
    // return response.json();
    const data = await response.json();

    if (data.conversion_rates) {  // API 返回的是 conversion_rates 而不是 rates
        data.rates = data.conversion_rates;
    }

    return {
        base: data.base_code || base, // 添加 fallback
        date: data.time_last_update_utc || new Date().toISOString(),
        rates: data.rates || {}
    };
}

export function convertCurrency(
    amount: number,
    fromCurrency: CurrencyType,
    toCurrency: CurrencyType,
    rates: { [key: string]: number }
): number {
    if (!rates || typeof rates !== 'object') {
        throw new Error('Invalid rates object');
    }

    if (fromCurrency === toCurrency) return amount;

    const targetCurrency = toCurrency.toUpperCase();
    const rate = rates[targetCurrency];

    if (rate === undefined) {
        console.error('Available rates:', Object.keys(rates));
        throw new Error(`Exchange rate not found for ${targetCurrency}`);
    }
    
    return amount * rate;

  
    //   const targetCurrency = toCurrency.toUpperCase();
    //   const rate = rates[targetCurrency];

    //   if (!rate) {
    //     throw new Error(`Exchange rate not found for ${toCurrency}`);
    //   }

    //   return amount * rate;
}

export function formatPrice(amount: number, currency: CurrencyType): string {
  return formatter[currency].format(amount);
}