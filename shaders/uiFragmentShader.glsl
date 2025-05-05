#version 300 es

precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec4 u_color;

out vec4 outColor;

void main() {
    vec4 texColor = texture(u_texture, v_texCoord);
    outColor = mix(u_color, texColor, texColor.a);
}
