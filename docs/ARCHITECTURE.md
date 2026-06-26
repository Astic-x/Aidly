# Aidly — Architecture

Aidly is a Manifest V3 Chrome/Edge extension. It has four execution contexts that
communicate through `chrome` messaging and `chrome.storage`.

```
            ┌─────────────────────────────────────────────────────────────┐
            │                      chrome.storage.sync                     │
            │     (feature on/off state + settings, synced per profile)    │
            └───────────────▲───────────────────────────▲─────────────────┘
                            │                           │
   ┌────────────────────┐   │   ┌───────────────────┐   │   ┌──────────────────────┐
   │  Popup (popup.js)  │───┘   │ Background (SW)   │   └───│ Content script        │
   │  toolbar control   │──msg──▶│ background.js     │──msg──▶│ content.js (per tab) │
   │  panel             │       │ - install defaults│       │ - applies features to │
   └─────────┬──────────┘       │ - context menus   │       │   the live page       │
             │ open window      │ - keyboard cmds   │       └──────────────────────┘
             ▼                  │ - EYE_CMD routing │
   ┌────────────────────┐       └─────────▲─────────┘
   │ Eye Control window │                 │ EYE_CMD (scroll/zoom/
   │ eye-control.js     │─────────────────┘ screenshot/bringTop)
   │ + worker (ticker)  │  runtime.sendMessage
   └────────────────────┘
```

## Contexts

### 1. Background service worker — `src/background.js`
- Sets default settings on install and opens the Options page on first install.
- Registers context menus and the keyboard `commands`.
- **Routes hands-free gesture commands.** The camera window sends
  `{ type: "EYE_CMD", cmd, value }`. The worker finds the most-recently-active web tab
  (`getActiveWebTab`) and injects the action with `chrome.scripting.executeScript`
  (scroll, zoom, bring-to-top). The double-blink **screenshot** focuses the page window,
  captures it with `captureVisibleTab`, then copies the PNG to the clipboard from the
  page context and shows a toast.

### 2. Content script — `src/content/content.js` (+ `content.css`)
Injected into every page (`<all_urls>`). Listens for `{ todo, ... }` messages from the
popup/background and applies the corresponding on-page change. Each feature creates and
tears down its own DOM nodes/styles, namespaced with the `aidly-…` prefix and
`window.__aidly…` globals to avoid clashing with the host page.

### 3. Popup — `src/popup/popup.{html,css,js}`
The main control panel. Every toggle/slider:
1. writes its state to `chrome.storage.sync`, and
2. sends a `{ todo }` message to the active tab's content script.

On load it reads stored state so the controls reflect reality. The popup also opens the
Eye Control window.

### 4. Eye Control window — `src/eye-control/`
A standalone extension window (opened with `chrome.windows.create`).
- `eye-control.js` loads the **MediaPipe Tasks** vision bundle from
  `vendor/mediapipe/`, requests the webcam, and runs `FaceLandmarker` +
  `GestureRecognizer` every tick.
- **Head pose** (yaw/pitch/roll) is derived from the facial transformation matrix; a
  self-recentering baseline avoids drift. **Blink** comes from eye blendshapes. **Open
  palm** comes from the gesture recognizer.
- The loop is driven by `eye-control.worker.js`, a Web Worker that posts a tick on an
  interval. Workers are **not throttled when the window is minimized**, so control keeps
  working in the background (the camera stream keeps producing frames while hidden).
- Detected gestures are sent to the background worker as `EYE_CMD` messages.

## Data & messaging conventions

- **Feature messages:** `{ todo: "<feature>", checkedButton: 0|1, ...params }` from
  popup/background → content script.
- **Gesture messages:** `{ type: "EYE_CMD", cmd, value }` from eye-control → background.
- **State:** all user-visible toggles and slider values live in `chrome.storage.sync`.
- **Namespacing:** injected elements use `id="aidly-…"`/`class="aidly-…"`; shared page
  globals use `window.__aidly…`.

## Manifest V3 notes

- **CSP:** `script-src 'self' 'wasm-unsafe-eval'` — required for the MediaPipe WASM and
  forbids `eval`/remote scripts, which is why the vision bundle is shipped locally.
- **Permissions:** `activeTab`, `storage`, `contextMenus`, `tabs`, `scripting`.
- **Host permissions:** `http/https` (to apply features and capture tabs) and
  `api.dictionaryapi.dev` (dictionary lookups).
- **web_accessible_resources:** fonts, images, models and the MediaPipe bundle, so the
  page/content-script can reference them.

## Third-party components (`vendor/`)

- **jQuery** + **jQuery Lettering** — used by the legacy content/popup code.
- **MediaPipe Tasks (vision)** — `vision_bundle.mjs` and the WASM runtime, plus the
  `.task` model files in `models/`.
