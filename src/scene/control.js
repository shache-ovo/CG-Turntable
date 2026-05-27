import { playAudio, stopAudio, loadAudio, getIsPlaying } from "../audio/audio.js";
import { startTurntable, stopTurntable, setOnPlaybackStart } from '../animations/animation.js';

const buttonPlay = document.getElementById("button-play");
const audioFile= document.getElementById('audio-file');
const audioStatus = document.getElementById('audio-status');

setOnPlaybackStart(() => {
    playAudio();
});

export function initControls() {
  buttonPlay.addEventListener("click", () => {
    if (getIsPlaying()) {
      stopAudio();
      stopTurntable();
      buttonPlay.textContent = "▶";
      buttonPlay.classList.remove("playing");
    } else {
      startTurntable();
      buttonPlay.textContent = "⏸";
      buttonPlay.classList.add("playing");
    }
  });

  audioFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    audioStatus.textContent = "로딩 중…";
    const url = URL.createObjectURL(file);
    loadAudio(url)
      .then(() => {
        audioStatus.textContent =
          file.name.length > 18 ? file.name.slice(0, 16) + "…" : file.name;
      })
      .catch(() => {
        audioStatus.textContent = "로드 실패";
      });
  });
}
