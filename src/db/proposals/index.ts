/**
 * Proposals Database Layer
 * Manages temporary storage of knowledge proposals awaiting user confirmation
 * Proposals auto-expire after 24 hours
 */

import { ObjectId } from "mongodb";
import { getKnowledgeEntriesCollection } from "../client.js";
import type {
    KnowledgeProposal,
    ProposalWarning,
    SimilarEntry,
    ProposalResponse,
} from "./proposals.type.js";
import type { CreateKnowledgeInput } from "../../types.js";
import { searchKnowledgeVector } from "../vector-search.js";
import { sanitizeContent } from "../../middleware/sanitization/index.js";

// In-memory storage for proposals (could be moved to MongoDB if needed)
const proposalsStore = new Map<string, KnowledgeProposal>();

/**
 * Create a new knowledge proposal
 * Analyzes content for warnings and similar entries
 */
export async function createProposal(
    input: CreateKnowledgeInput & { embedding?: number[] }
): Promise<ProposalResponse> {
    const { type, title, content, tags, source, embedding, metadata } = input;

    const warnings: ProposalWarning[] = [];
    const similar_entries: SimilarEntry[] = [];

    // 1. Check for sanitization issues (detect, don't block)
    const sanitizationResult = sanitizeContent(title, content);
    if (!sanitizationResult.allowed && sanitizationResult.violations) {
        for (const violation of sanitizationResult.violations) {
            warnings.push({
                type: "sanitization",
                severity: "high",
                message: `Detected ${violation.category}: ${violation.message}`,
                details: {
                    category: violation.category,
                    matches: violation.matches.slice(0, 3),
                },
            });
        }
    }

    // 2. Check for similar entries (detect, don't block)
    if (embedding && embedding.length > 0) {
        const similar = await searchKnowledgeVector(embedding, 3, type);
        for (const entry of similar) {
            if (entry.embedding_score && entry.embedding_score > 0.85) {
                similar_entries.push({
                    id: entry.id,
                    title: entry.title,
                    type: entry.type,
                    similarity_score: entry.embedding_score,
                    created_at: entry.created_at,
                });

                if (entry.embedding_score > 0.92) {
                    warnings.push({
                        type: "similarity",
                        severity: "high",
                        message: `Very similar entry found: "${entry.title}" (${Math.round(entry.embedding_score * 100)}% match)`,
                        details: {
                            existing_id: entry.id,
                            existing_title: entry.title,
                            similarity: entry.embedding_score,
                        },
                    });
                } else if (entry.embedding_score > 0.85) {
                    warnings.push({
                        type: "similarity",
                        severity: "medium",
                        message: `Similar entry found: "${entry.title}" (${Math.round(entry.embedding_score * 100)}% match)`,
                        details: {
                            existing_id: entry.id,
                            existing_title: entry.title,
                            similarity: entry.embedding_score,
                        },
                    });
                }
            }
        }
    }

    // 3. Create proposal
    const proposal_id = new ObjectId().toString();
    const now = new Date();
    const expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const proposal: KnowledgeProposal = {
        proposal_id,
        type: "knowledge",
        suggested_data: {
            type,
            title,
            content,
            tags,
            source,
            embedding,
            metadata,
        },
        warnings,
        similar_entries,
        created_at: now.toISOString(),
        expires_at: expires_at.toISOString(),
        status: "pending",
    };

    proposalsStore.set(proposal_id, proposal);

    // 4. Build user-friendly question
    let question = "¿Quieres guardar este conocimiento?";
    if (warnings.length > 0) {
        question = `Detecté ${warnings.length} advertencia(s). ¿Aún así quieres guardarlo?`;
    }

    return {
        proposal_id,
        suggested_type: type,
        title,
        content,
        tags,
        warnings,
        similar_entries,
        question,
        expires_in_hours: 24,
    };
}

/**
 * Confirm a proposal and store the knowledge
 */
export async function confirmProposal(
    proposal_id: string,
    modifications?: Partial<CreateKnowledgeInput>
): Promise<{ id: string; message: string }> {
    const proposal = proposalsStore.get(proposal_id);

    if (!proposal) {
        throw new Error("Proposal not found or expired");
    }

    if (proposal.status !== "pending") {
        throw new Error(`Proposal already ${proposal.status}`);
    }

    // Check if expired
    if (new Date() > new Date(proposal.expires_at)) {
        proposalsStore.delete(proposal_id);
        throw new Error("Proposal expired");
    }

    // Merge modifications with original data
    const finalData = {
        ...proposal.suggested_data,
        ...modifications,
    };

    // Store the knowledge (bypass deduplication and sanitization checks)
    const collection = getKnowledgeEntriesCollection();
    const now = new Date().toISOString();

    const doc = {
        type: finalData.type,
        title: finalData.title.trim(),
        content: finalData.content.trim(),
        tags: finalData.tags || [],
        source: finalData.source,
        metadata: finalData.metadata,
        visibility: "private" as const,
        embedding: finalData.embedding || [],
        created_at: now,
        updated_at: now,
    };

    const result = await collection.insertOne(doc);

    // Update proposal status
    proposal.status = "confirmed";
    proposalsStore.set(proposal_id, proposal);

    // Clean up after 1 hour
    setTimeout(() => proposalsStore.delete(proposal_id), 60 * 60 * 1000);

    return {
        id: result.insertedId.toString(),
        message: "Knowledge stored successfully",
    };
}

/**
 * Reject a proposal
 */
export async function rejectProposal(
    proposal_id: string,
    reason?: string
): Promise<{ message: string }> {
    const proposal = proposalsStore.get(proposal_id);

    if (!proposal) {
        throw new Error("Proposal not found or expired");
    }

    if (proposal.status !== "pending") {
        throw new Error(`Proposal already ${proposal.status}`);
    }

    // Update proposal status
    proposal.status = "rejected";
    proposalsStore.set(proposal_id, proposal);

    // Clean up after 1 hour
    setTimeout(() => proposalsStore.delete(proposal_id), 60 * 60 * 1000);

    return {
        message: reason
            ? `Proposal rejected: ${reason}`
            : "Proposal rejected successfully",
    };
}

/**
 * Get a proposal by ID
 */
export async function getProposal(
    proposal_id: string
): Promise<KnowledgeProposal | null> {
    const proposal = proposalsStore.get(proposal_id);

    if (!proposal) {
        return null;
    }

    // Check if expired
    if (new Date() > new Date(proposal.expires_at)) {
        proposalsStore.delete(proposal_id);
        return null;
    }

    return proposal;
}

/**
 * Clean up expired proposals (run periodically)
 */
export function cleanupExpiredProposals(): void {
    const now = new Date();
    for (const [id, proposal] of proposalsStore.entries()) {
        if (now > new Date(proposal.expires_at)) {
            proposalsStore.delete(id);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredProposals, 60 * 60 * 1000);
