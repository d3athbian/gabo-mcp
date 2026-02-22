import { getKnowledgeAuditLogCollection } from '../../db/client.js';
import { successResponse } from '../../utils/tool-handler/index.js';
import { AuditToolNames } from '../audit.constants.js';
import type { ToolDefinition } from '../index.type.js';
import type { GetAuditLogsArgs } from './get-audit-logs.type.ts';
import { GetAuditLogsSchema } from './get-audit-logs.type.ts';

export const getAuditLogsTool: ToolDefinition<GetAuditLogsArgs> = {
  name: AuditToolNames.GET_AUDIT_LOGS,
  title: AuditToolNames.GET_AUDIT_LOGS_TITLE,
  description: 'Retrieve recent security audit logs.',
  inputSchema: GetAuditLogsSchema,
  handler: async (args) => {
    const { limit, offset, action } = args;
    const collection = getKnowledgeAuditLogCollection();

    const query: any = {};
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
