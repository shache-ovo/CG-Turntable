let audioCtx = null;
let gainNode = null;
let sourceNode = null;
let audioBuffer = null;
let isPlaying = false;
let volume = 0.7;
let pausedAt = 0;
let startedAt = 0;


export function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(audioCtx.destination);
}

export function loadAudio(url) {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => audioCtx.decodeAudioData(buf))
    .then((decoded) => {
      audioBuffer = decoded;
      pausedAt = 0;
      return decoded;
    });
}

export function playAudio() {
    if (!audioBuffer || isPlaying) return false;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.connect(gainNode);
    sourceNode.start(0, pausedAt % audioBuffer.duration);
    startedAt = audioCtx.currentTime - pausedAt;
    isPlaying = true;
    return true;
}

export function stopAudio() {
    if (!sourceNode || !isPlaying) return;
    pausedAt = audioCtx.currentTime - startedAt;
    sourceNode.stop();
    sourceNode = null;
    isPlaying = false;
}

export function setVolume(val) {
  volume = Math.max(0, Math.min(1, val));
  if (gainNode)
    gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01);
}

export function getVolume() {
  return volume;
}
export function getIsPlaying() {
  return isPlaying;
}
