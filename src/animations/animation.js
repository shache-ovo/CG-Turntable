/**
 * Animation State and Logic
 * Manages turntable animation states and timing
 */

let animState = 0; 
let armTiltAngle = 0;   
let armPanAngle = 0;    
let cartridgeAngle = 0; 
let recordAngle = 0;    
let buttonAngle = 0;    
let lastTime = 0;

export function getAnimationState() {
    return {
        animState,
        armTiltAngle,
        armPanAngle,
        cartridgeAngle,
        recordAngle,
        buttonAngle
    };
}

export function updateAnimation(dt) {
    if (animState === 0) {
        setTimeout(() => { animState = 1; }, 1000);
        animState = -1; 
    } 
    else if (animState === 1) { 
        armTiltAngle -= dt * 0.15; 
        if (armTiltAngle <= -0.15) {
            armTiltAngle = -0.15;
            animState = 2;
        }
    } 
    else if (animState === 2) { 
        armPanAngle -= dt * 0.25; 
        cartridgeAngle -= dt * 0.1; 
        if (armPanAngle <= -0.65) {
            armPanAngle = -0.65;
            animState = 3;
        }
    } 
    else if (animState === 3) { 
        armTiltAngle += dt * 0.15; 
        if (armTiltAngle >= 0.05) { 
            armTiltAngle = 0.05;
            animState = 4;
        }
    } 
    else if (animState === 4) { 
        recordAngle += dt * 1.5; 
        buttonAngle += dt * 1.0; 
    }
}

export function getLastTime() {
    return lastTime;
}

export function setLastTime(time) {
    lastTime = time;
}
