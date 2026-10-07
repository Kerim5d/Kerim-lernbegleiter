/* equalizer.js — ECHTER Audio-Equalizer über Web Audio API.
   Analysiert tatsächlich die Lautstärke/Frequenzen eines <audio>-Elements
   (z.B. der Entspannungsmusik) und bewegt die Balken live danach.
   Für die Sprachausgabe (speechSynthesis) ist das technisch nicht möglich,
   da Browser dort keinen Audio-Stream freigeben — dafür pulsiert der Ring
   während des Sprechens weich mit einer Simulation (siehe sprache.js). */

let _audioCtx = null;
let _analyser = null;
let _sourceNode = null;
let _eqRafId = null;

function initEqualizerFuerAudio(audioEl) {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_sourceNode) { _sourceNode.disconnect(); }
    _sourceNode = _audioCtx.createMediaElementSource(audioEl);
    _analyser = _audioCtx.createAnalyser();
    _analyser.fftSize = 64;
    _sourceNode.connect(_analyser);
    _analyser.connect(_audioCtx.destination);
    starteEchteEqualizerAnimation();
  } catch (e) {
    console.warn('Equalizer konnte nicht initialisiert werden:', e.message);
  }
}

function starteEchteEqualizerAnimation() {
  const bars = document.querySelectorAll('.eq-bar');
  if (!bars.length || !_analyser) return;
  const data = new Uint8Array(_analyser.frequencyBinCount);

  function tick() {
    _analyser.getByteFrequencyData(data);
    bars.forEach((bar, i) => {
      const value = data[i % data.length] || 0;
      bar.style.height = (6 + (value / 255) * 54) + 'px';
    });
    _eqRafId = requestAnimationFrame(tick);
  }
  tick();
}

function stoppeEchteEqualizerAnimation() {
  if (_eqRafId) { cancelAnimationFrame(_eqRafId); _eqRafId = null; }
  document.querySelectorAll('.eq-bar').forEach(bar => { bar.style.height = '6px'; });
}

function baueEqualizerRing(containerId, anzahlBalken = 16) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="eq-ring"><div class="eq-bars"></div></div>';
  const bars = container.querySelector('.eq-bars');
  for (let i = 0; i < anzahlBalken; i++) {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';
    bars.appendChild(bar);
  }
}
