/* kalender.js — Proben/Exen-Termine mit Erinnerungsfunktion */

function tageBis(datumStr) {
  const heute = new Date(); heute.setHours(0,0,0,0);
  const ziel = new Date(datumStr); ziel.setHours(0,0,0,0);
  return Math.round((ziel - heute) / (1000 * 60 * 60 * 24));
}

function renderKalender() {
  const liste = document.getElementById('terminListe');
  const termine = DB.getTermine().slice().sort((a,b) => new Date(a.datum) - new Date(b.datum));
  liste.innerHTML = '';

  if (!termine.length) {
    liste.innerHTML = '<p class="hint">Noch keine Proben/Exen eingetragen.</p>';
    return;
  }

  termine.forEach(t => {
    const tage = tageBis(t.datum);
    const item = document.createElement('div');
    item.className = 'blatt-item';
    let dringlichkeit = '';
    if (tage < 0) dringlichkeit = '✅ vorbei';
    else if (tage === 0) dringlichkeit = '🔴 HEUTE!';
    else if (tage <= 2) dringlichkeit = `🟠 in ${tage} Tag(en)`;
    else dringlichkeit = `🟢 in ${tage} Tagen`;

    item.innerHTML = `<span><b>${t.fach}</b> — ${t.thema || 'Probe'} am ${new Date(t.datum).toLocaleDateString('de-DE')}<br><span class="hint">${dringlichkeit}</span></span>`;
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'primary-btn';
    delBtn.onclick = () => { DB.deleteTermin(t.id); renderKalender(); };
    item.appendChild(delBtn);
    liste.appendChild(item);
  });
}

function initKalenderView() {
  const fachSelect = document.getElementById('terminFachSelect');
  fuelleFachSelect(fachSelect);
  renderKalender();
  pruefeFaelligeErinnerungen();

  document.getElementById('terminAddBtn').onclick = () => {
    const datum = document.getElementById('terminDatum').value;
    const thema = document.getElementById('terminThema').value.trim();
    if (!datum) { alert('Bitte ein Datum wählen.'); return; }
    DB.addTermin({ fach: fachSelect.value, datum, thema });
    document.getElementById('terminThema').value = '';
    renderKalender();
  };
}

// Erinnerung: Browser-Benachrichtigung, wenn eine Probe in <= 2 Tagen bevorsteht
function pruefeFaelligeErinnerungen() {
  if (!('Notification' in window)) return;
  const faellige = DB.getTermine().filter(t => {
    const tage = tageBis(t.datum);
    return tage >= 0 && tage <= 2;
  });
  if (!faellige.length) return;

  if (Notification.permission === 'granted') {
    faellige.forEach(t => {
      new Notification('📅 Probe steht an!', {
        body: `${t.fach}: ${t.thema || 'Probe'} am ${new Date(t.datum).toLocaleDateString('de-DE')}`
      });
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') pruefeFaelligeErinnerungen();
    });
  }
}
