/**
 * Confirm Proposal Tool
 * Confirms a knowledge proposal and stores it in the database
 */

import { successResponse } from "../../utils/tool-handler/index.js";
import { confirmProposal } from "../../db/proposals/index.js";
import { ConfirmProposalSchema } from "../../schemas/proposals.schema.js";
import type { ToolDefinition } from "../index.type.js";
import type { ConfirmProposalArgs } from "../../schemas/proposals.schema.js";

export const confirmKnowledgeTool: ToolDefinition<ConfirmProposalArgs> = {
    name: "confirm_knowledge",
    title: "Confirm Knowledge Proposal",
    description:
        "Confirm a knowledge proposal and store it in the database. Optionally provide modifications to the proposed data.",
    inputSchema: ConfirmProposalSchema,
    handler: async (args) => {
        const { proposal_id, modifications } = args;

        const result = await confirmProposal(proposal_id, modifications);

        return successResponse({
            id: result.id,
            message: `✅ ${result.message}`,
            proposal_id,
        });
    },
};
