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
        //console.log(uiProjectionMatrix);
        const testVertex = vec4.fromValues(400, 300, 0, 1);
        const transformedVertex = vec4.create();
        vec4.transformMat4(transformedVertex, testVertex, uiProjectionMatrix);

        console.log("Transformed UI Vertex:", transformedVertex);

        // const testProjection = mat4.create();
        // mat4.identity(testProjection);
        this.gl.disable(this.gl.DEPTH_TEST);
        objects.filter(obj => obj instanceof ObjectUI).forEach(obj => {
            const modelMatrix = obj.getModelMatrix();
            //mat4.scale(modelMatrix, modelMatrix, [5, 5, 1]);
            //const mvpMatrix = mat4.create();
            //mat4.multiply(mvpMatrix, uiProjectionMatrix, modelMatrix);
            //console.log(mvpMatrix)
            const shaderProgram = obj.getShader();
            this.gl.useProgram(shaderProgram);
            this.shaderManager.setUniformMatrix(shaderProgram, 'u_projection', uiProjectionMatrix);
            this.shaderManager.setUniformMatrix(shaderProgram, 'u_model', modelMatrix);
            //console.log("Drawing UI Object:", obj);
            //console.log("Rendering ObjectUI:", obj.shaderProgram);
            //console.log("Is Shader Program Linked:", this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS));
            //console.log("Shader Info Log:", this.gl.getProgramInfoLog(shaderProgram));            

            //console.log("ObjectUI Position Attribute Location:", this.gl.getAttribLocation(shaderProgram, "a_position"));
            //console.log("ObjectUI Vertex Buffer:", this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING));
            //console.log("Currently Bound Buffer:", this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING));
            // console.log("ObjectUI Vertex Data:", obj.vertices);
            // console.log("Buffer Data:", this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE));
            //console.log("UI Projection Matrix:", uiProjectionMatrix);
            //console.log("UI Model Matrix:", modelMatrix);
            //mat4.translate(modelMatrix, modelMatrix, [-250, -250, 0]);
            //mat4.translate(modelMatrix, modelMatrix, [300, 300, 0]);
            //console.log("Transformed UI Projection Output:", mat4.multiply([], uiProjectionMatrix, modelMatrix));
            obj.draw()
        });
        this.gl.enable(this.gl.DEPTH_TEST);

    }
};