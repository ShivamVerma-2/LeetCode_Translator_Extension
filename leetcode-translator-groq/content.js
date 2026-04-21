const PANEL_ID = 'lc-translator-panel';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProblemText') {
    sendResponse({ text: scrapeProblemText() });
  }
  if (message.action === 'showTranslation') {
    injectPanel(message.translation, message.lang);
  }
});

function scrapeProblemText() {
  const descSelectors = [
    '[data-track-load="description_content"]',
    '.question-content__JfgR',
    '.xFUwe',
    '[class*="description__"]',
    '[class*="questionContent"]',
    '[class*="question-content"]',
    '.notranslate',
    '[data-key="description-content"]',
    '.problems_problem_content__Xm_eO',
  ];

  let problemEl = null;
  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 50) {
      problemEl = el;
      break;
    }
  }

  // fallback — find largest div that looks like a problem
  if (!problemEl) {
    const divs = Array.from(document.querySelectorAll('div'));
    for (const div of divs) {
      const txt = div.innerText || '';
      if (
        txt.length > 200 &&
        txt.length < 8000 &&
        (txt.includes('Example') || txt.includes('Input:') || txt.includes('Constraints')) &&
        div.children.length > 2
      ) {
        problemEl = div;
        break;
      }
    }
  }

  const titleSelectors = [
    '[data-cy="question-title"]',
    '[class*="title__"]',
    '.mr-2.text-lg',
    'h1',
    '[class*="questionTitle"]',
  ];

  let titleEl = null;
  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) {
      titleEl = el;
      break;
    }
  }

  const title = titleEl
    ? titleEl.innerText.trim()
    : document.title.split(' - ')[0].trim();

  const body = problemEl ? problemEl.innerText.trim() : '';
  if (!body) return null;

  return title + '\n\n' + body;
}

function injectPanel(translation, lang) {
  const existing = document.getElementById(PANEL_ID);
  if (existing) existing.remove();

  // inject styles once
  if (!document.getElementById('lc-panel-styles')) {
    const style = document.createElement('style');
    style.id = 'lc-panel-styles';
    style.textContent = `
      #lc-translator-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 400px;
        max-height: 68vh;
        display: flex;
        flex-direction: column;
        background: #1c1c1c;
        border: 1px solid #2e2e2e;
        border-radius: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 999999;
        overflow: hidden;
        animation: lcFadeUp 0.22s ease;
      }
      @keyframes lcFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #lc-translator-panel .lc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 14px;
        background: #181818;
        border-bottom: 1px solid #2a2a2a;
        flex-shrink: 0;
        cursor: grab;
      }
      #lc-translator-panel .lc-head:active { cursor: grabbing; }
      #lc-translator-panel .lc-head-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #lc-translator-panel .lc-logo {
        width: 26px;
        height: 26px;
        background: #00e676;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 800;
        color: #0d0d0d;
        flex-shrink: 0;
      }
      #lc-translator-panel .lc-title {
        font-size: 13px;
        font-weight: 600;
        color: #e0e0e0;
      }
      #lc-translator-panel .lc-badge {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: #162b1e;
        color: #00e676;
        border: 1px solid #1e4030;
        font-weight: 500;
      }
      #lc-translator-panel .lc-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      #lc-translator-panel .lc-copy {
        font-size: 11px;
        padding: 4px 10px;
        border: 1px solid #2e2e2e;
        border-radius: 6px;
        background: #222;
        color: #8F8E8D;
        cursor: pointer;
        transition: color 0.12s, border-color 0.12s;
      }
      #lc-translator-panel .lc-copy:hover {
        color: #00e676;
        border-color: #00e676;
      }
      #lc-translator-panel .lc-close {
        width: 26px;
        height: 26px;
        border: none;
        background: transparent;
        color: #8F8E8D;
        font-size: 18px;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s, color 0.12s;
        line-height: 1;
      }
      #lc-translator-panel .lc-close:hover {
        background: #2a2a2a;
        color: #f0f0f0;
      }
      #lc-translator-panel .lc-body {
        padding: 14px 16px;
        overflow-y: auto;
        flex: 1;
        font-size: 13px;
        line-height: 1.8;
        color: #d0d0d0;
        white-space: pre-wrap;
        word-break: break-word;
      }
      #lc-translator-panel .lc-body::-webkit-scrollbar {
        width: 4px;
      }
      #lc-translator-panel .lc-body::-webkit-scrollbar-track {
        background: transparent;
      }
      #lc-translator-panel .lc-body::-webkit-scrollbar-thumb {
        background: #2e2e2e;
        border-radius: 4px;
      }
      #lc-translator-panel .lc-footer {
        padding: 7px 14px;
        border-top: 1px solid #242424;
        font-size: 10px;
        color: #8F8E8D;
        background: #161616;
        flex-shrink: 0;
        letter-spacing: 0.2px;
      }
    `;
    document.head.appendChild(style);
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="lc-head" id="lc-drag-handle">
      <div class="lc-head-left">
        <div class="lc-logo">LC</div>
        <span class="lc-title">Translation</span>
        <span class="lc-badge">${lang.name} &middot; ${lang.native}</span>
      </div>
      <div class="lc-actions">
        <button class="lc-copy" id="lc-copy-btn">Copy</button>
        <button class="lc-close" id="lc-close-btn">&times;</button>
      </div>
    </div>
    <div class="lc-body" id="lc-body-text">${escapeHtml(translation)}</div>
    <div class="lc-footer">Translated via Groq &middot; LLaMA 3.3 70B &middot; drag to move</div>
  `;

  document.body.appendChild(panel);

  document.getElementById('lc-close-btn').addEventListener('click', () => {
    panel.style.transition = 'opacity 0.18s, transform 0.18s';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(10px)';
    setTimeout(() => panel.remove(), 190);
  });

  document.getElementById('lc-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(translation).then(() => {
      const btn = document.getElementById('lc-copy-btn');
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.color = '#00e676';
      setTimeout(() => {
        btn.textContent = prev;
        btn.style.color = '';
      }, 1800);
    });
  });

  makeDraggable(panel, document.getElementById('lc-drag-handle'));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function makeDraggable(panel, handle) {
  let dragging = false;
  let startX, startY, origRight, origBottom;

  handle.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    origRight  = window.innerWidth  - rect.right;
    origBottom = window.innerHeight - rect.bottom;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.right  = Math.max(0, origRight  - dx) + 'px';
    panel.style.bottom = Math.max(0, origBottom - dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
  });
}
