/* diktat.js — Diktat-Modus: Satz vorlesen, Kind schreibt, Foto -> OCR -> Vergleich */

function splitInSaetze(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

function normalisiereText(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:„“"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Einfache Levenshtein-Ähnlichkeit (0 = identisch)
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function aehnlichkeit(a, b) {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - dist / maxLen;
}

let _diktatSaetze = [];
let _diktatIndex = 0;
let _diktatFach = '';
let _diktatBlattId = '';

function fuelleBlattSelect(selectEl) {
  selectEl.innerHTML = '';
  DB.getBlaetter().forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.fach} — ${new Date(b.erstelltAm).toLocaleDateString('de-DE')}`;
    selectEl.appendChild(opt);
  });
}

function initDiktatView() {
  const blattSelect = document.getElementById('diktatBlattSelect');
  fuelleBlattSelect(blattSelect);

  document.getElementById('diktatStartBtn').onclick = () => {
    const blatt = DB.getBlattById(blattSelect.value);
    if (!blatt) { alert('Bitte zuerst ein Arbeitsblatt abfotografieren.'); return; }
    _diktatSaetze = splitInSaetze(blatt.text);
    if (!_diktatSaetze.length) { alert('Im Blatt wurde kein lesbarer Satz erkannt.'); return; }
    _diktatIndex = 0;
    _diktatFach = blatt.fach;
    _diktatBlattId = blatt.id;
    document.getElementById('diktatArea').style.display = 'block';
    Zeit.start(_diktatFach, 'diktat');
    zeigeDiktatSatz();
  };

  document.getElementById('diktatVorlesenBtn').onclick = () => {
    sprich(_diktatSaetze[_diktatIndex]);
  };
  document.getElementById('diktatWiederholenBtn').onclick = () => {
    sprich(_diktatSaetze[_diktatIndex]);
  };

  document.getElementById('diktatShotBtn').onclick = async () => {
    const videoEl = document.getElementById('diktatCamPreview');
    const canvasEl = document.getElementById('diktatCamCanvas');
    const dataUrl = macheFoto(videoEl, canvasEl);
    const ergebnisBox = document.getElementById('diktatErgebnis');
    ergebnisBox.textContent = 'Text wird erkannt...';
    ergebnisBox.className = 'ergebnis-box';
    try {
      const erkannterText = await erkenneText(dataUrl);
      pruefeDiktat(erkannterText);
    } catch (e) {
      ergebnisBox.textContent = 'Fehler: ' + e.message;
    }
  };

  document.getElementById('diktatNextBtn').onclick = () => {
    _diktatIndex++;
    if (_diktatIndex >= _diktatSaetze.length) {
      Zeit.stop();
      alert('Diktat fertig! Super gemacht, Kerim! 🎉');
      document.getElementById('diktatArea').style.display = 'none';
      stoppeKamera();
      return;
    }
    zeigeDiktatSatz();
  };

  // Kamera für den Diktat-Bereich separat starten, wenn View aktiv wird
  starteKamera(document.getElementById('diktatCamPreview'));
}

function zeigeDiktatSatz() {
  document.getElementById('diktatStatus').textContent =
    `Satz ${_diktatIndex + 1} von ${_diktatSaetze.length}`;
  document.getElementById('diktatErgebnis').textContent = '';
  document.getElementById('diktatErgebnis').className = 'ergebnis-box';
  document.getElementById('diktatNextBtn').style.display = 'none';
  sprich(_diktatSaetze[_diktatIndex]);
}

function pruefeDiktat(erkannterText) {
  const original = normalisiereText(_diktatSaetze[_diktatIndex]);
  const geschrieben = normalisiereText(erkannterText);
  const score = aehnlichkeit(original, geschrieben);
  const richtig = score >= 0.85;

  const ergebnisBox = document.getElementById('diktatErgebnis');
  ergebnisBox.className = 'ergebnis-box ' + (richtig ? 'ok' : 'fail');
  ergebnisBox.textContent =
    `Original: ${_diktatSaetze[_diktatIndex]}\n` +
    `Erkannt:  ${erkannterText}\n` +
    (richtig ? '✅ Richtig geschrieben!' : '❌ Da ist noch ein Fehler — gut nochmal anschauen!');

  DB.addErgebnis({
    fach: _diktatFach,
    thema: 'Rechtschreibung (Diktat)',
    blattId: _diktatBlattId,
    richtig,
    text: _diktatSaetze[_diktatIndex]
  });

  document.getElementById('diktatNextBtn').style.display = 'inline-block';
}
