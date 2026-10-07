/* noten.js — Notenregister: echte Schulnoten pro Fach eintragen & Durchschnitt sehen */

function berechneDurchschnitt(fach) {
  const noten = DB.getNoten().filter(n => n.fach === fach).map(n => n.note);
  if (!noten.length) return null;
  const summe = noten.reduce((a,b) => a+b, 0);
  return (summe / noten.length).toFixed(2);
}

function prozentZuNote(prozent) {
  const schluessel = DB.getNotenschluessel();
  for (const stufe of schluessel) {
    if (prozent >= stufe.von) return stufe.note;
  }
  return 6;
}

function renderNoten() {
  const container = document.getElementById('notenListe');
  const faecher = DB.getFaecher();
  container.innerHTML = '';

  faecher.forEach(fach => {
    const noten = DB.getNoten().filter(n => n.fach === fach).sort((a,b) => new Date(b.datum) - new Date(a.datum));
    const schnitt = berechneDurchschnitt(fach);
    const box = document.createElement('div');
    box.className = 'dash-card';
    let html = `<h3>${fach} ${schnitt ? '— Ø ' + schnitt : ''}</h3>`;
    if (!noten.length) {
      html += '<p class="hint">Noch keine Noten eingetragen.</p>';
    } else {
      html += '<div class="verlauf-liste">';
      noten.forEach(n => {
        html += `<div class="verlauf-item"><span>${n.bezeichnung || 'Probe'} — ${new Date(n.datum).toLocaleDateString('de-DE')}</span><span><b>${n.note}</b></span></div>`;
      });
      html += '</div>';
    }
    box.innerHTML = html;
    container.appendChild(box);
  });
}

function initNotenView() {
  const fachSelect = document.getElementById('noteFachSelect');
  fuelleFachSelect(fachSelect);
  renderNoten();

  document.getElementById('noteAddBtn').onclick = () => {
    const note = parseInt(document.getElementById('noteWert').value, 10);
    const bezeichnung = document.getElementById('noteBezeichnung').value.trim();
    if (!note || note < 1 || note > 6) { alert('Bitte eine Note zwischen 1 und 6 eingeben.'); return; }
    DB.addNote({ fach: fachSelect.value, note, bezeichnung });
    document.getElementById('noteWert').value = '';
    document.getElementById('noteBezeichnung').value = '';
    renderNoten();
  };
}
