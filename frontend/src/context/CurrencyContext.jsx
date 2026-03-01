import { createContext, useContext, useState, useCallback } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

/* ── Static conversion rates (mirrored from backend) ── */
const RATES = { INR: 1, USD: 0.012, EUR: 0.011 };
const SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };
const LOCALES = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE' };
const CURRENCIES = Object.keys(RATES);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'INR';
  });

  const setCurrency = (code) => {
    if (!RATES[code]) return;
    setCurrencyState(code);
    localStorage.setItem('selectedCurrency', code);
  };

  /** Convert an INR amount to the selected (or supplied) currency */
  const convert = useCallback(
    (amountINR, target) => {
      const c = target || currency;
      return Math.round(amountINR * RATES[c] * 100) / 100;
    },
    [currency],
  );

  /** Format a price for display – pass the raw INR amount */
  const formatPrice = useCallback(
    (amountINR, target) => {
      const c = target || currency;
      const converted = Math.round(amountINR * RATES[c] * 100) / 100;
      const symbol = SYMBOLS[c];
      const locale = LOCALES[c];
      const formatted = converted.toLocaleString(locale, {
        minimumFractionDigits: c === 'INR' ? 0 : 2,
        maximumFractionDigits: 2,
      });
      return `${symbol}${formatted}`;
    },
    [currency],
  );

  const symbol = SYMBOLS[currency];

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convert,
        formatPrice,
        symbol,
        currencies: CURRENCIES,
        symbols: SYMBOLS,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
