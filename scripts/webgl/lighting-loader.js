import { ShaderType, LightType } from "./utils/constants.js";

export class LightObjectDefinition {
    constructor(builder) {
        this.name = builder.name;
        this.type = builder.type;
        this.shaderProgram = builder.shaderProgram;
        this.position = builder.position;
        this.direction = builder.direction || [0, -1, 0];
        this.color = builder.color || [1, 1, 1];
        this.specularColor = builder.specularColor || [1, 1, 1];
        this.specularIntensity = builder.specularIntensity;
        this.lightIntensity = builder.lightIntensity ?? 1.0;
        this.rotation = builder.rotation || { x: 0, y: 0 };
        this.innerLimit = builder.innerLimit ?? 5;
        this.outerLimit = builder.outerLimit ?? 30;
    }

    static get Builder() {
        class Builder {
            setName(name) { this.name = name; return this; }
            setType(type) { this.type = type; return this; }
            setShaderProgram(shaderProgram) { this.shaderProgram = shaderProgram; return this; }
            setPosition(position) { this.position = position; return this; }
            setDirection(direction) { this.direction = direction; return this; }
            setColor(color) { this.color = color; return this; }
            setSpecularColor(specularColor) { this.specularColor = specularColor; return this; }
            setSpecularIntensity(specularIntensity) { this.specularIntensity = specularIntensity; return this; }
            setLightIntensity(intensity) { this.lightIntensity = intensity; return this; }
            setRotation(rotation) { this.rotation = rotation; return this; }
            setInnerLimit(innerLimit) { this.innerLimit = innerLimit; return this; }
            setOuterLimit(outerLimit) {
                if (outerLimit == this.innerLimit)
                    this.outerLimit = outerLimit + 0.0000001; 
                return this; 
            }

            build() {
                return new LightObjectDefinition(this);
            }
        }

        return Builder;
    }
}


export class LightingLoader {
    constructor(lightingManager, shaderManager) {
        this.lightingManager = lightingManager;
        this.shaderManager = shaderManager;
    }

    async loadLights() {
        let shaderProgram = this.shaderManager.getShader(ShaderType.THREE_D);

        const directionalLightDefinition = new LightObjectDefinition.Builder()
            .setName("directional")
            .setType(LightType.DIRECTIONAL)
            .setShaderProgram(shaderProgram)
            .setDirection([0.5, 0.7, 1])
            .setColor([1, 1, 1])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setRotation({ x: 0, y: 0 })
            .setLightIntensity(2)
            .setInnerLimit(5)
            .setOuterLimit(30)
        
        const pointLightDefinition = new LightObjectDefinition.Builder()
            .setName("point")
            .setType(LightType.POINT)
            .setShaderProgram(shaderProgram)
            .setPosition([110, -75, -15])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setLightIntensity(1000.0)
            .build();

        const spotLightDefinition = new LightObjectDefinition.Builder()
            .setName("spot")
            .setType(LightType.SPOT)
            .setShaderProgram(shaderProgram)
            .setPosition([110, -75, -15])
            .setDirection([-1, 0, 0])
            .setColor([1, 1, 1])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setRotation({ x: 0, y: 0 })
            .setLightIntensity(2)
            .setInnerLimit(5)
            .setOuterLimit(30)
            .build();
            
        //this.lightingManager.addLight(directionalLightDefinition);
        this.lightingManager.addLight(pointLightDefinition);
        //this.lightingManager.addLight(spotLightDefinition);
    }
}