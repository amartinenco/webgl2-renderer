import { debugLog } from "../logger/logger.js";
import { TextureFactory } from "./texture-factory.js";
import { RenderTarget } from "./render-target.js";

export class TextureLoader {

    constructor(gl, textureManager, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.textureManager = textureManager;
        this.textureFactory = new TextureFactory(this.gl, textureManager);
    }

    loadRenderTargets() {

        const renderTargets = [
            { name: "square" }
        ];

        for (const rt of renderTargets) {
            const renderTarget = new RenderTarget(this.gl, this.textureFactory, rt.name, this.canvas.width, this.canvas.height);
            this.textureManager.addRenderTarget(rt.name, renderTarget);
            debugLog(`Render target "${rt.name}" loaded`);
        }

        //this.renderTarget = new RenderTarget(this.gl, this.textureFactory, name, this.canvas.width, this.canvas.height);
        //this.textureManager.addRenderTarget(this.renderTarget);   
    }

    async loadTextures() {

        const texture = [
            { name: "3df", src: "resources/textures/f-texture.png" }
        ];

        // const promises = [
        //     this.textureFactory.loadImage("3df", "resources/textures/f-texture.png")
        // ];
        // await Promise.all(promises);

        await Promise.all(
            texture.map(t => 
                this.textureFactory.loadImage(t.name, t.src)
            )
        );
        debugLog("Finished loading textures.");
    }
}