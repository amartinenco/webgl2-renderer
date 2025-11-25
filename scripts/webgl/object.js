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
            } else warnLog("Attribute a_normal not found in shader.");
        }

        if (this.texcoordBuffer && this.texture) {
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
export class RenderTargetQuad extends Renderable {
    constructor(gl, options) {
        super(gl);
        this.shaderProgram = options.shaderProgram;
        this.texture = options.texture;
        this.position = options.position || [0, 0, 0];
        this.vertices = options.vertices || [
            -1, -1, 0,
             1, -1, 0,
            -1,  1, 0,
             1,  1, 0
        ];

        this.vertexBuffer = createBuffer(gl, this.vertices);
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const posLoc = gl.getAttribLocation(this.shaderProgram, "a_position");
        if (posLoc !== -1) {
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        }
        gl.bindVertexArray(null);
    }

    update(deltaTime) {
        // Optional: animation for RTT quad
    }

    render() {
        const gl = this.gl;
        gl.useProgram(this.shaderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        const texLoc = gl.getUniformLocation(this.shaderProgram, 'u_texture');
        if (texLoc) gl.uniform1i(texLoc, 0);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length / 3);
        gl.bindVertexArray(null);
    }
}

// import { createBuffer } from './buffer-manager.js';
// import { mat4, vec3, vec4 } from '../math/gl-matrix/index.js'
// import { warnLog } from '../logger/logger.js';
// //import { TextureFactory } from './texture-factory.js';

// export class ObjectBase {
//     constructor(gl, objectDefinition, attributeSize) {
//         this.gl = gl;
//         this.name = objectDefinition.name;
//         this.vertices = objectDefinition.vertices;
//         this.normals = objectDefinition.normals;
//         this.uvCoords = objectDefinition.uvCoords;
//         this.vertexBuffer = createBuffer(gl, this.vertices);
//         this.normalBuffer = createBuffer(gl, this.normals);
//         this.indexBuffer = null;
//         this.outputTarget = objectDefinition.outputTarget;
//         //this.texture = objectDefinition.texture;
//         this.texture = null;
//         this.texcoordBuffer = null;
//         //this.texcoordBuffer = this.uvCoords.length ? createBuffer(gl, this.uvCoords) : null;
//         if (objectDefinition.uvCoords && objectDefinition.uvCoords.length > 0) {
//             this.texcoordBuffer = createBuffer(gl, objectDefinition.uvCoords);
//         }

//         // if (typeof objectDefinition.texture === 'string') {
//         //     const textureFactory = new TextureFactory(gl);
//         //     this.texture = textureFactory.loadImage("test", objectDefinition.texture);
//         // }
//         this.texture = objectDefinition.texture;

//         this.shaderProgram = objectDefinition.shaderProgram;
//         this.attributeSize = attributeSize;
//         this.modelMatrix = mat4.create();
//         this.position = null;
//         mat4.identity(this.modelMatrix);

      
//         this.vao = gl.createVertexArray();
//         gl.bindVertexArray(this.vao);

//         this.setupAttributes();

//         if (objectDefinition.position) {
//             this.position = objectDefinition.position
//             mat4.translate( this.modelMatrix,  this.modelMatrix, this.position);
//             console.log();
//         }

//         this.rotationX = 0;
//         this.rotationY = 0;
//         if (objectDefinition.rotation && (objectDefinition.rotation.x != 0 || objectDefinition.rotation.y != 0)) {
//             this.rotationX = objectDefinition.rotation.x * Math.PI / 180;
//             this.rotationY = objectDefinition.rotation.y * Math.PI / 180;
//             mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationY);
//             mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotationX);
//         }

//         gl.bindVertexArray(null);
//     }

//     setupAttributes() {
//         const gl = this.gl;
//         gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
//         gl.useProgram(this.shaderProgram);
       
        
//         // else {    warnLog("Uniform 'u_useTexture' not found in shader."); }

//         const positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");
//         if (positionAttributeLocation !== -1) {
//             gl.enableVertexAttribArray(positionAttributeLocation);
//             gl.vertexAttribPointer(positionAttributeLocation, this.attributeSize, gl.FLOAT, false, 0, 0);
//         } else {
//             warnLog("Attribute 'a_position' not found in shader.");
//         }

//         if (this.normals && this.normals.length > 0) {
//             gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
//             const normalsAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_normal");
//             if (normalsAttributeLocation !== -1) {
//                 gl.enableVertexAttribArray(normalsAttributeLocation);
//                 gl.vertexAttribPointer(normalsAttributeLocation, this.attributeSize, gl.FLOAT, false, 0, 0);
//             } else {
//                 warnLog("Attribute 'a_normal' not found in shader.");
//             }
//         }
        
//         const useTextureLocation = this.gl.getUniformLocation(this.shaderProgram, "u_useTexture");
//         //gl.uniform1i(useTextureLocation, 0);
//         console.log(this.name + " texture " + this.texture);
//         console.log(this.name + " texcoordBuffer " + this.texcoordBuffer)
//         console.log(this.name + " " + Boolean(this.texture && this.texcoordBuffer) )
//         const hasTexture = Boolean(this.texture && this.texcoordBuffer);
//         if (useTextureLocation !== null) {
//             gl.uniform1i(useTextureLocation, hasTexture ? 1 : 0);
//             //console.log("---" + this.name + " " + hasTexture);
//             // if (this.texture == null || this.texture == undefined) {
//             //     this.gl.uniform1i(useTextureLocation, 0);
//             // } else {
//          } 


//          console.log()
//           console.log("name:" + hasTexture  + " " + this.name)

          
//         if (hasTexture) {
            
//             //this.gl.uniform1i(useTextureLocation, 1);
//             const textureCoordAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_texcoord");
//             if (textureCoordAttributeLocation !== -1) {
//                 gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
//                 gl.enableVertexAttribArray(textureCoordAttributeLocation);
//                 gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);
//             } else {
//                 warnLog("Attribute 'a_texcoord' not found in shader.");
//             }
//         }
       
//         mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]);
//     }

//     draw() {
//         const gl = this.gl;
//         gl.useProgram(this.shaderProgram);
        
//         const useTexLoc = gl.getUniformLocation(this.shaderProgram, "u_useTexture");
//         const hasTexture = Boolean(this.texture && this.texcoordBuffer);
//         gl.uniform1i(useTexLoc, hasTexture ? 1 : 0);

//         if (hasTexture) {
//             const texLoc = gl.getUniformLocation(this.shaderProgram, 'u_texture');
//             gl.activeTexture(gl.TEXTURE0);
//             gl.bindTexture(gl.TEXTURE_2D, this.texture);
//             gl.uniform1i(texLoc, 0);
//         }

//         gl.bindVertexArray(this.vao);
//         this.render();
//         gl.bindVertexArray(null);

//         if (hasTexture) {
//             gl.bindTexture(gl.TEXTURE_2D, null);
//         }
//     }

//     translate(xOrVector, y = 0, z = 0) {
//         const vector = Array.isArray(xOrVector) ? xOrVector : [xOrVector, y, z];
//         mat4.translate(this.modelMatrix, this.modelMatrix, vector);
//     }

//     rotate(angle, axis = [0, 1, 0]) {
//         const normalizedAxis = vec3.create();
//         vec3.normalize(normalizedAxis, vec3.fromValues(...axis));
//         mat4.rotate(this.modelMatrix, this.modelMatrix, angle, normalizedAxis);
//     }

//     scale(xOrVector, y = 1, z = 1) {
//         const vector = Array.isArray(xOrVector) ? xOrVector : [xOrVector, y, z];
//         mat4.scale(this.modelMatrix, this.modelMatrix, vector);
//     }

//     getModelMatrix() {
//         return this.modelMatrix;
//     }

//     render() {
//         throw new Error("Render method must be implemented by subclasses");
//     }

//     update(deltaTime) {
//         throw new Error("Update method must be implemented by subclasses");
//     }

//     getShader() {
//         return this.shaderProgram;
//     }

//     destroy() {
//         if (this.vertexBuffer) {
//             this.gl.deleteBuffer(this.vertexBuffer);
//             this.vertexBuffer = null;
//         }

//         if (this.normalBuffer) {
//             this.gl.deleteBuffer(this.normalBuffer);
//             this.normalBuffer = null;
//         }

//         if (this.texcoordBuffer) {
//             this.gl.deleteBuffer(this.texcoordBuffer);
//             this.texcoordBuffer = null;
//         }

//         if (this.texture instanceof WebGLTexture) {
//             this.gl.deleteTexture(this.texture);
//             this.texture = null;
//         }
    
//         if (this.vao) {
//             this.gl.deleteVertexArray(this.vao);
//             this.vao = null;
//         }
    
//         if (this.indexBuffer) {
//             this.gl.deleteBuffer(this.indexBuffer);
//             this.indexBuffer = null;
//         }
//     }
// }

// export class Object3D extends ObjectBase {
//     constructor(gl, objectDefinition) {
//         super(gl, objectDefinition, 3);
//         this.rotationSpeed = 0.5;
//         //mat4.identity(this.modelMatrix);
//         //mat4.rotateX(matrix, matrix, Math.PI); // apply rotation around X-axis
//     }

//     render() {
//         this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
//     }

//     update(deltaTime) {
        
//         this.angle = (this.angle || 0) + this.rotationSpeed * deltaTime;
//         mat4.identity(this.modelMatrix);
//         mat4.translate(this.modelMatrix, this.modelMatrix, this.position);

//         const center = [50, -75, -15];  
//         mat4.translate(this.modelMatrix, this.modelMatrix, center);
        
//         this.rotate(this.angle, [0, 1, 0]);
//         const inverseCenter = [-center[0], -center[1], -center[2]];
//         mat4.translate(this.modelMatrix, this.modelMatrix, inverseCenter);
//     }
// }

// export class Object2D extends ObjectBase {
//     constructor(gl, objectDefinition) {
//         super(gl, objectDefinition, 3);
//     }

//     render() {
//         //this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 3);
//         this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
//     }
// }


// export class ObjectUI extends ObjectBase {
//     constructor(gl, objectDefinition) {
//         super(gl, objectDefinition, 2);
//     }

//     render() {
//         this.gl.enable(this.gl.BLEND); // transparency
//         this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
//         this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
//         this.gl.disable(this.gl.BLEND);
//     }
// }


