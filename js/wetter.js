/* wetter.js — Wetteranzeige auf der Startseite via Open-Meteo (kostenlos, kein Account nötig) */

const WETTER_ORT_DEFAULT = { name: 'München', lat: 48.1374, lon: 11.5755 }; // Bayern-Standard

function wetterIconFuerCode(code) {
  if (code === 0) return '☀️';
  if ([1, 2, 3].includes(code)) return '🌤️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
  if ([71, 73, 75, 77].includes(code)) return '❄️';
  if ([80, 81, 82].includes(code)) return '🌧️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}

async function ladeWetter() {
  const el = document.getElementById('wetterAnzeige');
  if (!el) return;
  const ort = DB._get('wetterOrt', WETTER_ORT_DEFAULT);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ort.lat}&longitude=${ort.lon}&current=temperature_2m,weather_code&timezone=Europe%2FBerlin`;
    const res = await fetch(url);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    el.textContent = `${wetterIconFuerCode(code)} ${ort.name}: ${temp}°C`;
  } catch (e) {
    el.textContent = '🌡️ Wetter nicht verfügbar';
  }
}
