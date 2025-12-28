export class Submesh {
    constructor(name, positions, normals, uvs, indices, material) {
        this.name = name;
        this.positions = positions;
        this.normals = normals;
        this.uvs = uvs;
        this.indices = indices;
        this.material = material
    }
};

export class Mesh {

    constructor(obj, materials) {
        this.obj = obj;
        this.materials = materials;
        this.submeshes = [];
        this._parse_meshes();
    }

    _parse_meshes() {
        for (const [materialName, faces] of Object.entries(this.obj.materialGroups)) {
            let positions = [];
            let uvs = [];
            let normals = [];
            const indices = [];

            const vertexMap = new Map();
            let indexCounter = 0;

            for (let originalFace of faces) {

                // Triangulate: 
                // - if the face has more than 3 vertices, turn it into a triangle fan.
                let face_array = originalFace;

                if (face_array.length > 3) {
                    const triangulated = [];
                    // fan: (v0, v1, v2), (v0, v2, v3), (v0, v3, v4) etc
                    for (let i = 1; i < face_array.length - 1; i++) {
                        triangulated.push(
                            face_array[0],
                            face_array[i],
                            face_array[i + 1]
                        );
                    }
                    face_array = triangulated;
                }

                for (let face of face_array) {
                    const parts = face.split("/");
                    const vStr = parts[0];
                    const uvStr = parts[1];
                    const nStr = parts[2];

                    const vIndex = parseInt(vStr) - 1;
                    const uvIndex = uvStr !== "" && uvStr !== undefined ? parseInt(uvStr) - 1 : null;
                    const nIndex = nStr !== "" && nStr !== undefined ? parseInt(nStr) - 1 : null;

                    const key = `${vIndex}/${uvIndex}/${nIndex}`;

                    let finalIndex;
                    if (vertexMap.has(key)) {
                        finalIndex = vertexMap.get(key);
                    } else {
                        const position = this.obj.positions[vIndex];
                        positions.push(position[0], position[1], position[2]);

                        if (uvIndex !== null && this.obj.uvs[uvIndex]) {
                            const uv = this.obj.uvs[uvIndex];
                            uvs.push(uv[0], uv[1]);
                        } else {
                            uvs.push(0, 0);
                        }

                        if (nIndex !== null && this.obj.normals[nIndex]) {
                            const normal = this.obj.normals[nIndex];
                            normals.push(normal[0], normal[1], normal[2]);
                        } else {
                            normals.push(0, 0, 1);
                        }

                        finalIndex = indexCounter++;
                        vertexMap.set(key, finalIndex);
                    }

                    indices.push(finalIndex);
                }
            }

            let submesh = new Submesh(
                materialName, 
                new Float32Array(positions), 
                new Float32Array(normals), 
                new Float32Array(uvs), 
                new Uint16Array(indices), 
                this.materials[materialName] || null
            );
            this.submeshes.push(submesh);
        }
    }
};

export class MeshBuilder {

    // static normalizeUVs(mesh) {
    //     const uvs = mesh.uvs;
    //     for (let i = 0; i < uvs.length; i += 2) {
    //         const u = uvs[i];
    //         const v = uvs[i + 1];

    //         // Rotate UVs 90° clockwise and normalize
    //         uvs[i]     = v;
    //         uvs[i + 1] = 1.0 - u;
    //     }
    // }
    
    // static normalizeUVs(submesh) {
    //     const uvs = submesh.uvs;

    //     // 1. Find the bounding box of the existing UVs
    //     let minU = Infinity, maxU = -Infinity;
    //     let minV = Infinity, maxV = -Infinity;

    //     for (let i = 0; i < uvs.length; i += 2) {
    //         const u = uvs[i];
    //         const v = uvs[i + 1];

    //         if (u < minU) minU = u;
    //         if (u > maxU) maxU = u;
    //         if (v < minV) minV = v;
    //         if (v > maxV) maxV = v;
    //     }

    //     const scaleU = 1.0 / (maxU - minU);
    //     const scaleV = 1.0 / (maxV - minV);

    //     // 2. Normalize to [0,1]
    //     for (let i = 0; i < uvs.length; i += 2) {
    //         uvs[i]     = (uvs[i]     - minU) * scaleU;
    //         uvs[i + 1] = (uvs[i + 1] - minV) * scaleV;
    //     }

        
    // }
    static normalizeUVs(submesh) {
    const uvs = submesh.uvs;

    // 1. Find bounding box
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < uvs.length; i += 2) {
        const u = uvs[i];
        const v = uvs[i + 1];

        if (u < minU) minU = u;
        if (u > maxU) maxU = u;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }

    const scaleU = 1.0 / (maxU - minU);
    const scaleV = 1.0 / (maxV - minV);

    // 2. Normalize AND rotate 90° clockwise
    for (let i = 0; i < uvs.length; i += 2) {
        const u = (uvs[i]     - minU) * scaleU; // normalized U
        const v = (uvs[i + 1] - minV) * scaleV; // normalized V

        // ROTATION FIX:
        // newU = v
        // newV = 1 - u
        uvs[i]     = v;
        uvs[i + 1] = 1.0 - u;
    }
}




    static fromObj(obj, materials) {
        
        const mesh = new Mesh(obj, materials);
        
        for (const sub of mesh.submeshes) { if (sub.name && sub.name.toLowerCase().includes("red")) { MeshBuilder.normalizeUVs(sub); } }
        
        console.log("MESH");
        console.log(mesh);

        //MeshBuilder.normalizeUVs(mesh);
        return mesh;
    }
};

/*

# Tiny test OBJ

v 0 0 0
v 1 0 0
v 0 1 0

v 0 0 1
v 1 0 1
v 0 1 1

vt 0 0
vt 1 0
vt 0 1

vn 0 0 1
vn 0 0 1
vn 0 0 1

usemtl A
f 1/1/1 2/2/1 3/3/1

usemtl B
f 4/1/1 5/2/1 6/3/1

usemtl C
f 1/1/1 4/2/1 2/3/1


1 → [0, 0, 0]
2 → [1, 0, 0]
3 → [0, 1, 0]
4 → [0, 0, 1]
5 → [1, 0, 1]
6 → [0, 1, 1]

1/1/1

position index = 1
uv index = 1
normal index = 1


*/

/*

export class ObjFile {
    constructor() {
        this.positions = []; // v (position)
        this.normals = []; // vn (normal)
        this.uvs = []; // vt (uv)
        this.materialGroups = {};
    }
};

Mesh {
    submeshes: [
        Submesh {
            name: "Keyboard",
            positions: Float32Array([...]),
            normals:   Float32Array([...]),
            uvs:       Float32Array([...]),
            indices:   Uint16Array([...]),
            material:  null
        },


        f 10/11/12 13/14/15 16/17/18

        positions = [pos10, pos13, pos16]
        uvs       = [uv11, uv14, uv17]
        normals   = [nor12, nor15, nor18]
        indices   = [0, 1, 2]

*/