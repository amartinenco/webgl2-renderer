import { mat4, vec3 } from '../math/gl-matrix/index.js';
import { CameraType } from './utils/constants.js';

export class Camera {
    constructor(position = [0, 0, 300], target = [0, 0, 0], up = [0, 1, 0]) {        
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

        //if (this.mode === CameraType.PERSPECTIVE) {
            this.setProjection(CameraType.PERSPECTIVE, Math.PI / 4, 800 / 600, 0.1, 1000);
        //} else {
            this.setProjection(CameraType.ORTHOGRAPHIC, null, null, null, null, 800, 600);
        //}

        this.updateViewMatrix();
    }

    setProjection(mode, fov = Math.PI / 4, aspect = 800 / 600, near = 0.1, far = 1000, width = 800, height = 600) {
        if (mode === CameraType.PERSPECTIVE) {
            mat4.perspective(this.worldProjectionMatrix, fov, aspect, near, far);
        } else if (mode === CameraType.ORTHOGRAPHIC) {
            mat4.ortho(this.uiProjectionMatrix, 0, 800, 0, 600, -1, 1);
            //mat4.ortho(this.uiProjectionMatrix, -width / 2, width / 2, -height / 2, height / 2, -1, 1);
            //console.log(this.uiProjectionMatrix)
            //mat4.ortho(this.uiProjectionMatrix, 0, width, height, 0, -1, 1);
            //mat4.ortho(this.uiProjectionMatrix, -width / 2, width / 2, -height / 2, height / 2, -1, 1);
            //mat4.ortho(this.uiProjectionMatrix, 0, width, height, 0, -1, 1);
        }
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