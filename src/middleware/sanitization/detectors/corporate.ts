/**
 * Corporate Data Detector
 * Detects company names, corporate domains, and confidential keywords
 */

import { loadConfig } from '../config.js';
import type { DetectionResult } from '../sanitization.type.js';

export function detectCorporate(content: string, title: string): DetectionResult {
  const config = loadConfig();
  const matches: string[] = [];
  const combinedText = `${title} ${content}`.toLowerCase();

  // Check blacklisted companies
  for (const company of config.blacklistedCompanies) {
    const regex = new RegExp(`\\b${company.toLowerCase()}\\b`, 'gi');
    if (regex.test(combinedText)) {
      matches.push(`Company: ${company}`);
    }
  }

  // Check blacklisted domains
  for (const domain of config.blacklistedDomains) {
    const regex = new RegExp(domain.toLowerCase().replace('.', '\\.'), 'gi');
    if (regex.test(combinedText)) {
      matches.push(`Domain: ${domain}`);
    }
  }

  // Check blacklisted keywords
  for (const keyword of config.blacklistedKeywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
    if (regex.test(combinedText)) {
      matches.push(`Keyword: ${keyword}`);
    }
  }

  // Common corporate indicators
  const corporateIndicators = [
    /\b(internal|confidential|proprietary|trade\s*secret)\b/gi,
    /\bcustomer\s*(data|information|records)\b/gi,
    /\buser\s*(data|information|records)\b/gi,
  ];

  for (const pattern of corporateIndicators) {
    const found = combinedText.match(pattern);
    if (found) {
      matches.push(...found.map((m) => `Indicator: ${m}`));
    }
  }

  return {
    detected: matches.length > 0,
    category: 'corporate',
    matches: [...new Set(matches)],
    message:
      matches.length > 0
        ? `Detected ${matches.length} corporate data reference(s): company names, domains, or confidential keywords`
        : undefined,
  };
}
