import { errorLog } from '../logger/logger.js';

export function initWebGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        errorLog("Canvas not found");
        return null;
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        errorLog("WebGL2 not supported! Ensure your browser supports WebGL2 and that hardware acceleration is enabled.");
        return null;
    }

    return gl;
}
