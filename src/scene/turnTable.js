/**
 * Scene Graph and Rendering
 * Handles scene hierarchy, matrix stack, and rendering of the turntable scene
 */

import { drawShape } from '../gl/webgl.js';
import { getAnimationState } from '../animations/animation.js';
import { getCubeBuffer, getCylinderBuffer } from '../gl/webgl.js';

let matrixStack = [];
let modelMatrix = mat4();
let viewProjMatrix = mat4();

const deg = (radians) => radians * 180 / Math.PI;


// Colors
const colorBase = [165/255, 196/255, 242/255, 1.0];
const colorWood = [199/255, 150/255, 109/255, 1.0];
const colorPlatter = [78/255, 132/255, 212/255, 1.0];
const colorRecord = [0.2, 0.2, 0.2, 1.0];
const colorLabel = [0.95, 0.45, 0.45, 1.0];
const colorArm = [0.85, 0.85, 0.85, 1.0];
const colorCartridge = [0.95, 0.35, 0.35, 1.0];

function pushMatrix() { 
    // Deep copy the matrix by creating a new matrix with the same values
    let copy = [];
    for (let i = 0; i < modelMatrix.length; i++) {
        copy.push(modelMatrix[i].slice());
    }
    copy.matrix = true;
    matrixStack.push(copy);
}

function popMatrix() { 
    if (matrixStack.length > 0) {
        modelMatrix = matrixStack.pop();
    }
}

export function renderScene(gl, canvas) {
    gl.clearColor(0.9, 0.9, 0.9, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let aspect = canvas.width / canvas.height;
    let projection = perspective(deg(Math.PI/3), aspect, 0.1, 100); 
    
    let view = mat4();
    view = mult(view, translate(-0.5, -1.0, -14.0)); 
    view = mult(view, rotateX(deg(0.4))); 
    view = mult(view, rotateY(deg(0.2))); 
    viewProjMatrix = mult(projection, view);
    
    modelMatrix = mat4();
    
    
    // HIERARCHY LEVEL 1: ROOT
    pushMatrix();
    
        pushMatrix();
            modelMatrix = mult(modelMatrix, scalem(5, 0.8, 4));
            drawShape(getCubeBuffer(), colorBase, modelMatrix, viewProjMatrix);
        popMatrix();
        
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(0, -0.9, 0));
            modelMatrix = mult(modelMatrix, scalem(5.3, 0.1, 4.5));
            drawShape(getCubeBuffer(), colorWood, modelMatrix, viewProjMatrix);
        popMatrix();

        // --------------------------------------------------
        // PLATTER & RECORD BRANCH
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(-1.5, 0.8, 0)); 
            
            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.2, 0));
                modelMatrix = mult(modelMatrix, scalem(2.5, 0.2, 2.5));
                drawShape(getCylinderBuffer(), colorPlatter, modelMatrix, viewProjMatrix);
            popMatrix();
            
            pushMatrix();
                modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().recordAngle)));
                
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(0, 0.45, 0));
                    modelMatrix = mult(modelMatrix, scalem(3.5, 0.05, 3.5));
                    drawShape(getCylinderBuffer(), colorRecord, modelMatrix, viewProjMatrix);
                popMatrix();

                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(0, 0.51, 0));
                    modelMatrix = mult(modelMatrix, scalem(0.8, 0.01, 0.8));
                    drawShape(getCylinderBuffer(), colorLabel, modelMatrix, viewProjMatrix);
                popMatrix();
            popMatrix();
        popMatrix(); 

        // --------------------------------------------------
        // HIERARCHY LEVEL 2: TONEARM MECHANISM 
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(3.2, 0.8, -1.5));
            modelMatrix = mult(modelMatrix, scalem(1.3, 1.3, 1.3));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.2, 0));
                modelMatrix = mult(modelMatrix, scalem(0.6, 0.2, 0.6));
                drawShape(getCylinderBuffer(), colorArm, modelMatrix, viewProjMatrix);
            popMatrix();

            // HIERARCHY LEVEL 3: TONEARM PIVOT
            modelMatrix = mult(modelMatrix, translate(0, 0.6, 0));
            modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().armPanAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, scalem(0.3, 0.4, 0.3));
                drawShape(getCylinderBuffer(), colorCartridge, modelMatrix, viewProjMatrix);
            popMatrix();

            // HIERARCHY LEVEL 4: TONEARM TUBE 
            modelMatrix = mult(modelMatrix, translate(0, 0.3, 0));
            modelMatrix = mult(modelMatrix, rotateX(deg(getAnimationState().armTiltAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.0, 1.8));
                modelMatrix = mult(modelMatrix, scalem(0.1, 0.1, 1.8));
                drawShape(getCubeBuffer(), colorArm, modelMatrix, viewProjMatrix);
            popMatrix();

            // --------------------------------------------------
            // HIERARCHY LEVEL 5: CARTRIDGE & STYLUS
            // --------------------------------------------------
            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.0, 3.6));
                
                modelMatrix = mult(modelMatrix, rotateY(deg(-0.6 + getAnimationState().cartridgeAngle))); 
                
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-0.15, 0.0, 0.1));
                    modelMatrix = mult(modelMatrix, scalem(0.25, 0.18, 0.4));
                    drawShape(getCubeBuffer(), colorCartridge, modelMatrix, viewProjMatrix);
                popMatrix();
                
                // 바늘 (stylus)
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-0.2, -0.2, 0.3));
                    modelMatrix = mult(modelMatrix, scalem(0.02, 0.15, 0.02));
                    drawShape(getCylinderBuffer(), colorArm, modelMatrix, viewProjMatrix);
                popMatrix();
                
            popMatrix(); 
        popMatrix(); 

        // --------------------------------------------------
        // RETRO BUTTONS
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(2.5, 0, 4.0));
            for(let i=0; i<3; i++) {
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-i*0.8, 0, 0));
                    modelMatrix = mult(modelMatrix, rotateX(deg(Math.PI/2)));

                    if (getAnimationState().animState === 4) {
                        modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().buttonAngle * (i+1) * 0.5)));
                    }

                    modelMatrix = mult(modelMatrix, scalem(0.2, 0.2, 0.2));
                    drawShape(getCylinderBuffer(), colorCartridge, modelMatrix, viewProjMatrix);
                popMatrix();
            }
        popMatrix();

    popMatrix();
}
