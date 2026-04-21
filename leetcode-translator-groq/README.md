# LeetCode Translator — Chrome Extension

Translate any LeetCode problem into Hindi, Spanish, French, German, Japanese, or Chinese with one click. The translated problem appears as a floating panel directly on the LeetCode page.

---

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this folder (`leetcode-translator-extension`)
5. The extension icon appears in your Chrome toolbar

---

## Adding Icons

The extension needs icon files. Create simple PNG icons or use any image editor:
- `icons/icon16.png`  — 16×16 px
- `icons/icon48.png`  — 48×48 px
- `icons/icon128.png` — 128×128 px

A quick way: download the LeetCode favicon and resize it, or use any orange square icon.

---

## Setup

1. Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Click the extension icon on any LeetCode problem page
3. Paste your API key in the **API key** field and click **Save**
4. Your key is stored securely in Chrome's sync storage

---

## Usage

1. Open any LeetCode problem — e.g., `https://leetcode.com/problems/two-sum/`
2. Click the extension icon in the toolbar
3. Pick your target language from the grid
4. Click **Translate problem**
5. A floating panel slides in with the full translated problem
6. Drag the panel anywhere on the page
7. Click **Copy** to copy the translation, or **×** to close

---

## File Structure

```
leetcode-translator-extension/
├── manifest.json      — Extension config & permissions
├── popup.html         — Extension popup UI
├── popup.js           — Popup logic & language picker
├── background.js      — Service worker: calls Claude API
├── content.js         — Reads LeetCode DOM, injects panel
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## How It Works

1. `content.js` is injected on every `leetcode.com/problems/*` page
2. When you click Translate, `popup.js` asks `content.js` to scrape the problem text from the DOM
3. The text + your chosen language is sent to `background.js`
4. `background.js` calls the Claude API (`claude-sonnet-4-20250514`) with a translation prompt
5. The translated text is sent back to `content.js`
6. `content.js` injects a draggable floating panel with the translation

---

## Supported Languages

| Language | Native |
|----------|--------|
| Hindi    | हिन्दी |
| Spanish  | Español |
| French   | Français |
| German   | Deutsch |
| Japanese | 日本語 |
| Chinese  | 中文 |

---

## Troubleshooting

**"Could not read problem text"** — LeetCode may have updated their DOM. Open DevTools, inspect the problem description element, and update the selectors in `content.js` inside the `scrapeProblemText()` function.

**API errors** — Make sure your Anthropic API key starts with `sk-ant-` and has credits available.

**Panel not showing** — Try refreshing the LeetCode page after installing the extension.
