import { initShaders } from './shader-manager.js';
import { ObjectManager } from './object-manager.js';
import { ObjectLoader } from './object-loader.js';
import { Renderer } from './renderer.js';
import { debugLog, errorLog } from '../logger/logger.js';
import { CameraManager } from './camera-manager.js';

export class GameEngine {

    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.objectManager = null;
        this.objectLoader = null;
        this.engineRun = this.engineRun.bind(this); // pre-bind 'this' for the looping
        this.renderer = null;
        this.CameraManager = null;
    }
    
    async initialize() {
        const shaderProgram = await initShaders(this.gl);
        if (!shaderProgram) {
            errorLog("Shader initialization failed.");
            return;
        }
        debugLog("Shaders initialized successfully.");
        this.objectManager = new ObjectManager(this.gl, shaderProgram);
        this.objectLoader = new ObjectLoader(this.objectManager);
        this.objectLoader.loadGameObjects();
        this.cameraManager = new CameraManager();
        this.renderer = new Renderer(this.gl, this.canvas, shaderProgram, this.objectManager, this.cameraManager);
        debugLog("GameEngine initialized");
    }

    engineRun() {
        this.renderer.render();
        requestAnimationFrame(this.engineRun);
    }
};


