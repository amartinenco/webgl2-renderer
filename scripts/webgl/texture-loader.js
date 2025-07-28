export class TextureLoader {
    
    constructor(gl) {
        this.gl = gl;
        this.texture = this.gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 255, 255]));
        this.setParameters();
    }

    setParameters() {
        const gl = this.gl;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    loadImage(src) {
        const gl = this.gl;
        let image = new Image();
        image.src = src;
        image.addEventListener('load', () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
        return this.texture;
    }

    loadData(width, height, pixelData) {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          pixelData // Uint8Array of RGBA values
        );

        if (this.isPowerOf2(width) && this.isPowerOf2(height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            this.setParameters(); 
        }

    return this.texture;
  }

  isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }
}