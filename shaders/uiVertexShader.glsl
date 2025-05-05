#version 300 es

in vec2 a_position;
//layout(location = 0) in vec2 a_position; // UI elements usually use 2D positions
//layout(location = 1) in vec2 a_texCoord; // Texture coordinates for UI elements

//uniform mat4 u_mvpMatrix;
uniform mat4 u_projection; // Orthographic projection matrix
uniform mat4 u_model; // Model matrix (positioning UI)

//out vec2 v_texCoord;

void main() {
    //gl_Position = u_mvpMatrix * vec4(a_position, 0.0, 1.0);
    gl_Position = u_projection * u_model * vec4(a_position, 0.0, 1.0); // No perspective depth
    //v_texCoord = a_texCoord; // Pass texture coordinates to fragment shader
}
