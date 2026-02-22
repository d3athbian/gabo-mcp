/**
 * Redaction Utilities
 * Functions for redacting sensitive values
 */

import type { RedactionStrategy } from "../pii.type.js";

export function redactValue(
  value: string,
  strategy: RedactionStrategy,
): string {
  switch (strategy) {
    case "email":
      if (value.includes("@")) {
        const [local, domain] = value.split("@");
        const domainParts = domain.split(".");
        if (domainParts.length >= 2) {
          const tld = domainParts.pop();
          const mainDomain = domainParts.join(".");
          return `${local.slice(0, 2)}***@${mainDomain.slice(0, 2)}***.${tld}`;
        }
        return `${local.slice(0, 2)}***@***`;
      }
      return "***@***";

    case "partial":
      if (value.length <= 4) return "***";
      return `${value.slice(0, 2)}***${value.slice(-2)}`;

    case "full":
      return "***REDACTED***";

    case "generic":
    default:
      if (value.length > 10) return `${value.slice(0, 4)}***`;
      return "***";
  }
}
