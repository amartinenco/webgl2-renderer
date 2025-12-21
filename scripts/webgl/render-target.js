import { errorLog } from "../logger/logger.js";

export class RenderTarget {
    // constructor(gl, textureFactory, name, width, height, depthOnly = false) {
    //     this.gl = gl;
    //     this.width = width;
    //     this.height = height;

    //     // create off-screen canvas you can draw into
    //     this.framebuffer = gl.createFramebuffer();
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    //     this.renderTargetName = name + '_rt';
    //     this.depthTextureName = name + '_dt';

    //     // color texture
    //     this.texture = textureFactory.createRenderTargetTexture(this.renderTargetName, width, height);
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,
    //         gl.COLOR_ATTACHMENT0,
    //         gl.TEXTURE_2D,
    //         this.texture,
    //         0
    //     );

    //     // depth texture
    //     this.depthTexture = textureFactory.createDepthTexture(this.depthTextureName, width, height);
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,
    //         gl.DEPTH_ATTACHMENT,
    //         gl.TEXTURE_2D,
    //         this.depthTexture,
    //         0
    //     );

    //     const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    //     if (status !== gl.FRAMEBUFFER_COMPLETE) {
    //         errorLog(`Framebuffer is incomplete: ${status}`);
    //     }

    //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // }

    constructor(gl, textureFactory, name, width, height, depthOnly = false) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.renderTargetName = name + "_rt";
        this.depthTextureName = name + "_dt";

        // ---------------------------------------------------------
        // DEPTH-ONLY RENDER TARGET (for shadow maps)
        // ---------------------------------------------------------
        if (depthOnly) {
            // Create depth texture
            this.depthTexture = textureFactory.createDepthTexture(
                this.depthTextureName,
                width,
                height
            );

            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                this.depthTexture,
                0
            );

            // No color attachments
            gl.drawBuffers([]);

            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (status !== gl.FRAMEBUFFER_COMPLETE) {
                errorLog(`Depth-only framebuffer incomplete: ${status}`);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return; // IMPORTANT: stop here
        }

        // ---------------------------------------------------------
        // NORMAL RTT (color + depth)
        // ---------------------------------------------------------

        // Color texture
        this.texture = textureFactory.createRenderTargetTexture(
            this.renderTargetName,
            width,
            height
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture,
            0
        );

        // Depth texture
        this.depthTexture = textureFactory.createDepthTexture(
            this.depthTextureName,
            width,
            height
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthTexture,
            0
        );

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            errorLog(`Framebuffer is incomplete: ${status}`);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }


    resize(width, height) {
        this.width = width;
        this.height = height;
        const gl = this.gl;

        if (!this.texture) {
            gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

            gl.bindTexture(gl.TEXTURE_2D, null);

            // Check framebuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);    
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (status !== gl.FRAMEBUFFER_COMPLETE) {
                errorLog(`Depth-only framebuffer incomplete after resize: ${status}`);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return;
        }

        // Normal RTT (color + depth)
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            errorLog(`Framebuffer incomplete after resize: ${status}`);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);


        // // Resize color texture
        // gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // // Resize depth texture
        // gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        // gl.bindTexture(gl.TEXTURE_2D, null);

        // // Optionally check framebuffer completeness after resize
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        // const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        // if (status !== gl.FRAMEBUFFER_COMPLETE) {
        //     errorLog(`Framebuffer incomplete after resize: ${status}`);
        // }
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
