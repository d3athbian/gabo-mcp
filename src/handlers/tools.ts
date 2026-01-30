/**
 * MCP Tool handlers for knowledge management
 */

import { storeKnowledge, searchKnowledge, getKnowledge, listKnowledge } from '../db/queries.ts';
import type { CreateKnowledgeInput, SearchKnowledgeInput, MCPToolResult, KnowledgeType } from '../types.ts';

const VALID_TYPES: KnowledgeType[] = [
  'UI_REASONING',
  'ARCH_DECISION',
  'PROMPT',
  'ERROR_CORRECTION',
  'CODE_SNIPPET',
  'DESIGN_DECISION',
  'TECHNICAL_INSIGHT',
  'REACT_PATTERN',
];

/**
 * Handler for store_knowledge tool
 */
export async function handleStoreKnowledge(
  userId: string,
  input: CreateKnowledgeInput
): Promise<MCPToolResult> {
  try {
    // Validate type
    if (!VALID_TYPES.includes(input.type)) {
      return {
        success: false,
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      };
    }
    
    const entry = await storeKnowledge(userId, input);
    return {
      success: true,
      data: {
        id: entry.id,
        type: entry.type,
        title: entry.title,
        created_at: entry.created_at,
        tags: entry.tags,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Handler for search_knowledge tool
 */
export async function handleSearchKnowledge(
  userId: string,
  input: SearchKnowledgeInput
): Promise<MCPToolResult> {
  try {
    const results = await searchKnowledge(userId, input);
    return {
      success: true,
      data: {
        query: input.query,
        results,
        count: results.length,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Handler for get_knowledge tool
 */
export async function handleGetKnowledge(
  userId: string,
  entryId: string
): Promise<MCPToolResult> {
  try {
    const entry = await getKnowledge(userId, entryId);
    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Handler for list_knowledge tool
 */
export async function handleListKnowledge(
  userId: string,
  type?: string,
  limit = 10,
  offset = 0
): Promise<MCPToolResult> {
  try {
    const { data, count } = await listKnowledge(userId, type, limit, offset);
    return {
      success: true,
      data: {
        entries: data,
        total: count,
        limit,
        offset,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}
