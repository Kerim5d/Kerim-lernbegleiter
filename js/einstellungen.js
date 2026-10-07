/* einstellungen.js — Sprache, Lautstärke, Stimme einstellen; Equalizer-Animation beim Sprechen */

const EinstellungenDB = {
  get() {
    return DB._get('spracheEinstellungen', {
      lang: 'de-DE',
      rate: 0.9,
      pitch: 1,
      volume: 1,
      voiceName: ''
    });
  },
  save(cfg) {
    DB._set('spracheEinstellungen', cfg);
  }
};

function ladeVerfuegbareStimmen(selectEl) {
  const stimmen = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const deutsche = stimmen.filter(v => v.lang.startsWith('de'));
  const liste = deutsche.length ? deutsche : stimmen;
  selectEl.innerHTML = '<option value="">Standard-Stimme</option>';
  liste.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    selectEl.appendChild(opt);
  });
}

function initEinstellungenView() {
  const cfg = EinstellungenDB.get();

  const langSelect = document.getElementById('einstellLang');
  if (typeof fuelleSprachenSelect === 'function') fuelleSprachenSelect(langSelect);
  langSelect.value = cfg.lang;

  document.getElementById('einstellRate').value = cfg.rate;
  document.getElementById('einstellPitch').value = cfg.pitch;
  document.getElementById('einstellVolume').value = cfg.volume;

  const stimmenSelect = document.getElementById('einstellStimme');
  const fuelleStimmen = () => {
    ladeVerfuegbareStimmen(stimmenSelect);
    if (cfg.voiceName) stimmenSelect.value = cfg.voiceName;
  };
  fuelleStimmen();
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = fuelleStimmen;
  }

  if (typeof baueEqualizerRing === 'function') {
    baueEqualizerRing('einstellEqualizerRing');
  }

  document.getElementById('einstellTestBtn').onclick = () => {
    sprich('Hallo Kerim, so klingt meine Stimme jetzt.');
  };

  document.getElementById('einstellSaveBtn').onclick = () => {
    EinstellungenDB.save({
      lang: langSelect.value,
      rate: parseFloat(document.getElementById('einstellRate').value),
      pitch: parseFloat(document.getElementById('einstellPitch').value),
      volume: parseFloat(document.getElementById('einstellVolume').value),
      voiceName: stimmenSelect.value
    });
    alert('Spracheinstellungen gespeichert!');
  };

  const ort = DB._get('wetterOrt', WETTER_ORT_DEFAULT);
  document.getElementById('wetterOrtName').value = ort.name;
  document.getElementById('wetterOrtLat').value = ort.lat;
  document.getElementById('wetterOrtLon').value = ort.lon;

  document.getElementById('wetterOrtSaveBtn').onclick = () => {
    const neuerOrt = {
      name: document.getElementById('wetterOrtName').value.trim() || WETTER_ORT_DEFAULT.name,
      lat: parseFloat(document.getElementById('wetterOrtLat').value) || WETTER_ORT_DEFAULT.lat,
      lon: parseFloat(document.getElementById('wetterOrtLon').value) || WETTER_ORT_DEFAULT.lon
    };
    DB._set('wetterOrt', neuerOrt);
    if (typeof ladeWetter === 'function') ladeWetter();
    alert('Ort gespeichert!');
  };
}

/* ===== Equalizer-Animation: animierte Balken, die beim Sprechen pulsieren.
   Hinweis: Browser erlauben keinen echten Frequenz-Zugriff auf die Vorlese-Stimme,
   daher ist das eine optische Animation, die sich am Sprechstatus orientiert
   (reagiert in Echtzeit darauf, ob gerade gesprochen wird), keine echte Audioanalyse. */
let _equalizerInterval = null;

function starteEqualizerAnimation() {
  const bars = document.querySelectorAll('.eq-bar');
  if (!bars.length) return;
  stoppeEqualizerAnimation();
  _equalizerInterval = setInterval(() => {
    bars.forEach(bar => {
      const hoehe = 10 + Math.random() * 40;
      bar.style.height = hoehe + 'px';
    });
  }, 150);
}

function stoppeEqualizerAnimation() {
  if (_equalizerInterval) {
    clearInterval(_equalizerInterval);
    _equalizerInterval = null;
  }
  document.querySelectorAll('.eq-bar').forEach(bar => { bar.style.height = '6px'; });
}
