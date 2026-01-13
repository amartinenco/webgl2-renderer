import { Camera } from './camera.js';
import { warnLog, errorLog } from '../logger/logger.js';

export class CameraManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.cameras = {};
        this.cameras["main"] = new Camera(this.canvas, [16.078306198120117, 7.269773483276367, 313.6032409667969], [15.857821464538574, 7.124093532562256, 312.6387939453125]);
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