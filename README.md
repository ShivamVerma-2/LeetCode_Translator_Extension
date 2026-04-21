# LeetCode Translator — Chrome Extension

Translate any LeetCode problem into your native language with a single click. The translation appears as a floating panel right on the problem page — no switching tabs, no copy-pasting.

Powered by **Groq's free API** (LLaMA 3.3 70B). No subscription needed.

---

## Screenshots

**Pin the extension to your toolbar**

![Extension pinned to Chrome toolbar]

<img width="785" height="556" alt="01-extension-pinned" src="https://github.com/user-attachments/assets/d7134a72-ffdd-49a7-bd38-07368b37a251" />


**Pick your language and hit translate**

![Popup UI with language selection]

<img width="616" height="631" alt="02-popup" src="https://github.com/user-attachments/assets/986848bb-a26f-484f-96d0-4db5caaa6555" />


**Translation appears directly on the LeetCode page**

![Floating translation panel on LeetCode]
<img width="609" height="737" alt="03-translation-panel" src="https://github.com/user-attachments/assets/715acb77-dbb1-4ea7-951f-c401362c4f14" />


---

## Features

- Supports 6 languages — Hindi, Spanish, French, German, Japanese, Chinese
- Floating panel stays on the page while you read and code
- Panel is draggable — move it anywhere on screen
- One-click copy button to grab the full translation
- Smart DOM scraping — works even when LeetCode updates their layout
- API key stored locally in Chrome, never sent anywhere else
- Completely free — Groq has a generous free tier

---

## Installation

### Step 1 — Get a free Groq API key

You need a Groq API key to use this extension. It is completely free.

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free account (no credit card required)
3. Click **API Keys** in the left sidebar
4. Click **Create API Key**, give it any name
5. Copy the key — it will start with `gsk_`

> Keep this key private. Do not share it with anyone.

---

### Step 2 — Download this repository

**Option A — Download as ZIP (recommended for beginners)**

1. Click the green **Code** button at the top of this page
2. Select **Download ZIP**
3. Extract the ZIP file anywhere on your computer

**Option B — Clone with Git**

```bash
git clone https://github.com/YOUR_USERNAME/leetcode-translator-extension.git
```

---

### Step 3 — Load the extension into Chrome

1. Open a new tab in Chrome and go to:
   ```
   chrome://extensions
   ```
2. Turn on **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Navigate into the extracted folder and select the `leetcode-translator-final` folder — the one that directly contains `manifest.json`
5. The **LC** icon will appear in your Chrome toolbar

> If you do not see the icon, click the puzzle piece icon in the toolbar and pin LeetCode Translator.

---

### Step 4 — Save your API key

1. Open any LeetCode problem, for example:
   ```
   https://leetcode.com/problems/two-sum/
   ```
2. Click the **LC** icon in the Chrome toolbar
3. Paste your Groq API key into the **API KEY** field at the bottom
4. Click **Save**
5. The status bar will show "Ready to translate" in green

Your key is saved in Chrome's local storage and never leaves your device.

---

## How to Use

1. Open any LeetCode problem page
2. Click the **LC** icon in the Chrome toolbar
3. Select the language you want
4. Click **Translate problem**
5. A panel slides in on the bottom-right of the page with the full translation
6. Drag the panel anywhere on screen if it is in the way
7. Click **Copy** to copy the translation to your clipboard
8. Click **×** to close the panel

---

## Supported Languages

| Language | Script |
|---|---|
| Hindi | हिन्दी |
| Spanish | Español |
| French | Français |
| German | Deutsch |
| Japanese | 日本語 |
| Chinese | 中文 |

More languages can be added by editing the `LANGUAGES` array in `popup.js`.

---

## Project Structure

```
leetcode-translator-final/
│
├── manifest.json        Chrome extension config and permissions
├── popup.html           The popup UI that opens when you click the icon
├── popup.js             Handles language selection and button logic
├── background.js        Makes the API call to Groq
├── content.js           Reads the problem from the LeetCode page
│                        and injects the translation panel
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── screenshots/
│   ├── 01-extension-pinned.png
│   ├── 02-popup.png
│   └── 03-translation-panel.png
│
└── README.md
```

---

## How It Works

When you click **Translate problem**, this is what happens behind the scenes:

1. `popup.js` sends a message to `content.js` asking for the problem text
2. `content.js` scrapes the problem title and description from the LeetCode DOM
3. The text is sent to `background.js` along with your chosen language
4. `background.js` calls the Groq API with a translation prompt
5. The translated text comes back and `content.js` injects it as a floating panel on the page

The extension uses `llama-3.3-70b-versatile` via Groq — one of the fastest and most accurate open-source models for multilingual tasks.

---

## Troubleshooting

**"Could not read problem text"**

LeetCode sometimes updates their page structure. Try:
- Refreshing the LeetCode problem page and translating again
- Making sure the URL contains `/problems/` — the extension only runs on problem pages
- Opening a GitHub issue with the problem URL so the scraper can be updated

**Translation panel does not appear**

- Scroll to the bottom-right corner of the screen, the panel appears there
- Try disabling other Chrome extensions temporarily to check for conflicts
- Reload the extension from `chrome://extensions` by clicking the refresh icon

**"Groq API error" or key rejected**

- Double-check that your key starts with `gsk_`
- Visit [console.groq.com](https://console.groq.com) to check your usage limits
- Delete the old key and create a new one, then save it again in the popup

**Extension icon not showing**

- Click the puzzle piece icon in the Chrome toolbar
- Find LeetCode Translator in the list and click the pin icon next to it

---

## Contributing

Pull requests are welcome. If you want to add a new language, fix a scraping issue, or improve the UI, here is the process:

1. Fork this repository
2. Create a new branch for your change
   ```bash
   git checkout -b add-portuguese-language
   ```
3. Make your changes and test them locally
4. Commit with a clear message
   ```bash
   git commit -m "Add Portuguese language support"
   ```
5. Push your branch and open a Pull Request

**Good first contributions:**
- Adding more languages (Portuguese, Arabic, Korean, Russian, Italian)
- Firefox/Edge support via a different manifest
- A history drawer showing past translations
- Auto-detecting the page language and pre-selecting it

---

## License

MIT — do whatever you want with this code. Attribution appreciated but not required.

---

If this saved you time, a star on the repo goes a long way. Thanks for checking it out.
