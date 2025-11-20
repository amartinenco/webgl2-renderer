import { debugLog } from "../logger/logger.js";

export class TextureManager {

    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
        this.renderTargets = new Map();
    }

    add(name, texture) {
        this.textures.set(name, texture);
        debugLog(`Texture ${name} loaded`);
    }

    get(name) {
        return this.textures.get(name);
    }

    delete(name) {
        const tex = this.textures.get(name);
        if (tex) {
            this.gl.deleteTexture(tex);
            this.textures.delete(name);
        }
    }

    addRenderTarget(name, rt) {
        this.renderTargets.set(name, rt);
    }

    getRenderTarget(name) {
        return this.renderTargets.get(name);
    }

    deleteRenderTarget(name) {
        const rt = this.renderTargets.get(name);
        if (!rt) return;
        if (rt.renderTargetName) this.delete(rt.renderTargetName);
        if (rt.depthTextureName) this.delete(rt.depthTextureName);
        this.renderTargets.delete(name);
    }
}