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
        this.submeshes = options.meshes || null;

        if (!this.submeshes) {
            this._setupBuffers();
            this._setupVAO();
        } else {    
            this._setupSubmeshVAOs();
        }
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

        // Position at location 0
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = 0;
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        // Normal at location 1 (if present)
        if (this.normalBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            const normalLoc = 1;
            gl.enableVertexAttribArray(normalLoc);
            gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
        }

        // Texcoord at location 2 (if present)
        if (this.texcoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            const texLoc = 2;
            gl.enableVertexAttribArray(texLoc);
            gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindVertexArray(null);
    }

    _setupSubmeshVAOs() {
        const gl = this.gl;
        this.submeshVAOs = [];

        for (const sub of this.submeshes) {
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);

            // Positions
            const posBuf = createBuffer(gl, sub.positions);
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            // Normals
            if (sub.normals && sub.normals.length) {
                const nBuf = createBuffer(gl, sub.normals);
                gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
                gl.enableVertexAttribArray(1);
                gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
            }

            // UVs
            if (sub.uvs && sub.uvs.length) {
                const uvBuf = createBuffer(gl, sub.uvs);
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
                gl.enableVertexAttribArray(2);
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
            }

            // Indices
            const idxBuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sub.indices, gl.STATIC_DRAW);

            gl.bindVertexArray(null);

            this.submeshVAOs.push({
                vao,
                count: sub.indices.length,
                material: sub.material
            });
        }
    }

    draw(activeShader) {
        if (this.submeshes) {
            //console.log("drawSubmeshes");
            this.drawSubmeshes(activeShader);
        } else {
            //console.log("drawSingleMesh");
            this.drawSingleMesh(); 
        }
        // const gl = this.gl;
        // gl.bindVertexArray(this.vao);
        // this.render();
        // gl.bindVertexArray(null);
    }

    drawSingleMesh() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        this.render();
        gl.bindVertexArray(null);
    }

    drawSubmeshes(activeShader) {
        const gl = this.gl;
        for (const sm of this.submeshVAOs) {
            gl.bindVertexArray(sm.vao);

            // Material color
            if (sm.material && sm.material.diffuse) {
                const [r, g, b] = sm.material.diffuse;
                const loc = gl.getUniformLocation(activeShader, "u_color");
                if (loc) gl.uniform4fv(loc, [r, g, b, 1.0]);
            }
            gl.drawElements(gl.TRIANGLES, sm.count, gl.UNSIGNED_SHORT, 0);
        }
        gl.bindVertexArray(null);
    }
}

// --- 3D object ---
export class Object3D extends MeshObject {
    constructor(gl, options) {
        super(gl, options);
        this.rotationSpeed = options.rotationSpeed || 0.5;
        this.angle = 0;
        this.scaleBy = options.scale ?? [1, 1, 1];
    }

    update(deltaTime) {
        this.angle += this.rotationSpeed * deltaTime;
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        this.rotate(this.angle, [0, 1, 0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scaleBy);
    }

    render() {
        // for simple hardcoded objects
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
