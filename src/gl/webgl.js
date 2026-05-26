/**
 * WebGL Setup and Rendering
 * Handles shader compilation, program creation, buffer management, and drawing
 */

import { createCube, createCylinder } from '../geometry/premitives.js';

// WebGL context and program
let gl;
let program;
let attribs;
let uniforms;
let cubeBuffer;
let cylinderBuffer;

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
        worldInvTrans: gl.getUniformLocation(program, 'u_worldInverseTranspose'),
        color: gl.getUniformLocation(program, 'u_color'),
        lightDir: gl.getUniformLocation(program, 'u_lightDirection')
    };

    // Create geometry buffers
    cubeBuffer = createBufferInfo(createCube());
    cylinderBuffer = createBufferInfo(createCylinder(36));

    // Set light direction
    gl.uniform3fv(uniforms.lightDir, [0.3, 1.0, 0.6]);
    console.log('position attrib:', gl.getAttribLocation(program, 'a_position'));
    console.log('normal attrib:', gl.getAttribLocation(program, 'a_normal'));
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

export function drawShape(bufferInfo, color, modelMatrix, viewProjMatrix) {
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
    gl.uniformMatrix4fv(uniforms.worldInvTrans, false, flatten(invTrans));
    gl.uniform4fv(uniforms.color, color);
    
    gl.drawElements(gl.TRIANGLES, bufferInfo.count, gl.UNSIGNED_SHORT, 0);
}

export function getGLContext() {
    return gl;
}

export function getBuffers() {
    return { cubeBuffer, cylinderBuffer };
}

export function getCubeBuffer() {
    return cubeBuffer;
}

export function getCylinderBuffer() {
    return cylinderBuffer;
}
