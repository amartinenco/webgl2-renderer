import { createVertexBuffer } from './buffer-manager.js';

export class Object3D {
    constructor(gl, vertices, shaderProgram) {
        this.gl = gl;
        this.vertexBuffer = createVertexBuffer(gl, vertices);
        this.shaderProgram = shaderProgram;
    }

    draw() {
        const gl = this.gl;
        gl.useProgram(this.shaderProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3); // Assuming a triangle for now
    }
}