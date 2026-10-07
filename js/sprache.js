/* sprache.js — Sprachausgabe (TTS) und Spracherkennung (STT) auf Deutsch.
   TTS läuft meist direkt auf dem Gerät. STT nutzt in Chrome einen
   Online-Dienst von Google — dafür ist eine Internetverbindung nötig. */

function sprich(text, onEnde) {
  if (!('speechSynthesis' in window)) {
    alert('Sprachausgabe wird auf diesem Gerät nicht unterstützt.');
    return;
  }
  const cfg = (typeof EinstellungenDB !== 'undefined') ? EinstellungenDB.get() : { lang: 'de-DE', rate: 0.9, pitch: 1, volume: 1, voiceName: '' };
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = cfg.lang || 'de-DE';
  utter.rate = cfg.rate || 0.9;
  utter.pitch = cfg.pitch || 1;
  utter.volume = cfg.volume != null ? cfg.volume : 1;

  if (cfg.voiceName) {
    const stimme = window.speechSynthesis.getVoices().find(v => v.name === cfg.voiceName);
    if (stimme) utter.voice = stimme;
  }

  if (typeof starteEqualizerAnimation === 'function') starteEqualizerAnimation();
  utter.onend = () => {
    if (typeof stoppeEqualizerAnimation === 'function') stoppeEqualizerAnimation();
    if (onEnde) onEnde();
  };
  window.speechSynthesis.speak(utter);
}

function hoereZu(onErgebnis, onFehler) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onFehler) onFehler('Spracherkennung wird auf diesem Gerät/Browser nicht unterstützt.');
    return;
  }
  const cfg = (typeof EinstellungenDB !== 'undefined') ? EinstellungenDB.get() : { lang: 'de-DE' };
  const recog = new SpeechRecognition();
  recog.lang = cfg.lang || 'de-DE';
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  recog.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onErgebnis(text);
  };
  recog.onerror = (event) => {
    if (onFehler) onFehler('Fehler bei der Spracherkennung: ' + event.error);
  };
  recog.start();
  return recog;
}
