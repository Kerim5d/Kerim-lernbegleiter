/* druck.js — Druckbare Zusammenfassung der Probenergebnisse erzeugen */

function erzeugeDruckAnsichtProbe(fach, richtig, gesamt, note, einzelErgebnisse) {
  const prozent = Math.round((richtig / gesamt) * 100);
  const container = document.getElementById('druckBereich');
  const heute = new Date().toLocaleDateString('de-DE');

  let zeilenHtml = '';
  einzelErgebnisse.forEach((e, i) => {
    zeilenHtml += `<tr><td>${i + 1}</td><td>${e.text}</td><td>${e.richtig ? '✅ richtig' : '❌ falsch'}</td></tr>`;
  });

  container.innerHTML = `
    <div class="print-only" style="padding:20px;">
      <h1>Übungsprobe — ${fach}</h1>
      <p>Name: Kerim &nbsp;&nbsp;|&nbsp;&nbsp; Datum: ${heute}</p>
      <p>Ergebnis: ${richtig} von ${gesamt} richtig (${prozent}%) &nbsp;&nbsp;|&nbsp;&nbsp; <b>Note: ${note}</b></p>
      <table border="1" cellpadding="6" style="width:100%; border-collapse:collapse; margin-top:14px;">
        <thead><tr><th>#</th><th>Aufgabe</th><th>Ergebnis</th></tr></thead>
        <tbody>${zeilenHtml}</tbody>
      </table>
    </div>
  `;
  window.print();
}
