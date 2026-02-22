import { z } from 'zod';

/**
 * Centralized Domain Types for Knowledge MCP Server
 * Types that don't have associated schemas
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export type AuthResult = { success: true; keyId: string } | { success: false; error: string };

// ============================================================================
// AUDIT TYPES
// ============================================================================

export const AuditActionSchema = z.enum([
  'auth_success',
  'auth_failed',
  'search_knowledge',
  'list_knowledge',
  'get_knowledge',
  'store_knowledge',
  'delete_knowledge',
  'key_created',
  'key_rotated',
  'key_revoked',
]);

export type AuditAction = z.infer<typeof AuditActionSchema>;

export type AuditLogEntry = {
  key_id?: string;
  action: AuditAction;
  timestamp: Date;
  ip?: string;
  user_agent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
};

// ============================================================================
// SANITIZATION TYPES
// ============================================================================

export type SecurityProfileName = 'work' | 'personal';

export type DetectionCategory = 'credentials' | 'pii' | 'corporate' | 'env_vars';

export type DetectionResult = {
  detected: boolean;
  category?: DetectionCategory;
  matches: string[];
  message?: string;
};

export type SanitizationResult = {
  allowed: boolean;
  violations: DetectionResult[];
  errorMessage?: string;
  warningMessage?: string;
};

// ============================================================================
// RE-EXPORTS FROM SCHEMAS
// ============================================================================

export type {
  CreateKnowledgeInput,
  KnowledgeEntry,
  KnowledgeType,
  MCPToolResult,
  SearchKnowledgeInput,
  SearchResult,
  StoredEntry,
  VisibilityType,
} from './schemas/index.schema.js';
