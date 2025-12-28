#version 300 es
precision highp float;

// Varying from vertex shader
in vec2 v_texcoord;

// Sampler
uniform sampler2D u_texture;
uniform bool u_useTexture;

out vec4 outColor;
in vec2 v_clip;

void main() {

    //vec2 ndc = v_clip; // [-1,1] 
    //vec2 uv = (ndc + 1.0) * 0.5; // [0,1]
    
    
    //outColor = vec4(1.0, 0.0, 1.0, 1.0);
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    
    //outColor = vec4(uv, 1.0, 1.0);
    // if(u_useTexture) {
    //     outColor = texture(u_texture, v_texcoord);
    // } else {
    //     outColor = vec4(0.25, 0.07, 0.07, 1.0); // fallback color
    // }

    
}