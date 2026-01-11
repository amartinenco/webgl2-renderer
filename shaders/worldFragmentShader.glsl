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


uniform float u_pointLightIntensity;

uniform bool u_useScreenLight;
uniform vec3 u_screenLightPos;
uniform vec3 u_screenLightNormal;
uniform vec3 u_screenLightColor;
uniform float u_screenLightIntensity;
uniform float u_time;

uniform sampler2D u_spotShadowMap;
uniform mat4 u_spotLightViewProjection;


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
}

float computeShadowSpot(vec4 worldPos) {
    vec4 lightSpace = u_spotLightViewProjection * worldPos;

    vec3 proj = lightSpace.xyz / lightSpace.w;
    proj = proj * 0.5 + 0.5;

    //flip Y for WebGL depth textures
    //proj.y = 1.0 - proj.y;

    // if outside shadow map, treat as lit 
    if (proj.x < 0.0 || proj.x > 1.0 ||
        proj.y < 0.0 || proj.y > 1.0 ||
        proj.z < 0.0 || proj.z > 1.0) {
        return 1.0;
    }

    float closestDepth = texture(u_spotShadowMap, proj.xy).r;
    float currentDepth = proj.z;

    return currentDepth - 0.005 > closestDepth ? 0.3 : 1.0;
}


void main() {
    
    // vec4 lightSpace = u_spotLightViewProjection * v_worldPos;
    // vec3 proj = lightSpace.xyz / lightSpace.w;
    // proj = proj * 0.5 + 0.5;
    // //proj.y = 1.0 - proj.y; 
    // // if you added the Y‑flip fix 
    // outColor = vec4(vec3(texture(u_spotShadowMap, proj.xy).r), 1.0);
    // return;


    // if (u_isScreen) {

    //     // float scanline = sin(v_texcoord.y * resolution.y * 3.14159);
    //     // color *= 0.8 + 0.2 * scanline;
        
    //     //float line = fract(v_texcoord.y * 400.0); 
    //     //color *= 0.9 + 0.1 * step(0.5, line);







    //     vec3 screen = texture(u_texture, v_texcoord).rgb;

    //     // --- Emissive boost (makes text glow) ---
    //     float brightness = dot(screen, vec3(0.299, 0.587, 0.114));
    //     float glow = smoothstep(0.2, 0.8, brightness);
    //     screen += glow * 0.45;   // stronger boost for bright green text

    //     // --- Soft bloom halo (correct for 1024x768) ---
    //     float offsetX = 1.0 / 1024.0;
    //     float offsetY = 1.0 / 768.0;

    //     vec3 bloom = (
    //         texture(u_texture, v_texcoord + vec2( offsetX, 0.0)).rgb +
    //         texture(u_texture, v_texcoord + vec2(-offsetX, 0.0)).rgb +
    //         texture(u_texture, v_texcoord + vec2(0.0,  offsetY)).rgb +
    //         texture(u_texture, v_texcoord + vec2(0.0, -offsetY)).rgb
    //     ) * 0.25;

    //     screen += bloom * 0.25;   // visible halo

        


    //     // --- Scanlines (correct frequency for 768px height) ---
    //     // float scan = 0.85 + 0.35 * sin(v_texcoord.y * 768.0 * 3.14159);
    //     // screen *= scan;

    //     // float sweepPos = 1.0 - fract(u_time * 0.15);
    //     // float dist = abs(v_texcoord.y - sweepPos);
    //     // float sweep = exp(-dist * 200.0);
    //     // screen += sweep * 0.05;
        

    //     // --- Scanlines ---
    //     float scan = 0.85 + 0.35 * sin(v_texcoord.y * 768.0 * 3.14159);
    //     screen *= scan;

    //     // --- Sweep line ---
    //     float sweepPos = 1.0 - fract(u_time * 0.15);
    //     float dist = abs(v_texcoord.y - sweepPos);
    //     float sweep = exp(-dist * 200.0);
    //     screen += sweep * 0.05;

    //     // --- Background horizontal CRT lines (upright or upside‑down) ---
    //     float bgLine = mod(1.0 - v_texcoord.y, 0.01) / 0.01;   // upside‑down version
    //     bgLine = min(abs((bgLine - 0.2) / 0.2), 1.0) * 0.005;
    //     screen -= bgLine;

    //     outColor = vec4(screen, 1.0);
    //     return;
    // }

if (u_isScreen) {

    // -----------------------------
    // 1. CRT CURVATURE
    // -----------------------------
    vec2 uv = v_texcoord * 2.0 - 1.0;   // [-1,1] space
    float r = 10.0;                      // curvature radius
    float d = dot(uv, uv);
    uv = uv * r / sqrt(r * r - d);      // curved surface
    vec2 curvedUV = uv * 0.5 + 0.5;     // back to [0,1]

    // clamp outside curved area
  
    // if (curvedUV.x < 0.0 || curvedUV.x > 1.0 ||
    //     curvedUV.y < 0.0 || curvedUV.y > 1.0) {
    //     outColor = vec4(0.0);
    //     return;
    // }

    // sample screen content
    vec3 screen = texture(u_texture, curvedUV).rgb;


    // -----------------------------
    // 2. EMISSIVE BOOST (your code)
    // -----------------------------
    float brightness = dot(screen, vec3(0.299, 0.587, 0.114));
    float glow = smoothstep(0.2, 0.8, brightness);
    screen += glow * 0.45;


    // -----------------------------
    // 3. BLOOM (your code)
    // -----------------------------
    float offsetX = 1.0 / 1024.0;
    float offsetY = 1.0 / 768.0;

    vec3 bloom = (
        texture(u_texture, curvedUV + vec2( offsetX, 0.0)).rgb +
        texture(u_texture, curvedUV + vec2(-offsetX, 0.0)).rgb +
        texture(u_texture, curvedUV + vec2(0.0,  offsetY)).rgb +
        texture(u_texture, curvedUV + vec2(0.0, -offsetY)).rgb
    ) * 0.25;

    screen += bloom * 0.25;


    // -----------------------------
    // 4. SCANLINES (your code)
    // -----------------------------
    float scan = 0.85 + 0.35 * sin(curvedUV.y * 768.0 * 3.14159);
    screen *= scan;


    // -----------------------------
    // 5. SWEEP LINE (your code)
    // -----------------------------
    float sweepPos = 1.0 - fract(u_time * 0.15);
    float dist = abs(curvedUV.y - sweepPos);
    float sweep = exp(-dist * 200.0);
    screen += sweep * 0.05;


    // -----------------------------
    // 6. VIGNETTE (from Shadertoy)
    // -----------------------------
    vec2 centered = curvedUV - 0.5;
    float vignette = 1.0 - 0.6 * length(centered);
    vignette = clamp(vignette, 0.0, 1.0);
    screen *= vignette;


    // -----------------------------
    // 7. GLASS SHINE (from Shadertoy)
    // -----------------------------
    float shine = 0.66 - distance(curvedUV, vec2(0.5, 1.0));
    shine = smoothstep(0.0, 0.15, shine);
    //screen += shine * 0.15;


    // -----------------------------
    // 8. INNER BEZEL MASK (rounded rect)
    // -----------------------------
    vec2 p = curvedUV - 0.5;
    //vec2 b = vec2(0.48, 0.30);     // screen extents
    vec2 b = vec2(0.48, 0.30);
    float dBorder = length(max(abs(p) - b, 0.0)) - 0.02;
    float innerMask = smoothstep(0.0, 0.01, -dBorder);
//    screen *= innerMask;


    // -----------------------------
    // FINAL OUTPUT
    // -----------------------------
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
        
        float pointFactor = float(u_usePointLight); 
        pointLight = pointFactor * max(dot(normal, surfaceToLightDirection), 0.0);
        pointLight *= u_pointLightIntensity;
        
        float spotFactor = float(u_useSpotLight);
        float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);
        float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);


        float spotShadow = computeShadowSpot(v_worldPos);
        spotLight = spotFactor * inLight * max(dot(normal, -u_lightDirection), 0.0);
        spotLight *= spotShadow;

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



    // vec3 lightColor = u_lightColor;

    // if (u_useScreenLight) {
    //     // Only override the color for the screen-light contribution
    //     lightColor = u_screenLightColor;
    // }

    vec3 diffuse = baseColor * ((directionalLight + pointLight + spotLight) * u_lightColor);

    // if (u_useScreenLight) {
    //     vec3 toLight = normalize(u_screenLightPos - v_worldPos.xyz);
    //     float ndotl = max(dot(normal, toLight), 0.0);
    //     float angle = max(dot(u_screenLightNormal, -toLight), 0.0);
    //     //angle = pow(angle, 8.0);
    //     angle = 0.0;
    //     float dist = length(u_screenLightPos - v_worldPos.xyz);
    //     float attenuation = 1.0 / (pow(dist, 4.0));
    //     vec3 screenLight = u_screenLightColor * ndotl * angle * attenuation * u_screenLightIntensity;
    //     //vec3 screenLight = vec3(1.0, 0.0, 0.0) * ndotl * angle * attenuation * 5.0;
    //     diffuse += screenLight;
    // }

    
    // if (u_useScreenLight) {
    //     diffuse += vec3(100.0, 0.0, 0.0);  // bright red
    // }
    // if (u_useScreenLight) {
    //     diffuse += vec3(0.0, 1.0, 0.0);  // green
    // } else {
    //     diffuse += vec3(1.0, 0.0, 0.0);  // red
    // }
    

    vec3 specularColor = u_specularColor * specular;
    float shadow = computeShadow(v_worldPos);

    vec3 finalColor = diffuse * shadow + specularColor * specular + ambient;


    // if (u_useScreenLight && !u_isScreen)  { 
    //     //vec3 toLight = normalize(u_screenLightPos - v_worldPos.xyz);
    //     vec3 toLight = normalize(v_worldPos.xyz - u_screenLightPos);
    //     //float ndotl = max(dot(normal, toLight), 0.0); 
    //     //float angle = max(dot(u_screenLightNormal, -toLight), 0.0);
    //     float angle = max(dot(u_screenLightNormal, toLight), 0.0);
    //     angle = pow(angle, 3.5); 
    //     // narrow emission cone 
    //     float dist = length(u_screenLightPos - v_worldPos.xyz);
    //     //float attenuation = 1.0 / (dist * dist * 0.01);
    //     float attenuation = 1.0 / (1.0 + dist * 0.45);
        
    //     float pulse = 1.0 + 0.25 * sin(u_time * 4.5) + 0.01 * fract(sin(dot(v_worldPos.xy , vec2(12.9898,78.233))) * 43758.5453);
    //     //float pulse = 1.0 + 0.2 * sin(u_time * 2.0);
    //     vec3 screenLight = u_screenLightColor  * angle * attenuation * pulse * u_screenLightIntensity; 
    //     // ADD AFTER SHADOWS — emissive light is NOT shadowed 
    //     finalColor += screenLight;
    //     //finalColor = vec3(1.0, 0.2, 0.2);
    // }

    if (u_useScreenLight && !u_isScreen) {

        // Direction from light to fragment
        vec3 toLight = normalize(v_worldPos.xyz - u_screenLightPos);

        // Cone shape (screen normal defines forward direction)
        float angle = max(dot(u_screenLightNormal, toLight), 0.0);
        angle = pow(angle, 3.5);   // your preferred cone tightness

        // Distance falloff
        float dist = length(v_worldPos.xyz - u_screenLightPos);
        float attenuation = 1.0 / (1.0 + dist * 0.2);

        // --- REALISTIC CRT MODULATION ---
        // 1. Tiny analog shimmer (CRT noise)
        //float shimmer = 0.1 * fract(sin(dot(v_worldPos.xy, vec2(12.9898, 78.233))) * 43758.5453);
    
        // float shimmer = 0.01 * fract(
        //     sin(dot(v_worldPos.xy + u_time * 5.0, vec2(12.9898, 78.233))) * 43758.5453
        // );

        
        //float shimmer = 0.070 * fract(sin(u_time * 120.0) * 43758.5453);

        float spatialNoise = fract( sin(dot(v_worldPos.xy * 3.0, vec2(12.9898, 78.233))) * 43758.5453 );

        float temporalNoise = fract( sin(u_time * 220.0) * 43758.5453 ); 
        // Combine noise types 
        float shimmer = 0.09 * spatialNoise + 0.07 * temporalNoise;


        // 2. Very subtle slow drift (power ripple)
        float drift = 1.0 + 0.05 * sin(u_time * 0.8);

        // 3. Combine into a modulation factor
        float modulation = drift + shimmer;

        // 4. Apply modulation to INTENSITY (not final light)
        float dynamicIntensity = u_screenLightIntensity * modulation;

        // Final light contribution
        vec3 screenLight = u_screenLightColor * angle * attenuation * dynamicIntensity;

        finalColor += screenLight;
    }







    outColor = vec4(finalColor, alpha);

    // if (u_isScreen) { 
    //     outColor = vec4(v_worldPos.xyz / 300.0, 1.0); 
    //     return; 
    // }

    // outColor = vec4(v_worldPos.xyz / 300.0, 1.0); return;
}
