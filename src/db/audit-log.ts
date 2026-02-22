/**
 * Audit Log Database Operations
 * Handles recording of security events and tool usage.
 * Includes automatic cleanup via MongoDB TTL index.
 */

import { getKnowledgeAuditLogCollection } from "./client.js";
import type { AuditLogEntry } from "./audit-log.type.js";
import { logger } from "../utils/logger/index.js";

/**
 * Record a security or tool event.
 */
export async function recordAuditLog(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    const collection = getKnowledgeAuditLogCollection();

    const fullEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
    };

    try {
        await collection.insertOne(fullEntry);
    } catch (error) {
        logger.error("Failed to write audit log", error);
    }
}

/**
 * Ensures the audit log collection has a TTL index.
 * Logs are automatically deleted after 'days' days.
 */
export async function setupAuditLogIndex(days: number = 90): Promise<void> {
    const collection = getKnowledgeAuditLogCollection();

    try {
        // TTL index on 'timestamp' field
        const expireAfterSeconds = days * 24 * 60 * 60;

        await collection.createIndex(
            { timestamp: 1 },
            {
                expireAfterSeconds,
                name: "audit_log_ttl_index"
            }
        );

        logger.info(`   ✓ Audit Log: TTL index set to ${days} days`);
    } catch (error) {
        logger.error("Failed to setup audit log TTL index", error);
    }
}
