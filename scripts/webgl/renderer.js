import { debugLog } from "../logger/logger.js";
import { mat4, vec4 } from "../math/gl-matrix/index.js";
import { Object3D, Object2D, ObjectUI } from "./object.js";
import { CameraType } from "./utils/constants.js";

export class Renderer {
    constructor(gl, canvas, shaderManager, objectManager, cameraManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = shaderManager;
        this.objectManager = objectManager;
        this.cameraManager = cameraManager;
        this.resizeCanvasToDisplaySize();
        this.cameraManager.getActiveCamera().updateProjection();
        window.addEventListener("resize", () => { 
            this.resizeCanvasToDisplaySize();
            this.cameraManager.getActiveCamera().updateProjection();
        });
    }

    resizeCanvasToDisplaySize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        const needResize = this.canvas.width  !== displayWidth || this.canvas.height !== displayHeight;
        if (needResize) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            debugLog(`Window resized to w:${displayWidth} h:${displayHeight}`);
        }
        return needResize;
    }
    
    render() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        const camera = this.cameraManager.getActiveCamera();
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix(CameraType.PERSPECTIVE);

        const objects = this.objectManager.getAllObjects();
        
        // Render objects 2D and 3D in the world
        objects.filter(obj => obj instanceof Object3D || obj instanceof Object2D).forEach(obj => { 
            const mvpMatrix = mat4.create();
            mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix); // camera transforms
            mat4.multiply(mvpMatrix, mvpMatrix, obj.getModelMatrix()); // object transforms

            const shaderProgram = obj.getShader();
            this.gl.useProgram(shaderProgram);
            this.shaderManager.setUniformMatrix(shaderProgram, 'u_mvpMatrix', mvpMatrix);
            obj.draw() 
        });

        // Render UI elements
        const uiProjectionMatrix = camera.getProjectionMatrix(CameraType.ORTHOGRAPHIC);
        const testVertex = vec4.fromValues(400, 300, 0, 1);
        const transformedVertex = vec4.create();
        vec4.transformMat4(transformedVertex, testVertex, uiProjectionMatrix);
        this.gl.disable(this.gl.DEPTH_TEST);
        objects.filter(obj => obj instanceof ObjectUI).forEach(obj => {
            const modelMatrix = obj.getModelMatrix();
            const shaderProgram = obj.getShader();
            this.gl.useProgram(shaderProgram);
            this.shaderManager.setUniformMatrix(shaderProgram, 'u_projection', uiProjectionMatrix);
            this.shaderManager.setUniformMatrix(shaderProgram, 'u_model', modelMatrix);
            obj.draw()
        });
        this.gl.enable(this.gl.DEPTH_TEST);

    }
};