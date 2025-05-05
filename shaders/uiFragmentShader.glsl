#version 300 es

precision highp float;

// in vec2 v_texCoord;
// uniform sampler2D u_texture;
// uniform vec4 u_color;

out vec4 outColor;

void main() {
    //outColor = vec4(0.5, 0.0, 0.0, 1.0);
    outColor = vec4(1.0, 1.0, 1.0, 1.0);
    // vec4 texColor = texture(u_texture, v_texCoord);
    // outColor = mix(u_color, texColor, texColor.a);
}
