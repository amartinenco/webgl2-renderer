import { warnLog, debugLog } from "../logger/logger.js";

export class TextureFactory {

    constructor(gl, textureManager) {
        this.gl = gl;
        this.textureManager = textureManager;
    }

    createDefaultTexture() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA,
            1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255])
        );
        TextureFactory.setParameters(gl, texture);
        return texture;
    }

    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const gl = this.gl;
            const defaultTexture = this.createDefaultTexture();
            const texture = gl.createTexture();

            const image = new Image();
            image.src = src;
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                this.textureManager.add(name, texture);
                resolve(texture);
            };

            image.onerror = () => {
                warnLog(`Faield to load ${src}, using default texture`);
                this.textureManager.add(name, defaultTexture);
                resolve(defaultTexture);
            }
        });
    }

    loadData(name, width, height, pixelData) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
        TextureFactory.setParameters(gl, texture);
        this.textureManager.add(name, texture);
        return texture;
    }

    createRenderTargetTexture(name, width, height) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        TextureFactory.setParameters(gl, texture, true);
        this.textureManager.add(name, texture);
        return texture;
    }

    createDepthTexture(name, width, height) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        this.textureManager.add(name, texture);
        return texture;
    }

    static setParameters(gl, texture, isDepth = false) {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        if (isDepth) {
            // depth textures must use 'nearest' for precise calculations when doing shadows
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    }
}
