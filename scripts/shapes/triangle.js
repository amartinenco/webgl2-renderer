export const triangleVertices = new Float32Array([
    0, 0, 0,
    100, 0, 0,
    0, 100, 0
]);

export const testTriangleInTextureVertices = new Float32Array([
    // -1, -1, 0, // bottom left
    // 0.1, -0.1, 0, // bottom right
    // 0, 0.1, 0 // top center
    0,  1, 0,   // bottom-left
    256,  10, 0,   // bottom-right
    30,  50, 0    // top-middle
]);

export const triangleVerticesUITest = new Float32Array([
    0, 0,
    100, 0,
    0, 100
]);

export const triangleNormals = new Float32Array([
    0, 0, 1, // Normal for vertex 0
    0, 0, 1, // Normal for vertex 1
    0, 0, 1  // Normal for vertex 2
]);
