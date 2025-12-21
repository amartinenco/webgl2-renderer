#version 300 es
precision highp float;

// Varying from vertex shader
in vec2 v_texcoord;

// Sampler
uniform sampler2D u_texture;
uniform bool u_useTexture;

out vec4 outColor;

void main() {
    if(u_useTexture) {
        outColor = texture(u_texture, v_texcoord);
    } else {
        outColor = vec4(0.25, 0.07, 0.07, 1.0); // fallback color
    }
}