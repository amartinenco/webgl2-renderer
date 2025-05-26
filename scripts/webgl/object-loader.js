import { triangleVertices } from '../shapes/triangle.js';
import { fVertices, fNormals, fColors } from '../shapes/3df.js';
import { ObjectType, ShaderType } from './utils/constants.js';


export class GameObjectDefinition {
    constructor(name, type, shaderProgram, position, vertices, normals = [], colors = [], indices = [], uvCoords = [], material = null, meshes = [], animations = [], textue = null) {
        this.name = name;
        this.type = type;
        this.shaderProgram = shaderProgram;
        this.position = position;
        this.vertices = vertices;
        this.normals = normals;
        this.colors = colors;
        this.indices = indices;
        this.uvCoords = uvCoords; // texture coordinates
        this.material = material; // linked material file or properties
        this.meshes = meshes; // sub-meshes for complex .obj files
        this.animations = animations;
        this.textue = textue;
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

        const triangle = new GameObjectDefinition("triangle", ObjectType.UI, shaderUI, null, triangleVertices);
        
        const triangle2d = new GameObjectDefinition("triangle2d", ObjectType.TWO_D, shaderThreeD, [110, -75, -15], triangleVertices);
        
        const f3d = new GameObjectDefinition("3df", ObjectType.THREE_D, shaderThreeD, null, fVertices, fNormals, fColors);
        
        this.objectManager.loadObject(triangle);
        this.objectManager.loadObject(f3d);
        
        this.objectManager.loadObject(triangle2d);
    }
};
