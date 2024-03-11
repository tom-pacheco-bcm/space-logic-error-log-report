
import fs from "fs"

export function readJson(filename: string) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}
