import { errorLog, debugLog } from '../logger/logger.js';

const isLocal = window.location.hostname === "localhost";
const FILE_PATH = isLocal ? "./scripts/shapes" : `${window.location.origin}/scripts/shapes`;

export class Glyph {
    constructor({
        id,
        u0, v0, u1, v1,
        width, height,
        xoffset, yoffset,
        xadvance
    }) {
        this.id = id;
        this.u0 = u0;
        this.v0 = v0;
        this.u1 = u1;
        this.v1 = v1;

        this.width = width;
        this.height = height;

        this.xoffset = xoffset;
        this.yoffset = yoffset;
        this.xadvance = xadvance;
    }
}


export class Font {
    constructor() {
        this.texture = null;
        this.lineHeight = 0;
        this.scaleW = 0;
        this.scaleH = 0;
        this.glyphs = new Map();
    }

    getGlyph(charCode) {
        return this.glyphs.get(charCode);
    }
}


export class FontLoader {
    
    constructor(fontManager, textureLoader) { 
        this.fontManager = fontManager;
        this.textureLoader = textureLoader;

        this.fontPath = FILE_PATH;
    }

    async loadAllFonts() {
        const fonts = [
                {   
                    name: "default", 
                    fnt: `${this.fontPath}/font5.fnt`, 
                    png: `${this.fontPath}/font5.png` 
                }
            ];
        
        for (const f of fonts) {
            const font = await this.loadFont(f.name, f.fnt, f.png);
            this.fontManager.addFont(f.name, font);
        }
    }

    async loadFont(name, fntUrl, pngUrl) { 
        const font = new Font();
        font.texture = await this.textureLoader.loadTexture(name, pngUrl);
        const response = await fetch(fntUrl); 
        const text = await response.text();
        this.parseFnt(text, font);
        return font; 
    }

    parseFnt(text, font) { 
        const lines = text.split('\n'); 
        for (const line of lines) { 
            if (line.startsWith("common")) { 
                font.lineHeight = this._getValue(line, "lineHeight"); 
                font.scaleW = this._getValue(line, "scaleW"); 
                font.scaleH = this._getValue(line, "scaleH"); } 
                if (line.startsWith("char id=")) {
                    const id = this._getValue(line, "id"); 
                    const x = this._getValue(line, "x"); 
                    const y = this._getValue(line, "y"); 
                    const width = this._getValue(line, "width"); 
                    const height = this._getValue(line, "height"); 
                    const xoffset = this._getValue(line, "xoffset"); 
                    const yoffset = this._getValue(line, "yoffset"); 
                    const xadvance = this._getValue(line, "xadvance");
                    const glyph = new Glyph(
                        { 
                          id, 
                          u0: x / font.scaleW, 
                          v0: y / font.scaleH, 
                          u1: (x + width) / font.scaleW, 
                          v1: (y + height) / font.scaleH, 
                          width, 
                          height, 
                          xoffset, 
                          yoffset, 
                          xadvance 
                        }
                    ); 
                    font.glyphs.set(id, glyph); 
                } 
            } 
        }

        _getValue(line, key) { 
            const match = line.match(new RegExp(`${key}=(-?\\d+)`));
            return match ? parseInt(match[1]) : 0; 
        }
};