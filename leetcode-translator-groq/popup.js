const LANGUAGES = [
  { code: 'hi', name: 'Hindi',    native: 'हिन्दी'   },
  { code: 'es', name: 'Spanish',  native: 'Español'  },
  { code: 'fr', name: 'French',   native: 'Français' },
  { code: 'de', name: 'German',   native: 'Deutsch'  },
  { code: 'ja', name: 'Japanese', native: '日本語'    },
  { code: 'zh', name: 'Chinese',  native: '中文'      },
];

let selectedLang = LANGUAGES[0];

function setStatus(msg, type) {
  document.getElementById('statusText').textContent = msg;
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot';
  if (type === 'green')  dot.classList.add('dot-green');
  else if (type === 'orange') dot.classList.add('dot-orange');
  else if (type === 'red')    dot.classList.add('dot-red');
  else dot.classList.add('dot-grey');
}

function buildLangGrid(savedCode) {
  const grid = document.getElementById('langGrid');
  LANGUAGES.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (lang.code === savedCode ? ' active' : '');
    btn.innerHTML = `<span class="lang-name">${lang.name}</span><span class="lang-native">${lang.native}</span>`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLang = lang;
      chrome.storage.sync.set({ selectedLang: lang.code });
      setStatus(lang.name + ' selected', 'green');
    });
    if (lang.code === savedCode) selectedLang = lang;
    grid.appendChild(btn);
  });
}

async function init() {
  const stored = await chrome.storage.sync.get(['apiKey', 'selectedLang']);

  const savedCode = stored.selectedLang || 'hi';
  buildLangGrid(savedCode);
  selectedLang = LANGUAGES.find(l => l.code === savedCode) || LANGUAGES[0];

  if (stored.apiKey) {
    document.getElementById('apiKeyInput').value = stored.apiKey;
    setStatus('Ready to translate', 'green');
  } else {
    setStatus('Add your Groq API key below', 'orange');
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onProblemPage = tab && tab.url && tab.url.includes('leetcode.com/problems/');

  if (!onProblemPage) {
    document.getElementById('main-ui').style.display = 'none';
    document.getElementById('not-lc-screen').style.display = 'block';
  }
}

document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key) {
    setStatus('Please enter an API key', 'red');
    return;
  }
  if (!key.startsWith('gsk_')) {
    setStatus('Key should start with gsk_', 'red');
    return;
  }
  chrome.storage.sync.set({ apiKey: key }, () => {
    setStatus('API key saved', 'green');
  });
});

document.getElementById('translateBtn').addEventListener('click', async () => {
  const stored = await chrome.storage.sync.get('apiKey');
  if (!stored.apiKey) {
    setStatus('Save your API key first', 'red');
    return;
  }

  const btn = document.getElementById('translateBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Translating...';
  setStatus('Reading problem...', 'orange');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: 'getProblemText' }, response => {
    if (chrome.runtime.lastError || !response || !response.text) {
      setStatus('Could not read problem text', 'red');
      btn.disabled = false;
      btn.textContent = 'Translate problem';
      return;
    }

    setStatus('Calling Groq API...', 'orange');

    chrome.runtime.sendMessage({
      action: 'translate',
      text: response.text,
      lang: selectedLang,
      apiKey: stored.apiKey
    }, result => {
      btn.disabled = false;
      btn.textContent = 'Translate problem';

      if (result && result.success) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showTranslation',
          translation: result.translation,
          lang: selectedLang
        });
        setStatus('Translated to ' + selectedLang.name, 'green');
        window.close();
      } else {
        setStatus(result?.error || 'Translation failed', 'red');
      }
    });
  });
});

init();
