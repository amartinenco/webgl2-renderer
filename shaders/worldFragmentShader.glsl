#version 300 es
 
precision highp float;


uniform bool u_usePointLight;
uniform bool u_useSpotLight;

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
//uniform float u_limit; 
uniform vec3 u_lightDirection;
// spot light - inner/outer limits
uniform float u_innerLimit;
uniform float u_outerLimit;

uniform bool u_useTexture;
// Passed in from the vertex shader.
in vec2 v_texcoord;
// The texture.
uniform sampler2D u_texture;

void main() {
    vec3 normal = normalize(v_normal);

    // directional light
    vec3 revLightDirection = normalize(u_reverseLightDirection);
    float directionalLight = max(dot(normal, revLightDirection), 0.0);
    float pointLight = 0.0;
    float spotLight = 0.0;
    float specular = 0.0;

    if (u_useSpotLight || u_usePointLight) {
    // point light
        vec3 surfaceToLightDirection = normalize(v_surface2light);
        vec3 surfaceToViewDirection = normalize(v_surface2view);
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
        
        //float pointLight = 0.0;
        float pointFactor = float(u_usePointLight); 

        pointLight = pointFactor * max(dot(normal, surfaceToLightDirection), 0.0);

        float spotFactor = float(u_useSpotLight);
        float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);
        // step: if dotFromDirection >= u_limit then 1 else 0
        //float inLight = step(u_limit, dotFromDirection);
        
        // float limitRange = u_innerLimit - u_outerLimit;
        // float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);
        float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);


        spotLight = spotFactor * inLight * max(dot(normal, -u_lightDirection), 0.0);

        specular = mix(
            pow(max(dot(normal, halfVector), 0.0), u_shininess),
            inLight * pow(max(dot(normal, halfVector), 0.0), u_shininess),
            spotFactor
        );
    }

    float ambient = 0.1;
    vec4 texColor = texture(u_texture, v_texcoord);
    
    
    vec3 baseColor = mix(u_color.rgb, texColor.rgb, float(u_useTexture));

    float alpha = mix(u_color.a, texColor.a, float(u_useTexture));

    //vec3 baseColor = u_useTexture ? texColor.rgb : u_color.rgb;
    //float alpha     = u_useTexture ? texColor.a   : u_color.a;

    //vec3 diffuse = u_color.rgb * ((directionalLight + pointLight + spotLight) * u_lightColor);
    vec3 diffuse = baseColor * ((directionalLight + pointLight + spotLight) * u_lightColor);

    vec3 specularColor = u_specularColor * specular;
    //outColor = vec4(diffuse + specularColor + ambient, u_color.a);
    vec3 finalColor = diffuse + specularColor * specular + ambient;
    outColor = vec4(finalColor, alpha);

    // vec4 texColor = texture(u_texture, v_texcoord);

    // Multiply the lighting result with the texture color
    // vec3 baseColor = texColor.rgb * ((directionalLight + pointLight + spotLight) * u_lightColor);
    // vec3 finalColor = baseColor + u_specularColor * specular + ambient;

    // outColor = vec4(finalColor, texColor.a);
}
