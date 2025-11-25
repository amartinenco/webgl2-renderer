#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelWorldMatrix;

out vec2 v_texcoord;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    v_texcoord = a_texcoord;
}
