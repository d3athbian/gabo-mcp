/**
 * Type definitions for MCP Server main implementation
 * Extends base.type.ts for common patterns
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type {
  KnowledgeAttributes,
  ResponseContent,
  LoggerInterface,
} from './base.type.ts';

export type StoredEntry = KnowledgeAttributes;

export type Logger = LoggerInterface;

export type ToolSchema = {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
};

export type ToolDefinition = Tool;

export type StoreKnowledgeArgs = {
  type: string;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
};

export type SearchKnowledgeArgs = {
  query: string;
  type?: string;
};

export type ListKnowledgeArgs = {
  limit?: number;
};

export type GetKnowledgeArgs = {
  id: string;
};

export type ToolArguments = 
  | StoreKnowledgeArgs 
  | SearchKnowledgeArgs 
  | ListKnowledgeArgs 
  | GetKnowledgeArgs 
  | Record<string, unknown>;

export type MCPToolResponse = {
  content: ResponseContent;
  isError?: boolean;
};

export type ToolResponseData = {
  success: boolean;
  id?: string;
  message?: string;
  entry?: StoredEntry;
  query?: string;
  results?: StoredEntry[];
  count?: number;
  entries?: StoredEntry[];
  total?: number;
  error?: string;
};
