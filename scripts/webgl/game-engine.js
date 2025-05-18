import { ShaderManager } from './shader-manager.js';
import { ObjectManager } from './object-manager.js';
import { ObjectLoader } from './object-loader.js';
import { LightingManager } from './lighting-manager.js';
import { LightingLoader } from './lighting-loader.js';
import { Renderer } from './renderer.js';
import { debugLog, errorLog } from '../logger/logger.js';
import { CameraManager } from './camera-manager.js';
import { GlobalContext } from './global-context.js';

export class GameEngine {

    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = new ShaderManager(gl);
        this.objectManager = null;
        this.objectLoader = null;
        this.lightManager = null;
        this.lightLoader = null;
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
        
        this.objectManager = new ObjectManager(this.gl);
        this.objectLoader = new ObjectLoader(this.objectManager, this.shaderManager);
        await this.objectLoader.loadGameObjects();

        this.lightManager = new LightingManager(this.gl);
        this.lightLoader = new LightingLoader(this.lightManager, this.shaderManager);
        await this.lightLoader.loadLights();

        this.cameraManager = new CameraManager(this.canvas);
        this.renderer = new Renderer(this.gl, this.canvas, this.shaderManager, this.objectManager, this.cameraManager, this.lightManager);
        this.inputManager = this.globalContext ? this.globalContext.inputManager : null;
        debugLog("GameEngine initialized");
    }

    handleInput(deltaTime) {
        if (!this.inputManager) return;
        const actions = {
            "w": () => { 
                this.cameraManager.activeCamera.move(0, 0, this.inputManager.cameraSpeed * deltaTime);
                debugLog("Moving forward!") 
            },
            "s": () => { 
                this.cameraManager.activeCamera.move(0, 0, -this.inputManager.cameraSpeed * deltaTime);
                debugLog("Moving backwards!") 
            },
            "a": () => {
                this.cameraManager.activeCamera.move(-this.inputManager.cameraSpeed * deltaTime, 0, 0);
                debugLog("Moving left!"); 
            }, 
            "d": () => { 
                this.cameraManager.activeCamera.move(this.inputManager.cameraSpeed * deltaTime, 0, 0);
                debugLog("Moving right!") 
            }
        };
    
        Object.keys(actions).forEach((key) => {
            if (this.inputManager.isKeyPressed(key)) {
                actions[key]();
            }
        });

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
        this.renderer.render();
        requestAnimationFrame(this.engineRun);
    }
};


