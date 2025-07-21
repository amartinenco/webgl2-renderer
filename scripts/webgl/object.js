import { createBuffer } from './buffer-manager.js';
import { mat4, vec3, vec4 } from '../math/gl-matrix/index.js'
import { warnLog } from '../logger/logger.js';
import { TextureLoader } from './texture-loader.js';

export class ObjectBase {
    constructor(gl, objectDefinition, attributeSize) {
        this.gl = gl;
        this.name = objectDefinition.name;
        this.vertices = objectDefinition.vertices;
        this.normals = objectDefinition.normals;
        this.uvCoords = objectDefinition.uvCoords;
        this.vertexBuffer = createBuffer(gl, this.vertices);
        this.normalBuffer = createBuffer(gl, this.normals);
        this.indexBuffer = null;
        //this.texture = objectDefinition.texture;
        this.texture = null;
        this.texcoordBuffer = null;
        //this.texcoordBuffer = this.uvCoords.length ? createBuffer(gl, this.uvCoords) : null;
        if (objectDefinition.uvCoords && objectDefinition.uvCoords.length > 0) {
            this.texcoordBuffer = createBuffer(gl, objectDefinition.uvCoords);
        }

        if (typeof objectDefinition.texture === 'string') {
            const textureLoader = new TextureLoader(gl);
            this.texture = textureLoader.load(objectDefinition.texture);
        }

        this.shaderProgram = objectDefinition.shaderProgram;
        this.attributeSize = attributeSize;
        this.modelMatrix = mat4.create();
        this.position = null;
        mat4.identity(this.modelMatrix);

      
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.setupAttributes();

        if (objectDefinition.position) {
            this.position = objectDefinition.position
            mat4.translate( this.modelMatrix,  this.modelMatrix, this.position);
            console.log();
        }


        gl.bindVertexArray(null);
    }

    setupAttributes() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        gl.useProgram(this.shaderProgram);
       
        
        // else {    warnLog("Uniform 'u_useTexture' not found in shader."); }

        const positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_position");
        if (positionAttributeLocation !== -1) {
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, this.attributeSize, gl.FLOAT, false, 0, 0);
        } else {
            warnLog("Attribute 'a_position' not found in shader.");
        }

        if (this.normals && this.normals.length > 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            const normalsAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_normal");
            if (normalsAttributeLocation !== -1) {
                gl.enableVertexAttribArray(normalsAttributeLocation);
                gl.vertexAttribPointer(normalsAttributeLocation, this.attributeSize, gl.FLOAT, false, 0, 0);
            } else {
                warnLog("Attribute 'a_normal' not found in shader.");
            }
        }
        
        const useTextureLocation = this.gl.getUniformLocation(this.shaderProgram, "u_useTexture");
        //gl.uniform1i(useTextureLocation, 0);
        console.log(this.name + " texture " + this.texture);
        console.log(this.name + " texcoordBuffer " + this.texcoordBuffer)
        console.log(this.name + " " + Boolean(this.texture && this.texcoordBuffer) )
        const hasTexture = Boolean(this.texture && this.texcoordBuffer);
        if (useTextureLocation !== null) {
            gl.uniform1i(useTextureLocation, hasTexture ? 1 : 0);
            //console.log("---" + this.name + " " + hasTexture);
            // if (this.texture == null || this.texture == undefined) {
            //     this.gl.uniform1i(useTextureLocation, 0);
            // } else {
         } 
         console.log()
          console.log("name:" + hasTexture  + " " + this.name)
        if (hasTexture) {
            
            //this.gl.uniform1i(useTextureLocation, 1);
            const textureCoordAttributeLocation = gl.getAttribLocation(this.shaderProgram, "a_texcoord");
            if (textureCoordAttributeLocation !== -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
                gl.enableVertexAttribArray(textureCoordAttributeLocation);
                gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);
            } else {
                warnLog("Attribute 'a_texcoord' not found in shader.");
            }
        }
       
        mat4.translate(this.modelMatrix, this.modelMatrix, [0, 0, 0]);
    }

    draw() {
        const gl = this.gl;
        gl.useProgram(this.shaderProgram);
        
        const useTexLoc = gl.getUniformLocation(this.shaderProgram, "u_useTexture");
        const hasTexture = Boolean(this.texture && this.texcoordBuffer);
        gl.uniform1i(useTexLoc, hasTexture ? 1 : 0);

        if (hasTexture) {
            const texLoc = gl.getUniformLocation(this.shaderProgram, 'u_texture');
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(texLoc, 0);
        }

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
        throw new Error("Render method must be implemented by subclasses");
    }

    update(deltaTime) {
        throw new Error("Update method must be implemented by subclasses");
    }

    getShader() {
        return this.shaderProgram;
    }

    destroy() {
        if (this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
            this.vertexBuffer = null;
        }

        if (this.normalBuffer) {
            this.gl.deleteBuffer(this.normalBuffer);
            this.normalBuffer = null;
        }

        if (this.texcoordBuffer) {
            this.gl.deleteBuffer(this.texcoordBuffer);
            this.texcoordBuffer = null;
        }

        if (this.texture instanceof WebGLTexture) {
            this.gl.deleteTexture(this.texture);
            this.texture = null;
        }
    
        if (this.vao) {
            this.gl.deleteVertexArray(this.vao);
            this.vao = null;
        }
    
        if (this.indexBuffer) {
            this.gl.deleteBuffer(this.indexBuffer);
            this.indexBuffer = null;
        }
    }
}

export class Object3D extends ObjectBase {
    constructor(gl, objectDefinition) {
        super(gl, objectDefinition, 3);
        this.rotationSpeed = 0.5;
        //mat4.identity(this.modelMatrix);
        //mat4.rotateX(matrix, matrix, Math.PI); // apply rotation around X-axis
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 3);
    }

    update(deltaTime) {
        
        this.angle = (this.angle || 0) + this.rotationSpeed * deltaTime;
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);

        const center = [50, -75, -15];  
        mat4.translate(this.modelMatrix, this.modelMatrix, center);
        
        this.rotate(this.angle, [0, 1, 0]);
        const inverseCenter = [-center[0], -center[1], -center[2]];
        mat4.translate(this.modelMatrix, this.modelMatrix, inverseCenter);
    }
}

export class Object2D extends ObjectBase {
    constructor(gl, objectDefinition) {
        super(gl, objectDefinition, 2);
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
    }
}


export class ObjectUI extends ObjectBase {
    constructor(gl, objectDefinition) {
        super(gl, objectDefinition, 2);
    }

    render() {
        this.gl.enable(this.gl.BLEND); // transparency
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertices.length / 2);
        this.gl.disable(this.gl.BLEND);
    }
}