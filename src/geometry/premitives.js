/**
 * Geometry Generators
 * Factory functions to create geometric primitives with positions, normals, and indices
 */


export function createCube() {
    const positions = [
        -1,-1, 1,   1,-1, 1,   1, 1, 1,  -1, 1, 1,
        -1,-1,-1,  -1, 1,-1,   1, 1,-1,   1,-1,-1,
        -1, 1,-1,  -1, 1, 1,   1, 1, 1,   1, 1,-1,
        -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
         1,-1,-1,   1, 1,-1,   1, 1, 1,   1,-1, 1,
        -1,-1,-1,  -1,-1, 1,  -1, 1, 1,  -1, 1,-1,
    ];
    const normals = [
         0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
         0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1,
         0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
         0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,
         1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
        -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    ];
    const indices = [
        0, 1, 2,  0, 2, 3,     4, 5, 6,  4, 6, 7,
        8, 9,10,  8,10,11,    12,13,14, 12,14,15,
       16,17,18, 16,18,19,    20,21,22, 20,22,23
    ];
    return { positions, normals, indices };
}

export function createCylinder(segments) {
    const positions = [], normals = [], indices = [];
    positions.push(0,1,0,  0,-1,0); 
    normals.push(0,1,0,  0,-1,0);
    let topCenter = 0, bottomCenter = 1;
    let offset = 2;
    
    for (let i = 0; i <= segments; i++) {
        let theta = (i / segments) * Math.PI * 2;
        let c = Math.cos(theta), s = Math.sin(theta);
        positions.push(c, 1, s,   c, -1, s);
        normals.push(0, 1, 0,   0, -1, 0); 
        positions.push(c, 1, s,   c, -1, s);
        normals.push(c, 0, s,   c, 0, s);  
    }
    
    for (let i = 0; i < segments; i++) {
        let base = offset + i * 4;
        indices.push(topCenter, base, base + 4); 
        indices.push(bottomCenter, base + 5, base + 1); 
        indices.push(base+2, base+3, base+7); 
        indices.push(base+2, base+7, base+6); 
    }
    return { positions, normals, indices };
}
