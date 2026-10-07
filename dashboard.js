/* dashboard.js — Eltern-Dashboard: Zeitverlauf-Chart, Verlaufsliste, Telegram-Bericht */

function zeichneZeitChart() {
  const canvas = document.getElementById('zeitChart');
  const ctx = canvas.getContext('2d');
  const daten = Zeit.letzteNTageMin(7);
  const maxMin = Math.max(...daten.map(d => d.minuten), 10);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / daten.length;

  daten.forEach((d, i) => {
    const barHeight = (d.minuten / maxMin) * (canvas.height - 30);
    const x = i * barWidth + 6;
    const y = canvas.height - barHeight - 20;
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(x, y, barWidth - 12, barHeight);
    ctx.fillStyle = '#cfd8ec';
    ctx.font = '10px sans-serif';
    ctx.fillText(d.datum.toLocaleDateString('de-DE', { weekday: 'short' }), x, canvas.height - 6);
    ctx.fillText(d.minuten + 'm', x, y - 4);
  });
}

function renderVerlauf() {
  const container = document.getElementById('verlaufListe');
  const sessions = DB.getSessions().slice(-20).reverse();
  container.innerHTML = '';
  if (!sessions.length) {
    container.innerHTML = '<p class="hint">Noch keine Lern-Sessions aufgezeichnet.</p>';
    return;
  }
  sessions.forEach(s => {
    const item = document.createElement('div');
    item.className = 'verlauf-item';
    const datum = new Date(s.startetAm).toLocaleString('de-DE');
    item.innerHTML = `<span>${datum} — ${s.fach} (${s.modus})</span><span>${Math.round(s.dauerSek / 60)} Min</span>`;
    container.appendChild(item);
  });
}

function erzeugeTagesbericht() {
  const heuteStr = new Date().toDateString();
  const sessionsHeute = DB.getSessions().filter(s => new Date(s.startetAm).toDateString() === heuteStr);
  const ergebnisseHeute = DB.getErgebnisse().filter(e => new Date(e.datum).toDateString() === heuteStr);

  const minutenGesamt = Math.round(sessionsHeute.reduce((sum, s) => sum + s.dauerSek, 0) / 60);
  const richtigeAnz = ergebnisseHeute.filter(e => e.richtig).length;
  const falscheAnz = ergebnisseHeute.filter(e => !e.richtig).length;

  const faecherHeute = [...new Set(sessionsHeute.map(s => s.fach))];
  const schwaechen = berechneStaerkenSchwaechen().filter(s => s.quote < 0.7).slice(0, 3);

  let text = `📚 Lernbericht für Kerim (${new Date().toLocaleDateString('de-DE')})\n\n`;
  text += `⏱️ Lernzeit heute: ${minutenGesamt} Minuten\n`;
  text += faecherHeute.length ? `📘 Fächer: ${faecherHeute.join(', ')}\n` : `📘 Keine Fächer heute geübt\n`;
  text += `✅ Richtig: ${richtigeAnz}  ❌ Falsch: ${falscheAnz}\n`;
  if (schwaechen.length) {
    text += `\n🔴 Woran noch geübt werden sollte:\n`;
    schwaechen.forEach(s => { text += `- ${s.fach}: ${s.thema} (${Math.round(s.quote * 100)}%)\n`; });
  }
  return text;
}

async function sendeTelegramBericht() {
  const cfg = DB.getTelegramConfig();
  const statusEl = document.getElementById('reportStatus');
  if (!cfg.token || !cfg.chatId) {
    statusEl.textContent = 'Bitte zuerst Telegram Bot-Token und Chat-ID eintragen und speichern.';
    return;
  }
  const text = erzeugeTagesbericht();
  statusEl.textContent = 'Sende Bericht...';
  try {
    const url = `https://api.telegram.org/bot${cfg.token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.chatId, text })
    });
    if (res.ok) {
      statusEl.textContent = 'Bericht erfolgreich gesendet! ✅';
    } else {
      const err = await res.text();
      statusEl.textContent = 'Fehler beim Senden: ' + err;
    }
  } catch (e) {
    statusEl.textContent = 'Fehler: ' + e.message + ' (Internetverbindung prüfen)';
  }
}

function initDashboardView() {
  zeichneZeitChart();
  renderStaerkenSchwaechen();
  renderVerlauf();

  const cfg = DB.getTelegramConfig();
  document.getElementById('telegramToken').value = cfg.token || '';
  document.getElementById('telegramChatId').value = cfg.chatId || '';

  document.getElementById('saveTelegramBtn').onclick = () => {
    DB.saveTelegramConfig({
      token: document.getElementById('telegramToken').value.trim(),
      chatId: document.getElementById('telegramChatId').value.trim()
    });
    document.getElementById('reportStatus').textContent = 'Einstellungen gespeichert.';
  };

  document.getElementById('sendReportBtn').onclick = sendeTelegramBericht;
}
