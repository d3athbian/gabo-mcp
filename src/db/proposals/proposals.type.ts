/**
 * Proposal Types
 * Temporary storage for knowledge proposals awaiting user confirmation
 */

import type { CreateKnowledgeInput } from "../../types.js";

export interface ProposalWarning {
  type: "similarity" | "sanitization" | "duplicate" | "info";
  severity: "low" | "medium" | "high";
  message: string;
  details?: Record<string, unknown>;
}

export interface SimilarEntry {
  id: string;
  title: string;
  type: string;
  similarity_score?: number;
  created_at: string;
}

export interface KnowledgeProposal {
  proposal_id: string;
  type: "knowledge";
  suggested_data: CreateKnowledgeInput & { embedding?: number[] };
  warnings: ProposalWarning[];
  similar_entries: SimilarEntry[];
  created_at: string;
  expires_at: string;
  status: "pending" | "confirmed" | "rejected";
}

export interface ProposalResponse {
  proposal_id: string;
  suggested_type: string;
  title: string;
  content: string;
  tags?: string[];
  warnings: ProposalWarning[];
  similar_entries: SimilarEntry[];
  question: string;
  expires_in_hours: number;
}

export interface ConfirmProposalInput {
  proposal_id: string;
  modifications?: Partial<CreateKnowledgeInput>;
}

export interface RejectProposalInput {
  proposal_id: string;
  reason?: string;
}
