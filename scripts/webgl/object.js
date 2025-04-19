import { createVertexBuffer } from './buffer-manager.js';

export class ObjectBase {
    constructor(gl, vertices, shaderProgram, attributeSize) {
        this.gl = gl;
        this.vertices = vertices;
        this.vertexBuffer = createVertexBuffer(gl, vertices);
        this.shaderProgram = shaderProgram;
        this.attributeSize = attributeSize;

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.setupAttributes();

        gl.bindVertexArray(null);
    }

    setupAttributes() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, this.attributeSize, gl.FLOAT, false, 0, 0);
    }

    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        this.render();
        gl.bindVertexArray(null);
    }

    render() {
    }
}

export class Object3D extends ObjectBase {
    constructor(gl, vertices, shaderProgram) {
        super(gl, vertices, shaderProgram, 3);
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}

export class Object2D extends ObjectBase {
    constructor(gl, vertices, shaderProgram) {
        super(gl, vertices, shaderProgram, 2);
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
    }
}
