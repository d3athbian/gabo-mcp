export type AuditAction =
    | "auth_success"
    | "auth_failed"
    | "search_knowledge"
    | "list_knowledge"
    | "get_knowledge"
    | "store_knowledge"
    | "delete_knowledge"
    | "key_created"
    | "key_rotated"
    | "key_revoked";

export type AuditLogEntry = {
    key_id?: string;          // Opcional en fallos de auth antes de identificar la key
    action: AuditAction;
    timestamp: Date;
    ip?: string;
    user_agent?: string;
    success: boolean;
    metadata?: Record<string, any>;
};
