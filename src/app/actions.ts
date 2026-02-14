'use server';

import fs from 'fs/promises';
import path from 'path';

const configPath = path.join(process.cwd(), 'src', 'app', 'layout-config.json');

export async function getLayoutConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading config:", error);
        // Return default if file fails
        return {
            avatar: { x: 60, y: 140, width: 220, height: 220 },
            name: { x: 40, y: 400 },
            position: { x: 40, y: 435 },
            content: { x: 380, y: 60, width: 480, height: 380 },
            textColor: '#000000'
        };
    }
}

export async function saveLayoutConfig(newConfig: any) {
    try {
        await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
        return { success: true };
    } catch (error) {
        console.error("Error saving config:", error);
        return { success: false, error: 'Failed to save configuration' };
    }
}

export async function uploadBackgroundImage(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error("No file received");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to public folder
        const filePath = path.join(process.cwd(), 'public', 'background_landscape.png');
        await fs.writeFile(filePath, buffer);

        return { success: true };
    } catch (error) {
        console.error("Error saving background:", error);
        return { success: false, error: 'Failed to upload background' };
    }
}
import { kv } from '@vercel/kv';

// Vercel KV based logging
export async function logDownload(name: string) {
    try {
        // Get current total count (atomic increment)
        const total = await kv.incr('download:total');

        // Create log entry
        const entry = {
            name: name || 'Anonymous',
            timestamp: new Date().toISOString()
        };

        // Add to entries list (using sorted set with timestamp as score for easy retrieval)
        await kv.zadd('download:entries', {
            score: Date.now(),
            member: JSON.stringify(entry)
        });

        return { success: true };
    } catch (error) {
        console.error("Error logging download:", error);
        return { success: false };
    }
}

export async function getLogs() {
    try {
        // Get total count
        const total = await kv.get('download:total') || 0;

        // Get all entries (sorted by timestamp, newest first)
        const entries = await kv.zrange('download:entries', 0, -1, { rev: true });

        // Parse entries
        const parsedEntries = entries.map((entry: any) => JSON.parse(entry));

        return {
            total: Number(total),
            entries: parsedEntries
        };
    } catch (error) {
        console.error("Error getting logs:", error);
        return { total: 0, entries: [] };
    }
}
