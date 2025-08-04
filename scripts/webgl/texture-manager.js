import { debugLog } from "../logger/logger.js";

export class TextureManager {

    constructor(gl) {
        this.gl = gl;
        this.textures = new Map();
        this.renderTarget = null;
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

    getRenderTarget() {
        if (this.renderTarget) {
            return this.renderTarget;
        }
        return null;
    }

    setRenderTarget(renderTarget) {
        this.renderTarget = renderTarget;
    }

    deleteRenderTarget() {
        if (this.renderTarget) {
            if (this.renderTarget.renderTargetName) {
                this.delete(this.renderTarget.renderTargetName);
            }
            if (this.renderTarget.depthTextureName) {
                this.delete(this.renderTarget.depthTextureName);
            }
        }
    }
}