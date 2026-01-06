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
            //.setIsRenderToTarget(true)
            //.setOutputTarget("screen")
            .setUVCoords(new Float32Array([
                0.0, 0.0,  // vertex 0
                1.0, 0.0,  // vertex 1
                0.5, 1.0   // vertex 2
            ]))
            .setTexture(squareRT.texture)
            .setOutputTarget("screen")
            .build();
        //square.setTexture(textureManager.getRenderTarget("square").texture);

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
            //.setPosition([110, -75, -15])
            //.setPosition([30, 10, 220])
            //.setPosition([30, 10, 110]) old screen
            .setPosition([-150, 10, 150])
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
        //this.objectManager.loadObject(f3d);
        
        
        
        
        //this.objectManager.loadObject(triangle2d);
        
        
        //this.objectManager.loadObject(square);
        //this.objectManager.loadObject(triangleInSquare);
        
        this.objectManager.loadObject(ground);
        this.objectManager.loadObject(wall_one);
        this.objectManager.loadObject(wall_two);
        this.objectManager.loadObject(wall_side);
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
        


        






        const testMaterials = await LoaderMtl.load(`${this.filePath}/computer2.mtl`);
        const testObj = await LoaderObj.load(`${this.filePath}/computer2.obj`);
        const testMesh = MeshBuilder.fromObj(testObj, testMaterials.materials);

        const screenRT = this.textureManager.getRenderTarget("computerScreen");

        for (const sm of testMesh.submeshes) {
            console.log(sm);
            if (sm.name.toLowerCase().includes("red")) {
                //sm.material.diffuse = [0.0, 1.0, 0.0];
                sm.material.diffuseTexture = screenRT.texture;
                sm.material.hasTexture = true;
            }
        }





        const objTest = new GameObjectDefinition.Builder()
            .setName("testModel")
            .setType(ObjectType.THREE_D)
            .setShaderProgram(shaderThreeD)
            .setMeshes(testMesh.submeshes)
            .setPosition([30, 15, 30])
            .setScale([30, 30, 30])
            .setOutputTarget("screen")
            //.setTexture(screenRT.texture)
            .build();


        // for (const sm of testMesh.submeshes) {
        //     console.log("-------------------->", sm.name, sm.material?.hasTexture);
        // }
        

        // Computer
        this.objectManager.loadObject(objTest);




        //const test2TriangleInTextureVertices = new Float32Array([ -0.5, -0.5, 0, 0.5, -0.5, 0, 0.0, 0.5, 0 ]);

        /*
        (-1,+1)        (0,+1)        (+1,+1)
            +-------------+-------------+
            |             |             |
            |             |             |
            |             |             |
            +-------------+-------------+
            |             |             |
            |     (0,0)   |             |
            |             |             |
            +-------------+-------------+
            (-1,-1)        (0,-1)        (+1,-1)

        */

        //const x = -0.5; const y = 0.9; const size = 0.02; 
        const x = -0.9; const y = 0.9; const size = 0.2;

        // .setVertices(new Float32Array([
        //     ...v0,
        //     ...v1,
        //     ...v2
        // ]));
        // console.log("V");
        // console.log(v0, v1, v2);

        const triangleTerminalUI = new GameObjectDefinition.Builder()
            .setName("terminalUI")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            //.setTexture(null)
            //.setVertices(new Float32Array([ 0, 0, 0, 255, 0, 0, 0, 150, 0 ]))
            //.setVertices(new Float32Array([ 400, 515, 0, 600, 515, 0, 500, 520, 0 ]))
            //.setVertices(new Float32Array([ 0, 0, 0, screenRT.width, 0, 0, 0, screenRT.height, 0 ]))
            //.setVertices(new Float32Array([ 0, 0, 0, 0, screenRT.height, 0, screenRT.width, 0, 0 ]))
            //.setVertices(new Float32Array([ 0, 0, 0, screenRT.width, 0, 0, screenRT.width, screenRT.height, 0, 0, 0, 0, screenRT.width, screenRT.height, 0, 0, screenRT.height, 0 ]))
            //.setUVCoords([ 0,0, 1,0, 1,1, 0,0, 1,1, 0,1 ])
            // .setVertices(new Float32Array([
            //     0, 0, 0,
            //     200, 0, 0,
            //     0, 200, 0
            // ]))
            // .setVertices(new Float32Array([
            //     -0.1, -0.4, 0,  // A
            //     0, 0, 0,  // B
            //     -0.1, 0, 0 // C
            // ]))
            // .setVertices(new Float32Array([
            //     -0.4, 0, 0, // left ()
            //     -0.1, 0, 0, // right 
            //     -0.25, 0.2, 0 // top 
            // ]))
            
            // .setVertices(new Float32Array([
            //   0.3, -0.5, 0, // top 
            //   0, 0.25, 0, // right 
            //   0.2, 0.2, 0 // left
            // ]))
            // .setVertices(new Float32Array([
            //   0.3, -0.5, 0,
            // ]))
            
            // FLIPPED
            //.setVertices(new Float32Array([ x, y, 0, x + size, y, 0, x, y + size, 0 ]))
            .setVertices(new Float32Array([
                -x,     -y,     0,
                -(x+size), -y,  0,
                -x,     -(y+size), 0
            ]))


            // .setVertices(new Float32Array([
            //     ...v0,
            //     ...v1,
            //     ...v2
            // ]))


            
            
            // .setVertices(this.mapToPhysical(new Float32Array([
            //     0.2, 0, 0, // left ()
            //     0, 0, 0, // right 
            //     0, 0.5, 0 // top 
            // ])))
            

            // .setVertices(new Float32Array([
            //      -1, 0, 0, // A = bottom-left 
            //      -0.1, -0.1, 0, // B = center-top 
            //      -0.3, 0, 0 // C = bottom-right
            // ]))
            
            
            
            // .setVertices(new Float32Array([
            //     -0.5, 0.0, 0.0, // left 
            //     0.5, 0.0, 0.0, // right 
            //     0.0, 0.5, 0.0 // top
            // ]))
            
            
            // .setVertices(new Float32Array([ 
            //     0.1, 0.057, 0, 
            //     0.1, -0.1, 0, 
            //     -0.1, 0.1, 0, 
            // ]))
            // .setVertices(new Float32Array([
            //     // Right side
            //     0.5, 0.0, 0.0,

            //     // Top side
            //     0.0, 0.5, 0.0,

            //     // Left side
            //     -0.5, 0.0, 0.0
            // ]))



            //.setUVCoords([0,0, 1,0, 0,1])
            //.setUVCoords([0,0, 1,0, 0,1])
            //.setUVCoords(triangleUVs)
            .setOutputTarget("computerScreen")
            //.setPosition([50, 50, 0])
            //s.setScale([1, 1, 1])
            .build();

        //this.objectManager.loadObject(triangleTerminalUI);
        
        const font = this.fontManager.getFont("default");
        console.log("hi", this.fontManager.getAllFonts())
        const renderer = new TextRenderer();

        //const mesh = renderer.buildTextMesh(font, "Hello", this.toClip(30, screenRT.width), this.toClip(30, screenRT.height));
        const startX = 50; 
        console.log("----------screen.height", screenRT.height);
        const startY = 100;
        //const startY = 50;








        // TERMINAL HERE
        
        const text = this.controller ? this.controller.terminal.getCurrentLine() : "test";
        console.log("------------------------------", this.controller)

        //const mesh = renderer.buildTextMesh(font, "helloworld", startX, startY, 1);
        const mesh = renderer.buildTextMesh(font, text, startX, startY, 1);

        const textObj = new GameObjectDefinition.Builder()
            .setName("helloText")
            .setType(ObjectType.RTT)
            .setShaderProgram(shaderRTT)
            .setVertices(mesh.vertices)
            .setUVCoords(mesh.uvs)
            .setIndices(mesh.indices)
            .setTexture(font.texture)
            .setOutputTarget("computerScreen")
            .build();


        let loadedTextObj = this.objectManager.loadObject(textObj);
        loadedTextObj.controller = this.controller;
        loadedTextObj.textRenderer = renderer;
        loadedTextObj.font = font;

        loadedTextObj.onUpdate = function(dt) {
            //console.log(this.controller);
            if (!this.controller) return;
            
            //const newText = this.controller.terminal.getCurrentLine();
            const newText = this.controller.terminal.getVisibleText();
            const lines = newText.split("\n");

            const baseX = 50; 
            const bottomY = 65;
         
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
    }   
}
