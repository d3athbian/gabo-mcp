/**
 * Tool Types
 * Type definitions for MCP tools following base.type.ts patterns
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodTypeAny } from 'zod';
import type { ToolResponse } from '../utils/tool-handler/tool-handler.type.js';

/**
 * Tool context - Dependencies that can be injected for testing
 */
export type ToolContext = {
  // Database queries
  storeKnowledge: typeof import('../db/queries.js').storeKnowledge;
  searchKnowledge: typeof import('../db/queries.js').searchKnowledge;
  getKnowledge: typeof import('../db/queries.js').getKnowledge;
  listKnowledge: typeof import('../db/queries.js').listKnowledge;
  deleteKnowledge: typeof import('../db/queries.js').deleteKnowledge;

  // Vector search
  searchKnowledgeVector: typeof import('../db/vector-search.js').searchKnowledgeVector;
  isVectorSearchAvailable: typeof import('../db/vector-search.js').isVectorSearchAvailable;

  // Embeddings
  generateEmbedding: typeof import('../embeddings/index.js').generateEmbedding;
  generateQueryEmbedding: typeof import('../embeddings/index.js').generateQueryEmbedding;

  // Sanitization
  sanitizeAllFields: typeof import('../middleware/sanitization/index.js').sanitizeAllFields;

  // Audit
  recordAuditLog: typeof import('../db/audit-log.js').recordAuditLog;
};

/**
 * Tool handler function type
 * Receives arguments WITHOUT api_key (extracted by middleware)
 * Optional auth and context parameter for dependency injection (testing)
 */
export type BaseToolHandler<T> = (
  args: T,
  auth?: { keyId: string },
  context?: Partial<ToolContext>
) => Promise<ToolResponse>;

/**
 * Metadata for tool definition
 */
export type ToolDefinition<T> = {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodTypeAny;
  handler: BaseToolHandler<Omit<T, 'api_key'>>;
  skipAuth?: boolean; // Optional flag to bypass authentication
  auditAction?: import('../types.js').AuditAction;
};

/**
 * Tool registrar function type
 */
export type ToolRegistrar = (server: McpServer) => void;
