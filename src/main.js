/**
 * Main Entry Point
 * Orchestrates WebGL setup, animation, and rendering loop
 */

import { initWebGL, getGLContext, getBuffers } from './gl/webgl.js';
import { renderScene } from './scene/turnTable.js';
import { updateAnimation, getLastTime, setLastTime } from './animations/animation.js';
import { initAudio } from './audio/audio.js';
import { initControls } from './scene/control.js';

const canvas = document.getElementById('glcanvas');

window.onload = function() {
    // Set canvas size before initialization
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize WebGL
    initWebGL(canvas);
    initAudio();
    initControls();
    const { cubeBuffer, cylinderBuffer } = getBuffers();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start the animation
    requestAnimationFrame(render);
}

// Render loop
function render(time) {
    time *= 0.001;
    let dt = time - getLastTime();
    setLastTime(time);

    updateAnimation(dt);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = getGLContext();
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    renderScene(gl, canvas);

    requestAnimationFrame(render);
}
