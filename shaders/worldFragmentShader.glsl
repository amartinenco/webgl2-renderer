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
uniform float u_spotLightIntensity;

uniform bool u_useScreenLight;
uniform vec3 u_screenLightPos;
uniform vec3 u_screenLightNormal;
uniform vec3 u_screenLightColor;
uniform float u_screenLightIntensity;
uniform float u_time;

uniform sampler2D u_spotShadowMap;
uniform mat4 u_spotLightViewProjection;

uniform vec3 u_lightPosition;


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

    if (u_isScreen) {

        // -----------------------------
        // 1. CRT CURVATURE
        // -----------------------------
        vec2 uv = v_texcoord * 2.0 - 1.0;   // [-1,1] space
        float r = 10.0;                      // curvature radius
        float d = dot(uv, uv);
        uv = uv * r / sqrt(r * r - d);      // curved surface
        vec2 curvedUV = uv * 0.5 + 0.5;     // back to [0,1]

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
    //  screen *= innerMask;


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

    vec3 surfaceToLightDirection = normalize(-v_surface2light);
    vec3 surfaceToViewDirection = normalize(v_surface2view);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float dist = length(v_surface2light);

    float kc = 1.0; 
    float kl = 0.01; 
    float kq = 0.0001;

    if (u_usePointLight) {
        vec3 L = normalize(-v_surface2light);
        float diff = max(dot(normal, L), 0.0);

        float attenuation = 1.0 / (kc + kl * dist + kq * dist * dist);

        pointLight = diff * attenuation * u_pointLightIntensity;
    }


    if (u_useSpotLight) {
        float spotFactor = float(u_useSpotLight);

        // direction from light → fragment
        vec3 lightDir = normalize(-v_surface2light);

        // spotlight cone test
        float angle = dot(lightDir, -normalize(u_lightDirection));
        float inLight = smoothstep(u_outerLimit, u_innerLimit, angle);

        // attenuation
        float spotAtt = 1.0 / (kc + kl * dist + kq * dist * dist);

        // diffuse
        float spotDiffuse = max(dot(normal, lightDir), 0.0);

        // final spotlight
        spotLight = spotFactor * inLight * spotDiffuse * spotAtt * u_spotLightIntensity;

        // shadows
        spotLight *= computeShadowSpot(v_worldPos);

        // specular
        specular = mix(
            pow(max(dot(normal, halfVector), 0.0), u_shininess),
            inLight * pow(max(dot(normal, halfVector), 0.0), u_shininess),
            spotFactor
        );
        specular = clamp(specular, 0.0, 1.0);
    }

    float ambient = 0.05;
    vec4 texColor = texture(u_texture, v_texcoord);
    
    
    vec3 baseColor = mix(u_color.rgb, texColor.rgb, float(u_useTexture));

    float alpha = mix(u_color.a, texColor.a, float(u_useTexture));

    float totalLight = directionalLight + pointLight + spotLight;

    vec3 diffuse = baseColor * (totalLight * u_lightColor);

    vec3 specularColor = u_specularColor * specular;
    float shadow = computeShadow(v_worldPos);

    vec3 finalColor = diffuse * shadow + specularColor * specular + ambient;

    if (u_useScreenLight && !u_isScreen) {

        // Direction from light to fragment
        vec3 toLight = normalize(v_worldPos.xyz - u_screenLightPos);

        // Cone shape (screen normal defines forward direction)
        float angle = max(dot(u_screenLightNormal, toLight), 0.0);
        angle = pow(angle, 3.5);   // your preferred cone tightness

        // Distance falloff
        float dist = length(v_worldPos.xyz - u_screenLightPos);
        float attenuation = 1.0 / (1.0 + dist * 0.2);

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


    // distance from fragment to spotlight origin
    float distToSpot = length(v_worldPos.xyz - u_lightPosition);

    // strong falloff near the light source
    float emitter = exp(-distToSpot * 0.12); // 0.12

    // emissive glow color
    vec3 emitterGlow = u_lightColor * emitter;

    // add to final color
    finalColor += emitterGlow;

    outColor = vec4(finalColor, alpha);
}
