export const APP_CONSTANTS = {
    SERVER_NAME: 'gabo-mcp-local',
    SERVER_VERSION: '0.1.0',
    PROCESS_TITLE: 'gabo-mcp-server',
} as const;

export const BACKUP_CONSTANTS = {
    SCRIPTS_PATH_TS: 'scripts/backup-db.ts',
    SCRIPTS_PATH_JS: 'dist/scripts/backup-db.js',
} as const;

export const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;
