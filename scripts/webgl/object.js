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
        this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
        this.outputTarget = options.outputTarget || null;
        this.vao = null;
        this.submeshes = options.meshes || null;
        this.pivotOffset = [0, 0, 0];
        if (!this.submeshes) {
            this._setupBuffers();
            this._setupVAO();
        } else {    
            this._setupSubmeshVAOs();
            this.pivotOffset = this.computePivotOffset(this.submeshes.flatMap(sub => Array.from(sub.positions)) );
        }
    }

    updateBuffers() {
        const gl = this.gl;

        gl.bindVertexArray(this.vao);

        // Update vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        // Update UV buffer
        if (this.texcoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.uvCoords, gl.DYNAMIC_DRAW);
        }

        // Update index buffer
        if (this.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.DYNAMIC_DRAW);
        }

        gl.bindVertexArray(null);
    }

    
    update(deltaTime) {
        
    }

    computePivotOffset(positions) {
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            const z = positions[i+2];

            min[0] = Math.min(min[0], x);
            min[1] = Math.min(min[1], y);
            min[2] = Math.min(min[2], z);

            max[0] = Math.max(max[0], x);
            max[1] = Math.max(max[1], y);
            max[2] = Math.max(max[2], z);
        }

        const center = [
            (min[0] + max[0]) * 0.5,
            (min[1] + max[1]) * 0.5,
            (min[2] + max[2]) * 0.5
        ];

        return center; 
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
                material: sub.material,

                // cruch - will need some kind of Submesh metadata
                // this is used for shader to determine what is a "3d comptuer screen" and what is plastic corpus
                // I do it because I want to shade the "3d computer screen" area differently and not be effected by external lighting
                isScreen: sub.isScreen
            });
        }
    }

    draw(activeShader) {
        
        if (this.submeshes) {
            this.drawSubmeshes(activeShader);
        } else {
            this.drawSingleMesh(); 
        }
    }

    drawShadow() {
        const gl = this.gl;
        
        if (this.submeshes) {
            for (const sm of this.submeshVAOs) {
                gl.bindVertexArray(sm.vao);
                gl.drawElements(gl.TRIANGLES, sm.count, gl.UNSIGNED_SHORT, 0);
            }
        } else {
            gl.bindVertexArray(this.vao);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        }

        gl.bindVertexArray(null);
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

            const isScreenLoc = this.gl.getUniformLocation(activeShader, "u_isScreen");
            if (isScreenLoc) {
                this.gl.uniform1i(isScreenLoc, sm.isScreen ? 1 : 0);
            }

            gl.bindVertexArray(sm.vao);

            if (sm.material && sm.material.hasTexture && sm.material.diffuseTexture) {
                const useTexLoc = gl.getUniformLocation(activeShader, "u_useTexture");
                if (useTexLoc) gl.uniform1i(useTexLoc, 1);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, sm.material.diffuseTexture);

                const texLoc = gl.getUniformLocation(activeShader, "u_texture");
                if (texLoc) gl.uniform1i(texLoc, 0);
            } else {
                const useTexLoc = gl.getUniformLocation(activeShader, "u_useTexture");
                if (useTexLoc) gl.uniform1i(useTexLoc, 0);

                if (sm.material && sm.material.diffuse) {
                    const [r, g, b] = sm.material.diffuse;
                    const loc = gl.getUniformLocation(activeShader, "u_color");
                    if (loc) gl.uniform4fv(loc, [r, g, b, 1.0]);
                }
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
        
        if (options.rotation) {
            const { x = 0, y = 0, z = 0 } = options.rotation;
            this.rotationX = x * Math.PI / 180;
            this.rotationY = y * Math.PI / 180;
            this.rotationZ = z * Math.PI / 180;

            this.initialRotation = { x: this.rotationX, y: this.rotationY, z: this.rotationZ };
        }

        this.scaleBy = options.scale ?? [1, 1, 1];
    }

    update(deltaTime) {
        //this.angle += this.rotationSpeed * deltaTime;
        mat4.identity(this.modelMatrix);

        // // 1. Move object to world position
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);

        // 2. Move pivot to origin
        mat4.translate(this.modelMatrix, this.modelMatrix, this.pivotOffset);

        // 3. Rotate around pivot
        //mat4.rotateY(this.modelMatrix, this.angle, [0, 1, 0]);
        //this.rotate(this.angle, [0, 1, 0]);
        if (this.initialRotation) { 
            mat4.rotateX(this.modelMatrix, this.modelMatrix, this.initialRotation.x);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, this.initialRotation.y);
            mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.initialRotation.z); 
        }
        
        // 4. Move pivot back
        const negPivot = vec3.create();
        vec3.negate(negPivot, this.pivotOffset);
        mat4.translate(this.modelMatrix, this.modelMatrix, negPivot);

        // 5. Apply scale
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
        this.scaleBy = options.scale ?? [1, 1, 1];
    }

    update(deltaTime) {
        mat4.identity(this.modelMatrix);
        if (this.position) {
            mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        }

        if (this.rotationX || this.rotationY) {
            mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationY);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotationX);
        }

        mat4.scale(this.modelMatrix, this.modelMatrix, this.scaleBy);
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

export class ObjectRTT extends MeshObject {
    constructor(gl, options) {
        super(gl, {
            ...options,
            vertices: options.vertices,
            uvCoords: options.uvCoords
        });
        this.isScreen = true;
    }

    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        this.render();
        gl.bindVertexArray(null);
    }

    update(dt) {
        mat4.identity(this.modelMatrix);

        if (this.onUpdate) {
            this.onUpdate(dt);
        }
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}

