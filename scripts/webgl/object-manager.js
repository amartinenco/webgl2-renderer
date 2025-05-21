import { Object3D, Object2D, ObjectUI } from './object.js';
import { warnLog, debugLog } from '../logger/logger.js';
import { ObjectType, ShaderType } from './utils/constants.js';

export class ObjectManager {
    constructor(gl) {
        this.gl = gl;
        this.loadedObjects = {};
    }

    loadObject(objectDefinition) {
        if (!objectDefinition) {
            return null;
        }

        const id = objectDefinition.name;
        const type = objectDefinition.type;

        if (this.loadedObjects[id]) {
            warnLog(`Object with id '${id}' already exists.`);
            return null;
        }

        const objectMapping = {
            [ObjectType.UI]: ObjectUI,
            [ObjectType.TWO_D]: Object2D,
            [ObjectType.THREE_D]: Object3D
        };
     
        if (!objectMapping[type]) {
            warnLog(`Invalid object type: ${type}`);
            return null;
        }

        this.loadedObjects[id] = new objectMapping[type](this.gl, objectDefinition);
        debugLog(`Loaded [${type}]: ${id}`);
        return this.loadedObjects[id];
    }

    getObject(id) {
       return this.loadedObjects[id] || null; 
    }

    removeObject(id) {
        if (this.loadedObjects[id]) {
            const obj = this.loadedObjects[id];
            obj.destroy();
            // if (obj.vertexBuffer) {
            //     this.gl.deleteBuffer(obj.vertexBuffer);
            // }

            delete this.loadedObjects[id];
        } else {
            warnLog(`Object with id ${id} not found`);
        }
    }

    getAllObjects() {
        return Object.values(this.loadedObjects);
    }
}
