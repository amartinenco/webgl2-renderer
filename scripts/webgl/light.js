import { warnLog } from "../logger/logger.js";

export class LightBase {
    constructor(gl, lightObjectDefinition) {
        this.gl = gl;
        this.name = lightObjectDefinition.name;
        this.shaderProgram = lightObjectDefinition.shaderProgram;
        this.color = lightObjectDefinition.color || [255, 250, 222];
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
        this.direction = lightObjectDefinition.direction || [0, -1, 0];
    }

    setupUniforms() {
        if (!this.shaderProgram) {
            warnLog("Shader program is missing. Cannot set uniforms.");
            return;
        }

        this.gl.useProgram(this.shaderProgram);
        const colorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_color");
        if (colorLocation !== null) {
            this.gl.uniform4fv(colorLocation, [255, 255, 255, 1]);
        } else {
            warnLog("Uniform 'u_color' not found in shader.");
        }

        const reverseLightDirectionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_reverseLightDirection");
        if (reverseLightDirectionLocation !== null) {
            this.gl.uniform3fv(reverseLightDirectionLocation, [0, -1, 0]);
        } else {
            warnLog("Uniform 'u_reverseLightDirection' not found in shader.");
        }
        // this.gl.uniform3fv(colorLocation, this.color);
        // this.gl.uniform3fv(reverseLightDirectionLocation, this.direction);
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
    }

    // TODO: add the point light logic
}