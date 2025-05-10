import { Camera } from './camera.js';
import { warnLog, errorLog } from '../logger/logger.js';

export class CameraManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.cameras = {};
        this.cameras["main"] = new Camera(this.canvas);
        this.activeCamera = this.cameras["main"];
    }

    addCamera(name, camera) {
        if (!this.cameras[name]) {
            this.cameras[name] = camera;
        } else {
            warnLog(`Camera '${name}' already exists!`);
        }
    }

    setActiveCamera(name) {
        if (this.cameras[name]) {
            this.activeCamera = this.cameras[name];
        } else {
            errorLog(`Camera '${name}' not found!`);
        }
    }

    getActiveCamera() {
        return this.activeCamera;
    }
}