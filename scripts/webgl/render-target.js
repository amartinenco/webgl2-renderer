import { errorLog } from "../logger/logger.js";

export class RenderTarget {
    constructor(gl, textureFactory, name, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.renderTargetName = name + '_rt';
        this.depthTextureName = name + '_dt';

        // color texture
        this.texture = textureFactory.createRenderTargetTexture(renderTargetName, width, height);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture,
            0
        );

        // depth texture
        const depthTexture = textureFactory.createDepthTexture(depthTextureName, width, height);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            depthTexture,
            0
        );

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            errorLog(`Framebuffer is incomplete: ${status}`);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0, 0, this.width, this.height);
    }

    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
}
