import { createVertexBuffer } from './buffer-manager.js';
import { mat4, vec3 } from '../math/gl-matrix/index.js'

export class ObjectBase {
    constructor(gl, vertices, shaderProgram, attributeSize) {
        this.gl = gl;
        this.vertices = vertices;
        this.vertexBuffer = createVertexBuffer(gl, vertices);
        this.shaderProgram = shaderProgram;
        this.attributeSize = attributeSize;
        this.modelMatrix = mat4.create();
        mat4.identity(this.modelMatrix);
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
        
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]);
    }

    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        this.render();
        gl.bindVertexArray(null);
    }

    translate(xOrVector, y = 0, z = 0) {
        const vector = Array.isArray(xOrVector) ? xOrVector : [xOrVector, y, z];
        mat4.translate(this.modelMatrix, this.modelMatrix, vector);
    }

    rotate(angle, axis = [0, 1, 0]) {
        const normalizedAxis = vec3.create();
        vec3.normalize(normalizedAxis, vec3.fromValues(...axis));
        mat4.rotate(this.modelMatrix, this.modelMatrix, angle, normalizedAxis);
    }

    scale(xOrVector, y = 1, z = 1) {
        const vector = Array.isArray(xOrVector) ? xOrVector : [xOrVector, y, z];
        mat4.scale(this.modelMatrix, this.modelMatrix, vector);
    }

    getModelMatrix() {
        return this.modelMatrix;
    }

    render() {
        throw new Error("Render method must be implemented by subclasses")
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


export class ObjectUI extends ObjectBase {
    constructor(gl, vertices, shaderProgram) {
        super(gl, vertices, shaderProgram, 2);
    }

    render() {
        this.gl.enable(this.gl.BLEND); // transparency
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
        this.gl.disable(this.gl.BLEND);
    }
}