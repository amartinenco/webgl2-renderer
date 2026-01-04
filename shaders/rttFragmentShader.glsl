#version 300 es
precision highp float;

// Varying from vertex shader
in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform bool u_useTexture;

out vec4 outColor;

void main() {

    vec3 bg = vec3(0.0); 
    if (!u_useTexture) { 
        outColor = vec4(bg, 1.0); 
        return; 
    }

    if(u_useTexture) {
        vec4 tex = texture(u_texture, v_texcoord);
        float mask = smoothstep(0.3, 0.7, tex.a); 
        vec3 red = vec3(1.0, 0.0, 0.0); 
        outColor = vec4(red * mask, mask);
    } else {
        outColor = vec4(0.25, 0.07, 0.07, 1.0); // fallback color
    }

    
}