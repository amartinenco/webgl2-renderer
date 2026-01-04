#version 300 es
precision highp float;

// Attributes
layout(location = 0) in vec3 a_position;   // 3D position of quad
layout(location = 2) in vec2 a_texcoord;   // UV coordinates

// Uniforms
uniform mat4 u_mvpMatrix;

// Varyings
out vec2 v_texcoord;


void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_texcoord = a_texcoord;
}