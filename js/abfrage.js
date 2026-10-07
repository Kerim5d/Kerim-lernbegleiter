/* abfrage.js — Abfrage-Modus: App "liest" Frage/Begriff vor, Kind antwortet gesprochen */

let _abfrageSaetze = [];
let _abfrageIndex = 0;
let _abfrageFach = '';
let _abfrageBlattId = '';

function initAbfrageView() {
  const blattSelect = document.getElementById('abfrageBlattSelect');
  fuelleBlattSelect(blattSelect);

  document.getElementById('abfrageStartBtn').onclick = () => {
    const blatt = DB.getBlattById(blattSelect.value);
    if (!blatt) { alert('Bitte zuerst ein Arbeitsblatt abfotografieren.'); return; }
    _abfrageSaetze = splitInSaetze(blatt.text);
    if (!_abfrageSaetze.length) { alert('Im Blatt wurde kein lesbarer Satz erkannt.'); return; }
    _abfrageIndex = 0;
    _abfrageFach = blatt.fach;
    _abfrageBlattId = blatt.id;
    document.getElementById('abfrageArea').style.display = 'block';
    Zeit.start(_abfrageFach, 'abfrage');
    zeigeAbfrageFrage();
  };

  document.getElementById('abfrageSprechenBtn').onclick = () => {
    const gehoertEl = document.getElementById('abfrageGehoert');
    gehoertEl.textContent = '🎙️ Ich höre zu...';
    hoereZu(
      (text) => {
        gehoertEl.textContent = 'Du hast gesagt: "' + text + '"';
        pruefeAbfrage(text);
      },
      (fehler) => { gehoertEl.textContent = fehler; }
    );
  };

  document.getElementById('abfrageNextBtn').onclick = () => {
    _abfrageIndex++;
    if (_abfrageIndex >= _abfrageSaetze.length) {
      Zeit.stop();
      alert('Abfrage fertig! Klasse gemacht, Kerim! 🎉');
      document.getElementById('abfrageArea').style.display = 'none';
      return;
    }
    zeigeAbfrageFrage();
  };
}

function zeigeAbfrageFrage() {
  const satz = _abfrageSaetze[_abfrageIndex];
  document.getElementById('abfrageFrage').textContent =
    `Lies oder wiederhole: "${satz}"`;
  document.getElementById('abfrageGehoert').textContent = '';
  document.getElementById('abfrageErgebnis').textContent = '';
  document.getElementById('abfrageErgebnis').className = 'ergebnis-box';
  document.getElementById('abfrageNextBtn').style.display = 'none';
  sprich(satz);
}

function pruefeAbfrage(gesprochenerText) {
  const original = normalisiereText(_abfrageSaetze[_abfrageIndex]);
  const gesagt = normalisiereText(gesprochenerText);
  const score = aehnlichkeit(original, gesagt);
  const richtig = score >= 0.75;

  const ergebnisBox = document.getElementById('abfrageErgebnis');
  ergebnisBox.className = 'ergebnis-box ' + (richtig ? 'ok' : 'fail');
  ergebnisBox.textContent = richtig
    ? '✅ Super, das war richtig!'
    : '❌ Nicht ganz — lies es nochmal in Ruhe durch.';

  DB.addErgebnis({
    fach: _abfrageFach,
    thema: 'Lesen & Verstehen (Abfrage)',
    blattId: _abfrageBlattId,
    richtig,
    text: _abfrageSaetze[_abfrageIndex]
  });

  document.getElementById('abfrageNextBtn').style.display = 'inline-block';
}
