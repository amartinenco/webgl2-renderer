import { debugLog } from "../logger/logger.js";
import { mat4, vec4 } from "../math/gl-matrix/index.js";
import { Object3D, Object2D, ObjectUI } from "./object.js";
import { CameraType } from "./utils/constants.js";

export class Renderer {
    constructor(gl, canvas, shaderManager, objectManager, cameraManager, lightManager, textureManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = shaderManager;
        this.objectManager = objectManager;
        this.cameraManager = cameraManager;
        this.lightManager = lightManager;
        this.resizeCanvasToDisplaySize();
        this.cameraManager.getActiveCamera().updateProjection();
        window.addEventListener("resize", () => { 
            this.resizeCanvasToDisplaySize();
            this.cameraManager.getActiveCamera().updateProjection();
        });

        this.textureManager = textureManager;
        //this.renderTarget = this.textureManager.getRenderTarget();
        this.gl.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
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
    
    renderToTexture() {
        const camera = this.cameraManager.getActiveCamera();
        const projection = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
        const object = this.objectManager.getRenderTargetObject();
        //console.log(object);
        if (!object) return;
        
        // console.log("Render target", this.renderTarget)
        // this.renderTarget.bind();
        // this.gl.clearColor(0.2, 0.2, 0.2, 1);
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // const view = camera.getViewMatrix();
        // const mvpMatrix = mat4.create();
        // mat4.multiply(mvpMatrix, projection, view);
        // mat4.multiply(mvpMatrix, mvpMatrix, object.getModelMatrix());

        // const shader = object.getShader();
        // this.gl.useProgram(shader);
        // camera.setUniforms(this.gl, shader);
        
        // const colorLocation = this.gl.getUniformLocation(shader, "u_color");
        // this.gl.uniform4fv(colorLocation, [1.0, 1.0, 0.0, 1.0]); // highlight color

        // this.shaderManager.setUniformMatrix(shader, 'u_mvpMatrix', mvpMatrix);
        // this.shaderManager.setUniformMatrix(shader, 'u_modelWorldMatrix', object.getModelMatrix());

        // object.draw();
        // this.renderTarget.unbind();
    }

    renderScene(camera, projection) {
        const viewMatrix = camera.getViewMatrix();
        const objects = this.objectManager.getAllObjects();
        let currentShader = null;

        this.lightManager.getAllLights().forEach(light => {
            light.applyLighting();
            currentShader = light.getShader();
        });

        if (currentShader) camera.setUniforms(this.gl, currentShader);

        objects.filter(obj => !(obj instanceof ObjectUI || obj.isRenderTargetOnly)).forEach(obj => {
            const mvp = mat4.create();
            mat4.multiply(mvp, projection, viewMatrix);
            mat4.multiply(mvp, mvp, obj.getModelMatrix());

            const shader = obj.getShader();
            if (shader !== currentShader) {
                this.gl.useProgram(shader);
                currentShader = shader;
                camera.setUniforms(this.gl, shader);
            }

            this.gl.uniform4fv(this.gl.getUniformLocation(shader, "u_color"), [0.5, 0.0, 0.0, 1.0]);
            this.shaderManager.setUniformMatrix(shader, 'u_mvpMatrix', mvp);
            this.shaderManager.setUniformMatrix(shader, 'u_modelWorldMatrix', obj.getModelMatrix());

            obj.draw();
        });
    }

    renderUI(uiProjection) {
        const objects = this.objectManager.getAllObjects();
        let currentShader = null;
        this.gl.disable(this.gl.DEPTH_TEST);

        objects.filter(obj => obj instanceof ObjectUI).forEach(obj => {
            const model = obj.getModelMatrix();
            const shader = obj.getShader();
            if (shader !== currentShader) {
                this.gl.useProgram(shader);
                currentShader = shader;
            }

            this.shaderManager.setUniformMatrix(shader, 'u_projection', uiProjection);
            this.shaderManager.setUniformMatrix(shader, 'u_model', model);

            obj.draw();
        });

        this.gl.enable(this.gl.DEPTH_TEST);
    }

    render() {
        const camera = this.cameraManager.getActiveCamera();
        const perspective = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
        const uiProjection = camera.getProjectionMatrix(CameraType.ORTHOGRAPHIC);

        // TODO: continue from here
        // Render to texture
        this.renderToTexture();

        // Render to full screen
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        this.renderScene(camera, perspective); // Main scene
        this.renderUI(uiProjection);   // UI
    }
};