/* mikrofon-equalizer.js — ECHTER Equalizer für die eigene Stimme (Mikrofon-Input).
   Wenn Kerim selbst spricht (z.B. beim Antworten), kann er auf einen Button drücken,
   dann wird sein Mikrofon live analysiert und die Equalizer-Balken bewegen sich
   nach seiner echten Stimme (Lautstärke/Frequenzen) — nicht simuliert. */

let _mikroStream = null;
let _mikroAudioCtx = null;
let _mikroAnalyser = null;
let _mikroRafId = null;
let _mikroAktiv = false;

async function starteMikrofonEqualizer(containerId) {
  if (_mikroAktiv) {
    stoppeMikrofonEqualizer();
    return false;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Dieses Gerät/Browser unterstützt keinen Mikrofon-Zugriff.');
    return false;
  }
  try {
    _mikroStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    alert('Zugriff auf das Mikrofon wurde nicht erlaubt oder ist nicht möglich: ' + e.message);
    return false;
  }

  if (containerId && typeof baueEqualizerRing === 'function') {
    baueEqualizerRing(containerId);
  }

  _mikroAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const quelle = _mikroAudioCtx.createMediaStreamSource(_mikroStream);
  _mikroAnalyser = _mikroAudioCtx.createAnalyser();
  _mikroAnalyser.fftSize = 64;
  quelle.connect(_mikroAnalyser);

  _mikroAktiv = true;
  const data = new Uint8Array(_mikroAnalyser.frequencyBinCount);

  function tick() {
    if (!_mikroAktiv) return;
    _mikroAnalyser.getByteFrequencyData(data);
    const bars = document.querySelectorAll('.eq-bar');
    bars.forEach((bar, i) => {
      const value = data[i % data.length] || 0;
      bar.style.height = (6 + (value / 255) * 54) + 'px';
    });
    _mikroRafId = requestAnimationFrame(tick);
  }
  tick();
  return true;
}

function stoppeMikrofonEqualizer() {
  _mikroAktiv = false;
  if (_mikroRafId) { cancelAnimationFrame(_mikroRafId); _mikroRafId = null; }
  if (_mikroStream) {
    _mikroStream.getTracks().forEach(track => track.stop());
    _mikroStream = null;
  }
  if (_mikroAudioCtx) {
    _mikroAudioCtx.close().catch(() => {});
    _mikroAudioCtx = null;
  }
  document.querySelectorAll('.eq-bar').forEach(bar => { bar.style.height = '6px'; });
}

/* Button-Verknüpfung: wird von app.js / abfrage.js aufgerufen, sobald der Button existiert */
function initEigeneStimmeButton(buttonId, containerId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.onclick = async () => {
    const laeuft = await starteMikrofonEqualizer(containerId);
    if (laeuft) {
      btn.textContent = '⏹️ Equalizer stoppen';
      btn.classList.add('active');
    } else {
      btn.textContent = '🎙️ Meine Stimme anzeigen';
      btn.classList.remove('active');
    }
  };
}
