/* gemini.js — Anbindung an die Google Gemini API für ein echtes freies KI-Gespräch.
   Der API-Key wird NUR lokal auf dem Gerät gespeichert (localStorage), niemals
   im Quellcode oder auf GitHub sichtbar gemacht. */

const GeminiDB = {
  getKey() {
    return DB._get('geminiApiKey', '');
  },
  saveKey(key) {
    DB._set('geminiApiKey', key);
  }
};

async function frageGemini(nachricht, verlauf = []) {
  const key = GeminiDB.getKey();
  if (!key) {
    return { fehler: true, text: 'Es ist noch kein Gemini-API-Key eingetragen. Bitte in den Einstellungen hinzufügen.' };
  }

  const systemHinweis = {
    role: 'user',
    parts: [{ text: 'Du bist ein freundlicher, geduldiger Lernbegleiter für Kerim, einen Jungen in der 5. Klasse am Gymnasium in Bayern. Antworte einfach, kindgerecht, ermutigend und auf Deutsch. Halte Antworten kurz (max. 3-4 Sätze), außer er bittet um mehr Details.' }]
  };

  const contents = [systemHinweis];
  verlauf.slice(-8).forEach(m => {
    contents.push({ role: m.von === 'kerim' ? 'user' : 'model', parts: [{ text: m.text }] });
  });
  contents.push({ role: 'user', parts: [{ text: nachricht }] });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    if (!res.ok) {
      const errText = await res.text();
      return { fehler: true, text: 'Fehler bei der KI-Antwort: ' + errText.slice(0, 200) };
    }
    const data = await res.json();
    const antwort = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!antwort) return { fehler: true, text: 'Die KI hat keine Antwort geschickt. Versuch es nochmal.' };
    return { fehler: false, text: antwort.trim() };
  } catch (e) {
    return { fehler: true, text: 'Verbindung zur KI fehlgeschlagen: ' + e.message + ' (Internet prüfen)' };
  }
}
