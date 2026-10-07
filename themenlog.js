/* themenlog.js — "Was habt ihr heute im Unterricht gemacht?" — Themen pro Fach protokollieren */

function renderThemenLog() {
  const container = document.getElementById('themenListe');
  const eintraege = DB.getThemenLog().slice(-15).reverse();
  container.innerHTML = '';
  if (!eintraege.length) {
    container.innerHTML = '<p class="hint">Noch keine Einträge.</p>';
    return;
  }
  eintraege.forEach(e => {
    const item = document.createElement('div');
    item.className = 'blatt-item';
    item.innerHTML = `<span><b>${e.fach}</b> — ${new Date(e.datum).toLocaleDateString('de-DE')}<br><span class="hint">${e.text}</span></span>`;
    container.appendChild(item);
  });
}

function initThemenLogView() {
  const fachSelect = document.getElementById('themaFachSelect');
  fuelleFachSelect(fachSelect);
  renderThemenLog();

  document.getElementById('themaAddBtn').onclick = () => {
    const text = document.getElementById('themaText').value.trim();
    if (!text) { alert('Bitte kurz eintragen, was ihr gemacht habt.'); return; }
    DB.addThemenEintrag({ fach: fachSelect.value, text });
    document.getElementById('themaText').value = '';
    renderThemenLog();
  };
}
