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
        0, 1, 2,  0, 2, 3,  4, 5, 6,  4, 6, 7,
        8, 9,10,  8,10,11, 12,13,14, 12,14,15,
       16,17,18, 16,18,19, 20,21,22, 20,22,23
    ];
    return { positions, normals, indices };
}

function createGeometryBuilder() {
    const positions = [];
    const normals = [];
    const indices = [];
    let vertexCount = 0;

    function addVertex(px, py, pz, nx, ny, nz) {
        positions.push(px, py, pz);
        normals.push(nx, ny, nz);
        return vertexCount++;
    }

    function addQuad(a, b, c, d) {
        indices.push(a, b, c);
        indices.push(a, c, d);
    }

    function addTri(a, b, c) {
        indices.push(a, b, c);
    }

    function build() {
        return { positions, normals, indices };
    }

    return { addVertex, addQuad, addTri, build };
}

export function createCylinder(segments) {
    const { addVertex, addQuad, addTri, build } = createGeometryBuilder();

    const topCenter = addVertex(0, 1, 0, 0, 1, 0);
    const bottomCenter = addVertex(0, -1, 0, 0, -1, 0);

    const topCapVerts = [];
    const botCapVerts = [];
    const topSideVerts = [];
    const botSideVerts = [];

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        topCapVerts.push(addVertex(cos, 1, sin, 0, 1, 0));
        botCapVerts.push(addVertex(cos, -1, sin, 0, -1, 0));
        topSideVerts.push(addVertex(cos, 1, sin, cos, 0, sin));
        botSideVerts.push(addVertex(cos, -1, sin, cos, 0, sin));
    }

    for (let i = 0; i < segments; i++) {
        addTri(topCenter, topCapVerts[i], topCapVerts[i + 1]);
        addTri(bottomCenter, botCapVerts[i + 1], botCapVerts[i]);
        addQuad(topSideVerts[i], botSideVerts[i], botSideVerts[i + 1], topSideVerts[i + 1]);
    }

    return build();
}

export function createHollowCylinder(segments, thickness, outerRadius, height) {
    const { addVertex, addQuad, build } = createGeometryBuilder();

    const innerRadius = outerRadius - thickness;
    const halfH = height / 2;

    const outerTop = [], outerBot = [];
    const innerTop = [], innerBot = [];
    const capOutTop = [], capInTop = [];
    const capOutBot = [], capInBot = [];

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const ox = cos * outerRadius, oz = sin * outerRadius;
        const ix = cos * innerRadius, iz = sin * innerRadius;

        outerTop.push( addVertex(ox, halfH, oz, cos, 0, sin));
        outerBot.push( addVertex(ox, -halfH, oz, cos, 0, sin));
        innerTop.push( addVertex(ix, halfH, iz, -cos, 0, -sin));
        innerBot.push( addVertex(ix, -halfH, iz, -cos, 0, -sin));

        capOutTop.push(addVertex(ox, halfH, oz, 0, 1, 0));
        capInTop.push(addVertex(ix, halfH, iz, 0, 1, 0));
        capOutBot.push(addVertex(ox, -halfH, oz, 0, -1, 0));
        capInBot.push(addVertex(ix, -halfH, iz, 0, -1, 0));
    }

    for (let i = 0; i < segments; i++) {
        addQuad(outerTop[i], outerBot[i], outerBot[i+1], outerTop[i+1]);
        addQuad(innerTop[i], innerTop[i+1], innerBot[i+1], innerBot[i]);
        addQuad(capOutTop[i], capOutTop[i+1], capInTop[i+1], capInTop[i]);
        addQuad(capOutBot[i], capInBot[i], capInBot[i+1], capOutBot[i+1]);
    }

    return build();
}

function makeArcVerts(addVertex, { cx, cz, radius, startAngle, segments, y, normalMode }) {
    const verts = [];
    for (let s = 0; s <= segments; s++) {
        const theta = startAngle + (s / segments) * (Math.PI / 2);
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const px = cx + cos * radius;
        const pz = cz + sin * radius;

        let nx, ny, nz;
        if (normalMode === 'side') { nx = cos; ny = 0; nz = sin; }
        else if (normalMode === 'top') { nx = 0; ny = 1; nz = 0; }
        else { nx = 0; ny = -1; nz = 0; }

        verts.push(addVertex(px, y, pz, nx, ny, nz));
    }
    return verts;
}

export function createRoundedBox(width, height, depth, radius, segments) {
    const { addVertex, addQuad, addTri, build } = createGeometryBuilder();

    const hw = width / 2 - radius;
    const hh = height / 2;
    const hd = depth / 2 - radius;

    const cornerDefs = [
      { cx: hw, cz: hd, startAngle: 0},
      { cx: -hw, cz: hd, startAngle: Math.PI / 2},
      { cx: -hw, cz: -hd, startAngle: Math.PI},
      { cx: hw, cz: -hd, startAngle: Math.PI * 3/2},
    ];

    const cornerSideVerts = cornerDefs.map(({ cx, cz, startAngle }) => {
        const tops = makeArcVerts(addVertex, { cx, cz, radius, startAngle, segments, y: hh, normalMode: 'side' });
        const bots = makeArcVerts(addVertex, { cx, cz, radius, startAngle, segments, y: -hh, normalMode: 'side' });
        return { tops, bots };
    });

    for (const { tops, bots } of cornerSideVerts) {
        for (let s = 0; s < segments; s++) {
            addQuad(tops[s], tops[s+1], bots[s+1], bots[s]);
        }
    }

    const sideOrder = [[0, 1], [1, 2], [2, 3], [3, 0]];
    for (const [a, b] of sideOrder) {
        const t0 = cornerSideVerts[a].tops[segments];
        const b0 = cornerSideVerts[a].bots[segments];
        const t1 = cornerSideVerts[b].tops[0];
        const b1 = cornerSideVerts[b].bots[0];
        addQuad(t0, t1, b1, b0);
    }

    function buildCap(ny) {
        const y = ny > 0 ? hh : -hh;
        const mode = ny > 0 ? 'top' : 'bottom';

        const c = [
            addVertex(hw, y, hd, 0, ny, 0),
            addVertex(-hw, y, hd, 0, ny, 0),
            addVertex(-hw, y, -hd, 0, ny, 0),
            addVertex(hw, y, -hd, 0, ny, 0),
        ];
        ny > 0 ? addQuad(c[0], c[1], c[2], c[3])
               : addQuad(c[0], c[3], c[2], c[1]);

        const strips = [
            [hw, y, hd + radius, -hw, y, hd + radius, -hw, y, hd, hw, y, hd],
            [hw, y, -hd, -hw, y, -hd, -hw, y, -(hd + radius), hw, y, -(hd + radius)],
            [hw + radius, y, hd, hw + radius, y, -hd, hw, y, -hd, hw, y, hd],
            [-(hw + radius), y, hd, -(hw + radius), y, -hd, -hw, y, -hd, -hw, y, hd],
        ];

        for (const [ax,ay,az, bx,by,bz, cx2,cy2,cz2, dx,dy,dz] of strips) {
            const s0 = addVertex(ax, ay, az, 0, ny, 0);
            const s1 = addVertex(bx, by, bz, 0, ny, 0);
            const s2 = addVertex(cx2,cy2,cz2,0, ny, 0);
            const s3 = addVertex(dx, dy, dz, 0, ny, 0);
            ny > 0 ? addQuad(s0, s1, s2, s3)
                   : addQuad(s0, s3, s2, s1);
        }

        for (const { cx, cz, startAngle } of cornerDefs) {
            const center = addVertex(cx, y, cz, 0, ny, 0);
            const arc = makeArcVerts(addVertex, { cx, cz, radius, startAngle, segments, y, normalMode: mode });
            for (let s = 0; s < segments; s++) {
                ny > 0 ? addTri(center, arc[s], arc[s+1])
                       : addTri(center, arc[s+1], arc[s]);
            }
        }
    }

    buildCap(1);
    buildCap(-1);

    return build();
}