#version 300 es
 
precision highp float;

out vec4 outColor;

in vec3 v_normal;
in vec3 v_lightDirection;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

void main() {

    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(v_lightDirection);

    // directional light
    vec3 revLightDirection = normalize(u_reverseLightDirection);
    float directionalLight = max(dot(normal, revLightDirection), 0.0);

    // point light
    float pointLight = max(dot(normal, lightDir), 0.0);

    // ambient light
    float ambient = 0.1;

    // combine lights
    outColor = u_color;
    
    //outColor.rgb *= pointLight;
    outColor.rgb *= pointLight + directionalLight + ambient;
}
