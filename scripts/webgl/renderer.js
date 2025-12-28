import { debugLog, errorLog } from "../logger/logger.js";
import { mat4, vec4 } from "../math/gl-matrix/index.js";
import { Object3D, Object2D, ObjectUI, ObjectRTT } from "./object.js";
import { CameraType } from "./utils/constants.js";
import { groupBy } from "./utils/objhelper.js";
import { ShaderType } from "./utils/constants.js";
import { LightType } from "./utils/constants.js";

export class Renderer {
    constructor(gl, canvas, shaderManager, objectManager, cameraManager, lightManager, textureManager) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderManager = shaderManager;
        this.objectManager = objectManager;
        this.cameraManager = cameraManager;
        this.lightManager = lightManager;
        this.textureManager = textureManager;
    
        this.gl.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
    
        // load render targets groups
        this.rtGroups = groupBy(this.objectManager.getAllObjects().filter(obj => obj.outputTarget), o => o.outputTarget);
        console.log("RT Groups:", this.rtGroups);

        this.resizeCanvasToDisplaySize();
        this.cameraManager.getActiveCamera().updateProjection();
        window.addEventListener("resize", () => { 
            this.resizeCanvasToDisplaySize();
            this.cameraManager.getActiveCamera().updateProjection();
        });

        this.shadowShader = this.shaderManager.getShader(ShaderType.SHADOW);
        console.log(this.shadowShader);
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
    
    /**
     * Shadow pass - the light taking a photo of a scene (depth only)
     */
    renderShadowMap(light) {
        const gl = this.gl;

        const shadowRT = this.textureManager.getRenderTarget("shadow");
        if (shadowRT) {
            shadowRT.bind();

            gl.enable(gl.DEPTH_TEST); 
            gl.depthFunc(gl.LESS);
            gl.disable(gl.CULL_FACE);
            gl.clearDepth(1.0);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.useProgram(this.shadowShader);
            this.shaderManager.setUniformMatrix(this.shadowShader, "u_lightViewProjection", light.viewProjectionMatrix);

            const objects = this.objectManager.getAllObjects()
                .filter(obj => !(obj instanceof ObjectUI || obj instanceof ObjectRTT));

            for (const object of objects) {
                this.shaderManager.setUniformMatrix(this.shadowShader, "u_modelWorldMatrix", object.getModelMatrix());
                object.draw(this.shadowShader);
            }

            shadowRT.unbind();
        }
    }

    renderToTexture() {
        const rt = this.textureManager.getRenderTarget("square");
        //const objects = this.objectManager.getAllObjects();
        const objects = this.rtGroups["square"];

        rt.bind();
        this.gl.viewport(0, 0, rt.width, rt.height);
        this.gl.clearColor(1, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        if (!objects) return;

        for (const obj of objects) {
            if (obj.outputTarget === "square") {

                const shader = obj.shaderProgram;
                this.gl.useProgram(shader);

                const mvp = mat4.create();
                //const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);
                const projection = mat4.ortho(
                    mat4.create(),
                    -0.6, rt.width - 0.6,   // x
                    -0.6, rt.height - 0.6,  // y
                    -1, 1                   // z
                );
                
                mat4.multiply(mvp, projection, obj.getModelMatrix());
                this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);
                const useTexLoc = this.gl.getUniformLocation(obj.shaderProgram, "u_useTexture");
                this.gl.uniform1i(useTexLoc, 0);
                obj.draw();
            }
        }
        rt.unbind();
    }

    // renderComputerScreen() {
    //     const rt = this.textureManager.getRenderTarget("computerScreen");
    //     const objects = this.rtGroups["computerScreen"];
    //     console.log(objects);
    //     // console.log("----------------");
    //     // console.log(rt.width)
    //     // console.log(rt.height)

    //     if (!rt || !objects) return;

    //     rt.bind();
    //     this.gl.viewport(0, 0, rt.width, rt.height);

    //     this.gl.activeTexture(this.gl.TEXTURE0);
    //     this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    //     // Clear to green or black or whatever
    //     this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //     for (const obj of objects) {
    //         const shader = obj.shaderProgram;
    //         this.gl.useProgram(shader);

    //         const mvp = mat4.create();
    //         //const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);
    //          const projection = mat4.ortho(
    //                 mat4.create(),
    //                 -0.6, rt.width - 0.6,   // x
    //                 -0.6, rt.height - 0.6,  // y
    //                 -1, 1                   // z
    //             );
    //         mat4.multiply(mvp, projection, obj.getModelMatrix());

    //         this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);

    //         const useTexLoc = this.gl.getUniformLocation(shader, "u_useTexture");
    //         this.gl.uniform1i(useTexLoc, 0);
    //         this.gl.bindVertexArray(obj.vao);
    //         obj.draw();
    //     }

    //     rt.unbind();
    // }

// renderComputerScreen() {
//     const rt = this.textureManager.getRenderTarget("computerScreen");
//     const objects = this.rtGroups["computerScreen"];
//     if (!rt || !objects || !objects.length) return;

//     rt.bind();
//     this.gl.viewport(0, 0, rt.width, rt.height);

//     this.gl.disable(this.gl.DEPTH_TEST);
//     this.gl.disable(this.gl.CULL_FACE); //-- temporary 

//     this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
//     this.gl.clear(this.gl.COLOR_BUFFER_BIT);

//     const obj = objects[0];
//     const shader = obj.shaderProgram;
//     this.gl.useProgram(shader);

//     const projection = mat4.ortho(
//         mat4.create(),
//         0, rt.width,
//         0, rt.height,
//         -1, 1
//     );

//     const mvp = mat4.create();
//     mat4.multiply(mvp, projection, obj.getModelMatrix());
//     this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);

//     obj.draw(shader);

//     rt.unbind();
// }

   





// renderComputerScreen() {
//     const rt = this.textureManager.getRenderTarget("computerScreen");
//     const objects = this.rtGroups["computerScreen"];
//     if (!rt || !objects || !objects.length) return;

//     const gl = this.gl;
//     rt.bind();
//     gl.viewport(0, 0, rt.width, rt.height);

//     gl.disable(gl.DEPTH_TEST);
//     gl.disable(gl.CULL_FACE);

//     gl.clearColor(0.0, 1.0, 0.0, 1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT);

//     const obj = objects[0];
//     const shader = obj.shaderProgram;
//     gl.useProgram(shader);

//     const mvp = mat4.create(); // identity
//     this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);

//     obj.draw(shader);

//     rt.unbind();
// }
renderComputerScreen() {
    const rt = this.textureManager.getRenderTarget("computerScreen");
    const objects = this.rtGroups["computerScreen"];
    if (!rt || !objects || !objects.length) return;

    const gl = this.gl;
    rt.bind();
    gl.viewport(0, 0, rt.width, rt.height);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const obj = objects[0];
    const shader = obj.shaderProgram;

    gl.useProgram(shader);
    const identity = mat4.create(); 
    
    //mat4.rotateZ(identity, identity, -Math.PI / 2);
    
    const loc = gl.getUniformLocation(shader, "u_mvpMatrix"); 
    gl.uniformMatrix4fv(loc, false, identity);
    //console.log("u_mvpMatrix location:", loc);
    
    // const mvp = mat4.create();
    //             //const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);
    //             const projection = mat4.ortho(
    //                 mat4.create(),
    //                 -0.6, rt.width - 0.6,   // x
    //                 -0.6, rt.height - 0.6,  // y
    //                 -1, 1                   // z
    //             );
                
    //             mat4.multiply(mvp, projection, obj.getModelMatrix());
    //             this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);
    
    obj.draw(shader);

    rt.unbind();
}









//     renderComputerScreen() {
//     const rt = this.textureManager.getRenderTarget("computerScreen");
//     const objects = this.rtGroups["computerScreen"];
//     //console.log("computerScreen objects:", objects);

//     if (!rt || !objects) return;

//     rt.bind();
//     this.gl.viewport(0, 0, rt.width, rt.height);

//     this.gl.disable(this.gl.DEPTH_TEST);
//     this.gl.disable(this.gl.CULL_FACE);

//     this.gl.clearColor(0.0, 1.0, 0.0, 1.0);
//     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

//     const obj = objects[0]; // terminalUI
//     const shader = obj.shaderProgram;
//     this.gl.useProgram(shader);

//     // Super simple projection: NDC space
//     const mvp = mat4.create();
//     mat4.identity(mvp);
//     //console.log("MODEL MATRIX:")
//     //console.log(obj.modelMatrix);
//     //const projection = mat4.ortho( mat4.create(), 0, rt.width, 0, rt.height, -1, 1 ); 
//     //mat4.multiply(mvp, projection, obj.getModelMatrix());

//     //         //const projection = mat4.ortho(mat4.create(), 0, rt.width, 0, rt.height, -1, 1);
//     //          const projection = mat4.ortho(
//     //                 mat4.create(),
//     //                 -0.6, rt.width - 0.6,   // x
//     //                 -0.6, rt.height - 0.6,  // y
//     //                 -1, 1                   // z
//     //             );
//     //         mat4.multiply(mvp, projection, obj.getModelMatrix());

//     this.shaderManager.setUniformMatrix(shader, "u_mvpMatrix", mvp);

//     const useTexLoc = this.gl.getUniformLocation(shader, "u_useTexture");
//     if (useTexLoc) this.gl.uniform1i(useTexLoc, 0);

//     this.gl.bindVertexArray(obj.vao);
//     this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);



//     rt.unbind();
// }


    renderScene(camera, projection) {
        const viewMatrix = camera.getViewMatrix();
        const objects = this.objectManager.getAllObjects();
        let currentShader = null;

        this.lightManager.getAllLights().forEach(light => {
            light.applyLighting();
            //currentShader = light.getShader();
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

                // --- Bind shadow map ---
                const shadowRT = this.textureManager.getRenderTarget("shadow");
                if (shadowRT && shadowRT.depthTexture) {
                    // Bind depth texture to texture unit 7
                    this.gl.activeTexture(this.gl.TEXTURE7);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, shadowRT.depthTexture);
                    
                    // Tell shader which texture unit to use
                    const shadowLoc = this.gl.getUniformLocation(shader, "u_shadowMap");
                    if (shadowLoc) this.gl.uniform1i(shadowLoc, 7);

                    // Pass light view-projection matrix
                    const dirLight = this.lightManager.getLight(LightType.DIRECTIONAL);
                    if (dirLight) {
                        this.shaderManager.setUniformMatrix(
                            shader,
                            "u_lightViewProjection",
                            dirLight.viewProjectionMatrix
                        );
                    }
                }
            }
            
            //this.gl.uniform4fv(this.gl.getUniformLocation(shader, "u_color"), [0.5, 0.0, 0.0, 1.0]);
            this.shaderManager.setUniformMatrix(shader, 'u_mvpMatrix', mvp);
            this.shaderManager.setUniformMatrix(shader, 'u_modelWorldMatrix', obj.getModelMatrix());



            const hasTexture = Boolean(obj.texture && obj.texcoordBuffer);
            const useTexLoc = this.gl.getUniformLocation(obj.shaderProgram, "u_useTexture");
            if (useTexLoc) this.gl.uniform1i(useTexLoc, hasTexture ? 1 : 0);

            if (hasTexture) {
                const texLoc = this.gl.getUniformLocation(obj.shaderProgram, 'u_texture');
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, obj.texture);
                this.gl.uniform1i(texLoc, 0);
            }
            
            obj.draw(currentShader);

            if (hasTexture) this.gl.bindTexture(this.gl.TEXTURE_2D, null);
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

        const dirLight = this.lightManager.getLight(LightType.DIRECTIONAL);
        // if (dirLight) {
        //     //dirLight.updateMatrices();
        //     // Shadow pass
        //     if (this.shadowShader) {
        //         this.renderShadowMap(dirLight);
        //     }
        // }
        if (dirLight && this.shadowShader) {
            //updateDirectionalLightMatrices(dirLight);
            this.renderShadowMap(dirLight);
        }

        //this.renderToTexture();
        this.renderComputerScreen();    


        // Screen pass
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0.1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
     
        this.renderScene(camera, perspective);
        this.renderUI(uiProjection);

    }
};