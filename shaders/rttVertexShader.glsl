#version 300 es
precision highp float;

// Attributes
layout(location = 0) in vec3 a_position;   // 3D position of quad
//layout(location = 2) in vec2 a_texcoord;   // UV coordinates

// Uniforms
uniform mat4 u_mvpMatrix;

// Varyings
//out vec2 v_texcoord;
out vec2 v_clip;

void main() {
    //gl_Position = vec4(a_position.x, -a_position.y, 1.0,  1.0);
    //gl_Position = vec4(a_position, 1.0);
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);

    //gl_Position = u_mvpMatrix * vec4(a_position.x, a_position.y, 1.0, 1.0);
    //v_texcoord = a_texcoord;
    v_clip = a_position.xy;
}