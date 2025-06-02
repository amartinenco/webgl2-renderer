import { ShaderType, LightType } from "./utils/constants.js";

export class LightObjectDefinition {
    constructor(name, type, shaderProgram, position, direction = [], color = [], specularColor, intensity) {
        this.name = name;
        this.type = type;
        this.shaderProgram = shaderProgram;
        this.position = position;
        this.direction = direction;
        this.color = color; // rgb01
        this.specularColor = specularColor; // rgb01
        this.intensity = intensity;
    }
};

export class LightingLoader {
    constructor(lightingManager, shaderManager) {
        this.lightingManager = lightingManager;
        this.shaderManager = shaderManager;
    }

    async loadLights() {
        let shaderProgram = this.shaderManager.getShader(ShaderType.THREE_D);

        //const directionalLightDefinition = new LightObjectDefinition("directional", LightType.DIRECTIONAL, shaderProgram, null, [0.5, 0.7, 1]);
        const pointLightDefinition = new LightObjectDefinition("point", LightType.POINT, shaderProgram, [110, -75, -15], null, null, [1, 1, 1], 50.0);
        //const pointLightDefinition = new LightObjectDefinition("point", LightType.POINT, shaderProgram, [20, 30, 60]);
    
        //this.lightingManager.addLight(directionalLightDefinition);
        this.lightingManager.addLight(pointLightDefinition);
    }
}