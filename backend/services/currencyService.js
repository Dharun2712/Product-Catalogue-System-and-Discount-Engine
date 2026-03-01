/**
 * Currency Conversion Service
 *
 * All product prices are stored internally in INR.
 * This service converts INR amounts to other currencies
 * for display purposes only.
 */

const RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
};

const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

/**
 * Convert an amount from INR to the target currency.
 * @param {number} amount  – price in INR
 * @param {string} targetCurrency – one of INR | USD | EUR
 * @returns {number} converted value (rounded to 2 decimals)
 */
function convertPrice(amount, targetCurrency = 'INR') {
  const rate = RATES[targetCurrency];
  if (rate === undefined) {
    throw new Error(`Unsupported currency: ${targetCurrency}`);
  }
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Return the symbol for a given currency code.
 */
function getCurrencySymbol(currencyCode = 'INR') {
  return SYMBOLS[currencyCode] || currencyCode;
}

/**
 * Return all supported currencies with their rates and symbols.
 */
function getSupportedCurrencies() {
  return Object.keys(RATES).map((code) => ({
    code,
    symbol: SYMBOLS[code],
    rate: RATES[code],
  }));
}

module.exports = {
  convertPrice,
  getCurrencySymbol,
  getSupportedCurrencies,
  RATES,
  SYMBOLS,
};
