import { Object3D, Object2D } from './object.js';
import { warnLog, debugLog } from '../logger/logger.js';
import { ObjectType } from '../utils/constants.js';

export class ObjectManager {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.loadedObjects = {};
    }

    loadObject(id, vertices, type = ObjectType.THREE_D) {
        if (this.loadedObjects[id]) {
            warnLog(`Object with id '${id}' already exists.`);
            return null;
        }

        if (type === ObjectType.TWO_D) {
            this.loadedObjects[id] = new Object2D(this.gl, vertices, this.shaderProgram);
        } else {
            this.loadedObjects[id] = new Object3D(this.gl, vertices, this.shaderProgram);
        }

        debugLog(`Loaded [${type}]: ${id}`);
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
