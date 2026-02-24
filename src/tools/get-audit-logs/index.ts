import { AUDIT_TOOL_NAMES } from '../../config/constants.js';
import { getKnowledgeAuditLogCollection } from '../../db/client.js';
import type { MongoFilter } from '../../schemas/index.schema.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import type { ToolDefinition } from '../index.type.js';
import type { GetAuditLogsArgs } from './get-audit-logs.type.ts';
import { GetAuditLogsSchema } from './get-audit-logs.type.ts';

export const getAuditLogsTool: ToolDefinition<GetAuditLogsArgs> = {
  name: AUDIT_TOOL_NAMES.GET_AUDIT_LOGS,
  title: AUDIT_TOOL_NAMES.GET_AUDIT_LOGS_TITLE,
  description: 'Retrieve recent security audit logs.',
  inputSchema: GetAuditLogsSchema,
  handler: async (args) => {
    const { limit, offset, action } = args;
    const collection = getKnowledgeAuditLogCollection();

    const query: MongoFilter = {};
    if (action) {
      query.action = action;
    }

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(offset || 0)
      .limit(limit || 10)
      .toArray();

    const count = await collection.countDocuments(query);

    return successResponse({
      logs: logs.map((log) => ({
        ...log,
        id: log._id.toString(),
        _id: undefined,
      })),
      total: count,
    });
  },
};
