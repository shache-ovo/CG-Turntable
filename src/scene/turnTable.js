/**
 * Scene Graph and Rendering
 * Handles scene hierarchy, matrix stack, and rendering of the turntable scene
 */

import { drawShape, getBuffers, setCameraPosition } from '../gl/webgl.js';
import { getAnimationState } from '../animations/animation.js';

let matrixStack = [];
let modelMatrix = mat4();
let viewProjMatrix = mat4();

const deg = (radians) => radians * 180 / Math.PI;

// Colors
const colorBase = [165/255, 196/255, 242/255, 1.0];
const colorWood = [199/255, 150/255, 109/255, 1.0];
const colorPlatter = [78/255, 132/255, 212/255, 1.0];
const colorRecord = [0.12, 0.12, 0.14, 1.0];
const colorLabel = [0.95, 0.45, 0.45, 1.0];
const colorArm = [0.9, 0.9, 0.9, 1.0];
const colorCartridge = [0.95, 0.35, 0.35, 1.0];
const colorRecordInner = [0.9, 0.9, 0.9, 1.0];

const matWood = { shininess: 10.0, specular: 0.1, ambient: 0.15};
const matRecord = { shininess: 6.0, specular: 0.4, anisotropic: 0.9 };
const matMetal = { shininess: 20.0, specular: 0.6, ambient: 0.23, metallic: 0.9 };

function pushMatrix() { 
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
    view = mult(view, translate(0, 0, -15.0)); 
    view = mult(view, rotateX(deg(0.5))); 
    view = mult(view, rotateY(deg(0))); 

    let invView = inverse(view);
    setCameraPosition([invView[0][3], invView[1][3], invView[2][3]]);

    viewProjMatrix = mult(projection, view);
    
    modelMatrix = mat4();
    
    
    // HIERARCHY LEVEL 1: ROOT
    pushMatrix();
    
        pushMatrix();
            modelMatrix = mult(modelMatrix, scalem(5, 0.8, 4));
            drawShape(getBuffers().roundedCubeBuffer, colorBase, modelMatrix, viewProjMatrix);
        popMatrix();
        
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(0, -0.9, 0));
            modelMatrix = mult(modelMatrix, scalem(5.5, 0.1, 4.4));
            drawShape(getBuffers().roundedCubeBuffer, colorWood, modelMatrix, viewProjMatrix, matWood);
        popMatrix();

        // --------------------------------------------------
        // PLATTER & RECORD BRANCH
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(-0.9, 0.8, 0)); 
            
            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.1, 0));
                modelMatrix = mult(modelMatrix, scalem(3.65, 0.07, 3.65));
                drawShape(getBuffers().cylinderBuffer, colorPlatter, modelMatrix, viewProjMatrix);
            popMatrix();

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.27, 0));
                modelMatrix = mult(modelMatrix, scalem(3.65, 0.2, 3.65));
                drawShape(getBuffers().hollowCylinderBuffer, colorPlatter, modelMatrix, viewProjMatrix);
            popMatrix();

            
            if (getAnimationState().hasRecord) {
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(getAnimationState().recordSwapX, getAnimationState().recordLiftY, 0));
                    modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().recordAngle)));
                    
                    pushMatrix();
                        modelMatrix = mult(modelMatrix, translate(0, 0.45, 0));
                        modelMatrix = mult(modelMatrix, scalem(3.5, 0.05, 3.5));
                        drawShape(getBuffers().cylinderBuffer, colorRecord, modelMatrix, viewProjMatrix, matRecord);
                    popMatrix();
                        
                    pushMatrix();
                        modelMatrix = mult(modelMatrix, translate(0, 0.5, 0));
                        modelMatrix = mult(modelMatrix, scalem(1, 0.01, 1));
                        drawShape(getBuffers().cylinderBuffer, getAnimationState().colorLabels[getAnimationState().currentRecord], modelMatrix, viewProjMatrix);
                    popMatrix();

                    pushMatrix();
                        modelMatrix = mult(modelMatrix, translate(0, 0.52, 0));
                        modelMatrix = mult(modelMatrix, scalem(0.07, 0.01, 0.07));
                        drawShape(getBuffers().cylinderBuffer, colorRecordInner, modelMatrix, viewProjMatrix, matRecord);
                    popMatrix();
                popMatrix();
            }
        popMatrix();

        // --------------------------------------------------
        // HIERARCHY LEVEL 2: TONEARM MECHANISM 
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(3.8, 0.8, -2.5));
            modelMatrix = mult(modelMatrix, scalem(1.3, 1.3, 1.3));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.2, 0));
                modelMatrix = mult(modelMatrix, scalem(0.6, 0.2, 0.6));
                drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix, matMetal);
            popMatrix();

            // HIERARCHY LEVEL 3: TONEARM PIVOT
            modelMatrix = mult(modelMatrix, translate(0, 0.6, 0));
            modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().armPanAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, scalem(0.4, 0.4, 0.4));
                drawShape(getBuffers().cylinderBuffer, colorCartridge, modelMatrix, viewProjMatrix);
            popMatrix();

            // HIERARCHY LEVEL 4: TONEARM TUBE 
            modelMatrix = mult(modelMatrix, translate(0, 0.3, 0));
            modelMatrix = mult(modelMatrix, rotateX(deg(getAnimationState().armTiltAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, -0.15, 1.9));
                modelMatrix = mult(modelMatrix, rotateX(90));
                modelMatrix = mult(modelMatrix, scalem(0.13, 1.6, 0.13));
                drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix, matMetal);
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
                    drawShape(getBuffers().cubeBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                popMatrix();
                
                // 바늘 (stylus)
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-0.2, -0.2, 0.3));
                    modelMatrix = mult(modelMatrix, scalem(0.02, 0.15, 0.02));
                    drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix);
                popMatrix();
                
            popMatrix(); 
        popMatrix(); 

        // --------------------------------------------------
        // RETRO BUTTONS
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(3.7, 0, 4.0));
            for(let i=0; i<3; i++) {
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-i*0.8, 0, 0));
                    modelMatrix = mult(modelMatrix, rotateX(deg(Math.PI/2)));

                    if (getAnimationState().animState === 4) {
                        modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().buttonAngle * (i+1) * 0.5)));
                    }

                    pushMatrix();
                        modelMatrix = mult(modelMatrix, scalem(0.2, 0.2, 0.2));
                        drawShape(getBuffers().cylinderBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                    popMatrix();

                    pushMatrix();
                        modelMatrix = mult(modelMatrix, scalem(0.27, 0.27, 0.27));
                        drawShape(getBuffers().husksBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                    popMatrix();

                popMatrix();
            }
        popMatrix();

    popMatrix();
}
