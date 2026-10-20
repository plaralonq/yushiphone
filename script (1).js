const PASSCODE = '4503';
const screenIds = ['lock-screen', 'passcode-screen', 'home-screen', 'app-screen'];
let code = '';
let deferredInstallPrompt = null;
let touchStartY = 0;
const phone = document.querySelector('#phone');
const passcodeDots = [...document.querySelectorAll('#passcode-dots i')];
const passcodeScreen = document.querySelector('#passcode-screen');
const appContent = document.querySelector('#app-content');
const appTitle = document.querySelector('#app-title');
const photoModal = document.querySelector('#photo-modal');

const photoSources = Array.from({ length: 7 }, (_, index) => `images/photo-0${index + 1}.jpg`);
const photoCaptions = ['a quiet afternoon', 'small moments', 'soft light', 'for the camera roll', 'favorite frame', 'a familiar smile', 'October memories'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function showScreen(id) {
  screenIds.forEach((screenId) => document.querySelector(`#${screenId}`).classList.toggle('active', screenId === id));
  if (id === 'passcode-screen') resetCode();
}

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }).format(now);
  const date = `${days[now.getDay()]}, ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(now)}`;
  ['lock-time', 'lock-time-small', 'passcode-time', 'home-time'].forEach((id) => { const el = document.querySelector(`#${id}`); if (el) el.textContent = time; });
  document.querySelector('#lock-date').textContent = date;
  document.querySelector('#home-date').textContent = date;
  document.querySelector('#cal-day').textContent = now.getDate();
  document.querySelector('.calendar-icon em').textContent = weekdays[now.getDay()];
}

function clickSound() {
  if (localStorage.getItem('yushi-sound') !== 'on') return;
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 525; gain.gain.setValueAtTime(.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .06);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .065);
  } catch (_) { /* audio is optional */ }
}

function resetCode() { code = ''; renderDots(); document.querySelector('#passcode-help').textContent = 'Enter your passcode'; passcodeScreen.classList.remove('passcode-error'); }
function renderDots() { passcodeDots.forEach((dot, index) => dot.classList.toggle('filled', index < code.length)); }
function enterDigit(digit) {
  clickSound();
  if (digit === 'delete') { code = code.slice(0, -1); renderDots(); return; }
  if (code.length >= 4 || !/^[0-9]$/.test(digit)) return;
  code += digit; renderDots();
  if (code.length === 4) window.setTimeout(validateCode, 140);
}
function validateCode() {
  if (code === PASSCODE) { showScreen('home-screen'); return; }
  document.querySelector('#passcode-help').textContent = 'Incorrect passcode';
  passcodeScreen.classList.add('passcode-error');
  window.setTimeout(resetCode, 560);
}

function galleryMarkup() {
  return `<div class="gallery">${photoSources.map((source, index) => `<figure><button type="button" class="photo-thumb" data-photo="${index}" aria-label="Open ${photoCaptions[index]}"><img src="${source}" alt="${photoCaptions[index]}" loading="${index > 1 ? 'lazy' : 'eager'}" /></button><figcaption>${photoCaptions[index]}</figcaption></figure>`).join('')}</div>`;
}

function appMarkup(app) {
  const now = new Date();
  const today = now.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  const rows = ['คาเฟ่ใกล้ฉัน', 'cafe date ideas', 'คาเฟ่ดอกไม้', 'ร้านกาแฟเงียบ ๆ', 'cafe index.html'];
  const dateCells = Array.from({ length: 28 }, (_, i) => `<span class="${i + 1 === today ? 'today' : ''}">${i + 1}</span>`).join('');
  const markup = {
    kakao: {
      title: 'KakaoTalk', content: `<p class="section-eyebrow">1:1 CHAT</p><h1 class="large-title">Riku</h1><section class="card"><div class="chat-person"><div class="chat-avatar"><img src="images/photo-07.jpg" alt="Riku" /></div><div><strong>Riku</strong><span>to Riku · sent from Yushi</span></div></div><div class="bubble outgoing">ริคุ คิดถึงนะ<small>Sent 9:41</small></div><div class="bubble outgoing">วันไหนเราไปคาเฟ่ด้วยกันนะ?</div><div class="chat-footer">Message <b>＋</b></div></section>`
    },
    photos: { title: 'Photos', content: `<p class="section-eyebrow">LIBRARY · 7 PHOTOS</p><h1 class="large-title">All Photos</h1>${galleryMarkup()}` },
    notes: { title: 'Notes', content: `<p class="section-eyebrow">PINNED</p><h1 class="large-title">Notes</h1><section class="note-paper"><h3>plan ไปเที่ยวกับริคุ</h3><p class="note-date">Today · 9:41</p><p>วันเสาร์: ไปคาเฟ่ตอนสาย ถ่ายรูปด้วยกัน แล้วเดินดูร้านหนังสือก่อนพระอาทิตย์ตก</p><h3>ของขวัญวันเกิดที่จะซื้อให้</h3><ul class="checklist"><li>พวงกุญแจน้องหมา</li><li>อัลบั้มรูปเล่มเล็ก</li><li>เค้กสตรอว์เบอร์รี</li><li>การ์ดเขียนด้วยมือ</li></ul></section>` },
    instagram: { title: 'Instagram', content: `<section class="card"><div class="insta-head"><div class="insta-profile"><div class="chat-avatar"><img src="images/photo-01.jpg" alt="Yushi" /></div><div><strong>yushi.archive</strong><span>Seoul, 9:41 PM</span></div></div><b>•••</b></div><img class="insta-photo" src="images/photo-04.jpg" alt="A photo shared by Yushi" /><div class="insta-actions">♡　◌　⌁</div><p class="insta-copy"><b>yushi.archive</b>today felt like a page worth keeping.</p></section>` },
    calendar: { title: 'Calendar', content: `<p class="section-eyebrow">${month} ${now.getFullYear()}</p><h1 class="large-title">Calendar</h1><section class="calendar-feature"><p>Today · ${days[now.getDay()]}</p><h3>café with riku</h3><span>3:30 PM · window seat please</span></section><section class="date-grid"><b>S</b><b>M</b><b>T</b><b>W</b><b>T</b><b>F</b><b>S</b>${dateCells}</section><div class="event-list"><div class="event"><div class="event-time">15:30</div><i></i><div><strong>ไปคาเฟ่กับริคุ</strong><span>new place · two iced drinks</span></div></div><div class="event"><div class="event-time">19:00</div><i style="background:#8e5eff"></i><div><strong>เลือกของขวัญวันเกิด</strong><span>online wishlist</span></div></div></div>` },
    safari: { title: 'Search', content: `<p class="section-eyebrow">PRIVATE HISTORY</p><h1 class="large-title">Search</h1><div class="search-field"><b>⌕</b> Search or enter website name</div><p class="history-label">Recent searches</p>${rows.map((row, index) => `<div class="search-row"><span>${index === 0 ? '☕' : '⌕'}</span><div><strong>${row}</strong><small>${index < 3 ? 'Search · Today' : 'Google · Yesterday'}</small></div><button type="button" aria-label="Search ${row}">↗</button></div>`).join('')}` },
    settings: { title: 'Settings', content: `<p class="section-eyebrow">YUSHI POCKET</p><h1 class="large-title">Settings</h1><section class="settings-group"><h3>Experience</h3><div class="settings-row"><span class="setting-icon purple">⌁</span><span>Click sound</span><button id="sound-toggle" class="toggle ${localStorage.getItem('yushi-sound') === 'on' ? 'on' : ''}" type="button" aria-label="Toggle click sound"></button></div><div class="settings-row"><span class="setting-icon blue">⌗</span><span>Install Yushi Pocket</span><button id="install-button" type="button" class="toggle ${deferredInstallPrompt ? 'on' : ''}" aria-label="Install app"></button></div></section><section class="settings-group"><h3>Phone</h3><div class="settings-row"><span class="setting-icon pink">♡</span><span>Wallpaper</span><small>Riku ♡ Yushi</small></div><div class="settings-row"><span class="setting-icon gray">◌</span><span>Passcode</span><small>Enabled</small></div></section><p style="color:#8b8d99;font-size:12px;text-align:center">Designed for Yushi · virtual edition</p>` },
    memories: { title: 'Memories', content: `<p class="section-eyebrow">FOR YOU</p><h1 class="large-title">On This Day</h1><section class="memory-hero"><img src="images/photo-06.jpg" alt="A Yushi memory" /></section><p class="memory-copy">A small collection of favorite light, café plans and people worth missing. Keep this one close.</p>${galleryMarkup()}` }
  };
  return markup[app] || markup.photos;
}

function openApp(app) {
  clickSound();
  const view = appMarkup(app);
  appTitle.textContent = view.title;
  appContent.innerHTML = view.content;
  appContent.scrollTop = 0;
  showScreen('app-screen');
  bindAppContent();
}
function bindAppContent() {
  document.querySelectorAll('.photo-thumb').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.photo); document.querySelector('#modal-image').src = photoSources[index]; document.querySelector('#modal-caption').textContent = photoCaptions[index]; photoModal.classList.add('open'); photoModal.setAttribute('aria-hidden', 'false');
  }));
  document.querySelector('#sound-toggle')?.addEventListener('click', (event) => { const enabled = localStorage.getItem('yushi-sound') === 'on'; localStorage.setItem('yushi-sound', enabled ? 'off' : 'on'); event.currentTarget.classList.toggle('on', !enabled); if (!enabled) clickSound(); });
  document.querySelector('#install-button')?.addEventListener('click', installApp);
}
async function installApp() { if (!deferredInstallPrompt) { alert('Use your browser menu and select “Add to Home Screen” to install Yushi Pocket.'); return; } deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt = null; }

document.querySelector('.unlock-trigger').addEventListener('click', () => showScreen('passcode-screen'));
document.querySelector('.back-to-lock').addEventListener('click', () => showScreen('lock-screen'));
document.querySelector('#app-close').addEventListener('click', () => showScreen('home-screen'));
document.querySelector('#app-grid').addEventListener('click', (event) => { const button = event.target.closest('[data-app]'); if (button) openApp(button.dataset.app); });
document.querySelector('.dock').addEventListener('click', (event) => { const button = event.target.closest('[data-app]'); if (button) openApp(button.dataset.app); });
document.querySelectorAll('[data-key]').forEach((button) => button.addEventListener('click', () => enterDigit(button.dataset.key)));
document.querySelector('#photo-close').addEventListener('click', () => { photoModal.classList.remove('open'); photoModal.setAttribute('aria-hidden', 'true'); });
phone.addEventListener('touchstart', (event) => { touchStartY = event.changedTouches[0].screenY; }, { passive: true });
phone.addEventListener('touchend', (event) => { if (document.querySelector('#lock-screen').classList.contains('active') && touchStartY - event.changedTouches[0].screenY > 45) showScreen('passcode-screen'); }, { passive: true });
document.addEventListener('keydown', (event) => { if (!document.querySelector('#passcode-screen').classList.contains('active')) return; if (/^[0-9]$/.test(event.key)) enterDigit(event.key); if (event.key === 'Backspace') enterDigit('delete'); if (event.key === 'Escape') showScreen('lock-screen'); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
updateClock(); window.setInterval(updateClock, 1000);
