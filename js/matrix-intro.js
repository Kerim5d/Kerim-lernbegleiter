/* matrix-intro.js — Matrix-Code-Regen beim App-Start, der sich zu "HALLO KERIM" formt,
   dann sanft zum normalen Hauptmenü überblendet. Reine Canvas-Animation, keine Bibliothek. */

function starteMatrixIntro(onFertig) {
  const overlay = document.createElement('div');
  overlay.id = 'matrixIntroOverlay';
  overlay.innerHTML = '<canvas id="matrixCanvas"></canvas>';
  document.body.appendChild(overlay);

  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const zeichen = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&アイウエオカキク'.split('');
  const schriftGroesse = 18;
  const spalten = Math.floor(w / schriftGroesse);
  const tropfen = new Array(spalten).fill(0).map(() => Math.random() * -h / schriftGroesse);

  const ziel = 'HALLO KERIM';
  let phase = 'regen'; // 'regen' -> 'formation' -> 'halten' -> 'ausblenden'
  let frame = 0;
  const regenDauer = 110;      // Frames reiner Regen (~1.8s bei 60fps)
  const formationDauer = 150;  // Frames für die Buchstaben-Formation (~2.5s)
  const haltenDauer = 90;      // Frames: fertiger Schriftzug bleibt stehen (~1.5s)
  const ausblendDauer = 50;    // Frames für das Ausblenden (~0.8s)

  // Zielpositionen der Buchstaben von "HALLO KERIM" in der Bildschirmmitte berechnen
  function berechneZielPositionen() {
    const grossSchrift = 64;
    ctx.font = `bold ${grossSchrift}px 'Orbitron', sans-serif`;
    const gesamtBreite = ctx.measureText(ziel).width;
    let startX = (w - gesamtBreite) / 2;
    const y = h / 2;
    const positionen = [];
    for (const buchstabe of ziel) {
      const breite = ctx.measureText(buchstabe).width;
      positionen.push({ buchstabe, x: startX + breite / 2, y });
      startX += breite;
    }
    return positionen;
  }
  const zielPositionen = berechneZielPositionen();

  function zeichneRegen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = schriftGroesse + 'px monospace';
    for (let i = 0; i < tropfen.length; i++) {
      const text = zeichen[Math.floor(Math.random() * zeichen.length)];
      const x = i * schriftGroesse;
      const y = tropfen[i] * schriftGroesse;
      ctx.fillStyle = '#2bff6b';
      ctx.fillText(text, x, y);
      if (y > h && Math.random() > 0.975) tropfen[i] = 0;
      tropfen[i]++;
    }
  }

  function zeichneFormation(fortschritt) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = schriftGroesse + 'px monospace';
    for (let i = 0; i < tropfen.length; i++) {
      const text = zeichen[Math.floor(Math.random() * zeichen.length)];
      const x = i * schriftGroesse;
      const y = tropfen[i] * schriftGroesse;
      ctx.fillStyle = 'rgba(43,255,107,0.4)';
      ctx.fillText(text, x, y);
      if (y > h && Math.random() > 0.95) tropfen[i] = 0;
      tropfen[i] += 0.5;
    }

    ctx.font = `bold 64px 'Orbitron', sans-serif`;
    ctx.textBaseline = 'middle';
    zielPositionen.forEach((p, idx) => {
      const verzoegerung = idx * 3;
      const lokalerFortschritt = Math.max(0, Math.min(1, (fortschritt * zielPositionen.length - verzoegerung) / 20));
      if (lokalerFortschritt <= 0) return;
      const startY = -50 - idx * 15;
      const aktuelleY = startY + (p.y - startY) * lokalerFortschritt;
      ctx.globalAlpha = lokalerFortschritt;
      ctx.fillStyle = '#2bff6b';
      ctx.shadowColor = '#2bff6b';
      ctx.shadowBlur = 20;
      ctx.fillText(p.buchstabe, p.x, aktuelleY);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
  }

  function tick() {
    frame++;
    if (phase === 'regen') {
      zeichneRegen();
      if (frame > regenDauer) { phase = 'formation'; frame = 0; }
    } else if (phase === 'formation') {
      zeichneFormation(frame / formationDauer);
      if (frame > formationDauer) { phase = 'halten'; frame = 0; }
    } else if (phase === 'halten') {
      zeichneFormation(1);
      if (frame > haltenDauer) { phase = 'ausblenden'; frame = 0; }
    } else if (phase === 'ausblenden') {
      overlay.style.opacity = Math.max(0, 1 - frame / ausblendDauer);
      if (frame > ausblendDauer) {
        overlay.remove();
        if (onFertig) onFertig();
        return;
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}
