/**
 * Animation State and Logic
 * Manages turntable animation states and timing
 */

import { playAudio, stopAudio, getIsPlaying } from '../audio/audio.js';

let animState = 0; 
let armTiltAngle = 0;   
let armPanAngle = 0;    
let cartridgeAngle = 0; 
let recordAngle = 0;    
let buttonAngle = 0;    
let lastTime = 0;

let onPlaybackStart = null;

export function setOnPlaybackStart(fn) {
    onPlaybackStart = fn;
}

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

export function startTurntable() {
    if (animState === 0) {
        animState = 1;
    } else if (animState === 6) {
        animState = 1;
    }
}

export function stopTurntable() {
    if (animState === 4) {
        animState = 5;
    }
}

export function updateAnimation(dt) {
    if (animState === 0) return;

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
            if (onPlaybackStart) onPlaybackStart();
        }
    } 
    else if (animState === 4) { 
        recordAngle += dt * 1.5; 
        buttonAngle += dt * 1.0; 
    }
    
    else if (animState === 5) {
        armTiltAngle -= dt * 0.15;
        if (armTiltAngle <= -0.15) {
            armTiltAngle = -0.15;
            animState = 6;
        }
    }
    else if (animState === 6) {
        armPanAngle    += dt * 0.25;
        cartridgeAngle += dt * 0.1;
        if (armPanAngle >= 0) {
            armPanAngle = 0;
            animState = 7;
        }
    }
    else if (animState === 7) { 
        armTiltAngle += dt * 0.15; 
        if (armTiltAngle >= 0) {
            armTiltAngle = 0;
            animState = 7;
        }
    } 
}

export function getLastTime() {
    return lastTime;
}

export function setLastTime(time) {
    lastTime = time;
}
