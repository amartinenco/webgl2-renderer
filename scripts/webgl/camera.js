import { mat4, vec3 } from '../math/gl-matrix/index.js';

export class Camera {
    constructor(position = [0, 0, 5], target = [0, 0, 0], up = [0, 1, 0]) {
        this.position = vec3.fromValues(...position);
        this.target = vec3.fromValues(...target);
        this.up = vec3.fromValues(...up);

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.setPerspective(Math.PI / 4, 800 / 600, 0.5, 100);
    }

    setPerspective(fov, aspect, near, far) {
        mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    move(x, y, z) {
        vec3.add(this.position, this.position, [x, y, z]);
        this.updateViewMatrix();
    }
};