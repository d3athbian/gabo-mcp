export type BackupFolderInfo = {
    name: string;
    path: string;
    time: number;
};

export type BackupResult = {
    success: boolean;
    folder?: string;
    error?: string;
};
