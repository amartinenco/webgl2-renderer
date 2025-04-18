import { Object3D } from './object.js';
import { warnLog, debugLog } from '../logger/logger.js';

export class ObjectManager {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.loadedObjects = {};
    }

    loadObject(id, vertices) {
        if (this.loadedObjects[id]) {
            warnLog(`Object with id '${id}' already exists.`);
            return null;
        }
        this.loadedObjects[id] = new Object3D(this.gl, vertices, this.shaderProgram);
        debugLog(`Loaded: ${id}`);
        return this.loadedObjects[id];
    }

    getObject(id) {
       return this.loadedObjects[id] || null; 
    }

    removeObject(id) {
        if (this.loadedObjects[id]) {
            const obj = this.loadedObjects[id];
            if (obj.vertextBuffer) {
                this.gl.deleteBuffer(obj.vertextBuffer);
            }

            delete this.loadedObjects[id];
        } else {
            warnLog(`Object with id ${id} not found`);
        }
    }

    getAllObjects() {
        return this.loadedObjects;
    }
}
