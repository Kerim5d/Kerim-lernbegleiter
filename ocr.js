/* ocr.js — Texterkennung aus Fotos mittels Tesseract.js (Deutsch).
   Hinweis: Beim ersten Einsatz lädt der Browser die Erkennungs-Daten aus dem
   Internet herunter (einmalig, danach meist zwischengespeichert). */

let _tesseractReady = null;

function ladeTesseract() {
  if (_tesseractReady) return _tesseractReady;
  _tesseractReady = new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Tesseract konnte nicht geladen werden (Internet nötig beim ersten Mal).'));
    document.head.appendChild(script);
  });
  return _tesseractReady;
}

async function erkenneText(imageDataUrl, onProgress) {
  await ladeTesseract();
  const result = await window.Tesseract.recognize(imageDataUrl, 'deu', {
    logger: m => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });
  return result.data.text.trim();
}
