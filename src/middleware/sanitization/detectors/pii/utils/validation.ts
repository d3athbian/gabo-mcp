/**
 * Validation Utilities
 * Luhn check, SSN validation, false positive detection
 */

export function passesLuhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");

  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function isValidSSN(ssn: string): boolean {
  const prefix = ssn.split("-")[0];
  const prefixNum = parseInt(prefix, 10);
  return prefixNum !== 0 && prefixNum !== 666 && prefixNum < 900;
}

export function isLikelyFalsePositive(match: string, context: string): boolean {
  const lowerMatch = match.toLowerCase();
  const lowerContext = context.toLowerCase();

  if (/^\d+\.\d+(\.\d+)?$/.test(match)) return true;

  if (
    /^(0x[a-f0-9]+|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(
      match,
    )
  )
    return true;

  if (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      match,
    )
  )
    return true;

  if (/^\d{4}-\d{2}-\d{2}$/.test(match)) return true;

  if (
    lowerContext.includes("http") &&
    (lowerContext.includes("/") || lowerContext.includes("."))
  ) {
    if (
      lowerContext.split(match)[0].includes("/api") ||
      lowerContext.split(match)[0].includes(".com/")
    ) {
      return true;
    }
  }

  const programmingTerms = [
    "null",
    "undefined",
    "true",
    "false",
    "NaN",
    "Infinity",
  ];
  if (programmingTerms.includes(lowerMatch)) return true;

  return false;
}
