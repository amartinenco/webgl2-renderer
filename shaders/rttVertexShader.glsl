#version 300 es
precision highp float;

// Attributes
in vec3 a_position;   // 3D position of quad
in vec2 a_texcoord;   // UV coordinates

// Uniforms
uniform mat4 u_mvpMatrix;  // optional if you want to transform quad

// Varyings
out vec2 v_texcoord;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_texcoord = a_texcoord;
}

// #version 300 es

// in vec4 a_position;
// in vec2 a_texcoord;

// uniform mat4 u_mvpMatrix;

// out vec2 v_texcoord;

// void main() {
//     gl_Position = u_mvpMatrix * a_position;
//     v_texcoord = a_texcoord;
// }
