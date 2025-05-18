#version 300 es

uniform mat4 u_mvpMatrix;
in vec4 a_position;
in vec3 a_normal;

out vec3 v_normal;

void main() {
  gl_Position = u_mvpMatrix * a_position;
  v_normal = a_normal;
}