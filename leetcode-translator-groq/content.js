const PANEL_ID = 'lc-translator-panel';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProblemText') {
    sendResponse({ text: scrapeProblemText() });
  }

  if (message.action === 'showTranslation') {
    injectTranslationPanel(message.translation, message.lang);
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

  if (!problemEl) {
    const allDivs = Array.from(document.querySelectorAll('div'));
    for (const div of allDivs) {
      const text = div.innerText || '';
      if (
        text.length > 200 && text.length < 8000 &&
        (text.includes('Example') || text.includes('Input:') || text.includes('Constraints')) &&
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
    if (el && el.innerText.trim()) { titleEl = el; break; }
  }

  const title = titleEl ? titleEl.innerText.trim() : document.title.split(' - ')[0].trim();
  const body = problemEl ? problemEl.innerText.trim() : '';

  if (!body) return null;
  return title + '\n\n' + body;
}
function injectTranslationPanel(translation, lang) {
  const existing = document.getElementById(PANEL_ID);
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 420px;
    max-height: 70vh;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
    animation: lcSlideIn 0.25s ease;
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes lcSlideIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #${PANEL_ID} .lc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 10px;
      border-bottom: 1px solid #f3f4f6;
      flex-shrink: 0;
      background: #fffbf2;
    }
    #${PANEL_ID} .lc-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #${PANEL_ID} .lc-logo {
      width: 24px; height: 24px;
      background: #f89f1b;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: white;
    }
    #${PANEL_ID} .lc-title {
      font-size: 13px; font-weight: 600; color: #1a1a1a;
    }
    #${PANEL_ID} .lc-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 20px;
      background: #fff3d6;
      color: #9a5700;
      border: 1px solid #f8d78b;
      font-weight: 500;
    }
    #${PANEL_ID} .lc-actions {
      display: flex; gap: 6px; align-items: center;
    }
    #${PANEL_ID} .lc-action-btn {
      padding: 4px 10px;
      font-size: 11px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      color: #555;
      cursor: pointer;
      transition: all 0.12s;
    }
    #${PANEL_ID} .lc-action-btn:hover {
      background: #f5f5f5;
      color: #111;
    }
    #${PANEL_ID} .lc-close-btn {
      width: 26px; height: 26px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #aaa;
      font-size: 18px;
      line-height: 1;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.12s, color 0.12s;
    }
    #${PANEL_ID} .lc-close-btn:hover { background: #f0f0f0; color: #333; }
    #${PANEL_ID} .lc-body {
      padding: 14px 16px;
      overflow-y: auto;
      flex: 1;
      font-size: 13px;
      line-height: 1.75;
      color: #1a1a1a;
      white-space: pre-wrap;
      word-break: break-word;
    }
    #${PANEL_ID} .lc-body::-webkit-scrollbar { width: 4px; }
    #${PANEL_ID} .lc-body::-webkit-scrollbar-track { background: transparent; }
    #${PANEL_ID} .lc-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    #${PANEL_ID} .lc-resize-hint {
      text-align: center;
      font-size: 10px;
      color: #ccc;
      padding: 4px;
      flex-shrink: 0;
      cursor: ns-resize;
      user-select: none;
    }
  `;
  document.head.appendChild(styleTag);

  panel.innerHTML = `
    <div class="lc-header">
      <div class="lc-title-row">
        <div class="lc-logo">LC</div>
        <span class="lc-title">Translation</span>
        <span class="lc-badge">${lang.name} · ${lang.native}</span>
      </div>
      <div class="lc-actions">
        <button class="lc-action-btn" id="lc-copy-btn">Copy</button>
        <button class="lc-close-btn" id="lc-close-btn" title="Close">×</button>
      </div>
    </div>
    <div class="lc-body" id="lc-translation-body">${escapeHtml(translation)}</div>
    <div class="lc-resize-hint">⋯</div>
  `;

  document.body.appendChild(panel);

  document.getElementById('lc-close-btn').addEventListener('click', () => {
    panel.style.animation = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(10px)';
    panel.style.transition = 'opacity 0.18s, transform 0.18s';
    setTimeout(() => panel.remove(), 180);
  });

  document.getElementById('lc-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(translation).then(() => {
      const btn = document.getElementById('lc-copy-btn');
      btn.textContent = 'Copied!';
      btn.style.color = '#16a34a';
      setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 1800);
    });
  });

  makeDraggable(panel);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function makeDraggable(el) {
  const header = el.querySelector('.lc-header');
  let isDragging = false, startX, startY, origRight, origBottom;

  header.style.cursor = 'grab';

  header.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origRight  = window.innerWidth  - rect.right;
    origBottom = window.innerHeight - rect.bottom;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.right  = Math.max(0, origRight  - dx) + 'px';
    el.style.bottom = Math.max(0, origBottom - dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    header.style.cursor = 'grab';
  });
}
