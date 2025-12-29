export class TextRenderer {

    constructor() {}

    buildTextMesh(font, text, startX = 0, startY = 0, scale=1) {
        const vertices = [];
        const uvs = [];
        const indices = [];

        let cursorX = startX;
        let cursorY = startY;

        let indexOffset = 0;

        for (const char of text) {
            const code = char.charCodeAt(0);
            const glyph = font.getGlyph(code);
            if (!glyph) continue;


            // baseline is cursorY
            const x0 = cursorX + glyph.xoffset * scale;
            const x1 = x0 + glyph.width * scale;

            // BMFont y offset goes DOWN, but this one Y goes UP
            const y0 = cursorY + (font.lineHeight - glyph.yoffset) * scale; // top
            const y1 = y0 - glyph.height * scale;                           // bottom
      
            // // Quad corners in pixel space
            // const x0 = cursorX + glyph.xoffset;
            // //const y0 = cursorY - glyph.yoffset;
            // const x1 = x0 + glyph.width;
            // //const y1 = y0 - glyph.height;

            // //const y0 = cursorY - glyph.yoffset;
            // //const y1 = y0 - glyph.height;
            
            // const y0 = cursorY - glyph.yoffset;   // top of glyph quad
            // const y1 = y0 - glyph.height;         // bottom of glyph quad


            // Push vertices (x, y)
            // vertices.push(
            //     x0, y0, 0,
            //     x1, y0, 0,
            //     x1, y1, 0,
            //     x0, y1, 0
            // );

            // instead of 4 verts + indices, do:
            vertices.push(
                x0, y0, 0,
                x1, y0, 0,
                x1, y1, 0,

                x0, y0, 0,
                x1, y1, 0,
                x0, y1, 0
            );

// uvs.push(
//     glyph.u0, glyph.v0,
//     glyph.u1, glyph.v0,
//     glyph.u1, glyph.v1,

//     glyph.u0, glyph.v0,
//     glyph.u1, glyph.v1,
//     glyph.u0, glyph.v1
// );

            uvs.push(
                glyph.u0, glyph.v0,  // top-left
                glyph.u1, glyph.v0,  // top-right
                glyph.u1, glyph.v1,  // bottom-right

                glyph.u0, glyph.v0,  // top-left
                glyph.u1, glyph.v1,  // bottom-right
                glyph.u0, glyph.v1   // bottom-left
            );


            // Push UVs
            // uvs.push(
            //     glyph.u0, glyph.v1,  // bottom-left
            //     glyph.u1, glyph.v1,  // bottom-right
            //     glyph.u1, glyph.v0,  // top-right
            //     glyph.u0, glyph.v0   // top-left
            // );


           
            // uvs.push(
            //     glyph.u0, glyph.v0,
            //     glyph.u1, glyph.v0,
            //     glyph.u1, glyph.v1,
            //     glyph.u0, glyph.v1
            // );

            // uvs.push(
            //     glyph.u0, 1.0 - glyph.v0,
            //     glyph.u1, 1.0 - glyph.v0,
            //     glyph.u1, 1.0 - glyph.v1,
            //     glyph.u0, 1.0 - glyph.v1
            // );


            // Push indices
            indices.push(
                indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3
            );

            indexOffset += 4;

            // Move cursor
            cursorX += glyph.xadvance * scale;
        }

        return {
            vertices: new Float32Array(vertices),
            uvs: new Float32Array(uvs),
            indices: new Uint16Array(indices)
        };
    }
}
