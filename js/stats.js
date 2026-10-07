/* stats.js — Fehleranalyse: Stärken & Schwächen pro Thema/Fach berechnen */

function berechneStaerkenSchwaechen() {
  const ergebnisse = DB.getErgebnisse();
  const gruppen = {}; // key: fach + '|' + thema

  ergebnisse.forEach(e => {
    const key = e.fach + '|' + e.thema;
    if (!gruppen[key]) gruppen[key] = { fach: e.fach, thema: e.thema, richtig: 0, falsch: 0 };
    if (e.richtig) gruppen[key].richtig++;
    else gruppen[key].falsch++;
  });

  const liste = Object.values(gruppen).map(g => {
    const gesamt = g.richtig + g.falsch;
    const quote = gesamt ? g.richtig / gesamt : 0;
    return { ...g, gesamt, quote };
  });

  liste.sort((a, b) => a.quote - b.quote);
  return liste;
}

function renderStaerkenSchwaechen() {
  const container = document.getElementById('staerkenSchwaechen');
  const liste = berechneStaerkenSchwaechen();

  if (!liste.length) {
    container.innerHTML = '<p class="hint">Noch keine Übungsergebnisse vorhanden.</p>';
    return;
  }

  const schwaechen = liste.filter(l => l.quote < 0.7).slice(0, 5);
  const staerken = liste.filter(l => l.quote >= 0.85).slice(0, 5);

  let html = '';
  if (schwaechen.length) {
    html += '<p><b>🔴 Noch üben:</b></p><ul>';
    schwaechen.forEach(s => {
      html += `<li>${s.fach} — ${s.thema} (${Math.round(s.quote * 100)}% richtig, ${s.gesamt} Versuche)</li>`;
    });
    html += '</ul>';
  }
  if (staerken.length) {
    html += '<p><b>🟢 Stark darin:</b></p><ul>';
    staerken.forEach(s => {
      html += `<li>${s.fach} — ${s.thema} (${Math.round(s.quote * 100)}% richtig, ${s.gesamt} Versuche)</li>`;
    });
    html += '</ul>';
  }
  if (!schwaechen.length && !staerken.length) {
    html = '<p class="hint">Noch nicht genug Daten für eine klare Einschätzung.</p>';
  }
  container.innerHTML = html;
}
