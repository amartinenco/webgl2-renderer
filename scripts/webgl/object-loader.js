import { triangleVertices, triangleVerticesUITest, testTriangleInTextureVertices } from '../shapes/triangle.js';
import { squareVertices, squareNormals } from '../shapes/square.js';
import { fVertices, fNormals, fColors, fTextureCoords } from '../shapes/3df.js';
import { ObjectType, ShaderType } from './utils/constants.js';
import { errorLog, warnLog } from '../logger/logger.js';
import { TextureFactory } from './texture-factory.js';
import { LoaderObj } from './loader-obj.js';
import { LoaderMtl } from './loader-mtl.js';
import { MeshBuilder } from './mesh-builder.js';
import { TextRenderer } from './text-renderer.js'

const isLocal = window.location.hostname === "localhost";
const FILE_PATH = isLocal ? "./scripts/shapes" : `${window.location.origin}/scripts/shapes`;

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
        this.meshes = builder.meshes ?? null;
        this.animations = builder.animations ?? [];
        this.texture = builder.texture ?? null;
        this.rotation = builder.rotation || { x: 0, y: 0 };
        this.scale = builder.scale ?? [1, 1, 1];
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
            setScale(scale) { this.scale = scale; return this; };

            build() {
                return new GameObjectDefinition(this);
            }
        }
        return Builder;
    }
}

export class ObjectLoader {
    constructor(objectManager, shaderManager, textureManager, fontManager, controller) {
        this.objectManager = objectManager; 
        this.shaderManager = shaderManager;
        this.textureManager = textureManager;
        this.fontManager = fontManager;
        this.filePath = FILE_PATH;
        this.controller = controller;
    }

    setController(controller) {
        warnLog("SEtting controller")
        this.controller = controller;
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
            .setPosition([-250, 50, 0])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 45 })
            .setUVCoords(new Float32Array([
                0.0, 0.0,  // vertex 0
                1.0, 0.0,  // vertex 1
                0.5, 1.0   // vertex 2
            ]))
            .setTexture(squareRT.texture)
            .setOutputTarget("screen")
            .build();

        const ground = new GameObjectDefinition.Builder()
            .setName("ground")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([-80, -150, -90])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 90, y: 0 })
            .setScale([2, 2, 1])
            .build();

        const wall_one = new GameObjectDefinition.Builder()
            .setName("wall_one")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([100, -150, -120])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 180 })
            .build();

        const wall_two = new GameObjectDefinition.Builder()
            .setName("wall_two")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([100, 150, -90])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 180 })
            .build();
        
        const wall_side = new GameObjectDefinition.Builder()
            .setName("wall_side")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([-200, -150, 20])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 45 })
            .build();

        const wall_three = new GameObjectDefinition.Builder()
            .setName("wall_three")
            .setType(ObjectType.TWO_D)
            .setShaderProgram(shaderThreeD)
            .setPosition([-110, -150, 250])
            .setVertices(squareVertices)
            .setNormals(squareNormals)
            .setRotation({ x: 0, y: 120 })
            .build();

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
            .setPosition([-110, 15, 150])
            .setVertices(triangleVertices)
            .setOutputTarget("screen")
            .build();

        const triangleUVs = [
            0.0, 0.0,   // vertex 0
            0.0, 0.0,   // vertex 1
            0.0, 0.0    // vertex 2
        ];
        const triangleInSquare = new GameObjectDefinition.Builder()
            .setName("triangleInSquare")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            .setVertices(testTriangleInTextureVertices)
            .setUVCoords(triangleUVs)
            .setOutputTarget("square")
            .setPosition([0, 0, 0])
            .build();

        const f3dTexture = this.textureManager.get("3df");
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
        //this.objectManager.loadObject(f3d);
        
        //this.objectManager.loadObject(triangle2d);
    
        //this.objectManager.loadObject(square);
        //this.objectManager.loadObject(triangleInSquare);
        
        // debug walls
        // this.objectManager.loadObject(ground);
        // this.objectManager.loadObject(wall_one);
        // this.objectManager.loadObject(wall_two);
        // this.objectManager.loadObject(wall_side);

        //this.objectManager.loadObject(wall_three);

        // Test obj and mtl loader
        // const testMaterials = await LoaderMtl.load(`${this.filePath}/monkey.mtl`);
        // const testObj = await LoaderObj.load(`${this.filePath}/monkey.obj`);
        // const testMesh = MeshBuilder.fromObj(testObj, testMaterials.materials);

        // const objTest = new GameObjectDefinition.Builder()
        //     .setName("testModel")
        //     .setType(ObjectType.THREE_D)
        //     .setShaderProgram(shaderThreeD)
        //     .setMeshes(testMesh.submeshes)
        //     .setPosition([30, 30, 30])
        //     .setScale([30, 30, 30])
        //     .setOutputTarget("screen")
        //     .build(); 
        
        const testMaterials = await LoaderMtl.load(`${this.filePath}/computer5.mtl`);
        const testObj = await LoaderObj.load(`${this.filePath}/computer5.obj`);
        const testMesh = MeshBuilder.fromObj(testObj, testMaterials.materials);
        const screenRT = this.textureManager.getRenderTarget("computerScreen");

        for (const sm of testMesh.submeshes) {
            if (sm.name.toLowerCase().includes("red")) {
                //sm.material.diffuse = [0.0, 1.0, 0.0];
                sm.material.diffuseTexture = screenRT.texture;
                sm.material.hasTexture = true;
            }

            if (sm.material && sm.material.texture) {
                const stickyTexture = this.textureManager.get("sticky");
                if (stickyTexture) {
                    sm.material.diffuseTexture = stickyTexture;
                    sm.material.hasTexture = true;
                }
            }
        }

        const objTest = new GameObjectDefinition.Builder()
            .setName("testModel")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setMeshes(testMesh.submeshes)
            .setPosition([30, -15, 30])
            .setScale([30, 30, 30])
            .setOutputTarget("screen")
            .build();

        // Computer
        this.objectManager.loadObject(objTest);

        const x = -0.9; const y = 0.9; const size = 0.2;

        const triangleTerminalUI = new GameObjectDefinition.Builder()
            .setName("terminalUI")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            .setVertices(new Float32Array([
                -x,     -y,     0,
                -(x+size), -y,  0,
                -x,     -(y+size), 0
            ]))
            .setOutputTarget("computerScreen")
            .build();
        
        const font = this.fontManager.getFont("default");
        const renderer = new TextRenderer();

        const startX = 50; 
        const startY = 65;

        // TERMINAL
        const text = this.controller ? this.controller.terminal.getCurrentLine() : "test";
        const mesh = renderer.buildTextMesh(font, text, startX, startY, 1);

        const textObj = new GameObjectDefinition.Builder()
            .setName("helloText")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            .setVertices(mesh.vertices)
            .setUVCoords(mesh.uvs)
            .setTexture(font.texture)
            .setOutputTarget("computerScreen")
            .build();

        let loadedTextObj = this.objectManager.loadObject(textObj);
        loadedTextObj.controller = this.controller;
        loadedTextObj.textRenderer = renderer;
        loadedTextObj.font = font;

        loadedTextObj.onUpdate = function(dt) {
            if (!this.controller) return;
            
            const newText = this.controller.terminal.getVisibleText();
            const lines = newText.split("\n");

            const baseX = 50; 
            const bottomY = 40;
         
            if (newText !== this.lastText) {
                const startY = bottomY + (lines.length - 1) * this.font.lineHeight;
                const mesh = this.textRenderer.buildTextMesh(this.font, newText, baseX, startY, 1);

                this.vertices = mesh.vertices;
                this.uvCoords = mesh.uvs;
                this.indices = mesh.indices;

                this.updateBuffers();
                this.lastText = newText;
            }
        };

        const lampMaterials = await LoaderMtl.load(`${this.filePath}/lamp.mtl`);
        const lampObj = await LoaderObj.load(`${this.filePath}/lamp.obj`);
        const lampMesh = MeshBuilder.fromObj(lampObj, lampMaterials.materials);

        const objLamp = new GameObjectDefinition.Builder()
            .setName("lampModel")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setMeshes(lampMesh.submeshes)
            .setPosition([-200, -110, 110])
            .setScale([8, 8, 8])
            .setRotation({x: 0, y: 80, z: 0})
            .setOutputTarget("screen")
            .build();

        this.objectManager.loadObject(objLamp);

        const tableMaterials = await LoaderMtl.load(`${this.filePath}/table.mtl`);
        const tableObj = await LoaderObj.load(`${this.filePath}/table.obj`);
        const tableMesh = MeshBuilder.fromObj(tableObj, tableMaterials.materials);

        const objTable = new GameObjectDefinition.Builder()
            .setName("tableModel")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setMeshes(tableMesh.submeshes)
            .setPosition([-60, -115, 110])
            .setScale([110, 110, 110])
            .setRotation({x: 0, y: -90, z: 0})
            .setOutputTarget("screen")
            .build();

        this.objectManager.loadObject(objTable);

        const robotMaterials = await LoaderMtl.load(`${this.filePath}/robot.mtl`);
        const robotObj = await LoaderObj.load(`${this.filePath}/robot.obj`);
        const robotMesh = MeshBuilder.fromObj(robotObj, robotMaterials.materials);
        const objRobot = new GameObjectDefinition.Builder()
            .setName("robotModel")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setMeshes(robotMesh.submeshes)
            .setPosition([-125, -8, -42])
            .setScale([10, 10, 10])
            .setRotation({x: 0, y: 60, z: 0})
            .setOutputTarget("screen")
            .build();

        this.objectManager.loadObject(objRobot);
    }   
}
