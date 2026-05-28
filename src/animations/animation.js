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

let hasRecord = false;
let pendingSwap = false;
let pendingStart = false;
let recordLiftY = 0;
let recordSwapX = 0;
let currentRecord = 0;

const colorLabels = [
    [0.95, 0.45, 0.45, 1.0],
    [0.75, 0.7, 0.5, 1.0],
    [0.6, 0.4, 0.75, 1.0],
];

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
        buttonAngle,
        hasRecord,
        recordLiftY,
        recordSwapX,
        currentRecord,
        colorLabels,
    };
}

export function startTurntable() {
    if (!hasRecord) return false;

    if (animState === 0 || animState === 6 || animState === 7) {
        animState = 1;
        pendingStart = false;
        return true;
    }
    else if (animState >= 8 && animState <= 11) {
        pendingStart = true;
        return true;
    }

    return false;
}

export function stopTurntable() {
    pendingStart = false;

    if (animState >= 1 && animState <= 4) {
        animState = 5;
        return true;
    }
    else if (animState >= 8 && animState <= 11) {
        return true;
    }

    return false;
}

export function isPlaybackRequested() {
    return getIsPlaying() || pendingStart;
}

export function loadRecord() {
    if (!hasRecord) {
        hasRecord = true;
        currentRecord = currentRecord % colorLabels.length;
        recordSwapX = -5.0;
        animState = 10;
        return;
    }

    if (animState === 0 || animState === 7) {
        animState = 8;
    }
    else if (animState === 4) {
        animState = 5;
        pendingSwap = true;
    }
    else if (animState === 5 || animState === 6) {
        pendingSwap = true;
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
        if (armPanAngle <= -0.5) {
            armPanAngle = -0.5;
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
            if (pendingSwap) {
                pendingSwap = false;
                animState = 8;
            }
        }
    }

    else if (animState === 8) {
        recordLiftY += dt * 1.5;
        if (recordLiftY >= 2.0) { recordLiftY = 2.0; animState = 9; }
    }
    else if (animState === 9) {
        recordSwapX += dt * 3.0;
        if (recordSwapX >= 4.0) {
            recordSwapX = 4.0;
            currentRecord = (currentRecord + 1) % colorLabels.length;
            recordSwapX = -4.0;
            animState = 10;
        }
    }
    else if (animState === 10) {
        recordSwapX += dt * 3.0;
        if (recordSwapX >= 0) { recordSwapX = 0; animState = 11; }
    }
    else if (animState === 11) {
        recordLiftY -= dt * 1.5;
        if (recordLiftY <= -0.1) {
            recordLiftY = -0.1;
            if (pendingStart) {
                pendingStart = false;
                animState = 1;
            } else {
                animState = 0;
            }
        }
    }
}

export function getLastTime() {
    return lastTime;
}

export function setLastTime(time) {
    lastTime = time;
}
