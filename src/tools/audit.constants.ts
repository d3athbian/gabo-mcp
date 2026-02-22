export const AuditToolNames = {
  GET_AUDIT_LOGS: "get_audit_logs",
  GET_AUDIT_LOGS_TITLE: "Get Audit Logs",
} as const;

export type AuditToolName =
  (typeof AuditToolNames)[keyof typeof AuditToolNames];
