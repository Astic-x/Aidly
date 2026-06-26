# Aidly — Features

This document describes every feature, where it lives in the code, and how to use it.
Open the toolbar popup to toggle most features; a few are keyboard shortcuts or live in
the separate camera window.

## Reading aids

### Bionic Reading
Bolds the first portion of each word to create fixation points that guide the eye.
- Toggle: popup → **Bionic Reading**.
- Code: `content.js` `bionic` handler (wraps word prefixes in `b.aidly-bionic`).

### Reading Ruler
A highlight band follows the cursor and dims the rest of the page to keep your place.
- Toggle: popup → **Reading Ruler**.
- Code: `content.js` `readingRuler` handler.

### Read Aloud (whole page)
Reads the page using the browser's speech synthesis with play / pause / stop and a speed
slider; the spoken word is highlighted as it is read.
- Controls: popup → **Read Aloud** card.
- Code: `content.js` `readAloud` handler; wiring in `popup.js`.

### Reader Mode
Strips ads, sidebars and clutter, showing a clean, centered article.
- Toggle: popup → **Reader Mode**.
- Code: `content.js` `readerMode` handler.

### Syllable splitter
Breaks long words into `syl·la·bles` to ease decoding.
- Toggle: popup → **Syllables**.
- Code: `content.js` `syllable` handler.

### Dictionary (double-click)
Double-click any word to show its definition in a tooltip. Uses `api.dictionaryapi.dev`.
- Toggle: popup → **Dictionary**.
- Code: `content.js` `hoverDict` handler.

### Auto Scroll
Lets the page scroll itself at a steady pace so you can read hands-free; set the speed
with the slider. Stops automatically at the bottom of the page.
- Controls: popup → **Auto Scroll** card (toggle + speed 1–10).
- Code: `content.js` `autoScroll` handler; wiring in `popup.js`.

## Typography

### Font Type
Switches body text to a chosen font, including dyslexia-friendly **Open Dyslexic** and
**Lexend**, plus Sign Language, Arial, Verdana, Impact and Comic Sans.
- Control: popup → **Font Type** dropdown + toggle.
- Code: `content.js` `fontFamily` handler injects `assets/fonts/css/<font>.css`.

### Font Size / Font Color / Text Stroke
Scale text, recolor text, or add an outline for contrast.
- Controls: popup → **Font Size**, **Font Color**, **Text Stroke**.

### Text Spacing
Independent line, letter and word spacing sliders (key dyslexia settings).
- Controls: popup → **Text Spacing** card.
- Code: `content.js` `spacing` handler.

## Vision support

### Color-Blind Correction
Daltonization presets for **protanopia**, **deuteranopia** and **tritanopia** with an
intensity slider. Implemented with an SVG `feColorMatrix` applied to the page.
- Controls: popup → **Color-Blind Correction** card.
- Code: `content.js` `colorBlindCorrect` handler.

### Magnifier
A lens that magnifies images on hover, with adjustable size and zoom.
- Controls: popup → **Magnifier** card.

### Emphasize Links / Image Veil
Add a multi-color underline to links, or hide images to reduce distraction.
- Emphasize Links: popup toggle or **Alt+Shift+E**.
- Image Veil: **Alt+V**.

## Hands-free control

Open the camera window from popup → **Eye Control → Open**. It uses MediaPipe
FaceLandmarker (head pose + blink blendshapes) and GestureRecognizer (open palm).

| Gesture | Action |
| --- | --- |
| Face up | Scroll up |
| Chin down | Scroll down |
| Head left | Zoom in |
| Head right | Zoom out |
| Double blink | Screenshot (copied to clipboard) |
| Long blink | Bring page to top |
| **Show palm** | Pause / resume all control |

- Sensitivity sliders tune scroll/zoom/blink thresholds and scroll speed.
- The detection loop is driven by a **Web Worker** (`eye-control.worker.js`) so it keeps
  running even when the camera window is minimized.
- Gesture commands are sent to the active tab via the background service worker
  (`EYE_CMD` → `chrome.scripting.executeScript`).

### Voice actions
Optional speech recognition (enable on the Options page). Right-click the Aidly icon →
**Options** to turn on voice actions.

## Utilities

- **Cursor Type** — swap the page cursor (arrow, black pointer, pencil).
- **Print** — print the current page.
- **Screenshot** — capture the page; the hands-free double-blink copies it to the
  clipboard.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt+V` | Toggle Image Veil |
| `Alt+Shift+H` | Toggle Highlight Words |
| `Alt+Shift+M` | Toggle Magnifier |
| `Alt+Shift+E` | Toggle Emphasize Links |
