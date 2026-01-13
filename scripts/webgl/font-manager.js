import { errorLog, debugLog, warnLog } from '../logger/logger.js';

export class FontManager {
    constructor(gl) {
        this.gl = gl;
        this.loadedFonts = new Map(); // {name, {name: [list_of_glyps]}}
    }

    addFont(name, font) {
        if (!font) {
            return null;
        }
        this.loadedFonts.set(name, font);
        debugLog(`Loaded font ${name}`);
    }

    getFont(name) {
       return this.loadedFonts.get(name) || null;
    }

    removeFont(name) {
        if (this.loadedFonts.has(name)) { 
            this.loadedFonts.delete(name);
        } else {
            warnLog(`Font with name ${name} not found`);
        }
    }

    getAllFonts() {
        return Object.values(this.loadedFonts);
    }
}