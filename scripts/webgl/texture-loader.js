import { debugLog, errorLog } from "../logger/logger.js";
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
            { name: "square" },
            { name: "computerScreen", width: 1024, height: 768},
            { name: "shadow", depthOnly: true, width: 2048, height: 2048 },
            { name: "spotShadow", depthOnly: true, width: 2048, height: 2048 }
        ];

        for (const rt of renderTargets) {

            const width = rt.width ?? this.canvas.width;
            const height = rt.height ?? this.canvas.height;
            //console.log(this.canvas.width)
            //console.log(this.canvas.height)
            const renderTarget = new RenderTarget(this.gl, this.textureFactory, rt.name, width, height, rt.depthOnly === true);
            this.textureManager.addRenderTarget(rt.name, renderTarget);
            debugLog(`Render target "${rt.name}" loaded`);
        }
        //this.renderTarget = new RenderTarget(this.gl, this.textureFactory, name, this.canvas.width, this.canvas.height);
        //this.textureManager.addRenderTarget(this.renderTarget);   
    }

    async loadTextures() {

        const texture = [
            { name: "3df", src: "resources/textures/f-texture.png" },
            { name: "sticky", src: "resources/textures/StickyTexture.001.png" }
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

    async loadTexture(name, src) { 
        try { 
            const texture = await this.textureFactory.loadImage(name, src); 
            debugLog(`Texture "${name}" loaded from ${src}`);
            return texture;
        } catch (err) { 
            errorLog(`Failed to load texture "${name}" from ${src}`);
            return null
        }
    }
}