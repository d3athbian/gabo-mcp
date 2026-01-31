/**
 * Type definitions for database client module
 * Extends base.type.ts for common patterns
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseRow, EntityId, EntityType, Embedding } from '../base.type.ts';

export type DatabaseSchema = {
  knowledge_entries: DatabaseRow & {
    user_id: EntityId;
    type: EntityType;
    title: string;
    content: string;
    tags: string[];
    embedding?: Embedding;
  };
};

export type SupabaseClientType = SupabaseClient<DatabaseSchema>;

export type ConnectionTestResult = boolean;
