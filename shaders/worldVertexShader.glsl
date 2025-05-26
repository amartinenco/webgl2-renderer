#version 300 es

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelWorldMatrix;

// check if point light needs to be used
uniform bool u_usePointLight;
uniform vec3 u_pointLightPosition;

in vec4 a_position;
in vec3 a_normal;

out vec3 v_normal;
out vec3 v_lightDirection;

void main() {

  // world position of each fragment
  vec3 fragPosition = vec3(u_modelWorldMatrix * a_position);

  // direction for point light
  if (u_usePointLight) {
    v_lightDirection = normalize(u_pointLightPosition - fragPosition);
  } else {
    v_lightDirection = vec3(0.0);
  }

  gl_Position = u_mvpMatrix * a_position;

  mat3 normalMatrix = mat3(transpose(inverse(u_modelWorldMatrix)));
  v_normal = normalize(normalMatrix * a_normal);
}