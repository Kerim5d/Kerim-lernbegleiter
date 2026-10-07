/* arbeitsblaetter.js — Kamera starten, Foto aufnehmen, Text erkennen & speichern */

let _camStream = null;

function fuelleFachSelect(selectEl) {
  selectEl.innerHTML = '';
  DB.getFaecher().forEach(fach => {
    const opt = document.createElement('option');
    opt.value = fach;
    opt.textContent = fach;
    selectEl.appendChild(opt);
  });
}

async function starteKamera(videoEl) {
  try {
    _camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    videoEl.srcObject = _camStream;
  } catch (e) {
    alert('Kamera konnte nicht gestartet werden: ' + e.message);
  }
}

function stoppeKamera() {
  if (_camStream) {
    _camStream.getTracks().forEach(t => t.stop());
    _camStream = null;
  }
}

function macheFoto(videoEl, canvasEl) {
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);
  return canvasEl.toDataURL('image/jpeg', 0.85);
}

function renderBlattListe() {
  const container = document.getElementById('blattListe');
  const blaetter = DB.getBlaetter();
  container.innerHTML = '';
  if (!blaetter.length) {
    container.innerHTML = '<p class="hint">Noch keine Arbeitsblätter gespeichert.</p>';
    return;
  }
  blaetter.forEach(b => {
    const item = document.createElement('div');
    item.className = 'blatt-item';
    const datum = new Date(b.erstelltAm).toLocaleString('de-DE');
    item.innerHTML = `
      <span><b>${b.fach}</b> — ${datum}<br><span class="hint">${(b.text || '').slice(0, 80)}...</span></span>
      <button class="loesch-btn" data-id="${b.id}" title="Arbeitsblatt löschen">🗑️</button>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.loesch-btn').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Dieses Arbeitsblatt wirklich löschen?')) {
        DB.deleteBlatt(btn.dataset.id);
        renderBlattListe();
      }
    };
  });
}

async function initArbeitsblaetterView() {
  const videoEl = document.getElementById('camPreview');
  const canvasEl = document.getElementById('camCanvas');
  const startBtn = document.getElementById('camStartBtn');
  const shotBtn = document.getElementById('camShotBtn');
  const fachSelect = document.getElementById('camFachSelect');
  const statusEl = document.getElementById('ocrStatus');

  fuelleFachSelect(fachSelect);
  renderBlattListe();

  startBtn.onclick = async () => {
    await starteKamera(videoEl);
    shotBtn.disabled = false;
  };

  shotBtn.onclick = async () => {
    const dataUrl = macheFoto(videoEl, canvasEl);
    statusEl.textContent = 'Text wird erkannt... 0%';
    try {
      const text = await erkenneText(dataUrl, (p) => {
        statusEl.textContent = `Text wird erkannt... ${p}%`;
      });
      DB.addBlatt({ fach: fachSelect.value, text, bildDataUrl: dataUrl });
      statusEl.textContent = 'Gespeichert! ✅';
      renderBlattListe();
    } catch (e) {
      statusEl.textContent = 'Fehler bei der Texterkennung: ' + e.message;
    }
  };
}
