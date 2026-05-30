/**
 * Animation State and Logic
 * Manages turntable animation states and timing
 */

import { playAudio, stopAudio, getIsPlaying } from '../audio/audio.js';

export const STATE = Object.freeze({
    IDLE:             0,
    ARM_LIFT:         1,
    ARM_PAN_IN:       2,
    ARM_DROP:         3,
    PLAYING:          4,
    ARM_LIFT_STOP:    5,
    ARM_PAN_OUT:      6,
    ARM_REST:         7,
    RECORD_LIFT:      8,
    RECORD_SWAP:      9,
    RECORD_PLACE:     10,
    RECORD_SETTLE:    11,
});

let animState = STATE.IDLE;
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

export function startTurntable() {
    if (!hasRecord) return false;

    if (animState === STATE.IDLE || animState === STATE.ARM_PAN_OUT || animState === STATE.ARM_REST) {
        animState = STATE.ARM_LIFT;
        pendingStart = false;
        return true;
    }
    else if (animState >= STATE.RECORD_LIFT && animState <= STATE.RECORD_SETTLE) {
        pendingStart = true;
        return true;
    }

    return false;
}

export function stopTurntable() {
    pendingStart = false;

    if (animState >= STATE.ARM_LIFT && animState <= STATE.PLAYING) {
        animState = STATE.ARM_LIFT_STOP;
        return true;
    }
    else if (animState >= STATE.RECORD_LIFT && animState <= STATE.RECORD_SETTLE) {
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
        recordLiftY = 2.0;
        animState = STATE.RECORD_PLACE;
        return;
    }

    if (animState === STATE.IDLE || animState === STATE.ARM_PAN_OUT || animState === STATE.ARM_REST) {
        animState = STATE.RECORD_LIFT;
    }
    else if (animState === STATE.PLAYING) {
        animState = STATE.ARM_LIFT_STOP;
        pendingSwap = true;
    }
    else if (animState === STATE.ARM_LIFT_STOP || animState === STATE.ARM_PAN_OUT || animState === STATE.ARM_REST) {
        pendingSwap = true;
    }
}

export function updateAnimation(dt) {
    if (animState === STATE.IDLE) return;

    else if (animState === STATE.ARM_LIFT) { 
        armTiltAngle -= dt * 0.15; 
        if (armTiltAngle <= -0.15) {
            armTiltAngle = -0.15;
            animState = STATE.ARM_PAN_IN;
        }
    } 
    else if (animState === STATE.ARM_PAN_IN) { 
        armPanAngle -= dt * 0.25; 
        cartridgeAngle -= dt * 0.1; 
        if (armPanAngle <= -0.5) {
            armPanAngle = -0.5;
            animState = STATE.ARM_DROP;
        }
    } 
    else if (animState === STATE.ARM_DROP) { 
        armTiltAngle += dt * 0.15; 
        if (armTiltAngle >= 0.05) { 
            armTiltAngle = 0.05;
            animState = STATE.PLAYING;
            if (onPlaybackStart) onPlaybackStart();
        }
    } 
    else if (animState === STATE.PLAYING) { 
        recordAngle += dt * 1.5; 
        buttonAngle += dt * 1.0; 
    }
    
    else if (animState === STATE.ARM_LIFT_STOP) {
        armTiltAngle -= dt * 0.15;
        if (armTiltAngle <= -0.15) {
            armTiltAngle = -0.15;
            animState = STATE.ARM_PAN_OUT;
        }
    }
    else if (animState === STATE.ARM_PAN_OUT) {
        armPanAngle    += dt * 0.25;
        cartridgeAngle += dt * 0.1;
        if (armPanAngle >= 0) {
            armPanAngle = 0;
            animState = STATE.ARM_REST;
        }
    }
    else if (animState === STATE.ARM_REST) {
        armTiltAngle += dt * 0.15;
        if (armTiltAngle >= 0) {
            armTiltAngle = 0;
            if (pendingSwap) {
                pendingSwap = false;
                animState = STATE.RECORD_LIFT;
            }
        }
    }

    else if (animState === STATE.RECORD_LIFT) {
        recordLiftY += dt * 1.5;
        if (recordLiftY >= 2.0) { recordLiftY = 2.0; animState = STATE.RECORD_SWAP; }
    }
    else if (animState === STATE.RECORD_SWAP) {
        recordSwapX += dt * 3.0;
        if (recordSwapX >= 4.0) {
            recordSwapX = 4.0;
            currentRecord = (currentRecord + 1) % colorLabels.length;
            recordSwapX = -4.0;
            animState = STATE.RECORD_PLACE;
        }
    }
    else if (animState === STATE.RECORD_PLACE) {
        recordSwapX += dt * 3.0;
        if (recordSwapX >= 0) { recordSwapX = 0; animState = STATE.RECORD_SETTLE; }
    }
    else if (animState === STATE.RECORD_SETTLE) {
        recordLiftY -= dt * 1.5;
        if (recordLiftY <= -0.1) {
            recordLiftY = -0.1;
            if (pendingStart) {
                pendingStart = false;
                animState = STATE.PLAYING;
            } else {
                animState = STATE.IDLE;
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

const _state = {
    animState: STATE.IDLE,
    armTiltAngle: 0,
    armPanAngle: 0,
    cartridgeAngle: 0,
    recordAngle: 0,
    buttonAngle: 0,
    hasRecord: false,
    recordLiftY: 0,
    recordSwapX: 0,
    currentRecord: 0,
    colorLabels,
};

export function getAnimationState() {
    _state.animState = animState;
    _state.armTiltAngle = armTiltAngle;
    _state.armPanAngle = armPanAngle;
    _state.cartridgeAngle = cartridgeAngle;
    _state.recordAngle = recordAngle;
    _state.buttonAngle = buttonAngle;
    _state.hasRecord = hasRecord;
    _state.recordLiftY = recordLiftY;
    _state.recordSwapX = recordSwapX;
    _state.currentRecord = currentRecord;
    return _state;
}