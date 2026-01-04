import { ShaderManager } from './shader-manager.js';
import { ObjectManager } from './object-manager.js';
import { ObjectLoader } from './object-loader.js';
import { LightingManager } from './lighting-manager.js';
import { LightingLoader } from './lighting-loader.js';
import { Renderer } from './renderer.js';
import { debugLog, errorLog } from '../logger/logger.js';
import { CameraManager } from './camera-manager.js';
import { GlobalContext } from './global-context.js';
import { MeshObject, Object3D } from './object.js';
import { TextureManager } from './texture-manager.js';
import { TextureLoader } from './texture-loader.js';
import { FontManager } from './font-manager.js';
import { FontLoader } from './font-loader.js';

export class GameEngine {

    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = new ShaderManager(gl);
        this.objectManager = null;
        this.objectLoader = null;
        this.lightManager = null;
        this.lightLoader = null;
        this.textureManager = null;
        this.textureLoader = null;
        this.fontManager = null;
        this.fontLoader = null;
        this.engineRun = this.engineRun.bind(this); // pre-bind 'this' for the looping
        this.renderer = null;
        this.cameraManager = null;
        this.inputManager = null;
        this.globalContext = GlobalContext.getInstance();
        this.lastTime = performance.now();
    }
    
    async initialize() {
        await this.shaderManager.initialize();
        debugLog("Shaders initialized successfully.");
        
        this.textureManager = new TextureManager(this.gl);
        this.textureLoader = new TextureLoader(this.gl, this.textureManager, this.canvas);
        await this.textureLoader.loadTextures();
        this.textureLoader.loadRenderTargets();

        this.fontManager = new FontManager(this.gl);
        this.fontLoader = new FontLoader(this.fontManager, this.textureLoader);
        await this.fontLoader.loadAllFonts();

        this.objectManager = new ObjectManager(this.gl);
        this.objectLoader = new ObjectLoader(this.objectManager, this.shaderManager, this.textureManager, this.fontManager);
        await this.objectLoader.loadGameObjects();

        this.cameraManager = new CameraManager(this.canvas);
        console.log("Texture manager", this.textureManager);

        this.lightManager = new LightingManager(this.gl, this.cameraManager);
        this.lightLoader = new LightingLoader(this.lightManager, this.shaderManager);
        await this.lightLoader.loadLights();

        this.renderer = new Renderer(this.gl, this.canvas, this.shaderManager, 
            this.objectManager, this.cameraManager, this.lightManager, this.textureManager,
            this.fontManager
        );
        this.inputManager = this.globalContext ? this.globalContext.inputManager : null;
        debugLog("GameEngine initialized");
    }

    handleInput(deltaTime) {
        if (!this.inputManager) return;
        const actions = {
            "KeyW": () => { 
                this.cameraManager.activeCamera.move(0, 0, this.inputManager.cameraSpeed * deltaTime);
                debugLog("Moving forward!") 
            },
            "KeyS": () => { 
                this.cameraManager.activeCamera.move(0, 0, -this.inputManager.cameraSpeed * deltaTime);
                debugLog("Moving backwards!") 
            },
            "KeyA": () => {
                this.cameraManager.activeCamera.move(-this.inputManager.cameraSpeed * deltaTime, 0, 0);
                debugLog("Moving left!"); 
            }, 
            "KeyD": () => { 
                this.cameraManager.activeCamera.move(this.inputManager.cameraSpeed * deltaTime, 0, 0);
                debugLog("Moving right!") 
            },
            "Space": () => {
                this.cameraManager.activeCamera.move(0, this.inputManager.cameraSpeed * deltaTime, 0);
                debugLog("Moving up!") 
            },
            "KeyC": () => {
                this.cameraManager.activeCamera.move(0, -this.inputManager.cameraSpeed * deltaTime, 0);
                debugLog("Moving down!") 
            }
        };
    
        Object.keys(actions).forEach((code) => {
            if (this.inputManager.isKeyPressed(code)) {
                actions[code]();
            }
        });

        if (!Object.keys(actions).some(code => this.inputManager.isKeyPressed(code))) {
            this.cameraManager.activeCamera.move(0, 0, 0);
        }

        this.inputManager.update(deltaTime);
        this.cameraManager.activeCamera.rotate(this.inputManager.yaw, this.inputManager.pitch);
    }

    calculateDeltatime() {
        let now = performance.now();
        let deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        return deltaTime;
    }

    engineRun() {
        let deltaTime = this.calculateDeltatime();
        this.handleInput(deltaTime);
        
        this.lightManager.updateLightMatrices();
        this.renderer.render();
        
        const objects = this.objectManager.getAllObjects();
        objects.filter(obj => obj instanceof MeshObject).forEach(obj => obj.update(deltaTime));

        
        requestAnimationFrame(this.engineRun);
    }
};


