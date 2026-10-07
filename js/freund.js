/* freund.js — "Bester Freund"-Begleiter: Begrüßung, erinnert sich an letzte Sitzung,
   fragt nach Unterrichtsstoff, bietet Musikpause an, erinnert ans Trinken.
   Hinweis: Dies ist ein regelbasierter Begleiter (fest geskriptete Dialoge),
   kein freies KI-Gespräch — das würde eine angebundene KI-API erfordern. */

function freundBubble(von, text) {
  const chat = document.getElementById('freundChatVerlauf');
  const bubble = document.createElement('div');
  bubble.className = 'blatt-item';
  bubble.style.alignSelf = von === 'freund' ? 'flex-start' : 'flex-end';
  bubble.innerHTML = `<span><b>${von === 'freund' ? '🤖 Lernfreund' : 'Du'}:</b> ${text}</span>`;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
  DB.addFreundNachricht(von, text);
}

const ENTSPANN_TRACKS = [
  { name: 'Ruhiges Klavier', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8a7a73b8b.mp3' },
  { name: 'Entspannte Natur-Klänge', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_9e3c2e4f4f.mp3' }
];

function starteFreundGespraech() {
  const chat = document.getElementById('freundChatVerlauf');
  chat.innerHTML = '';

  const letzte = DB.getLetzteSitzung();
  const stunde = new Date().getHours();
  const gruss = stunde < 11 ? 'Guten Morgen' : stunde < 18 ? 'Hallo' : 'Guten Abend';

  freundBubble('freund', `${gruss}, Kerim! 😊 Schön, dass du da bist.`);

  if (letzte) {
    const tageSeit = Math.round((Date.now() - new Date(letzte.datum)) / (1000*60*60*24));
    const wannText = tageSeit === 0 ? 'heute schon mal' : tageSeit === 1 ? 'gestern' : `vor ${tageSeit} Tagen`;
    setTimeout(() => freundBubble('freund', `Ich erinnere mich noch an unsere letzte Lerneinheit ${wannText}: "${letzte.text}" — weiter so!`), 600);
  }

  setTimeout(() => zeigeFreundFrageThema(), 1400);
}

function zeigeFreundFrageThema() {
  const faecher = DB.getFaecher();
  const plan = DB.getStundenplan();
  const heute = heutigerWochentag();
  const heutigeFaecher = plan[heute] && plan[heute].length ? plan[heute] : faecher;

  freundBubble('freund', `Was habt ihr heute in der Schule gemacht? Erzähl mir kurz, z.B. in ${heutigeFaecher[0] || 'einem Fach'}!`);

  const inputArea = document.getElementById('freundInputArea');
  inputArea.innerHTML = '';

  const fachSelect = document.createElement('select');
  heutigeFaecher.forEach(f => {
    const opt = document.createElement('option'); opt.value = f; opt.textContent = f;
    fachSelect.appendChild(opt);
  });

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'z.B. Bruchrechnen, Kapitel 3 Englisch...';
  textInput.style.flex = '1';

  const sendBtn = document.createElement('button');
  sendBtn.className = 'primary-btn';
  sendBtn.textContent = 'Senden';
  sendBtn.onclick = () => {
    const text = textInput.value.trim();
    if (!text) return;
    freundBubble('kerim', text);
    DB.addThemenEintrag({ fach: fachSelect.value, text });
    DB.saveLetzteSitzung(`${fachSelect.value}: ${text}`);
    textInput.value = '';
    setTimeout(() => freundReaktionAufThema(text), 500);
  };

  inputArea.appendChild(fachSelect);
  inputArea.appendChild(textInput);
  inputArea.appendChild(sendBtn);
}

function freundReaktionAufThema(text) {
  const lower = text.toLowerCase();
  let reaktion = 'Cool, danke dass du mir das erzählst! Das merk ich mir für unser nächstes Üben. 👍';
  if (lower.includes('schwer') || lower.includes('schwierig') || lower.includes('verstehe nicht')) {
    reaktion = 'Hey, das klingt nicht so einfach. Kein Problem — wir können das zusammen üben, bis du es drauf hast! 💪';
  } else if (lower.includes('leicht') || lower.includes('einfach') || lower.includes('gut')) {
    reaktion = 'Super, freut mich zu hören! Dann machen wir das kurz zur Festigung, damit es auch bleibt. 🎉';
  }
  freundBubble('freund', reaktion);
  setTimeout(() => frageNachMusikpause(), 1000);
}

function frageNachMusikpause() {
  freundBubble('freund', 'Möchtest du kurz etwas entspannende Musik hören, bevor wir weitermachen? 🎵');
  const inputArea = document.getElementById('freundInputArea');
  inputArea.innerHTML = '';

  const jaBtn = document.createElement('button');
  jaBtn.className = 'primary-btn';
  jaBtn.textContent = 'Ja, gerne! 🎶';
  jaBtn.onclick = () => { freundBubble('kerim', 'Ja, gerne!'); spieleEntspannMusik(); };

  const neinBtn = document.createElement('button');
  neinBtn.className = 'primary-btn';
  neinBtn.textContent = 'Nein, lieber weiter';
  neinBtn.onclick = () => { freundBubble('kerim', 'Nein, lieber weiter'); erinnereAnsTrinken(); };

  inputArea.appendChild(jaBtn);
  inputArea.appendChild(neinBtn);
}

function spieleEntspannMusik() {
  const track = ENTSPANN_TRACKS[Math.floor(Math.random() * ENTSPANN_TRACKS.length)];
  freundBubble('freund', `Alles klar, hier ist etwas Ruhe für dich: "${track.name}" 🎧`);
  const player = document.getElementById('freundAudioPlayer');
  player.src = track.url;
  player.style.display = 'block';
  player.play().catch(() => {});
  setTimeout(() => erinnereAnsTrinken(), 2000);
}

function erinnereAnsTrinken() {
  freundBubble('freund', 'Übrigens: Denk daran, etwas zu trinken! 💧 Ein Glas Wasser hilft beim Konzentrieren.');
  setTimeout(() => freundAbschluss(), 1200);
}

function freundAbschluss() {
  freundBubble('freund', 'Wollen wir jetzt loslegen? Du kannst oben ein Arbeitsblatt abfotografieren, ein Diktat üben oder eine Übungsprobe machen. Ich bin für dich da! 🤗');
  document.getElementById('freundInputArea').innerHTML = '';
}

function freiesGespraechMoeglich() {
  return typeof GeminiDB !== 'undefined' && GeminiDB.getKey();
}

async function starteFreiesGespraech() {
  const chat = document.getElementById('freundChatVerlauf');
  chat.innerHTML = '';
  freundBubble('freund', 'Hallo Kerim! Jetzt kannst du mit mir ganz frei reden, so wie mit einer echten KI. Frag mich alles, was du willst! 🤖✨');

  const inputArea = document.getElementById('freundInputArea');
  inputArea.innerHTML = '';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'Schreib mir etwas...';
  textInput.style.flex = '1';

  const sprechBtn = document.createElement('button');
  sprechBtn.textContent = '🎙️';
  sprechBtn.title = 'Mit Mikrofon sprechen statt tippen';
  sprechBtn.onclick = () => {
    hoereZu((text) => { textInput.value = text; sendeFreieNachricht(textInput); }, (fehler) => alert(fehler));
  };

  const sendBtn = document.createElement('button');
  sendBtn.className = 'primary-btn';
  sendBtn.textContent = 'Senden';
  sendBtn.onclick = () => sendeFreieNachricht(textInput);
  textInput.onkeydown = (e) => { if (e.key === 'Enter') sendeFreieNachricht(textInput); };

  inputArea.appendChild(textInput);
  inputArea.appendChild(sprechBtn);
  inputArea.appendChild(sendBtn);
}

async function sendeFreieNachricht(textInput) {
  const text = textInput.value.trim();
  if (!text) return;
  freundBubble('kerim', text);
  textInput.value = '';

  const denkBubble = document.createElement('div');
  denkBubble.className = 'blatt-item';
  denkBubble.style.alignSelf = 'flex-start';
  denkBubble.innerHTML = '<span><b>🤖 Lernfreund:</b> <i>denkt nach...</i></span>';
  const chat = document.getElementById('freundChatVerlauf');
  chat.appendChild(denkBubble);
  chat.scrollTop = chat.scrollHeight;

  const verlauf = DB.getFreundChat();
  const antwort = await frageGemini(text, verlauf);
  denkBubble.remove();
  freundBubble('freund', antwort.text);
  if (!antwort.fehler && typeof sprich === 'function') sprich(antwort.text);
}

function initFreundView() {
  const chat = document.getElementById('freundChatVerlauf');
  chat.innerHTML = '';
  chat.style.display = 'flex';
  chat.style.flexDirection = 'column';
  chat.style.gap = '8px';

  // bisherigen Verlauf laden (letzte 10 Nachrichten)
  DB.getFreundChat().slice(-10).forEach(m => {
    const bubble = document.createElement('div');
    bubble.className = 'blatt-item';
    bubble.style.alignSelf = m.von === 'freund' ? 'flex-start' : 'flex-end';
    bubble.innerHTML = `<span><b>${m.von === 'freund' ? '🤖 Lernfreund' : 'Du'}:</b> ${m.text}</span>`;
    chat.appendChild(bubble);
  });

  document.getElementById('freundStartBtn').onclick = starteFreundGespraech;

  const freiBtn = document.getElementById('freundFreiChatBtn');
  if (freiBtn) {
    if (freiesGespraechMoeglich()) {
      freiBtn.style.display = 'inline-block';
      freiBtn.onclick = starteFreiesGespraech;
    } else {
      freiBtn.style.display = 'none';
    }
  }
}
