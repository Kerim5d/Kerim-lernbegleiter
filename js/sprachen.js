/* sprachen.js — Mehrsprachigkeit: Kerim kann in mehreren Sprachen vorlesen/antworten lassen */

const VERFUEGBARE_SPRACHEN = [
  { code: 'de-DE', label: '🇩🇪 Deutsch' },
  { code: 'en-US', label: '🇬🇧 Englisch' },
  { code: 'tr-TR', label: '🇹🇷 Türkisch' },
  { code: 'fr-FR', label: '🇫🇷 Französisch' },
  { code: 'es-ES', label: '🇪🇸 Spanisch' }
];

function fuelleSprachenSelect(selectEl) {
  selectEl.innerHTML = '';
  VERFUEGBARE_SPRACHEN.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.code;
    opt.textContent = s.label;
    selectEl.appendChild(opt);
  });
}
