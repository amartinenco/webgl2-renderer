import { LightType } from "./utils/constants.js";
import { warnLog, debugLog } from "../logger/logger.js";
import { DirectionalLight, PointLight, SpotLight } from "./light.js";

export class LightingManager {
    constructor(gl, cameraManager) {
        this.gl = gl;
        this.loadedLights = {};

        this.camera = cameraManager.getActiveCamera();
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

        this.loadedLights[id] = new objectMapping[type](this.gl, lightObjectDefinition, this.camera);
        debugLog(`Loaded Light [${type}]: ${id}`);
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

    updateLightMatrices() {
        for (const light of Object.values(this.loadedLights)) {
            if (typeof light.updateMatrices === "function") {
                light.updateMatrices();
            }
        }
    }
}