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
            content: { x: 380, y: 60, width: 480, height: 380 }
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
