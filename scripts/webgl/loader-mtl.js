import { errorLog } from '../logger/logger.js';

export class MtlFile {
    constructor() {
        this.materials = {};
    }
};

export class LoaderMtl {

    static async load(url) {
        const mtl = new MtlFile();

        try {
            const response = await fetch(url);
            if (!response.ok) {
                errorLog(`Failed to fetch .mtl material from ${url}`);
                return mtl;
            }
            
            const text = await response.text();
            this.parse(text, mtl);
            return mtl;
        } catch (error) {
            errorLog(`Error loading .mtl material: ${error.message}`);
            return null;
        }
    }

    static parse(text, mtl) {
        let current = null;

        for (const line of text.split("\n")) {
            const parts = line.trim().split(/\s+/);

            if (parts[0] === "newmtl") {
                current = parts[1];
                mtl.materials[current] = {};
            }

            if (parts[0] === "Kd" && current) {
                mtl.materials[current].diffuse = [
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ];
            }

            if (parts[0] === "map_Kd" && current) { 
                mtl.materials[current].texture = parts[1]; 
            }
        }
    }
}