/* sprache.js — Sprachausgabe (TTS) und Spracherkennung (STT) auf Deutsch.
   TTS läuft meist direkt auf dem Gerät. STT nutzt in Chrome einen
   Online-Dienst von Google — dafür ist eine Internetverbindung nötig. */

function sprich(text, onEnde) {
  if (!('speechSynthesis' in window)) {
    alert('Sprachausgabe wird auf diesem Gerät nicht unterstützt.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'de-DE';
  utter.rate = 0.9;
  if (onEnde) utter.onend = onEnde;
  window.speechSynthesis.speak(utter);
}

function hoereZu(onErgebnis, onFehler) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onFehler) onFehler('Spracherkennung wird auf diesem Gerät/Browser nicht unterstützt.');
    return;
  }
  const recog = new SpeechRecognition();
  recog.lang = 'de-DE';
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
