/* stundenplan.js — Fächer pro Wochentag verwalten */

const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function heutigerWochentag() {
  const idx = new Date().getDay(); // 0=Sonntag
  return WOCHENTAGE[(idx + 6) % 7];
}

function renderStundenplan() {
  const grid = document.getElementById('stundenplanGrid');
  const plan = DB.getStundenplan();
  const faecher = DB.getFaecher();
  grid.innerHTML = '';

  WOCHENTAGE.forEach(tag => {
    const label = document.createElement('div');
    label.className = 'tag-label';
    label.textContent = tag;

    const inputWrap = document.createElement('div');
    inputWrap.className = 'faecher-input';
    const aktiveFaecher = plan[tag] || [];

    faecher.forEach(fach => {
      const chip = document.createElement('div');
      chip.className = 'fach-chip' + (aktiveFaecher.includes(fach) ? ' selected' : '');
      chip.textContent = fach;
      chip.dataset.tag = tag;
      chip.dataset.fach = fach;
      chip.addEventListener('click', () => chip.classList.toggle('selected'));
      inputWrap.appendChild(chip);
    });

    grid.appendChild(label);
    grid.appendChild(inputWrap);
  });
}

function speicherStundenplan() {
  const plan = {};
  WOCHENTAGE.forEach(tag => { plan[tag] = []; });
  document.querySelectorAll('#stundenplanGrid .fach-chip.selected').forEach(chip => {
    plan[chip.dataset.tag].push(chip.dataset.fach);
  });
  DB.saveStundenplan(plan);
  renderHeuteFaecher();
  alert('Stundenplan gespeichert!');
}

function renderHeuteFaecher() {
  const plan = DB.getStundenplan();
  const heute = heutigerWochentag();
  const faecher = plan[heute] || [];
  const el = document.getElementById('todayFaecher');
  el.textContent = faecher.length ? `Heute (${heute}): ${faecher.join(', ')}` : `Heute (${heute}): kein Fach eingetragen`;
}
