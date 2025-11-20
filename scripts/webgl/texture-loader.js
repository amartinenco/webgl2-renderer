import { debugLog } from "../logger/logger.js";
import { TextureFactory } from "./texture-factory.js";
import { RenderTarget } from "./render-target.js";

export class TextureLoader {

    constructor(gl, textureManager, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.textureFactory = new TextureFactory(this.gl, textureManager);
    }

    loadRenderTarget(name) {
        this.renderTarget = new RenderTarget(this.gl, this.textureFactory, name, this.canvas.width, this.canvas.height);
        this.textureManager.setRenderTarget(this.renderTarget);
        debugLog(`Render target "${name}" set`);
    }

    async loadTextures() {
        const promises = [
            this.textureFactory.loadImage("3df", "resources/textures/f-texture.png")
        ];
        await Promise.all(promises);
        debugLog("Finished loading textures.");
    }
}