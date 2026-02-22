import { MongoClient } from 'mongodb';
import { join, dirname } from 'node:path';
import { createWriteStream, existsSync, readdirSync, rmSync, statSync, renameSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import { BACKUP_CONFIG, BACKUP_FLAGS, BACKUP_PATHS } from './backup.constants.js';
import type { BackupFolderInfo } from './backup.type.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const FORCE = process.argv.includes(BACKUP_FLAGS.FORCE);

/**
 * Main backup execution logic
 */
async function runBackup(): Promise<void> {
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const basePath = BACKUP_PATHS.getBasename();
    const backupFolder = join(basePath, dateStr);
    const oldFolder = `${backupFolder}.old`;

    // 1. Check if daily backup already exists
    if (existsSync(backupFolder)) {
        if (!FORCE) {
            console.log(`[Backup] Daily backup for ${dateStr} already exists. Skipping.`);
            process.exit(0);
        }

        // If forcing, rotate the existing today's backup to .old
        console.log(`[Backup] Forcing update. Moving existing backup to ${dateStr}.old`);
        if (existsSync(oldFolder)) {
            rmSync(oldFolder, { recursive: true, force: true });
        }
        renameSync(backupFolder, oldFolder);
    }

    console.log(`[Backup] Starting backup for ${dateStr}...`);

    if (!MONGODB_URI) {
        console.error('[Backup] MONGODB_URI is not defined in .env');
        process.exit(1);
    }

    const client = await connectWithRetry();
    if (!client) process.exit(1);

    try {
        const db = client.db();
        const collections = await db.listCollections().toArray();
        await mkdir(backupFolder, { recursive: true });

        for (const collInfo of collections) {
            await exportCollection(db, collInfo.name, backupFolder);
        }

        console.log(`[Backup] SUCCESS: Data saved to ${backupFolder}`);

        // 4. Rotation: Keep only the 2 most recent folders
        pruneBackups(basePath);

    } catch (error) {
        console.error('[Backup] FATAL ERROR during backup:', error);
    } finally {
        await client.close();
    }
}

/**
 * Connects to MongoDB with retry logic
 */
async function connectWithRetry(): Promise<MongoClient | null> {
    for (let i = 1; i <= BACKUP_CONFIG.MAX_RETRIES; i++) {
        try {
            console.log(`[Backup] Connecting (Attempt ${i}/${BACKUP_CONFIG.MAX_RETRIES})...`);
            const client = new MongoClient(MONGODB_URI!, {
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 20000
            });
            await client.connect();
            await client.db().command({ ping: 1 });
            return client;
        } catch (error: any) {
            console.warn(`[Backup] Attempt ${i} failed: ${error.message}`);
            if (i < BACKUP_CONFIG.MAX_RETRIES) {
                await new Promise(r => setTimeout(r, BACKUP_CONFIG.RETRY_DELAY_MS));
            }
        }
    }
    console.error('[Backup] Could not establish connection. Database might be down.');
    return null;
}

/**
 * Exports a single collection to a JSON file
 */
async function exportCollection(db: any, collName: string, folder: string): Promise<void> {
    const filePath = join(folder, `${collName}.json`);
    const fileStream = createWriteStream(filePath);
    const cursor = db.collection(collName).find();

    fileStream.write('[\n');
    let first = true;

    for await (const doc of cursor) {
        if (!first) fileStream.write(',\n');
        fileStream.write('  ' + JSON.stringify(doc));
        first = false;
    }

    fileStream.write('\n]');
    fileStream.end();

    return new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
}

/**
 * Prunes old backups keeping only the most recent ones
 */
function pruneBackups(basePath: string): void {
    try {
        if (!existsSync(basePath)) return;

        const folders: BackupFolderInfo[] = readdirSync(basePath)
            .map(f => ({ name: f, path: join(basePath, f), time: statSync(join(basePath, f)).mtimeMs }))
            .sort((a, b) => b.time - a.time); // Newest first

        if (folders.length > BACKUP_CONFIG.KEEP_BACKUPS) {
            const foldersToDelete = folders.slice(BACKUP_CONFIG.KEEP_BACKUPS);
            console.log(`[Backup] Rotation: Keeping ${BACKUP_CONFIG.KEEP_BACKUPS} most recent folders.`);

            for (const folder of foldersToDelete) {
                console.log(`[Backup] Removing old backup: ${folder.name}`);
                rmSync(folder.path, { recursive: true, force: true });
            }
        }
    } catch (err) {
        console.error('[Backup] Error during rotation:', err);
    }
}

runBackup().catch(console.error);
