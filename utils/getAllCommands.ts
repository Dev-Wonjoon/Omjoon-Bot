import fs from 'fs';
import path from 'path';

export function getAllCommandfiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? getAllCommandfiles(fullPath) : [fullPath];
    }).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
}