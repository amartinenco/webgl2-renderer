#version 300 es

uniform mat4 u_mvpMatrix;
uniform mat4 u_modelWorldMatrix;

// check if point light needs to be used
uniform bool u_usePointLight;
uniform vec3 u_lightPosition;

// check if spot light needs to be used
uniform bool u_useSpotLight;

// eye position
uniform vec3 u_viewWorldPosition;

// texture
layout(location = 2) in vec2 a_texcoord;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;

out vec3 v_normal;
out vec3 v_lightDirection;

// reflection
out vec3 v_surface2light;
out vec3 v_surface2view;

// pass texture to fragment shader
out vec2 v_texcoord;

out vec4 v_worldPos;

void main() {

  // world position of each fragment
  //vec3 fragPosition = vec3(u_modelWorldMatrix * a_position);
  vec3 fragPosition = vec3(u_modelWorldMatrix * vec4(a_position, 1.0));

  // direction for point light
  if (u_usePointLight || u_useSpotLight) {
    v_lightDirection = normalize(u_lightPosition - fragPosition);

    // compute surface to light (light to surface)
    v_surface2light = v_lightDirection;
    
    // compute surface to view (camera to surface)
    v_surface2view = u_viewWorldPosition - fragPosition;

  } else {
    v_lightDirection = vec3(0.0);
    v_surface2light = vec3(0.0);
    v_surface2view = vec3(0.0);
  }

  gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
  
  mat3 normalMatrix = mat3(transpose(inverse(u_modelWorldMatrix)));
  v_normal = normalize(normalMatrix * a_normal);
  v_texcoord = a_texcoord;

  //v_worldPos = u_modelWorldMatrix * vec4(a_position, 1.0);
  v_worldPos = vec4(fragPosition, 1.0);

}