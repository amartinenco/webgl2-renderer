#version 300 es
 
precision highp float;

out vec4 outColor;

in vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;
//uniform vec3 u_lightColor;

void main() {

    vec3 normal = normalize(v_normal);

    float light = dot(normal, u_reverseLightDirection);

    outColor = u_color;

    outColor.rgb *= light;
}