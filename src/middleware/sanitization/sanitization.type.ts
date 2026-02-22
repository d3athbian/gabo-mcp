/**
 * Types for Content Sanitization System
 */

export type SecurityProfileName = 'work' | 'personal';

export type DetectionCategory = 'credentials' | 'pii' | 'corporate' | 'env_vars';

export type DetectionResult = {
  detected: boolean;
  category: DetectionCategory;
  matches: string[];
  message?: string;
};

export type DetectorFunction = (content: string, title: string) => DetectionResult;

export type SecurityProfile = {
  name: SecurityProfileName;
  description: string;
  detectors: {
    credentials: boolean;
    pii: boolean;
    corporate: boolean;
    envVars: boolean;
  };
};

export type SanitizationResult = {
  allowed: boolean;
  violations: DetectionResult[];
  errorMessage?: string;
  warningMessage?: string;
};

export type SanitizationConfig = {
  blacklistedCompanies: string[];
  blacklistedDomains: string[];
  blacklistedKeywords: string[];
};
