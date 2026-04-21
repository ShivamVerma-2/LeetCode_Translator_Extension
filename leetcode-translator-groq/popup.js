const LANGUAGES = [
  { code: 'hi', name: 'Hindi',   native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French',  native: 'Français' },
  { code: 'de', name: 'German',  native: 'Deutsch' },
  { code: 'ja', name: 'Japanese',native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
];

let selectedLang = null;

function setStatus(msg, type = 'gray') {
  document.getElementById('statusText').textContent = msg;
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot ' + type;
}

function buildLangGrid(savedCode) {
  const grid = document.getElementById('langGrid');
  grid.innerHTML = '';
  LANGUAGES.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (lang.code === savedCode ? ' active' : '');
    btn.innerHTML = `<span class="lang-name">${lang.name}</span><span class="lang-native">${lang.native}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLang = lang;
      chrome.storage.sync.set({ selectedLang: lang.code });
      setStatus(`${lang.name} selected`, 'orange');
    });
    if (lang.code === savedCode) selectedLang = lang;
    grid.appendChild(btn);
  });
}

async function init() {
  const { apiKey, selectedLang: savedLang } = await chrome.storage.sync.get(['apiKey', 'selectedLang']);

  buildLangGrid(savedLang || 'hi');
  if (!selectedLang) selectedLang = LANGUAGES[0];

  if (apiKey) {
    document.getElementById('apiKeyInput').value = apiKey;
    setStatus('API key saved', 'green');
  } else {
    setStatus('Add your API key below', 'orange');
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isLeetCode = tab && tab.url && tab.url.includes('leetcode.com/problems/');
  if (!isLeetCode) {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('not-leetcode').style.display = 'block';
  }
}

document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) { setStatus('Enter an API key first', 'red'); return; }
  if (!key.startsWith('gsk_')) { setStatus('Groq key should start with gsk_', 'red'); return; }
  chrome.storage.sync.set({ apiKey: key }, () => setStatus('API key saved!', 'green'));
});

document.getElementById('translateBtn').addEventListener('click', async () => {
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) { setStatus('Save your API key first', 'red'); return; }
  if (!selectedLang) { setStatus('Select a language', 'orange'); return; }

  const btn = document.getElementById('translateBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Translating...';
  setStatus('Reading problem...', 'orange');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: 'getProblemText' }, async (response) => {
    if (chrome.runtime.lastError || !response || !response.text) {
      setStatus('Could not read problem text', 'red');
      btn.disabled = false;
      btn.textContent = 'Translate problem';
      return;
    }

    setStatus('Calling Claude API...', 'orange');

    chrome.runtime.sendMessage({
      action: 'translate',
      text: response.text,
      lang: selectedLang,
      apiKey
    }, (result) => {
      btn.disabled = false;
      btn.textContent = 'Translate problem';

      if (result && result.success) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showTranslation',
          translation: result.translation,
          lang: selectedLang
        });
        setStatus(`Translated to ${selectedLang.name}!`, 'green');
        window.close();
      } else {
        setStatus(result?.error || 'Translation failed', 'red');
      }
    });
  });
});

init();
