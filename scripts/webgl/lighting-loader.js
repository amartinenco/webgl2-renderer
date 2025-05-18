import { ShaderType, LightType } from "./utils/constants.js";

export class LightObjectDefinition {
    constructor(name, type, shaderProgram, position, direction = [], color = [], intensity) {
        this.name = name;
        this.type = type;
        this.shaderProgram = shaderProgram;
        this.position = position;
        this.direction = direction;
        this.color = color;
        this.intensity = intensity
    }
};

export class LightingLoader {
    constructor(lightingManager, shaderManager) {
        this.lightingManager = lightingManager;
        this.shaderManager = shaderManager;
    }

    async loadLights() {
        let shaderProgram = this.shaderManager.getShader(ShaderType.THREE_D);
        const directionalLightDefinition = new LightObjectDefinition("directional", LightType.DIRECTIONAL, shaderProgram, null, [1, -1, 0]);
        this.lightingManager.addLight(directionalLightDefinition);
    }
}