import { debugLog } from "../logger/logger.js";
import { mat4 } from "../math/gl-matrix/index.js";
import { setUniformMatrix } from "./shader-manager.js";

export class Renderer {
    constructor(gl, canvas, shaderProgram, objectManager, cameraManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderProgram = shaderProgram;
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

        const camera = this.cameraManager.getActiveCamera();
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        const objects = this.objectManager.getAllObjects();
        Object.values(objects).forEach(obj => { 
            const mvpMatrix = mat4.create();
            mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix); // camera transforms
            mat4.multiply(mvpMatrix, mvpMatrix, obj.getModelMatrix()); // object transforms
            setUniformMatrix(this.gl, this.shaderProgram, 'u_mvpMatrix', mvpMatrix);
            obj.draw() 
        });
    }
};