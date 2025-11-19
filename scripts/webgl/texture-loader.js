import { debugLog } from "../logger/logger.js";
import { TextureFactory } from "./texture-factory.js";
import { RenderTarget } from "./render-target.js";

export class TextureLoader {

    constructor(gl, textureManager, canvas) {
        this.canvas = canvas;
        this.textureFactory = new TextureFactory(gl, textureManager);
    }

    loadRenderTarget(name, canvas) {
        this.renderTarget = new RenderTarget(gl, this.textureFactory, name, canvas.width, canvas.height);
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