/**
 * Reject Proposal Tool
 * Rejects a knowledge proposal without storing it
 */

import { successResponse } from "../../utils/tool-handler/index.js";
import { rejectProposal } from "../../db/proposals/index.js";
import { RejectProposalSchema } from "../../schemas/proposals.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { RejectProposalArgs } from "../../schemas/proposals.schema.js";

export const rejectKnowledgeTool: ToolDefinition<RejectProposalArgs> = {
    name: "reject_knowledge",
    title: "Reject Knowledge Proposal",
    description:
        "Reject a knowledge proposal without storing it. Optionally provide a reason for rejection.",
    inputSchema: RejectProposalSchema,
    handler: async (args) => {
        const { proposal_id, reason } = args;

        const result = await rejectProposal(proposal_id, reason);

        return successResponse({
            message: `❌ ${result.message}`,
            proposal_id,
        });
    },
};
