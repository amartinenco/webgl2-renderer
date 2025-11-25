#version 300 es
precision highp float;

in vec2 v_texcoord;
uniform sampler2D u_texture;
uniform bool u_useTexture;

out vec4 outColor;

void main() {
    vec4 texColor = texture(u_texture, v_texcoord);
    outColor = u_useTexture ? texColor : vec4(1.0, 1.0, 1.0, 1.0); // white fallback
}
