/**
 * WebGL Setup and Rendering
 * Handles shader compilation, program creation, buffer management, and drawing
 */

import { createCube, createCylinder, createHollowCylinder, createRoundedBox } from '../geometry/primitives.js';

// WebGL context and program
let gl;
let program;
let attribs;
let uniforms;
let cubeBuffer;
let cylinderBuffer;
let hollowCylinderBuffer;
let husksBuffer;
let roundedCubeBuffer;

export function initWebGL(canvas) {
    gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    attribs = {
        position: gl.getAttribLocation(program, 'a_position'),
        normal: gl.getAttribLocation(program, 'a_normal')
    };
    
    uniforms = {
        matrix: gl.getUniformLocation(program, 'u_worldViewProjection'),
        world: gl.getUniformLocation(program, 'u_world'),
        worldInvTrans: gl.getUniformLocation(program, 'u_worldInverseTranspose'),
        color: gl.getUniformLocation(program, 'u_color'),
        lightDir: gl.getUniformLocation(program, 'u_lightDirection'),
        lightDir2: gl.getUniformLocation(program, 'u_lightDirection2'),
        lightDir3: gl.getUniformLocation(program, 'u_lightDirection3'),
        viewPosition: gl.getUniformLocation(program, 'u_viewPosition'),
        shininess: gl.getUniformLocation(program, 'u_shininess'),
        ambient: gl.getUniformLocation(program, 'u_ambient'),
        specular: gl.getUniformLocation(program, 'u_specular'),
        metallic: gl.getUniformLocation(program, 'u_metallic'),
        anisotropic: gl.getUniformLocation(program, 'u_anisotropic'),
        objectCenter: gl.getUniformLocation(program, 'u_objectCenter'),
    };

    // Create geometry buffers
    cubeBuffer = createBufferInfo(createCube());
    cylinderBuffer = createBufferInfo(createCylinder(36));
    hollowCylinderBuffer = createBufferInfo(createHollowCylinder(36, 0.03, 1, 1));
    husksBuffer = createBufferInfo(createHollowCylinder(7, 0.2, 1, 1));
    roundedCubeBuffer = createBufferInfo(createRoundedBox(2, 2, 2, 0.1, 10));

    gl.uniform3fv(uniforms.lightDir, [1.0, 0.3, 0.5]);
    gl.uniform3fv(uniforms.lightDir2, [-0.5, 0.8, -0.3]);
    gl.uniform3fv(uniforms.lightDir3, [-0.2, -0.4, 0.4]);
}

export function setCameraPosition(pos) {
    gl.uniform3fv(uniforms.viewPosition, pos);
}

export function createBufferInfo(data) {
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.STATIC_DRAW);

    const normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);

    const idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);

    return { pos: posBuffer, norm: normBuffer, idx: idxBuffer, count: data.indices.length };
}

export function drawShape(bufferInfo, color, modelMatrix, viewProjMatrix, material = {}) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.pos);
    gl.enableVertexAttribArray(attribs.position);
    gl.vertexAttribPointer(attribs.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.norm);
    gl.enableVertexAttribArray(attribs.normal);
    gl.vertexAttribPointer(attribs.normal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.idx);

    let wvp = mult(viewProjMatrix, modelMatrix);
    let invTrans = transpose(inverse(modelMatrix));

    gl.uniformMatrix4fv(uniforms.matrix, false, flatten(wvp));
    gl.uniformMatrix4fv(uniforms.world, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(uniforms.worldInvTrans, false, flatten(invTrans));
    gl.uniform4fv(uniforms.color, color);

    gl.uniform1f(uniforms.shininess, material.shininess ?? 32.0);
    gl.uniform1f(uniforms.specular, material.specular ?? 0.2);
    gl.uniform1f(uniforms.metallic, material.metallic ?? 0.0);
    gl.uniform1f(uniforms.anisotropic, material.anisotropic ?? 0.0);
    gl.uniform1f(uniforms.ambient, material.ambient ?? 0.3);
    let cx = modelMatrix[0][3];
    let cy = modelMatrix[1][3];
    let cz = modelMatrix[2][3];
    gl.uniform3fv(uniforms.objectCenter, [cx, cy, cz]);

    gl.drawElements(gl.TRIANGLES, bufferInfo.count, gl.UNSIGNED_SHORT, 0);
}

export function getGLContext() {
    return gl;
}

export function getBuffers() {
    return { cubeBuffer, cylinderBuffer, hollowCylinderBuffer, husksBuffer, roundedCubeBuffer };
}