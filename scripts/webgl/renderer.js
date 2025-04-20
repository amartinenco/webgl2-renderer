import { debugLog } from "../logger/logger.js";

export class Renderer {
    constructor(gl, canvas, objectManager, cameraManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.objectManager = objectManager;
        this.cameraManager = cameraManager;
        window.addEventListener("resize", () => this.resizeCanvasToDisplaySize());
    }

    resizeCanvasToDisplaySize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        const needResize = this.canvas.width  !== displayWidth || this.canvas.height !== displayHeight;
        if (needResize) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);
            debugLog(`Window resized to w:${displayWidth} h:${displayHeight}`);
        }
        return needResize;
    }

    render() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const objects = this.objectManager.getAllObjects();
        Object.values(objects).forEach(obj => obj.draw());
    }
};