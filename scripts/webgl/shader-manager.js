const isLocal = window.location.hostname === "localhost";
const SHADER_PATH = isLocal ? "./shaders" : `${window.location.origin}/shaders`;

async function loadShaderSource(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            errorLog(`Failed to load a shader from ${url}`);
            return null;
        }
        return await response.text();
    } catch (error) {
        errorLog(error.message);
        return null;
    }
}

export async function initShaders(gl) {
    if (!gl) {
        errorLog("WebGL context is null. Cannot initialize shaders.");
        return null;
    }

    const vertexShaderSource = await loadShaderSource(`${SHADER_PATH}/vertexShader.glsl`);
    const fragmentShaderSource = await loadShaderSource(`${SHADER_PATH}/fragmentShader.glsl`);

    if (!vertexShaderSource || !fragmentShaderSource) {
        errorLog("Failed to load shader source files. Aborting shader initialization.");
        return null;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        errorLog("Shader creation failed. Aborting shader program initialization.");
        return null;
    }

    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    return program;
}

function createShader(gl, shader_type, shader_source) {
    const shaderTypeName = shader_type === gl.VERTEX_SHADER ? "Vertex" : "Fragment";
    const trimmedShaderSource = shader_source?.trim();

    if (!trimmedShaderSource) {
        errorLog(`${shaderTypeName} shader source is empty or invalid.`);
        return null;
    }

    let shader = gl.createShader(shader_type);
    if (!shader) {
        errorLog(`Failed to create ${shaderTypeName} shader.`);
        return null;
    }
    gl.shaderSource(shader, trimmedShaderSource);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (!success) {
        const errorMessage = gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";
        errorLog(`Failed to compile ${shaderTypeName} shader:\n${errorMessage}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    
    if (!success) {
        errorLog(`Failed to create GL program: ${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}