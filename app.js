/* app.js — Hauptsteuerung: Navigation zwischen Views, Start-Setup */

function zeigeView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelector(`.tab[data-view="${name}"]`).classList.add('active');

  if (name === 'stundenplan') renderStundenplan();
  if (name === 'arbeitsblaetter') initArbeitsblaetterView();
  if (name === 'diktat') initDiktatView();
  if (name === 'abfrage') initAbfrageView();
  if (name === 'dashboard') initDashboardView();
  if (name === 'freund') initFreundView();
  if (name === 'themenlog') initThemenLogView();
  if (name === 'probe') initProbeView();
  if (name === 'kalender') initKalenderView();
  if (name === 'noten') initNotenView();
  if (name === 'start') aktualisiereStart();

  // Kamera stoppen, wenn man den Bereich verlässt (Akku/Datenschutz)
  if (name !== 'arbeitsblaetter' && name !== 'diktat') {
    stoppeKamera();
  }
}

function aktualisiereStart() {
  document.getElementById('todayTimeTotal').textContent = Zeit.heutigeGesamtzeitMin() + ' Min';
  renderHeuteFaecher();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => zeigeView(tab.dataset.view));
  });

  document.getElementById('savePlanBtn').onclick = speicherStundenplan;

  document.getElementById('startDiktatBtn').onclick = () => zeigeView('diktat');
  document.getElementById('startAbfrageBtn').onclick = () => zeigeView('abfrage');
  document.getElementById('startFotoBtn').onclick = () => zeigeView('arbeitsblaetter');
  document.getElementById('startFreundBtn').onclick = () => zeigeView('freund');
  document.getElementById('startProbeBtn').onclick = () => zeigeView('probe');

  aktualisiereStart();

  // Service Worker für Offline-Fähigkeit registrieren (falls Datei vorhanden)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
