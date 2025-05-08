import { triangleVertices } from '../shapes/triangle.js';
import { fVertices, fNormals } from '../shapes/3df.js';
import { ObjectType, ShaderType } from './utils/constants.js';


export class GameObjectDefinition {
    constructor(name, type, shaderProgram, vertices, normals = [], colors = [], indices = [], uvCoords = [], material = null, meshes = [], animations = []) {
        this.name = name;
        this.type = type;
        this.shaderProgram = shaderProgram;
        this.vertices = vertices;
        this.normals = normals;
        this.colors = colors;
        this.indices = indices;
        this.uvCoords = uvCoords; // texture coordinates
        this.material = material; // linked material file or properties
        this.meshes = meshes; // sub-meshes for complex .obj files
        this.animations = animations; 
    }
};

export class ObjectLoader {
    constructor(objectManager, shaderManager) {
        this.objectManager = objectManager; 
        this.shaderManager = shaderManager;       
    }

    async loadGameObjects() {
        let shaderThreeD = this.shaderManager.getShader(ShaderType.THREE_D);
        let shaderUI = this.shaderManager.getShader(ShaderType.UI);

        const triangle = new GameObjectDefinition("triangle", ObjectType.UI, shaderUI, triangleVertices);
        const f3d = new GameObjectDefinition("3df", ObjectType.THREE_D, shaderThreeD, fVertices, fNormals);
        
        this.objectManager.loadObject(triangle);
        this.objectManager.loadObject(f3d);
    }
};
