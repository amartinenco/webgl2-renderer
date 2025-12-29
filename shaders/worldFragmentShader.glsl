#version 300 es
 
precision highp float;

uniform bool u_isScreen;

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
uniform sampler2D u_shadowMap;
uniform mat4 u_lightViewProjection;
in vec4 v_worldPos;


float computeShadow(vec4 worldPos) {
    vec4 lightSpace = u_lightViewProjection * worldPos;

    vec3 proj = lightSpace.xyz / lightSpace.w;
    proj = proj * 0.5 + 0.5;

    // if outside shadow map, treat as lit 
    if (proj.x < 0.0 || proj.x > 1.0 ||
        proj.y < 0.0 || proj.y > 1.0 ||
        proj.z < 0.0 || proj.z > 1.0) {
        return 1.0;
    }

    float closestDepth = texture(u_shadowMap, proj.xy).r;
    float currentDepth = proj.z;

    return currentDepth - 0.005 > closestDepth ? 0.3 : 1.0;


    /*
       // return currentDepth - 0.005 > closestDepth ? 0.3 : 1.0;
    float bias = 0.005; 
    // Smooth fade from lit → shadowed
     float t = smoothstep(closestDepth, closestDepth + bias, currentDepth); 
     // Blend between lit (1.0) and shadowed (0.3) 
     return mix(1.0, 0.3, t);
     */
}



void main() {
    
    
    
    // Skip all lighting on screen
    // if (u_isScreen) { 
    //     vec3 screen = texture(u_texture, v_texcoord).rgb; 

    //     // CRT effects
    //     //float scan = sin(v_texcoord.y * 800.0) * 0.04; 
    //     //screen -= vec3(scan);    
    //     //screen *= scan;

    //     float scan = 0.85 + 0.15 * sin(v_texcoord.y * 800.0); 

    //     // --- Emissive boost ---
    //     float brightness = dot(screen, vec3(0.299, 0.587, 0.114)); // luminance
    //     float glow = smoothstep(0.4, 1.0, brightness);             // isolate bright pixels
    //     screen += glow * 0.35;                                     // boost emission

    //     screen *= scan;

    //     // --- Soft bloom halo ---
    //     vec3 bloom = vec3(0.0);
    //     float offset = 1.0 / 1024.0; // adjust based on your RTT resolution

    //     bloom += texture(u_texture, v_texcoord + vec2( offset, 0.0)).rgb;
    //     bloom += texture(u_texture, v_texcoord + vec2(-offset, 0.0)).rgb;
    //     bloom += texture(u_texture, v_texcoord + vec2(0.0,  offset)).rgb;
    //     bloom += texture(u_texture, v_texcoord + vec2(0.0, -offset)).rgb;

    //     bloom /= 4.0;

    //     screen += bloom * 0.15;   // subtle halo


    //     outColor = vec4(screen, 1.0); 
    //     return; 
    // };

    if (u_isScreen) {
        vec3 screen = texture(u_texture, v_texcoord).rgb;

        // --- Emissive boost (makes text glow) ---
        float brightness = dot(screen, vec3(0.299, 0.587, 0.114));
        float glow = smoothstep(0.2, 0.8, brightness);
        screen += glow * 0.45;   // stronger boost for bright green text

        // --- Soft bloom halo (correct for 1024x768) ---
        float offsetX = 1.0 / 1024.0;
        float offsetY = 1.0 / 768.0;

        vec3 bloom = (
            texture(u_texture, v_texcoord + vec2( offsetX, 0.0)).rgb +
            texture(u_texture, v_texcoord + vec2(-offsetX, 0.0)).rgb +
            texture(u_texture, v_texcoord + vec2(0.0,  offsetY)).rgb +
            texture(u_texture, v_texcoord + vec2(0.0, -offsetY)).rgb
        ) * 0.25;

        screen += bloom * 0.25;   // visible halo

        // --- Scanlines (correct frequency for 768px height) ---
        float scan = 0.85 + 0.15 * sin(v_texcoord.y * 768.0 * 3.14159);
        screen *= scan;

        outColor = vec4(screen, 1.0);
        return;
    }




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


    //vec3 finalColor = diffuse + specularColor * specular + ambient;    
    //outColor = vec4(finalColor, alpha);

    float shadow = computeShadow(v_worldPos);
    //vec3 finalColor = (diffuse + specularColor * specular + ambient) * shadow;
    vec3 finalColor = diffuse * shadow + specularColor * specular + ambient;
    //outColor = vec4(finalColor, alpha);
    
    outColor = vec4(finalColor, alpha);
    
    
    //outColor = vec4(vec3(shadow), 1.0);

}
