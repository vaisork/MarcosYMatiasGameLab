import { MISSIONS, isUnlocked, loadProgress } from '../content/campaign.mjs';

const storage = { getItem: (...args) => localStorage.getItem(...args) };
function render() {
  const progress = loadProgress(storage);
  const trail = document.querySelector('#mission-trail');
  const done = Object.keys(progress).length, stars = Object.values(progress).reduce((a, n) => a + n, 0);
  document.querySelector('#campaign-summary').textContent = `${done} de ${MISSIONS.length} capítulos superados · ${stars} estrellas`;
  trail.replaceChildren(...MISSIONS.map((mission, index) => {
    const item = document.createElement('li');
    const state = isUnlocked(mission, progress);
    const title = document.createElement('strong');
    title.textContent = mission.title;
    const status = document.createElement('span');
    status.textContent = state ? (progress[mission.id] ? `${progress[mission.id]} de 3 estrellas · Volver a jugar` : 'Lista para jugar') : (mission.ready ? 'Completa la misión anterior' : 'En preparación');
    const number = document.createElement('span');
    number.className = 'mission-number'; number.textContent = mission.number;
    const content = document.createElement(state ? 'a' : 'div');
    if (state) content.href = `./?mision=${mission.id}`;
    content.className = 'mission-stop'; content.classList.toggle('mission-open', state);
    const copy = document.createElement('span'); copy.className = 'mission-copy'; copy.append(title, status);
    content.append(number, copy);
    if (index % 4 === 0) {
      const clan = document.createElement('h2');
      clan.textContent = ['Guardianes del Dosel', 'Forja Errante', 'Marea Clara'][index / 4];
      item.append(clan);
    }
    item.append(content);
    return item;
  }));
}
addEventListener('pageshow', render);
