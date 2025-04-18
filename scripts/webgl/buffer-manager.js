import { errorLog } from '../logger/logger.js';

export function createVertexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        errorLog("Failed to create vertex buffer.");
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
}