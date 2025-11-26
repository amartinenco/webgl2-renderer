import { triangleVertices, triangleVerticesUITest } from '../shapes/triangle.js';
import { squareVertices, squareNormals } from '../shapes/square.js';
import { fVertices, fNormals, fColors, fTextureCoords } from '../shapes/3df.js';
import { ObjectType, ShaderType } from './utils/constants.js';
import { errorLog } from '../logger/logger.js';
import { TextureFactory } from './texture-factory.js';

export class GameObjectDefinition {
    constructor(builder) {
        this.name = builder.name;
        this.type = builder.type;
        this.shaderProgram = builder.shaderProgram;
        this.position = builder.position ?? [0, 0, 0];
        this.vertices = builder.vertices ?? [];
        this.normals = builder.normals ?? [];
        this.colors = builder.colors ?? [];
        this.indices = builder.indices ?? [];
        this.uvCoords = builder.uvCoords ?? [];
        this.material = builder.material ?? null;
        this.meshes = builder.meshes ?? [];
        this.animations = builder.animations ?? [];
        this.texture = builder.texture ?? null;
        this.rotation = builder.rotation || { x: 0, y: 0 };
        this.outputTarget = builder.outputTarget || null;
    }

    static get Builder() {
        class Builder {
            setName(name) { this.name = name; return this; }
            setType(type) { this.type = type; return this; }
            setShaderProgram(shaderProgram) { this.shaderProgram = shaderProgram; return this; }
            setPosition(position) { this.position = position; return this; }
            setVertices(vertices) { this.vertices = vertices; return this; }
            setNormals(normals) { this.normals = normals; return this; }
            setColors(colors) { this.colors = colors; return this; }
            setIndices(indices) { this.indices = indices; return this; }
            setUVCoords(uvCoords) { this.uvCoords = uvCoords; return this; }
            setMaterial(material) { this.material = material; return this; }
            setMeshes(meshes) { this.meshes = meshes; return this; }
            setAnimations(animations) { this.animations = animations; return this; }
            setTexture(texture) { this.texture = texture; return this; }
            setRotation(rotation) { this.rotation = rotation; return this; }
            setOutputTarget(targetName) { this.outputTarget = targetName; return this; }

            build() {
                return new GameObjectDefinition(this);
            }
        }
        return Builder;
    }
}

export class ObjectLoader {
    constructor(objectManager, shaderManager, textureManager) {
        this.objectManager = objectManager; 
        this.shaderManager = shaderManager;
        this.textureManager = textureManager;
    }

    async loadGameObjects() {
        const shaderThreeD = this.shaderManager.getShader(ShaderType.THREE_D);
        const shaderUI = this.shaderManager.getShader(ShaderType.UI);
        const shaderRTT = this.shaderManager.getShader(ShaderType.RTT);
        const squareRT = this.textureManager.getRenderTarget("square");
  
        const square = new GameObjectDefinition.Builder()
            .setName("square")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderRTT)
            .setPosition([-150, -150, 0])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 45 })
            //.setIsRenderToTarget(true)
            .setOutputTarget("screen")
            .setUVCoords(new Float32Array([
                0.0, 0.0,  // vertex 0
                1.0, 0.0,  // vertex 1
                0.5, 1.0   // vertex 2
            ]))
            //.setTexture(squareRT.texture)  -- 
            .build();
        //square.setTexture(textureManager.getRenderTarget("square").texture);

        const triangle = new GameObjectDefinition.Builder()
            .setName("triangle")
            .setType(ObjectType.UI)
            .setShaderProgram(shaderUI)
            .setVertices(triangleVerticesUITest)
            .build();

        const triangle2d = new GameObjectDefinition.Builder()
            .setName("triangle2d")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([110, -75, -15])
            .setVertices(triangleVertices)
            .setOutputTarget("screen")  // test target
            .build();

        // const test = new GameObjectDefinition.Builder()
        //     .setName("triangleTest")
        //     .setType(ObjectType.TWO_D)
        //     .setShaderProgram(shaderThreeD)
        //     .setVertices(triangleVertices)
        //     .setOutputTarget("square")
        //     .setPosition([0, 0, 0])
        //     .build();
        const triangleUVs = [
            0.0, 0.0,   // vertex 0
            1.0, 0.0,   // vertex 1
            0.5, 1.0    // vertex 2
        ];
        const triangleInSquare = new GameObjectDefinition.Builder()
            .setName("triangleInSquare")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            .setVertices(triangleVertices)
            .setUVCoords(triangleUVs)
            .setOutputTarget("square")
            //.setTexture(squareRT.texture) 
            .setPosition([0, 0, 0])
            .build();

        const f3dTexture = this.textureManager.get("3df");
        //console.log(f3dTexture);
        const f3d = new GameObjectDefinition.Builder()
            .setName("3df")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([0, 0, 0])
            .setVertices(fVertices)
            .setNormals(fNormals)
            .setColors(fColors)
            .setTexture(f3dTexture)
            .setUVCoords(fTextureCoords)
            .setOutputTarget("screen")
            .build();

        this.objectManager.loadObject(triangle);
        this.objectManager.loadObject(f3d);
        this.objectManager.loadObject(triangle2d);
        this.objectManager.loadObject(square);
        this.objectManager.loadObject(triangleInSquare);
    }
}
