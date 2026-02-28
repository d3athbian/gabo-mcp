/**
 * Default Tool Context
 * Provides real implementations for production use
 */

import { recordAuditLog } from '../db/audit-log.js';
import {
  deleteKnowledge,
  getKnowledge,
  listKnowledge,
  searchKnowledge,
  storeKnowledge,
} from '../db/queries.js';
import { isVectorSearchAvailable, searchKnowledgeVector } from '../db/vector-search.js';
import { generateEmbedding, generateQueryEmbedding } from '../embeddings/index.js';
import { sanitizeAllFields } from '../middleware/sanitization/index.js';
import type { ToolContext } from '../tools/index.type.js';

export const defaultToolContext: ToolContext = {
  storeKnowledge,
  searchKnowledge,
  getKnowledge,
  listKnowledge,
  deleteKnowledge,
  searchKnowledgeVector,
  isVectorSearchAvailable,
  generateEmbedding,
  generateQueryEmbedding,
  sanitizeAllFields,
  recordAuditLog,
};
