#version 300 es
 
precision highp float;

out vec4 outColor;

in vec3 v_normal;
in vec3 v_lightDirection;

// specular
in vec3 v_surface2light;
in vec3 v_surface2view;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

uniform float u_shininess;

void main() {

    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(v_lightDirection);

    // directional light
    vec3 revLightDirection = normalize(u_reverseLightDirection);
    float directionalLight = max(dot(normal, revLightDirection), 0.0);

    // point light
    float pointLight = max(dot(normal, lightDir), 0.0);

    // specular light
    vec3 surfaceToLightDirection = normalize(v_surface2light);
    vec3 surfaceToViewDirection = normalize(v_surface2view);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float light = dot(normal, surfaceToLightDirection);

    float specular = 0.0;
    if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
    }

    // ambient light
    float ambient = 0.1;

    // combine lights
    outColor = u_color;
    
    //outColor.rgb *= pointLight;
    outColor.rgb *= pointLight + directionalLight + ambient;
    outColor.rgb += specular;
}
