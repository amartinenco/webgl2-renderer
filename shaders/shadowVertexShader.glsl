#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;

uniform mat4 u_modelWorldMatrix;
uniform mat4 u_lightViewProjection;

void main() {
    gl_Position = u_lightViewProjection * u_modelWorldMatrix * vec4(a_position, 1.0);
}
