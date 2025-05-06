import { errorLog, warnLog } from "../logger/logger.js";
import { ShaderType } from "./utils/constants.js";

const isLocal = window.location.hostname === "localhost";
const SHADER_PATH = isLocal ? "./shaders" : `${window.location.origin}/shaders`;

export class ShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.shaderPath = SHADER_PATH;
        this.shaders = new Map();
    }

    async initialize() {
        await this.loadShader(ShaderType.THREE_D, "worldVertexShader.glsl", "worldFragmentShader.glsl");
        await this.loadShader(ShaderType.TWO_D, "worldVertexShader.glsl", "worldFragmentShader.glsl");
        await this.loadShader(ShaderType.UI, "uiVertexShader.glsl", "uiFragmentShader.glsl");
    }

    async loadShader(name, vertexFile, fragmentFile) {
        const vertexShaderSource = await this.fetchShader(`${this.shaderPath}/${vertexFile}`);
        const fragmentShaderSource = await this.fetchShader(`${this.shaderPath}/${fragmentFile}`);

        if (!vertexShaderSource || !fragmentShaderSource) {
            errorLog(`Failed to load shader sources for ${name}.`);
            return;
        }

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            errorLog(`Shader creation failed for ${name}.`);
            return;
        }

        const program = this.createProgram(vertexShader, fragmentShader);
        this.shaders.set(name, program);
    }

    async fetchShader(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                errorLog(`Failed to fetch shader from ${url}`);
                return null;
            }
            return await response.text();
        } catch (error) {
            errorLog(`Error fetching shader: ${error.message}`);
            return null;
        }
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(`Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            errorLog(`Program linking error: ${this.gl.getProgramInfoLog(program)}`);
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    useShader(name) {
        const program = this.shaders.get(name);
        if (program) {
            this.gl.useProgram(program);
        } else {
            errorLog(`Shader ${name} not found!`);
        }
    }

    getShader(name) {
        if (!this.shaders.has(name)) {
            warnLog(`Shader "${name}" not found.`);
            return null;
        }
        return this.shaders.get(name);
    }

    setUniformMatrix(shaderProgram, uniformName, matrix) {
        if (!shaderProgram) {
            warnLog(`Cannot set uniform "${uniformName}": Shader program is null.`);
            return;
        }
    
        const location = this.gl.getUniformLocation(shaderProgram, uniformName);
        if (!location) {
            warnLog(`Uniform "${uniformName}" not found in shader.`);
            return;
        }
    
        this.gl.uniformMatrix4fv(location, false, matrix);
    }
}
