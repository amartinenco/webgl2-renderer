import { triangleVertices } from '../shapes/triangle.js';
import { fVertices, fNormals, fColors } from '../shapes/3df.js';
import { ObjectType, ShaderType } from './utils/constants.js';


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

            build() {
                return new GameObjectDefinition(this);
            }
        }
        return Builder;
    }
}

export class ObjectLoader {
    constructor(objectManager, shaderManager) {
        this.objectManager = objectManager; 
        this.shaderManager = shaderManager;       
    }

    async loadGameObjects() {
        const shaderThreeD = this.shaderManager.getShader(ShaderType.THREE_D);
        const shaderUI = this.shaderManager.getShader(ShaderType.UI);

        const triangle = new GameObjectDefinition.Builder()
            .setName("triangle")
            .setType(ObjectType.UI)
            .setShaderProgram(shaderUI)
            .setVertices(triangleVertices)
            .build();

        const triangle2d = new GameObjectDefinition.Builder()
            .setName("triangle2d")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([110, -75, -15])
            .setVertices(triangleVertices)
            .build();

        const f3d = new GameObjectDefinition.Builder()
            .setName("3df")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([0, 0, 0])
            .setVertices(fVertices)
            .setNormals(fNormals)
            .setColors(fColors)
            .build();

        this.objectManager.loadObject(triangle);
        this.objectManager.loadObject(f3d);
        this.objectManager.loadObject(triangle2d);
    }
}
