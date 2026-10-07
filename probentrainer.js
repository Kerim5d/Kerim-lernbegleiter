/* probentrainer.js — Übungsprobe aus Arbeitsblättern/Themen generieren,
   Bewertung mit dem gleichen Notenschlüssel wie in der Schule */

let _probeFragen = [];
let _probeIndex = 0;
let _probeRichtig = 0;
let _probeFach = '';

function sammleProbeMaterial(fach) {
  const blaetter = DB.getBlaetter().filter(b => b.fach === fach);
  let saetze = [];
  blaetter.forEach(b => { saetze = saetze.concat(splitInSaetze(b.text)); });
  // doppelte entfernen, max 10 Fragen pro Probe
  saetze = [...new Set(saetze)];
  return saetze.slice(0, 10);
}

function initProbeView() {
  const fachSelect = document.getElementById('probeFachSelect');
  fuelleFachSelect(fachSelect);

  document.getElementById('probeStartBtn').onclick = () => {
    _probeFach = fachSelect.value;
    _probeFragen = sammleProbeMaterial(_probeFach);
    if (!_probeFragen.length) {
      alert('Für dieses Fach sind noch keine Arbeitsblätter gespeichert. Erst ein Blatt abfotografieren!');
      return;
    }
    _probeIndex = 0;
    _probeRichtig = 0;
    document.getElementById('probeArea').style.display = 'block';
    document.getElementById('probeAuswertung').style.display = 'none';
    Zeit.start(_probeFach, 'probe-trainer');
    zeigeProbeFrage();
  };

  document.getElementById('probeAntwortBtn').onclick = () => {
    const input = document.getElementById('probeAntwortInput');
    const antwort = input.value.trim();
    if (!antwort) return;
    const original = normalisiereText(_probeFragen[_probeIndex]);
    const gegeben = normalisiereText(antwort);
    const score = aehnlichkeit(original, gegeben);
    const richtig = score >= 0.8;
    if (richtig) _probeRichtig++;

    DB.addErgebnis({
      fach: _probeFach,
      thema: 'Probe-Training',
      blattId: null,
      richtig,
      text: _probeFragen[_probeIndex]
    });

    const feedback = document.getElementById('probeFeedback');
    feedback.className = 'ergebnis-box ' + (richtig ? 'ok' : 'fail');
    feedback.textContent = richtig ? '✅ Richtig!' : `❌ Richtig wäre: ${_probeFragen[_probeIndex]}`;
    input.value = '';

    setTimeout(() => {
      _probeIndex++;
      if (_probeIndex >= _probeFragen.length) {
        beendeProbe();
      } else {
        zeigeProbeFrage();
      }
    }, 1600);
  };
}

function zeigeProbeFrage() {
  document.getElementById('probeStatus').textContent = `Frage ${_probeIndex + 1} von ${_probeFragen.length}`;
  document.getElementById('probeFrage').textContent = `Schreib/sag diesen Satz richtig: "${_probeFragen[_probeIndex]}"`;
  document.getElementById('probeFeedback').textContent = '';
  document.getElementById('probeFeedback').className = 'ergebnis-box';
}

function beendeProbe() {
  Zeit.stop();
  const prozent = Math.round((_probeRichtig / _probeFragen.length) * 100);
  const note = prozentZuNote(prozent);

  document.getElementById('probeArea').style.display = 'none';
  const auswertung = document.getElementById('probeAuswertung');
  auswertung.style.display = 'block';
  auswertung.innerHTML = `
    <h3>Ergebnis der Übungsprobe — ${_probeFach}</h3>
    <p>${_probeRichtig} von ${_probeFragen.length} richtig (${prozent}%)</p>
    <p style="font-size:28px;font-weight:bold;">Note: ${note}</p>
    <p class="hint">Das ist nur eine Übungsnote nach Schulnotenschlüssel — zählt nicht offiziell, zeigt aber gut den Stand!</p>
  `;
}
