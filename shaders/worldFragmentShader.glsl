#version 300 es
 
precision highp float;

out vec4 outColor;

in vec3 v_normal;
uniform vec4 u_color;

// directional light
uniform vec3 u_reverseLightDirection;

// point light 
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;
in vec3 v_surface2light;
in vec3 v_surface2view;

// spot light
uniform float u_limit; 
uniform vec3 u_lightDirection;

void main() {
    vec3 normal = normalize(v_normal);

    // directional light
    vec3 revLightDirection = normalize(u_reverseLightDirection);
    float directionalLight = max(dot(normal, revLightDirection), 0.0);

    // point light
    vec3 surfaceToLightDirection = normalize(v_surface2light);
    vec3 surfaceToViewDirection = normalize(v_surface2view);
    
    //float pointLight = max(dot(normal, surfaceToLightDirection), 0.0);
    
    
    //float pointLight = 0.0;
    
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    //float specular = 0.0;



    float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);
    // if dotFromDirection >= u_limit then 1 else 0
    float inLight = step(u_limit, dotFromDirection);
    float light = inLight * max(dot(normal, surfaceToLightDirection), 0.0);
    float specular = inLight * pow(max(dot(normal, halfVector), 0.0), u_shininess);


    // if (dotFromDirection >= u_limit) {
    //     pointLight = max(dot(normal, surfaceToLightDirection), 0.0);
    //     if (pointLight > 0.0) {
    //         specular = pow(max(dot(normal, halfVector), 0.0), u_shininess);
    //     }
    // }

    // ambient light
    float ambient = 0.1 * length(u_lightColor);

    // combine lights
    outColor = u_color;
    
    vec3 diffuse = u_color.rgb * ((light + directionalLight) * u_lightColor);
    vec3 specularColor = u_specularColor * specular;
    outColor.rgb = diffuse + specularColor + ambient;
    //outColor.rgb *= pointLight;
    outColor.rgb += specular;
}
