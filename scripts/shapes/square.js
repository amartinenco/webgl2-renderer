// export const squareVertices = new Float32Array([
//     // front face
//     0, 0, 0,
//     100, 0, 0,
//     0, 100, 0,
//     100, 100, 0,

//     // back face
//     0, 0, 0,
//     0, 100, 0,
//     100, 0, 0,
//     100, 100, 0,
// ]);

export const squareVertices = new Float32Array([
    // Front face (two triangles)
    0, 0, 0,
    200, 0, 0,
    0, 200, 0,

    200, 0, 0,
    200, 200, 0,
    0, 200, 0,

    // Back face (two triangles)
    0, 0, 0,
    0, 200, 0,
    200, 0, 0,

    200, 0, 0,
    0, 200, 0,
    200, 200, 0,
]);

// export const squareVertices = new Float32Array([
//     -1, -1, 0,
//     1, -1, 0,
//     -1,  1, 0,
//     1,  1, 0
// ]);
// export const squareNormals = new Float32Array([
//     // Front face normals
//     0, 0, 1,
//     0, 0, 1,
//     0, 0, 1,
//     0, 0, 1,

//     //
//     0, 0, -1,
//     0, 0, -1,
//     0, 0, -1,
//     0, 0, -1
// ]);

export const squareNormals = new Float32Array([
    // Front face normals — 6 vertices (2 triangles)
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // Back face normals — 6 vertices (2 triangles)
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
]);