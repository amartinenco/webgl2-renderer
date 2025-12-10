import { debugLog, errorLog } from "../logger/logger.js";
import { mat4, vec4 } from "../math/gl-matrix/index.js";
import { Object3D, Object2D, ObjectUI, ObjectRTT } from "./object.js";
import { CameraType } from "./utils/constants.js";
import { groupBy } from "./utils/objhelper.js";

export class Renderer {
    constructor(gl, canvas, shaderManager, objectManager, cameraManager, lightManager, textureManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = shaderManager;
        this.objectManager = objectManager;
        this.cameraManager = cameraManager;
        this.lightManager = lightManager;
        this.textureManager = textureManager;
        
        this.cameraManager.getActiveCamera().updateProjection();
        
        //this.renderTarget = this.textureManager.getRenderTarget();
        this.gl.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
    
        // load render targets groups
        this.rtGroups = groupBy(this.objectManager.getAllObjects().filter(obj => obj.outputTarget), o => o.outputTarget);
        console.log(this.rtGroups);

        this.resizeCanvasToDisplaySize();
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

            for (const rt of this.textureManager.getRenderTargets()) {
                rt.resize(displayWidth, displayHeight);
            }

            debugLog(`Window resized to w:${displayWidth} h:${displayHeight}`);
            this.render();
        }
        return needResize;
    }
    

    renderToTexture() {
        const rt = this.textureManager.getRenderTarget("square");
        //const objects = this.objectManager.getAllObjects();
        const objects = this.rtGroups["square"];

        rt.bind();
        this.gl.viewport(0, 0, rt.width, rt.height);
        this.gl.clearColor(1, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const obj of objects) {
            if (obj.outputTarget === "square") {
                //if (obj.texture === rt.texture) {
                    //console.warn("Feedback risk: producer is sampling its own target:", obj.name);
                //    continue;
                //}
                //console.log(obj.name, "producer", obj.texture === rt.texture)
                const shader = obj.shaderProgram;
                this.gl.useProgram(shader);

                const mvp = mat4.create();
                //const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);
                //const projection = mat4.ortho(mat4.create(), -1, 1, -1, 1, -1, 1);
                const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);

                mat4.multiply(mvp, projection, obj.getModelMatrix());
                this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);

                obj.draw();
            }
        }
        rt.unbind();
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

        objects.filter(obj => !(obj instanceof ObjectUI || obj instanceof ObjectRTT)).forEach(obj => {
            const mvp = mat4.create();
            mat4.multiply(mvp, projection, viewMatrix);
            mat4.multiply(mvp, mvp, obj.getModelMatrix());

            //const shader = obj.getShader();
            const shader = obj.shaderProgram;
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
            //const shader = obj.getShader();
            const shader = obj.shaderProgram;
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

        // Screen pass
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // ensure canvas-sized viewport
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        
        this.renderScene(camera, perspective);
        this.renderUI(uiProjection);
        this.renderToTexture(); 
        // offscreen
        //this.renderToTexture(); // offscreen
    }
};