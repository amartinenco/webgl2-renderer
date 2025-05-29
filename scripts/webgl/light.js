import { warnLog } from "../logger/logger.js";
import { vec3 } from "../math/gl-matrix/index.js";

export class LightBase {
    constructor(gl, lightObjectDefinition) {
        this.gl = gl;
        this.name = lightObjectDefinition.name;
        this.shaderProgram = lightObjectDefinition.shaderProgram;
        this.color = lightObjectDefinition.color || [1, 1, 1];
        this.intensity = lightObjectDefinition.intensity || 1.0;
    }

    getShader() {
        return this.shaderProgram;
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
        return { direction: this.direction, color: this.color, intensity: this.intensity };
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

        const usePointLightLocation = this.gl.getUniformLocation(this.shaderProgram, "u_usePointLight");
        if (usePointLightLocation !== null) {
            this.gl.uniform1i(usePointLightLocation, 1);
        } else {
            warnLog("Uniform 'u_usePointLight' not found in shader.");
        }

        const usePointLightPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_pointLightPosition");
        if (usePointLightPositionLocation !== null) {
            this.gl.uniform3fv(usePointLightPositionLocation, this.position);
        } else {
            warnLog("Uniform 'u_pointLightPosition' not found in shader.");
        }

        const useShininessPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_shininess");
        console.log();
        if (useShininessPositionLocation !== null) {
            this.gl.uniform1f(useShininessPositionLocation, this.intensity);
        } else {
            warnLog("Uniform 'u_shininess' not found in shader.");
        }
    }

    // setIntensity(intensity) {
    //     this.intensity = intensity;
    //     const useShininessPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_shininess");
    //     if (useShininessPositionLocation !== null) {
    //         this.gl.uniform3fv(useShininessPositionLocation, this.intensity);
    //     } else {
    //         warnLog("Uniform 'u_shininess' not found in shader.");
    //     }
    // }
}