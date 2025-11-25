import { debugLog, errorLog } from "../logger/logger.js";
import { mat4, vec4 } from "../math/gl-matrix/index.js";
import { Object3D, Object2D, ObjectUI } from "./object.js";
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
        this.resizeCanvasToDisplaySize();
        this.cameraManager.getActiveCamera().updateProjection();
        window.addEventListener("resize", () => { 
            this.resizeCanvasToDisplaySize();
            this.cameraManager.getActiveCamera().updateProjection();
        });

        this.textureManager = textureManager;
        //this.renderTarget = this.textureManager.getRenderTarget();
        this.gl.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
        
        // render targets groups
        this.rtGroups = groupBy(this.objectManager.getAllObjects().filter(obj => obj.outputTarget), o => o.outputTarget);
        console.log(this.rtGroups)
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
    // Recompute groups in case objects changed targets at runtime (optional but robust)
    this.rtGroups = groupBy(this.objectManager.getAllObjects().filter(obj => obj.outputTarget), o => o.outputTarget);

    for (const [targetName, objects] of Object.entries(this.rtGroups)) {
        const isScreen = targetName === "screen" || targetName === null;
        const rt = isScreen ? null : this.textureManager.getRenderTarget(targetName);

        if (rt) {
            rt.bind(); // binds FBO
            this.gl.viewport(0, 0, rt.width, rt.height);      // IMPORTANT: viewport to RT size
            this.gl.disable(this.gl.DEPTH_TEST);              // 2D pass: no depth
            this.gl.disable(this.gl.CULL_FACE);
        } else {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.CULL_FACE);
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);               // transparent background for compositing
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for (const obj of objects) {
            const shader = obj.getShader();
            this.gl.useProgram(shader);

            // Offscreen: pure 2D ortho, no camera uniforms
            const mvp = mat4.create();
            if (rt) {
                // glMatrix mat4.ortho(out, left, right, bottom, top, near, far)
                const projection = mat4.ortho(mat4.create(), 0, rt.width, rt.height, 0, -1, 1); // flipped Y
                mat4.multiply(mvp, projection, obj.getModelMatrix());
                // Do NOT call camera.setUniforms here; keep the pass decoupled from world-space
            } else {
                const camera = this.cameraManager.getActiveCamera();
                const projection = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
                mat4.multiply(mvp, projection, camera.getViewMatrix());
                mat4.multiply(mvp, mvp, obj.getModelMatrix());
                camera.setUniforms(this.gl, shader); // only for screen/world pass
            }

            //this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);
            //this.shaderManager.setUniformMatrix(shader, "u_modelWorldMatrix", obj.getModelMatrix());

            obj.draw();
        }

        if (rt) {
            rt.unbind(); // returns to default framebuffer
        }
    }
}
    // renderToTexture() {
    //     const camera = this.cameraManager.getActiveCamera();
    //     //const projection = camera.getProjectionMatrix(CameraType.PERSPECTIVE);

    //     for (const [targetName, objects] of Object.entries(this.rtGroups)) {
    //         const isScreen = targetName === "screen" || targetName === null;
    //         const rt = isScreen ? null : this.textureManager.getRenderTarget(targetName);
            
    //         if (rt) rt.bind();
    //         else this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    //         //this.gl.clearColor(0.2, 0.2, 0.2, 1);
    //         this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //         this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //         //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //         // const projection = rt 
    //         //     ? mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1) 
    //         //     : this.cameraManager.getActiveCamera().getProjectionMatrix(CameraType.PERSPECTIVE);

    //         for (const obj of objects) {
    //             const mvp = mat4.create();
    //             // mat4.multiply(mvp, projection, camera.getViewMatrix());
    //             // mat4.multiply(mvp, mvp, obj.getModelMatrix());

    //             if (rt) {
    //                 const projection = mat4.ortho(mat4.create(), 0, rt.width, rt.height, 0, -1, 1); // flipped Y
    //                 mat4.multiply(mvp, projection, obj.getModelMatrix());
    //             } else {
    //                 const camera = this.cameraManager.getActiveCamera();
    //                 const projection = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
    //                 mat4.multiply(mvp, projection, camera.getViewMatrix());
    //                 mat4.multiply(mvp, mvp, obj.getModelMatrix());
    //             }

    //             const shader = obj.getShader();
    //             this.gl.useProgram(shader);
    //             camera.setUniforms(this.gl, shader);
    //             this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);
    //             this.shaderManager.setUniformMatrix(shader, "u_modelWorldMatrix", obj.getModelMatrix());
    //             obj.draw();
    //         }
    //         if (rt) rt.unbind();
    //     }
    // }

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

    // render() {
    //     const camera = this.cameraManager.getActiveCamera();
    //     const perspective = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
    //     const uiProjection = camera.getProjectionMatrix(CameraType.ORTHOGRAPHIC);

    //     // TODO: continue from here
    //     // Render to texture
    //     this.renderToTexture();

    //     // Render to full screen
    //     this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    //     this.gl.clearColor(0, 0, 0, 0);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //     this.gl.enable(this.gl.DEPTH_TEST);
    //     this.gl.enable(this.gl.CULL_FACE);

    //     this.renderScene(camera, perspective); // Main scene
    //     this.renderUI(uiProjection);   // UI
    // }
    render() {
        const camera = this.cameraManager.getActiveCamera();
        const perspective = camera.getProjectionMatrix(CameraType.PERSPECTIVE);
        const uiProjection = camera.getProjectionMatrix(CameraType.ORTHOGRAPHIC);

        this.renderToTexture(); // offscreen

        // Screen pass
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); // ensure canvas-sized viewport
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        this.renderScene(camera, perspective);
        this.renderUI(uiProjection);
    }
};