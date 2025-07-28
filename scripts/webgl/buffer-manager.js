import { errorLog } from '../logger/logger.js';

export function createBuffer(gl, data) {
    if (!data) {
        return null;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
        errorLog("Failed to create buffer.");
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer;
}

export function createFramebuffer(gl, targetTexture) {
    const fb = gl.createFramebuffer();
    gl.bindBuffer(gl.FRAMEBUFFER, fb);
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
}