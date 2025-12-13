import { mat4, vec3 } from '../math/gl-matrix/index.js';
import { createBuffer } from './buffer-manager.js';
import { warnLog } from '../logger/logger.js';

// --- Base interface for all renderable objects ---
export class Renderable {

    constructor(gl) {
        this.gl = gl;
        this.modelMatrix = mat4.create();
        mat4.identity(this.modelMatrix);
    }

    update(deltaTime) {
        throw new Error("update() must be implemented by subclass");
    }

    render() {
        throw new Error("render() must be implemented by subclass");
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
}

// --- Base class for objects with attributes (vertices, normals, uvs) ---
export class MeshObject extends Renderable {
    constructor(gl, options) {
        super(gl);
        this.name = options.name;
        this.shaderProgram = options.shaderProgram;
        this.vertices = options.vertices || [];
        this.normals = options.normals || [];
        this.uvCoords = options.uvCoords || [];
        this.texture = options.texture || null;
        this.position = options.position || [0, 0, 0];
        this.rotation = options.rotation || { x: 0, y: 0 };
        this.outputTarget = options.outputTarget || null;
        this.vao = null;

        this._setupBuffers();
        this._setupVAO();
    }

    _setupBuffers() {
        const gl = this.gl;
        this.vertexBuffer = createBuffer(gl, this.vertices);
        this.normalBuffer = this.normals.length ? createBuffer(gl, this.normals) : null;
        this.texcoordBuffer = this.uvCoords.length ? createBuffer(gl, this.uvCoords) : null;
    }

    _setupVAO() {
        const gl = this.gl;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(this.shaderProgram, "a_position");
        if (posLoc !== -1) {
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        } else warnLog("Attribute a_position not found in shader.");

        if (this.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            const normalLoc = gl.getAttribLocation(this.shaderProgram, "a_normal");
            if (normalLoc !== -1) {
                gl.enableVertexAttribArray(normalLoc);
                gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
            } //else warnLog("Attribute a_normal not found in shader.");
        }

        if (this.texcoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            const texLoc = gl.getAttribLocation(this.shaderProgram, "a_texcoord");
            if (texLoc !== -1) {
                gl.enableVertexAttribArray(texLoc);
                gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
            } else warnLog("Attribute a_texcoord not found in shader.");
        }

        gl.bindVertexArray(null);
    }

    draw() {
        const gl = this.gl;
        gl.useProgram(this.shaderProgram);

        // Texture
        const hasTexture = Boolean(this.texture && this.texcoordBuffer);
        const useTexLoc = gl.getUniformLocation(this.shaderProgram, "u_useTexture");
        if (useTexLoc) gl.uniform1i(useTexLoc, hasTexture ? 1 : 0);

        if (hasTexture) {
            const texLoc = gl.getUniformLocation(this.shaderProgram, 'u_texture');
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(texLoc, 0);
        }

        gl.bindVertexArray(this.vao);
        this.render();
        gl.bindVertexArray(null);

        if (hasTexture) gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

// --- 3D object ---
export class Object3D extends MeshObject {
    constructor(gl, options) {
        super(gl, options);
        this.rotationSpeed = options.rotationSpeed || 0.5;
        this.angle = 0;
    }

    update(deltaTime) {
        this.angle += this.rotationSpeed * deltaTime;
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        this.rotate(this.angle, [0, 1, 0]);
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}

// --- 2D object ---
export class Object2D extends MeshObject {

    constructor(gl, options) {
        super(gl, options);
        if (options.position) {
            this.position = options.position;
            mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        }
         if (options.rotation) {
            const { x = 0, y = 0 } = options.rotation;
            this.rotationX = x * Math.PI / 180;
            this.rotationY = y * Math.PI / 180;

            mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationY);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotationX);
        }
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}

// --- UI object ---
export class ObjectUI extends MeshObject {
    
    _setupVAO() {
        const gl = this.gl;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(this.shaderProgram, "a_position");
        if (posLoc !== -1) {
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0); // 2D positions
        } else warnLog("Attribute a_position not found in shader.");

        gl.bindVertexArray(null);
    }

    render() {
        const gl = this.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
        gl.disable(gl.BLEND);
    }
}

// --- Render-to-texture object ---
export class ObjectRTT extends MeshObject {
    constructor(gl, options) {
        super(gl, {
            ...options,
            texture: options.texture,      // RTT texture as input
            uvCoords: options.uvCoords || [
                0, 0,
                1, 0,
                0, 1,
                1, 1
            ],
            vertices: options.vertices || [
                -1, -1, 0,
                 1, -1, 0,
                -1,  1, 0,
                 1,  1, 0
            ]
        });

        if (options.position) {
            this.position = options.position;
            mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        }
        
    }

    update(dt) {
        // Usually empty for RTT quads
    }

    // render() {
    //     this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    // }
    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}
