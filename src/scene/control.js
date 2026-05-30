import { playAudio, stopAudio, loadAudio, setVolume, getIsPlaying } from "../audio/audio.js";
import { startTurntable, stopTurntable, setOnPlaybackStart, getAnimationState, loadRecord, isPlaybackRequested } from '../animations/animation.js';

const buttonPlay = document.getElementById("button-play");
const buttonSwap = document.getElementById("button-swap");
const audioFile= document.getElementById('audio-file');
const audioStatus = document.getElementById('audio-status');
const volSlider= document.getElementById('vol-slider');
const volLabel = document.getElementById('vol-label');

setOnPlaybackStart(() => {
  playAudio();
});

buttonPlay.addEventListener("click", () => {
  if (isPlaybackRequested()) {
    stopAudio();
    stopTurntable();
    buttonPlay.textContent = "▶";
    buttonPlay.classList.remove("playing");
  } else {
    if (startTurntable()) {
      buttonPlay.textContent = "⏸";
      buttonPlay.classList.add("playing");
    }
  }
});

audioFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (getIsPlaying()) {
    stopAudio();
    buttonPlay.textContent = '▶';
    buttonPlay.classList.remove('playing');
  }

  audioStatus.textContent = "로딩 중…";
  const url = URL.createObjectURL(file);
  loadAudio(url)
    .then(() => {
      audioStatus.textContent =
        file.name.length > 18 ? file.name.slice(0, 16) + "…" : file.name;
      loadRecord();
      buttonPlay.disabled = !getAnimationState().hasRecord;
    })
    .catch(() => {
      audioStatus.textContent = "로드 실패";
    });
});

buttonSwap.addEventListener('click', () => {
  audioFile.click();
  buttonSwap.style.opacity = '0.4';
  setTimeout(() => { buttonSwap.style.opacity = '1'; }, 2200);
});

volSlider.addEventListener('input', (e) => {
  const volume = e.target.value / 100;
  volLabel.textContent = `${e.target.value}%`;
  setVolume(volume);
});