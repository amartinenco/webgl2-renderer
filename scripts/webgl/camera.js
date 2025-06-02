import { mat4, vec3 } from '../math/gl-matrix/index.js';
import { CameraType } from './utils/constants.js';

export class Camera {
    constructor(canvas, position = [0, 0, 300], target = [0, 0, 0], up = [0, 1, 0]) {        
        this.canvas = canvas;
        this.position = vec3.fromValues(...position);
        this.front = vec3.fromValues(0, 0, -1);
        this.target = vec3.fromValues(...target);
        this.up = vec3.fromValues(...up);

        this.right = vec3.create();
        this.right = vec3.cross(this.right, this.front, this.up);
        vec3.normalize(this.right, this.right);

        // Movement vector based on camera direction
        this.movement = vec3.create();

        this.viewMatrix = mat4.create();
        
        this.worldProjectionMatrix = mat4.create();
        this.uiProjectionMatrix = mat4.create();

        this.updateProjection();
        this.updateViewMatrix();
    }

    setUniforms(gl, shaderProgram) {
        gl.useProgram(shaderProgram);
        const viewWorldPositionLocation = gl.getUniformLocation(shaderProgram, "u_viewWorldPosition");
        if (viewWorldPositionLocation !== null) {
            gl.uniform3fv(viewWorldPositionLocation, this.position);
        } else {
            warnLog("Uniform 'u_viewWorldPosition' not found in shader.");
        }
    }

    updateProjection() {
        const aspectRatio = this.canvas.width / this.canvas.height;
        
        mat4.perspective(this.worldProjectionMatrix, Math.PI / 4, aspectRatio, 0.1, 5000);
        
        const adjustedHeight = 600;
        const adjustedWidth = adjustedHeight * aspectRatio;
        mat4.ortho(this.uiProjectionMatrix, 0, adjustedWidth, 0, adjustedHeight, -1, 1);
    }

    updateViewMatrix() {
        vec3.add(this.target, this.position, this.front); // Camera looks along the front direction
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix(cameraType) {
        if (cameraType === CameraType.PERSPECTIVE) {
            return this.worldProjectionMatrix;
        } else {
            return this.uiProjectionMatrix;
        }
    }

    move(x, y, z) {
        vec3.cross(this.right, this.front, this.up);
        vec3.normalize(this.right, this.right); 

        vec3.set(this.movement, 0, 0, 0);

        // Compute movement based on camera direction
        vec3.scaleAndAdd(this.movement, this.movement, this.front, z); // Forward/backward movement
        vec3.scaleAndAdd(this.movement, this.movement, this.right, x); // Left/right movement
        vec3.scaleAndAdd(this.movement, this.movement, this.up, y); // Up/down movement

        vec3.add(this.position, this.position, this.movement);
        vec3.add(this.target, this.position, this.front);
        this.updateViewMatrix();
    }

    rotate(yaw, pitch) {
        const newFront = vec3.create();
        newFront[0] = Math.cos(yaw) * Math.cos(pitch);
        newFront[1] = Math.sin(pitch);
        newFront[2] = Math.sin(yaw) * Math.cos(pitch);
    
        vec3.normalize(this.front, newFront);
        vec3.add(this.target, this.position, this.front);
        this.updateViewMatrix();
    }
};