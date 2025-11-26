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


// #version 300 es
// precision highp float;

// in vec2 v_texcoord;
// uniform sampler2D u_texture;
// uniform bool u_useTexture;

// out vec4 outColor;

// void main() {
//     vec4 texColor = texture(u_texture, v_texcoord);
//     outColor = u_useTexture ? texColor : vec4(0.2549, 0.0667, 0.0667, 1.0); // white fallback
// }

