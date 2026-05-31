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
    PLATTER_BRAKE:    8,
    RECORD_LIFT:      9,
    RECORD_SWAP:      10,
    RECORD_PLACE:     11,
    RECORD_SETTLE:    12,
});

let animState = STATE.IDLE;
let armTiltAngle = 0;
let armPanAngle = 0;
let cartridgeAngle = 0;
let recordAngle = 0;
let lastTime = 0;
let diskDirection = 1;

let onPlaybackStart = null;

let hasRecord = false;
let pendingSwap = false;
let pendingStart = false;
let recordLiftY = 0;
let recordSwapX = 0;
let currentRecord = 0;

let buttonPressLength = [0, 0, 0];
let buttonPressTarget = [0, 0, 0];
let buttonKnobAngle = 0;   

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

    if (animState >= STATE.ARM_LIFT && animState <= STATE.ARM_DROP) {
        animState = STATE.ARM_LIFT_STOP;
        return true;
    }
    else if (animState === STATE.PLAYING) {
        animState = STATE.PLATTER_BRAKE;
        diskDirection = 1;
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

    if (animState === STATE.IDLE) {
        animState = STATE.RECORD_LIFT
        // diskDirection = 1;
    }
    else if (animState >= STATE.ARM_LIFT && animState <= STATE.PLAYING) {
        pendingSwap = true;
        stopTurntable()
    }
    else if (animState >= STATE.ARM_LIFT_STOP && animState <= STATE.ARM_REST) {
        pendingSwap = true;
    }

}

export function updateAnimation(dt) {
    for (let i = 0; i < 3; i++) {
        buttonPressLength[i] += (buttonPressTarget[i] - buttonPressLength[i]) * Math.min(dt * 12, 1);
    }

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
        recordAngle += dt * 2.5;
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
    else if (animState === STATE.PLATTER_BRAKE) {
        const TWO_PI = Math.PI * 2;

        let angle = recordAngle % TWO_PI;

        let target;
        if (angle < Math.PI) {
            diskDirection = -1;
            target = Math.PI;
        } 
        else {
            diskDirection = 1;
            target = TWO_PI;
        } 

        const diff = target - angle;
        const brakeSpeed = dt * 1.5;

        if (Math.abs(diff) <= brakeSpeed) {
            recordAngle = recordAngle + diff;
            animState = STATE.ARM_LIFT_STOP;
        } 
        else {
            recordAngle += Math.sign(diff) * brakeSpeed;
        }
    }

    else if (animState === STATE.RECORD_LIFT) {
        recordLiftY += dt * 1.5;
        if (recordLiftY >= 2.0) { recordLiftY = 2.0; animState = STATE.RECORD_SWAP; }
    }
    else if (animState === STATE.RECORD_SWAP) {
        recordSwapX += dt * 3.0 * diskDirection;
        const threshold = 4.0;

        const passed = diskDirection === 1
            ? recordSwapX >= threshold
            : recordSwapX <= -threshold;

        if (passed) {
            currentRecord = (currentRecord + 1) % colorLabels.length;
            recordAngle = 0;
            diskDirection = 1;
            recordSwapX = -threshold;
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
                animState = STATE.ARM_LIFT;
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

export function pressButton(index) {
    buttonPressTarget[index] = -0.1;
    setTimeout(() => { buttonPressTarget[index] = 0; }, 150);
}

export function setKnobAngle(angle) {
    buttonKnobAngle = angle;
}

const _state = {
    animState: STATE.IDLE,
    armTiltAngle: 0,
    armPanAngle: 0,
    cartridgeAngle: 0,
    recordAngle: 0,
    hasRecord: false,
    recordLiftY: 0,
    recordSwapX: 0,
    colorLabels,
    currentRecord: 0,
    nextRecord: 1,
    buttonPressLength: 0,
    buttonKnobAngle: 0,
};

export function getAnimationState() {
    _state.animState     = animState;
    _state.armTiltAngle  = armTiltAngle;
    _state.armPanAngle   = armPanAngle;
    _state.cartridgeAngle = cartridgeAngle;
    _state.recordAngle   = recordAngle;
    _state.hasRecord     = hasRecord;
    _state.recordLiftY   = recordLiftY;
    _state.recordSwapX   = recordSwapX;
    _state.currentRecord = currentRecord;
    _state.nextRecord = (currentRecord + 1) % colorLabels.length;
    _state.buttonPressLength = buttonPressLength;
    _state.buttonKnobAngle  = buttonKnobAngle;
    return _state;
}