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
const logPath = path.join(process.cwd(), 'src', 'app', 'logs.json');

export async function logDownload(name: string) {
    try {
        let logs = { total: 0, entries: [] as any[] };
        try {
            const data = await fs.readFile(logPath, 'utf8');
            logs = JSON.parse(data);
        } catch (e) {
            // File doesn't exist yet, use default
        }

        logs.total += 1;
        logs.entries.push({
            name: name || 'Anonymous',
            timestamp: new Date().toISOString()
        });

        // Limit entries to last 1000 to keep file size reasonable, or keep all
        await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
        return { success: true };
    } catch (error) {
        console.error("Error logging download:", error);
        return { success: false };
    }
}

export async function getLogs() {
    try {
        const data = await fs.readFile(logPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { total: 0, entries: [] };
    }
}
