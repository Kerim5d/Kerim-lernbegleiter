/* db.js — einfache lokale Datenschicht auf Basis von localStorage.
   Alles bleibt auf dem Tablet. Nichts wird automatisch irgendwohin gesendet. */

const DB = {
  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('DB read error', key, e);
      return fallback;
    }
  },
  _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // ---- Stundenplan: { Montag: ['Deutsch','Mathe'], ... } ----
  getStundenplan() {
    return this._get('stundenplan', {});
  },
  saveStundenplan(plan) {
    this._set('stundenplan', plan);
  },

  // ---- Fächer-Liste (editierbar, Default für Gymnasium 5. Klasse Bayern) ----
  getFaecher() {
    return this._get('faecher', ['Deutsch', 'Mathe', 'Englisch', 'Natur und Technik', 'Geschichte', 'Religion/Ethik']);
  },
  saveFaecher(list) {
    this._set('faecher', list);
  },

  // ---- Arbeitsblätter: [{id, fach, text, bildDataUrl, erstelltAm}] ----
  getBlaetter() {
    return this._get('blaetter', []);
  },
  addBlatt(blatt) {
    const list = this.getBlaetter();
    blatt.id = 'b_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    blatt.erstelltAm = new Date().toISOString();
    list.unshift(blatt);
    this._set('blaetter', list);
    return blatt;
  },
  getBlattById(id) {
    return this.getBlaetter().find(b => b.id === id);
  },

  // ---- Lern-Sessions / Zeiterfassung: [{id, fach, modus, startet, endetAm, dauerSek}] ----
  getSessions() {
    return this._get('sessions', []);
  },
  addSession(session) {
    const list = this.getSessions();
    session.id = 's_' + Date.now();
    list.push(session);
    this._set('sessions', list);
    return session;
  },

  // ---- Ergebnisse (für Fehleranalyse): [{id, datum, fach, thema, blattId, richtig, text}] ----
  getErgebnisse() {
    return this._get('ergebnisse', []);
  },
  addErgebnis(ergebnis) {
    const list = this.getErgebnisse();
    ergebnis.id = 'e_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    ergebnis.datum = new Date().toISOString();
    list.push(ergebnis);
    this._set('ergebnisse', list);
    return ergebnis;
  },

  // ---- Telegram-Einstellungen ----
  getTelegramConfig() {
    return this._get('telegramConfig', { token: '', chatId: '' });
  },
  saveTelegramConfig(cfg) {
    this._set('telegramConfig', cfg);
  }
};

/* ===== Erweiterungen: Kalender, Noten, Themen-Log, Freund-Gedächtnis ===== */

Object.assign(DB, {
  // ---- Termine (Proben/Exen): [{id, fach, datum, thema, erinnertTage}] ----
  getTermine() { return this._get('termine', []); },
  addTermin(termin) {
    const list = this.getTermine();
    termin.id = 't_' + Date.now();
    list.push(termin);
    this._set('termine', list);
    return termin;
  },
  deleteTermin(id) {
    this._set('termine', this.getTermine().filter(t => t.id !== id));
  },

  // ---- Notenregister: [{id, fach, note, bezeichnung, datum}] ----
  getNoten() { return this._get('noten', []); },
  addNote(note) {
    const list = this.getNoten();
    note.id = 'n_' + Date.now();
    note.datum = note.datum || new Date().toISOString();
    list.push(note);
    this._set('noten', list);
    return note;
  },
  deleteNote(id) {
    this._set('noten', this.getNoten().filter(n => n.id !== id));
  },

  // ---- Notenschlüssel (Prozent -> Note), bayerischer Standard als Default ----
  getNotenschluessel() {
    return this._get('notenschluessel', [
      { bis: 100, von: 92, note: 1 },
      { bis: 91, von: 81, note: 2 },
      { bis: 80, von: 67, note: 3 },
      { bis: 66, von: 50, note: 4 },
      { bis: 49, von: 30, note: 5 },
      { bis: 29, von: 0, note: 6 }
    ]);
  },
  saveNotenschluessel(liste) { this._set('notenschluessel', liste); },

  // ---- Themen-Log: was wurde im Unterricht behandelt: [{id, fach, datum, text}] ----
  getThemenLog() { return this._get('themenLog', []); },
  addThemenEintrag(eintrag) {
    const list = this.getThemenLog();
    eintrag.id = 'th_' + Date.now();
    eintrag.datum = new Date().toISOString();
    list.push(eintrag);
    this._set('themenLog', list);
    return eintrag;
  },

  // ---- Freund-Gedächtnis: letzte Sitzung + Chatverlauf ----
  getLetzteSitzung() { return this._get('letzteSitzung', null); },
  saveLetzteSitzung(zusammenfassung) {
    this._set('letzteSitzung', { text: zusammenfassung, datum: new Date().toISOString() });
  },
  getFreundChat() { return this._get('freundChat', []); },
  addFreundNachricht(von, text) {
    const list = this.getFreundChat();
    list.push({ von, text, zeit: new Date().toISOString() });
    if (list.length > 200) list.shift();
    this._set('freundChat', list);
  }
});
