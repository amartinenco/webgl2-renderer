#version 300 es

in vec2 a_position;

uniform mat4 u_projection; // Orthographic projection matrix
uniform mat4 u_model; // Model matrix (positioning UI)

void main() {
    gl_Position = u_projection * u_model * vec4(a_position, 0.0, 1.0); // No perspective depth
}
