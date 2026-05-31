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

let halfDiskColorA = [1, 0, 0, 1];
let halfDiskColorB = [0, 0, 1, 1];

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

export function randomizeHalfDiskColors() {
    halfDiskColorA = [Math.random(), Math.random(), Math.random(), 1.0];
    halfDiskColorB = [Math.random(), Math.random(), Math.random(), 1.0];
}

export function renderScene(gl, canvas, camera) {
    gl.clearColor(0.8, 0.8, 0.8, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let aspect = canvas.width / canvas.height;
    let projection = perspective(deg(Math.PI/3), aspect, 0.1, 100); 
    
    let view = mat4();
    view = mult(view, translate(0, 0, -camera.radius)); 
    view = mult(view, rotateX(deg(-camera.phi))); 
    view = mult(view, rotateY(deg(-camera.theta))); 

    setCameraPosition([0, 0, camera.radius]);

    viewProjMatrix = mult(projection, view);
    
    modelMatrix = mat4();
    
    
    // HIERARCHY LEVEL 1: ROOT
    pushMatrix();

        // --------------------------------------------------
        // BASE BRANCH
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, scalem(5, 0.8, 4));
            drawShape(getBuffers().roundedCubeBuffer, colorBase, modelMatrix, viewProjMatrix);
            
            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, -0.9, 0));
                modelMatrix = mult(modelMatrix, scalem(1.1, 0.125, 1.1));
                drawShape(getBuffers().roundedCubeBuffer, colorWood, modelMatrix, viewProjMatrix, matWood);
            popMatrix();

        popMatrix();
        
        // --------------------------------------------------
        // PLATTER & RECORD BRANCH
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(-0.9, 1.1, 0)); 
            
            pushMatrix();
                // modelMatrix = mult(modelMatrix, translate(0, 0.3, 0));
                modelMatrix = mult(modelMatrix, scalem(0.07, 0.3, 0.07));
                drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix);
            popMatrix();

            pushMatrix();
                modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().recordAngle)));
                modelMatrix = mult(modelMatrix, translate(0, -0.2, 0));
                pushMatrix();
                    modelMatrix = mult(modelMatrix, scalem(3.65, 0.07, 3.65));
                    drawShape(getBuffers().cylinderBuffer, colorPlatter, modelMatrix, viewProjMatrix);
                popMatrix();
                
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(0, 0.17, 0));
                    modelMatrix = mult(modelMatrix, scalem(3.65, 0.2, 3.65));
                    drawShape(getBuffers().hollowCylinderBuffer, colorPlatter, modelMatrix, viewProjMatrix);
                popMatrix();
            
            
                if (getAnimationState().hasRecord) {
                    pushMatrix();
                        modelMatrix = mult(modelMatrix, translate(getAnimationState().recordSwapX, getAnimationState().recordLiftY, 0));
                        modelMatrix = mult(modelMatrix, translate(0, 0.25, 0));
                        
                        pushMatrix();
                            modelMatrix = mult(modelMatrix, scalem(3.5, 0.05, 3.5));
                            drawShape(getBuffers().cylinderBuffer, colorRecord, modelMatrix, viewProjMatrix, matRecord);
                        popMatrix();

                        modelMatrix = mult(modelMatrix, translate(0, 0.05, 0));
                        pushMatrix();
                        modelMatrix = mult(modelMatrix, scalem(0.9, 0.01, 0.9));
                        drawShape(getBuffers().halfDiskBuffer, getAnimationState().colorLabels[getAnimationState().currentRecord], modelMatrix, viewProjMatrix);
                        popMatrix();
                        
                        pushMatrix();
                        modelMatrix = mult(modelMatrix, rotateY(180));
                        modelMatrix = mult(modelMatrix, scalem(0.9, 0.01, 0.9));
                        drawShape(getBuffers().halfDiskBuffer, getAnimationState().colorLabels[getAnimationState().nextRecord], modelMatrix, viewProjMatrix);
                        popMatrix();
                        
                        pushMatrix();
                            modelMatrix = mult(modelMatrix, translate(0, 0.01, 0));
                            modelMatrix = mult(modelMatrix, scalem(0.07, 0.01, 0.07));
                            drawShape(getBuffers().cylinderBuffer, colorRecordInner, modelMatrix, viewProjMatrix, matRecord);
                        popMatrix();
                    popMatrix();
                }
            popMatrix();
        popMatrix();

        // --------------------------------------------------
        // TONEARM MECHANISM 
        // --------------------------------------------------
        pushMatrix();
            modelMatrix = mult(modelMatrix, translate(3.8, 0.8, -2.5));
            modelMatrix = mult(modelMatrix, scalem(1.3, 1.3, 1.3));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, 0.2, 0));
                modelMatrix = mult(modelMatrix, scalem(0.6, 0.2, 0.6));
                drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix, matMetal);
            popMatrix();

            // TONEARM PIVOT
            modelMatrix = mult(modelMatrix, translate(0, 0.6, 0));
            modelMatrix = mult(modelMatrix, rotateY(deg(getAnimationState().armPanAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, scalem(0.4, 0.4, 0.4));
                drawShape(getBuffers().cylinderBuffer, colorCartridge, modelMatrix, viewProjMatrix);
            popMatrix();

            // TONEARM TUBE 
            modelMatrix = mult(modelMatrix, translate(0, 0.3, 0));
            modelMatrix = mult(modelMatrix, rotateX(deg(getAnimationState().armTiltAngle)));

            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(0, -0.15, 1.9));
                modelMatrix = mult(modelMatrix, rotateX(90));
                modelMatrix = mult(modelMatrix, scalem(0.13, 1.6, 0.13));
                drawShape(getBuffers().cylinderBuffer, colorArm, modelMatrix, viewProjMatrix, matMetal);
            popMatrix();

            // CARTRIDGE & STYLUS
            pushMatrix();
                modelMatrix = mult(modelMatrix, translate(-0.15, 0.0, 3.7));
                modelMatrix = mult(modelMatrix, rotateY(deg(-0.6 + getAnimationState().cartridgeAngle))); 
                
                pushMatrix();
                    modelMatrix = mult(modelMatrix, scalem(0.25, 0.18, 0.4));
                    drawShape(getBuffers().cubeBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                popMatrix();
                
                // stylus
                pushMatrix();
                    modelMatrix = mult(modelMatrix, translate(-0.05, -0.2, 0.2));
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

                    if (i === 0) {
                        modelMatrix = mult(modelMatrix, rotateY(deg(-getAnimationState().buttonKnobAngle)));
                    }
                    pushMatrix();
                        modelMatrix = mult(modelMatrix, scalem(0.27, 0.27, 0.27));
                        drawShape(getBuffers().husksBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                    popMatrix();

                    if (i == 1 || i == 2) {
                        const press = getAnimationState().buttonPressLength[i];
                        modelMatrix = mult(modelMatrix, translate(0, press, 0));
                        
                    }
                    pushMatrix();
                        modelMatrix = mult(modelMatrix, scalem(0.2, 0.2, 0.2));
                        drawShape(getBuffers().cylinderBuffer, colorCartridge, modelMatrix, viewProjMatrix);
                    popMatrix();

                popMatrix();
            }
        popMatrix();

    popMatrix();
}
