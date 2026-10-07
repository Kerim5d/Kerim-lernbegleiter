/* zeit.js — Zeiterfassung pro Lern-Session */

const Zeit = {
  _start: null,
  _fach: null,
  _modus: null,

  start(fach, modus) {
    this._start = Date.now();
    this._fach = fach;
    this._modus = modus;
  },

  stop() {
    if (!this._start) return;
    const dauerSek = Math.round((Date.now() - this._start) / 1000);
    DB.addSession({
      fach: this._fach,
      modus: this._modus,
      startetAm: new Date(this._start).toISOString(),
      endetAm: new Date().toISOString(),
      dauerSek
    });
    this._start = null;
    return dauerSek;
  },

  heutigeGesamtzeitMin() {
    const heuteStr = new Date().toDateString();
    const sessions = DB.getSessions().filter(s => new Date(s.startetAm).toDateString() === heuteStr);
    const sekunden = sessions.reduce((sum, s) => sum + (s.dauerSek || 0), 0);
    return Math.round(sekunden / 60);
  },

  letzteNTageMin(n) {
    const result = [];
    for (let i = n - 1; i >= 0; i--) {
      const tag = new Date();
      tag.setDate(tag.getDate() - i);
      const tagStr = tag.toDateString();
      const sek = DB.getSessions()
        .filter(s => new Date(s.startetAm).toDateString() === tagStr)
        .reduce((sum, s) => sum + (s.dauerSek || 0), 0);
      result.push({ datum: tag, minuten: Math.round(sek / 60) });
    }
    return result;
  }
};
