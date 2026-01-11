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
            //.setDirection([0.5, 0.7, 1])
            .setDirection([0, -1, -1])
            .setColor([1, 1, 1])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setRotation({ x: 0, y: 0 })
            .setLightIntensity(2)
            .setInnerLimit(5)
            .setOuterLimit(30) //30
        
        const pointLightDefinition = new LightObjectDefinition.Builder()
            .setName("point")
            .setType(LightType.POINT)
            .setShaderProgram(shaderProgram)
            .setPosition([110, -75, -15])
            .setSpecularColor([1, 1, 1])
            //.setSpecularIntensity(11)
            .setLightIntensity(0.5) // 0 to 1
            .build();

        const plSquareDefinition = new LightObjectDefinition.Builder()
            .setName("pl_square")
            .setType(LightType.POINT)
            .setShaderProgram(shaderProgram)
            .setPosition([10, 10, 10])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setLightIntensity(1000.0)
            .build();

        const spotLightDefinition = new LightObjectDefinition.Builder()
            .setName("spot")
            .setType(LightType.SPOT)
            .setShaderProgram(shaderProgram)
            //.setPosition([110, -75, -15])
            //.setPosition([310, 0, 0])
            //.setPosition([310, 0, 0])
            
            
            .setPosition([-150, 15, 150]) // good position
            //.setDirection([0.832, 0, -0.555]) // to computer
            //.setDirection([0.832,-0.539, -0.809])

            //.setPosition([0, 200, 0])
            //.setDirection([0.154, -0.976, 0.154])
            //.setPosition([30, 200, 30]) 
            //.setPosition([30, 75, 30])
            //.setDirection([0, -1, 0])
            
            .setDirection([0.836, -0.539, -0.309]) // to ground
            .setColor([1, 1, 1])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setRotation({ x: 0, y: 0 })
            .setLightIntensity(2)
            .setInnerLimit(5) //5
            .setOuterLimit(50) // 50
            .build();
            
        //this.lightingManager.addLight(directionalLightDefinition);
        //this.lightingManager.addLight(plSquareDefinition);
        this.lightingManager.addLight(pointLightDefinition);
        this.lightingManager.addLight(spotLightDefinition);

        const screenLightDefinition = new LightObjectDefinition.Builder()
            .setName("screen")
            .setType(LightType.SCREEN)
            .setShaderProgram(shaderProgram)
            .setPosition([30, 25, 55]) // screen center in world space
            //.setPosition([0, 0, 0])
            .setDirection([0, 0, 1]) // screen normal
            .setColor([0.0, 1.0, 0.6]) // reddish glow 1.0, 0.2, 0.2 //0.0, 1.0, 0.6 real crt
            .setLightIntensity(3) // can be dynamic later
            .build();

        this.lightingManager.addLight(screenLightDefinition);
        
    }

    /*
            const directionalLightDefinition = new LightObjectDefinition.Builder()
            .setName("directional")
            .setType(LightType.DIRECTIONAL)
            .setShaderProgram(shaderProgram)
            //.setDirection([0.5, 0.7, 1])
            .setDirection([0, -1, -1])
            .setColor([1, 1, 1])
            .setSpecularColor([1, 1, 1])
            .setSpecularIntensity(50.0)
            .setRotation({ x: 0, y: 0 })
            .setLightIntensity(2)
            .setInnerLimit(5)
            .setOuterLimit(30) //30 */
}