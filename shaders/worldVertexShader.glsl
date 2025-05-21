#version 300 es

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelWorldMatrix;
in vec4 a_position;
in vec3 a_normal;

out vec3 v_normal;

void main() {
  gl_Position = u_mvpMatrix * a_position;
  mat3 normalMatrix = mat3(transpose(inverse(u_modelWorldMatrix)));
  v_normal = normalize(normalMatrix * a_normal);
}