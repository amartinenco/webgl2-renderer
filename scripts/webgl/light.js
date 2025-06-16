import { warnLog } from "../logger/logger.js";
import { vec3, mat4 } from "../math/gl-matrix/index.js";

export class LightBase {
    constructor(gl, lightObjectDefinition) {
        this.gl = gl;
        this.name = lightObjectDefinition.name;
        this.shaderProgram = lightObjectDefinition.shaderProgram;
        const colorArray = lightObjectDefinition.color || [1, 1, 1];
        const normalizedColor = vec3.create();
        vec3.normalize(normalizedColor, vec3.fromValues(...colorArray));
        this.color = normalizedColor;
        this.intensity = lightObjectDefinition.intensity || 1.0;
        this.direction = lightObjectDefinition.direction;
        this.limit = lightObjectDefinition.limit;
        const normalizedSpecularColor = vec3.create();
        const specularColorArray = lightObjectDefinition.specularColor || [1, 1, 1];
        vec3.normalize(normalizedSpecularColor, vec3.fromValues(...specularColorArray));
        this.specularColor = normalizedSpecularColor;
        this.rotationX = 0;
        this.rotationY = 0;
        if (lightObjectDefinition.rotation && (lightObjectDefinition.rotation.x != 0 || lightObjectDefinition.rotation.y != 0)) {
            this.rotationX = lightObjectDefinition.rotation.x * Math.PI / 180;
            this.rotationY = lightObjectDefinition.rotation.y * Math.PI / 180;
            const rotationMatrix = mat4.create();
            mat4.identity(rotationMatrix);
            mat4.rotateY(rotationMatrix, rotationMatrix, this.rotationY);
            mat4.rotateX(rotationMatrix, rotationMatrix, this.rotationX);
            vec3.normalize(this.direction, this.direction);
            vec3.transformMat4(this.direction, this.direction, rotationMatrix);
        }
    }

    getShader() {
        return this.shaderProgram;
    }
    
    setupUniforms() {
         if (!this.shaderProgram) {
            warnLog("Shader program is missing. Cannot set uniforms.");
            return;
        }

        this.gl.useProgram(this.shaderProgram);

        const colorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_color");
        if (colorLocation !== null) {
            this.gl.uniform4fv(colorLocation, [1, 1, 1, 1]);
        } else {
            warnLog("Uniform 'u_color' not found in shader.");
        }

        const uselightColorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_lightColor");
        
        if (uselightColorLocation !== null) {
            this.gl.uniform3fv(uselightColorLocation, this.color);
        } else {
            warnLog("Uniform 'u_lightColor' not found in shader.");
        }
    }

    applyLighting() {
        throw new Error("Apply lighting method must be implemented by subclasses")
    }

    getLightData() {
        throw new Error("Get light data method must be implemented by subclasses")
    }
}

export class DirectionalLight extends LightBase {
    constructor(gl, lightObjectDefinition) {
        super(gl, lightObjectDefinition);
        this.direction = vec3.create();
        const directionArray = lightObjectDefinition.direction || [1, 1, 0];
        const actualLightDirection = vec3.fromValues(...directionArray);
        vec3.normalize(actualLightDirection, actualLightDirection);
        this.direction = actualLightDirection;
    }

    setupUniforms() {
        super.setupUniforms();

        const reverseLightDirectionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_reverseLightDirection");
        if (reverseLightDirectionLocation !== null) {
            this.gl.uniform3fv(reverseLightDirectionLocation, this.direction);
        } else {
            warnLog("Uniform 'u_reverseLightDirection' not found in shader.");
        }
    }

    applyLighting() {
        this.setupUniforms();
    }

    getLightData() {
        return { 
            name: this.name,
            type: "directional",
            direction: this.direction, 
            color: this.color 
        };
    }
}

export class PointLight extends LightBase {
    constructor(gl, lightObjectDefinition) {
        super(gl, lightObjectDefinition);
        if (lightObjectDefinition.position) {
            this.position = lightObjectDefinition.position;
        } else {
            this.position = vec3.create();
        }
    }

    applyLighting() {
        this.setupUniforms();
    }

    setupUniforms() {
        super.setupUniforms();

        const usePointLightLocation = this.gl.getUniformLocation(this.shaderProgram, "u_usePointLight");
        if (usePointLightLocation !== null) {
            this.gl.uniform1i(usePointLightLocation, 1);
        } else {
            warnLog("Uniform 'u_usePointLight' not found in shader.");
        }

        const usePointLightPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_lightPosition");
        if (usePointLightPositionLocation !== null) {
            this.gl.uniform3fv(usePointLightPositionLocation, this.position);
        } else {
            warnLog("Uniform 'u_lightPosition' not found in shader.");
        }

        const useShininessPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_shininess");
        
        if (useShininessPositionLocation !== null) {
            this.gl.uniform1f(useShininessPositionLocation, this.intensity);
        } else {
            warnLog("Uniform 'u_shininess' not found in shader.");
        }

        const useSpecularColorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_specularColor");
        if (useSpecularColorLocation !== null) {
            this.gl.uniform3fv(useSpecularColorLocation, this.specularColor);
        } else {
            warnLog("Uniform 'u_specularColor' not found in shader.");
        }

        const useLimitLocation = this.gl.getUniformLocation(this.shaderProgram, "u_limit");
        
        if (useLimitLocation !== null) {
            this.gl.uniform1f(useLimitLocation, Math.cos(360 * (Math.PI / 180.0)));
        } else {
            warnLog("Uniform 'u_limit' not found in shader.");
        }
    }

    getLightData() {
        return {
            name: this.name,
            type: "point",
            position: this.position, 
            color: this.color, 
            specularColor: this.specularColor,
            intensity: this.intensity 
        };
    }
}

export class SpotLight extends LightBase {
    constructor(gl, lightObjectDefinition) {
        super(gl, lightObjectDefinition);
        if (lightObjectDefinition.position) {
            this.position = lightObjectDefinition.position;
        } else {
            this.position = vec3.create();
        }
    }

    applyLighting() {
        this.setupUniforms();
    }

    setupUniforms() {
        super.setupUniforms();

        const useSpotLightLocation = this.gl.getUniformLocation(this.shaderProgram, "u_useSpotLight");
        if (useSpotLightLocation !== null) {
            this.gl.uniform1i(useSpotLightLocation, 1);
        } else {
            warnLog("Uniform 'u_useSpotLight' not found in shader.");
        }

        const useSpotLightPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_lightPosition");
        if (useSpotLightPositionLocation !== null) {
            this.gl.uniform3fv(useSpotLightPositionLocation, this.position);
        } else {
            warnLog("Uniform 'u_lightPosition' not found in shader.");
        }

        const useLightDirectionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_lightDirection");
        if (useLightDirectionLocation !== null) {
            this.gl.uniform3fv(useLightDirectionLocation, this.direction);
        } else {
            warnLog("Uniform 'u_lightDirection' not found in shader.");
        }
        
        const useLightLimitLocation = this.gl.getUniformLocation(this.shaderProgram, "u_limit");
        if (useLightLimitLocation !== null) {
            this.gl.uniform1f(useLightLimitLocation, Math.cos(this.limit * (Math.PI / 180.0)));
        } else {
            warnLog("Uniform 'u_limit' not found in shader.");
        }

        const useShininessPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_shininess");
        
        if (useShininessPositionLocation !== null) {
            this.gl.uniform1f(useShininessPositionLocation, this.intensity);
        } else {
            warnLog("Uniform 'u_shininess' not found in shader.");
        }

        const useSpecularColorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_specularColor");
        if (useSpecularColorLocation !== null) {
            this.gl.uniform3fv(useSpecularColorLocation, this.specularColor);
        } else {
            warnLog("Uniform 'u_specularColor' not found in shader.");
        }
    }

    getLightData() {
        return {
            name: this.name,
            type: "spot",
            position: this.position, 
            color: this.color, 
            direction: this.direction
        };
    }
}