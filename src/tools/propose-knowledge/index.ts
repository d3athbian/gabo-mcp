/**
 * Propose Knowledge Tool
 * Creates a proposal for storing knowledge (never stores directly)
 * Always asks user for confirmation
 */

import { successResponse } from "../../utils/tool-handler/index.js";
import { createProposal } from "../../db/proposals/index.js";
import { ProposeKnowledgeSchema } from "../../schemas/proposals.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { ProposeKnowledgeArgs } from "../../schemas/proposals.schema.js";

export const proposeKnowledgeTool: ToolDefinition<ProposeKnowledgeArgs> = {
    name: "propose_knowledge",
    title: "Propose Knowledge",
    description:
        "Propose storing knowledge. This tool NEVER stores directly - it creates a proposal that requires user confirmation via confirm_knowledge. Use this instead of store_knowledge.",
    inputSchema: ProposeKnowledgeSchema,
    handler: async (args) => {
        const { type, title, content, tags, source, embedding, metadata } = args;

        const proposal = await createProposal({
            type,
            title,
            content,
            tags,
            source,
            embedding,
            metadata,
        });

        // Format warnings for display
        const warningsText =
            proposal.warnings.length > 0
                ? `\n\n⚠️ WARNINGS:\n${proposal.warnings
                    .map(
                        (w) =>
                            `  ${w.severity === "high" ? "🔴" : "🟡"} ${w.type.toUpperCase()}: ${w.message}`
                    )
                    .join("\n")}`
                : "";

        // Format similar entries for display
        const similarText =
            proposal.similar_entries.length > 0
                ? `\n\n🔍 SIMILAR ENTRIES FOUND:\n${proposal.similar_entries
                    .map(
                        (e) =>
                            `  - "${e.title}" (${e.type}) - ${Math.round((e.similarity_score || 0) * 100)}% match [ID: ${e.id}]`
                    )
                    .join("\n")}`
                : "";

        const message = `📋 KNOWLEDGE PROPOSAL CREATED

Proposal ID: ${proposal.proposal_id}
Type: ${proposal.suggested_type}
Title: "${proposal.title}"
${warningsText}${similarText}

❓ ${proposal.question}

To confirm: Use confirm_knowledge with proposal_id="${proposal.proposal_id}"
To reject: Use reject_knowledge with proposal_id="${proposal.proposal_id}"

⏰ This proposal expires in ${proposal.expires_in_hours} hours.`;

        return successResponse({
            proposal_id: proposal.proposal_id,
            suggested_type: proposal.suggested_type,
            title: proposal.title,
            warnings: proposal.warnings,
            similar_entries: proposal.similar_entries,
            question: proposal.question,
            expires_in_hours: proposal.expires_in_hours,
            message,
        });
    },
};
