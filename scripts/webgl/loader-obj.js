import { errorLog } from '../logger/logger.js';

export class ObjFile {
    constructor() {
        this.positions = []; // v (position)
        this.normals = []; // vn (normal)
        this.uvs = []; // vt (uv)
        this.materialGroups = {};
    }
};

export class LoaderObj {
    constructor(){}
    
    static async load(url) {
        const obj = new ObjFile();

        try {
            const response = await fetch(url);
            if (!response.ok) {
                errorLog(`Failed to fetch .obj model from ${url}`);
                return obj;
            }
            
            const text = await response.text();
            this.parse(text, obj);
            return obj;
        } catch (error) {
            errorLog(`Error loading .obj model: ${error.message}`);
            return null;
        }
    }

    static parse(text, obj) {
        const lines = text.split('\n');
        let currentMaterial = 'default';
        obj.materialGroups[currentMaterial] = [];

        for (let line of lines) {
            line = line.trim();
            if (line === '' || line.startsWith('#')) continue; 

            const parts = line.split(/\s+/);
            const keyword = parts[0];

            switch (keyword) {
                case 'usemtl':
                    currentMaterial = parts[1];
                    if (!obj.materialGroups[currentMaterial]) {
                        obj.materialGroups[currentMaterial] = [];
                    }
                    break;
                case 'v':
                    obj.positions.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                    break;
                case 'vn':
                    obj.normals.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                    break;
                case 'vt':
                    obj.uvs.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2])
                    ]);
                    break;
                case 'f':
                    obj.materialGroups[currentMaterial].push(parts.slice(1));
                    break;
            }
        }
    }
};

