import { warnLog } from "../logger/logger.js";
import { vec3, vec4, mat4 } from "../math/gl-matrix/index.js";
import { CameraType } from './utils/constants.js';

export class LightBase {
    constructor(gl, lightObjectDefinition, camera) {
        this.gl = gl;
        this.camera = camera;
        this.name = lightObjectDefinition.name;
        this.shaderProgram = lightObjectDefinition.shaderProgram;
        const colorArray = lightObjectDefinition.color || [1, 1, 1];
        const normalizedColor = vec3.create();
        
        this.lightIntensity = lightObjectDefinition.lightIntensity || 1.0;
        const baseColor = vec3.fromValues(...colorArray);
        let scaledColor = vec3.create(); 


        vec3.scale(scaledColor, baseColor, this.lightIntensity);
        this.color = scaledColor;

        this.specularIntensity = lightObjectDefinition.specularIntensity || 1.0;
        this.direction = vec3.fromValues(
            lightObjectDefinition.direction[0],
            lightObjectDefinition.direction[1],
            lightObjectDefinition.direction[2]
        );
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
    }

    applyLighting() {
        throw new Error("Apply lighting method must be implemented by subclasses")
    }

    getLightData() {
        throw new Error("Get light data method must be implemented by subclasses")
    }
}

export class DirectionalLight extends LightBase {
    constructor(gl, lightObjectDefinition, camera) {
        super(gl, lightObjectDefinition, camera);

        this.direction = vec3.create();
        const directionArray = lightObjectDefinition.direction || [0, -1, -1];
        //const directionArray = [0, -1, -1];
        const actualLightDirection = vec3.fromValues(...directionArray);
        vec3.normalize(actualLightDirection, actualLightDirection);
        this.direction = actualLightDirection;


        // const normalizedColor = vec3.create();
        // vec3.normalize(normalizedColor, vec3.fromValues(...colorArray));
        // this.color = normalizedColor;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.viewProjectionMatrix = mat4.create();
    }

    updateMatrices() {
        const lightPos = vec3.create();
        vec3.scale(lightPos, this.direction, -500.0);  // far enough back

        const target = vec3.fromValues(0, 0, 0); // look at scene center

        mat4.lookAt(
            this.viewMatrix,
            lightPos,
            target,
            [0, 1, 0]
        );

        const size = 120.0;
        const near = 1.0;
        const far  = 2000.0;

        mat4.ortho(
            this.projectionMatrix,
            -size, size,
            -size, size,
            near, far
        );

        // 4. Combine
        mat4.multiply(
            this.viewProjectionMatrix,
            this.projectionMatrix,
            this.viewMatrix
        );
    }

    setupUniforms() {
        super.setupUniforms();

        const reverseLightDirectionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_reverseLightDirection");

        if (reverseLightDirectionLocation !== null) {
            let rev = vec3.create(); 
            vec3.negate(rev, this.direction);
            this.gl.uniform3fv(reverseLightDirectionLocation, rev);
        } else {
            warnLog("Uniform 'u_reverseLightDirection' not found in shader.");
        }

        this.gl.uniform3fv(this.gl.getUniformLocation(this.shaderProgram, "u_lightColor"), this.color);
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
    constructor(gl, lightObjectDefinition, camera) {
        super(gl, lightObjectDefinition, camera);
        if (lightObjectDefinition.position) {
            this.position = lightObjectDefinition.position;
        } else {
            this.position = vec3.create();
        }
        this.lightIntensity = lightObjectDefinition.lightIntensity || 1.0;
        //vec3.scale(this.color, this.color, this.lightIntensity);
    }

    applyLighting() {
        this.setupUniforms();
    }

    setupUniforms() {

        super.setupUniforms();
        this.gl.useProgram(this.shaderProgram);
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
        this.gl.uniform1f(useShininessPositionLocation, this.specularIntensity);
    } else {
        warnLog("Uniform 'u_shininess' not found in shader.");
    }

    const useSpecularColorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_specularColor");
    if (useSpecularColorLocation !== null) {
        this.gl.uniform3fv(useSpecularColorLocation, this.specularColor);
    } else {
        warnLog("Uniform 'u_specularColor' not found in shader.");
    }

    const intensityLoc = this.gl.getUniformLocation(this.shaderProgram, "u_pointLightIntensity"); 
    if (intensityLoc !== null) { 
        this.gl.uniform1f(intensityLoc, this.lightIntensity); 
    }

    this.gl.uniform3fv(this.gl.getUniformLocation(this.shaderProgram, "u_lightColor"), this.color);
}


    getLightData() {
        return {
            name: this.name,
            type: "point",
            position: this.position, 
            color: this.color, 
            specularColor: this.specularColor,
            specularIntensity: this.specularIntensity 
        };
    }
}

export class SpotLight extends LightBase {
    constructor(gl, lightObjectDefinition, camera) {
        super(gl, lightObjectDefinition, camera);
        vec3.scale(this.color, this.color, this.lightIntensity);
        if (lightObjectDefinition.position) {
            this.position = lightObjectDefinition.position;
            this.innerLimit = lightObjectDefinition.innerLimit;
            this.outerLimit = lightObjectDefinition.outerLimit;
        } else {
            this.position = vec3.create();
        }

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.viewProjectionMatrix = mat4.create();
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
        
        // const useLightLimitLocation = this.gl.getUniformLocation(this.shaderProgram, "u_limit");
        // if (useLightLimitLocation !== null) {
        //     this.gl.uniform1f(useLightLimitLocation, Math.cos(this.limit * (Math.PI / 180.0)));
        // } else {
        //     warnLog("Uniform 'u_limit' not found in shader.");
        // }

        const useShininessPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_shininess");
        
        if (useShininessPositionLocation !== null) {
            this.gl.uniform1f(useShininessPositionLocation, this.specularIntensity);
        } else {
            warnLog("Uniform 'u_shininess' not found in shader.");
        }

        const useSpecularColorLocation = this.gl.getUniformLocation(this.shaderProgram, "u_specularColor");
        if (useSpecularColorLocation !== null) {
            this.gl.uniform3fv(useSpecularColorLocation, this.specularColor);
        } else {
            warnLog("Uniform 'u_specularColor' not found in shader.");
        }

        const useInnerLimitLocation = this.gl.getUniformLocation(this.shaderProgram, "u_innerLimit");
        if (useInnerLimitLocation !== null) {
            this.gl.uniform1f(useInnerLimitLocation, Math.cos(this.innerLimit * (Math.PI / 180.0)));
        } else {
            warnLog("Uniform 'u_innerLimit' not found in shader.");
        }

        const useOuterLimitLocation = this.gl.getUniformLocation(this.shaderProgram, "u_outerLimit");
        if (useOuterLimitLocation !== null) {
            this.gl.uniform1f(useOuterLimitLocation, Math.cos(this.outerLimit * (Math.PI / 180.0)));
        } else {
            warnLog("Uniform 'u_outerLimit' not found in shader.");
        }

        this.gl.uniform3fv(this.gl.getUniformLocation(this.shaderProgram, "u_lightColor"), this.color);

        const intensityLoc = this.gl.getUniformLocation(this.shaderProgram, "u_spotLightIntensity"); 
        if (intensityLoc !== null) { 
            this.gl.uniform1f(intensityLoc, this.lightIntensity); 
        }
    }

    updateMatrices() {
        const lightPos = this.position;

        // Normalize direction
        const dir = vec3.create();
        vec3.normalize(dir, this.direction);

        // Choose a stable UP vector
        let up = vec3.fromValues(0, 1, 0);
        if (Math.abs(dir[1]) > 0.99) {
            up = vec3.fromValues(0, 0, 1);
        }

        // Compute right = normalize(cross(up, dir))
        const right = vec3.create();
        vec3.cross(right, up, dir);
        vec3.normalize(right, right);

        // Recompute up = cross(dir, right)
        vec3.cross(up, dir, right);

        // Build view matrix manually
        const target = vec3.create();
        vec3.add(target, lightPos, dir);

        mat4.lookAt(this.viewMatrix, lightPos, target, up);

        const size = 120.0;
        const near = 1.0;
        const far  = 2000.0;

        mat4.ortho(
            this.projectionMatrix,
            -size, size,
            -size, size,
            near, far
        );

        // Combine
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
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


export class ScreenLight extends LightBase {
    constructor(gl, lightObjectDefinition, camera) {
        super(gl, lightObjectDefinition, camera);
        this.position = lightObjectDefinition.position;
        this.normal = lightObjectDefinition.direction;
        this.intensity = lightObjectDefinition.lightIntensity;
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

        const gl = this.gl;
        const program = this.shaderProgram; 
        gl.uniform1i(gl.getUniformLocation(program, "u_useScreenLight"), 1);
        gl.uniform3fv(gl.getUniformLocation(program, "u_screenLightPos"), this.position);
        gl.uniform3fv(gl.getUniformLocation(program, "u_screenLightNormal"), this.normal);
        gl.uniform1f(gl.getUniformLocation(program, "u_screenLightIntensity"), this.intensity);
        let scaledColor = vec3.create();
        vec3.scale(scaledColor, this.color, this.intensity);
        gl.uniform3fv(gl.getUniformLocation(program, "u_screenLightColor"), scaledColor);
        const now = performance.now() * 0.001; 

        gl.uniform1f(gl.getUniformLocation(program, "u_time"), now);
    }

    getLightData() {
        return {
            name: this.name,
            type: "screen",
            position: this.position,
            direction: this.normal,
            color: this.color,
            intensity: this.intensity
        };
    }
}
