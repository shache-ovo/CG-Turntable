/**
 * Main Entry Point
 * Orchestrates WebGL setup, animation, and rendering loop
 */

import { initWebGL, getGLContext, getBuffers } from './gl/webgl.js';
import { renderScene } from './scene/turnTable.js';
import { updateAnimation, getLastTime, setLastTime } from './animations/animation.js';
import { initAudio } from './audio/audio.js';

const canvas = document.getElementById('glcanvas');

const camera = {
  theta: 0,
  phi: -0.8,
  radius: 15.0,
  isDragging: false,
  lastX: 0,
  lastY: 0,
};

window.onload = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initWebGL(canvas);
    initAudio();
    const { cubeBuffer, cylinderBuffer } = getBuffers();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    canvas.addEventListener('mousedown', (e) => {
        camera.isDragging = true;
        camera.lastX = e.clientX;
        camera.lastY = e.clientY;
    });

    canvas.addEventListener('mouseup', () => {
        camera.isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!camera.isDragging) return;

        const dx = e.clientX - camera.lastX;
        const dy = e.clientY - camera.lastY;
        camera.lastX = e.clientX;
        camera.lastY = e.clientY;

        const sensitivity = 0.005;
        camera.theta -= dx * sensitivity;
        camera.phi   -= dy * sensitivity;

        camera.phi = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.phi));
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSensitivity = 0.005;
        camera.radius += e.deltaY * zoomSensitivity;
        camera.radius = Math.max(5.0, Math.min(30.0, camera.radius));
    }, { passive: false });

    requestAnimationFrame(render);
}

// Render loop
function render(time) {
    time *= 0.001;
    let dt = time - getLastTime();
    setLastTime(time);

    updateAnimation(dt);

    const gl = getGLContext();
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    renderScene(gl, canvas, camera);

    requestAnimationFrame(render);
}
