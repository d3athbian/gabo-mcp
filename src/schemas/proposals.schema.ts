/**
 * Zod Schemas for Proposal Tools
 * SSOT for proposal-related validation
 */

import { z } from "zod";
import { KnowledgeTypeSchema } from "./index.schema.js";

// Propose Knowledge Schema
export const ProposeKnowledgeSchema = z.object({
    type: KnowledgeTypeSchema,
    title: z.string().min(1).describe("Title of the knowledge entry"),
    content: z.string().min(1).describe("Content of the knowledge entry"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    source: z.string().optional().describe("Source or context (e.g., 'auth_flow_optimization')"),
    embedding: z.array(z.number()).optional().describe("Vector embedding (768 dimensions)"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
    api_key: z.string().min(1).describe("API key for authentication"),
});

// Confirm Proposal Schema
export const ConfirmProposalSchema = z.object({
    proposal_id: z.string().min(1).describe("ID of the proposal to confirm"),
    modifications: z.object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        tags: z.array(z.string()).optional(),
        source: z.string().optional(),
        type: KnowledgeTypeSchema.optional(),
    }).optional().describe("Optional modifications to the proposed data"),
    api_key: z.string().min(1).describe("API key for authentication"),
});

// Reject Proposal Schema
export const RejectProposalSchema = z.object({
    proposal_id: z.string().min(1).describe("ID of the proposal to reject"),
    reason: z.string().optional().describe("Optional reason for rejection"),
    api_key: z.string().min(1).describe("API key for authentication"),
});

export type ProposeKnowledgeArgs = z.infer<typeof ProposeKnowledgeSchema>;
export type ConfirmProposalArgs = z.infer<typeof ConfirmProposalSchema>;
export type RejectProposalArgs = z.infer<typeof RejectProposalSchema>;
