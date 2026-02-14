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
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Firebase Firestore based logging
export async function logDownload(name: string) {
    try {
        const logsRef = db.collection('logs');
        const statsRef = logsRef.doc('stats');
        const entriesRef = logsRef.doc('entries');

        // Create log entry
        const entry = {
            name: name || 'Anonymous',
            timestamp: new Date().toISOString(),
            timestampMillis: Date.now()
        };

        // Batch write for atomic operation
        const batch = db.batch();

        // Increment total count
        batch.set(statsRef, {
            total: FieldValue.increment(1),
            lastUpdated: FieldValue.serverTimestamp()
        }, { merge: true });

        // Add entry to entries array
        batch.set(entriesRef, {
            data: FieldValue.arrayUnion(entry)
        }, { merge: true });

        await batch.commit();

        return { success: true };
    } catch (error) {
        console.error("Error logging download:", error);
        return { success: false };
    }
}

export async function getLogs() {
    try {
        const logsRef = db.collection('logs');

        // Get total count
        const statsDoc = await logsRef.doc('stats').get();
        const total = statsDoc.exists ? (statsDoc.data()?.total || 0) : 0;

        // Get entries
        const entriesDoc = await logsRef.doc('entries').get();
        const entries = entriesDoc.exists ? (entriesDoc.data()?.data || []) : [];

        // Sort by timestamp (newest first)
        const sortedEntries = entries.sort((a: any, b: any) =>
            (b.timestampMillis || 0) - (a.timestampMillis || 0)
        );

        return {
            total: Number(total),
            entries: sortedEntries
        };
    } catch (error) {
        console.error("Error getting logs:", error);
        return { total: 0, entries: [] };
    }
}

