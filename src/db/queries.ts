import { supabase } from './client';
import { KnowledgeEntry, CreateKnowledgeInput, SearchKnowledgeInput, SearchResult } from '../types';

/**
 * Store a new knowledge entry in the database
 */
export async function storeKnowledge(userId: string, input: CreateKnowledgeInput): Promise<KnowledgeEntry> {
  const { type, title, content, tags = [], source } = input;
  
  // Validate input
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required and cannot be empty');
  }
  if (!content || content.trim().length === 0) {
    throw new Error('Content is required and cannot be empty');
  }
  
  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert([
      {
        user_id: userId,
        type,
        title: title.trim(),
        content: content.trim(),
        tags,
        source,
        visibility: 'private',
      },
    ])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to store knowledge: ${error.message}`);
  }
  
  return data as KnowledgeEntry;
}

/**
 * Search knowledge entries by keyword (Phase 3 - no embeddings yet)
 */
export async function searchKnowledge(userId: string, input: SearchKnowledgeInput): Promise<SearchResult[]> {
  const { query, type, limit = 10, offset = 0 } = input;
  
  if (!query || query.trim().length === 0) {
    throw new Error('Search query is required');
  }
  
  let queryBuilder = supabase
    .from('knowledge_entries')
    .select('id, title, content, type, created_at')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (type) {
    queryBuilder = queryBuilder.eq('type', type);
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) {
    throw new Error(`Failed to search knowledge: ${error.message}`);
  }
  
  return data as SearchResult[];
}

/**
 * Get a single knowledge entry by ID
 */
export async function getKnowledge(userId: string, entryId: string): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Knowledge entry not found');
    }
    throw new Error(`Failed to fetch knowledge: ${error.message}`);
  }
  
  return data as KnowledgeEntry;
}

/**
 * List knowledge entries with optional filtering
 */
export async function listKnowledge(
  userId: string,
  type?: string,
  limit = 10,
  offset = 0
): Promise<{ data: KnowledgeEntry[]; count: number }> {
  let queryBuilder = supabase
    .from('knowledge_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (type) {
    queryBuilder = queryBuilder.eq('type', type);
  }
  
  const { data, error, count } = await queryBuilder;
  
  if (error) {
    throw new Error(`Failed to list knowledge: ${error.message}`);
  }
  
  return {
    data: data as KnowledgeEntry[],
    count: count || 0,
  };
}

/**
 * Update a knowledge entry
 */
export async function updateKnowledge(
  userId: string,
  entryId: string,
  updates: Partial<CreateKnowledgeInput>
): Promise<KnowledgeEntry> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  
  if (updates.title !== undefined) {
    updateData.title = updates.title.trim();
  }
  if (updates.content !== undefined) {
    updateData.content = updates.content.trim();
  }
  if (updates.tags !== undefined) {
    updateData.tags = updates.tags;
  }
  if (updates.source !== undefined) {
    updateData.source = updates.source;
  }
  
  const { data, error } = await supabase
    .from('knowledge_entries')
    .update(updateData)
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update knowledge: ${error.message}`);
  }
  
  return data as KnowledgeEntry;
}

/**
 * Delete a knowledge entry
 */
export async function deleteKnowledge(userId: string, entryId: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Failed to delete knowledge: ${error.message}`);
  }
}

/**
 * Get tags for a user
 */
export async function getUserTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('knowledge_tags')
    .select('tag')
    .eq('user_id', userId)
    .order('tag', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
  
  return (data || []).map(item => item.tag);
}
