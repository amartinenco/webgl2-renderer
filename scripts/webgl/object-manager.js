import { Object3D, Object2D, ObjectUI } from './object.js';
import { warnLog, debugLog } from '../logger/logger.js';
import { ObjectType, ShaderType } from './utils/constants.js';


export class ObjectManager {
    constructor(gl, shaderManager) {
        this.gl = gl;
        this.shaderManager = shaderManager;
        this.loadedObjects = {};
    }

    loadObject(id, vertices, type = ObjectType.THREE_D) {
        if (this.loadedObjects[id]) {
            warnLog(`Object with id '${id}' already exists.`);
            return null;
        }
      
        const shaderMapping = {
            [ObjectType.UI]: ShaderType.UI,
            [ObjectType.TWO_D]: ShaderType.THREE_D, // switch to TWO_D later
            [ObjectType.THREE_D]: ShaderType.THREE_D
        };

        const objectMapping = {
            [ObjectType.UI]: ObjectUI,
            [ObjectType.TWO_D]: Object2D,
            [ObjectType.THREE_D]: Object3D
        };

        if (!shaderMapping[type] || !objectMapping[type]) {
            warnLog(`Invalid object type: ${type}`);
            return null;
        }

        let shaderName = shaderMapping[type];
        let shaderProgram = this.shaderManager.getShader(shaderName);
        if (!shaderProgram) {
            warnLog(`Shader program not found for object type ${type}: ${shaderName}`);
            return null;
        }

        this.loadedObjects[id] = new objectMapping[type](this.gl, vertices, shaderProgram);

        debugLog(`Loaded [${type}]: ${id}`);
        return this.loadedObjects[id];
    }

    getObject(id) {
       return this.loadedObjects[id] || null; 
    }

    removeObject(id) {
        if (this.loadedObjects[id]) {
            const obj = this.loadedObjects[id];
            if (obj.vertexBuffer) {
                this.gl.deleteBuffer(obj.vertexBuffer);
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
