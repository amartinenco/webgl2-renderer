import { debugLog, errorLog, setLogLevel } from './logger/logger.js';
import { initWebGL } from './webgl/webgl-core.js';
import { initShaders } from './webgl/shader-manager.js';
import { ObjectManager } from './webgl/object-manager.js';
import { triangleVertices } from './shapes/triangle.js';

async function main() {
    setLogLevel("DEBUG");
    const gl = initWebGL("canvas");
    if (!gl) {
        errorLog("Failed to initialize WebGL.");
        return;
    }
    
    const shaderProgram = await initShaders(gl);
    if (!shaderProgram) {
        errorLog("Shader initialization failed.");
        return;
    }

    debugLog("Shaders initialized successfully.");

    const objManager = new ObjectManager(gl, shaderProgram);
    objManager.loadObject("triangle", triangleVertices);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        const objects = objManager.getAllObjects();
        Object.values(objects).forEach(obj => obj.draw());

        requestAnimationFrame(render);
    }

    render();
}

main();