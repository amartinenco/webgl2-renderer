import { LightType } from "./utils/constants.js";
import { warnLog } from "../logger/logger.js";
import { DirectionalLight, PointLight, SpotLight } from "./light.js";

export class LightingManager {
    constructor(gl) {
        this.gl = gl;
        this.loadedLights = {};
    }

    addLight(lightObjectDefinition) {
        if (!lightObjectDefinition) {
            return null;
        }

        const id = lightObjectDefinition.name;
        const type = lightObjectDefinition.type;

        const objectMapping = {
            [LightType.DIRECTIONAL]: DirectionalLight,
            [LightType.POINT]: PointLight,
            [LightType.SPOT]: SpotLight,
        };

        if (!objectMapping[type]) {
            warnLog(`Invalid object type: ${type}`);
            return null;
        }

        this.loadedLights[id] = new objectMapping[type](this.gl, lightObjectDefinition);
    }

    getLight(id) {
       return this.loadedLights[id] || null; 
    }

    removeLight(id) {
        if (this.loadedLights[id]) {
            delete this.loadedLights[id];
        } else {
            warnLog(`Object with id ${id} not found`);
        }
    }

    getAllLights() {
        return Object.values(this.loadedLights);
    }
}