# Aidly — Install & Troubleshooting

## Requirements

- Google Chrome or Microsoft Edge (Chromium), recent version.
- A webcam is only needed for the hands-free **Eye Control** feature.

## Load the extension (unpacked)

1. Download/unzip the `Aidly` folder so that `manifest.json` sits at its root.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode** (toggle, top-right).
4. Click **Load unpacked**.
5. Select the `Aidly` folder.
6. The Aidly icon appears in the toolbar — pin it for easy access.

To update after code changes: click **Reload** on the Aidly card in
`chrome://extensions`.

## Permissions and why they are needed

| Permission | Why |
| --- | --- |
| `activeTab`, `tabs`, `scripting` | Apply features to the page you are on and route hands-free commands to it |
| `storage` | Remember your settings across sessions (synced to your profile) |
| `contextMenus` | Right-click actions |
| `host_permissions` (http/https) | Inject the content script and capture screenshots |
| `api.dictionaryapi.dev` | Look up the word you double-click |
| Camera (requested at runtime) | Only when you open **Eye Control** |

No data leaves your machine except the single word you look up in the dictionary.

## Using Eye Control

1. Open the popup → **Eye Control → Open**. A small camera window opens.
2. Allow camera access when prompted.
3. Click **Start**, look straight ahead, click **Recenter**, then **Enable control**.
4. Use head tilts to scroll/zoom, blinks for screenshot/bring-to-top, and **show your
   palm** to pause or resume.

The window can be **minimized** and control keeps working.

## Troubleshooting

**The camera window is black / "No face detected".**
Make sure no other app is using the camera and that any physical privacy shutter is open.

**Palm pause does nothing.**
Hold an open palm clearly in frame for a moment. If the window shows "palm gesture
unavailable", the gesture model failed to load — reload the extension and reopen the
window.

**Double-blink screenshot didn't copy.**
The clipboard image API only works on secure (`https://`) pages. On `http://` or
`chrome://` pages you will see a red toast. Paste with `Ctrl+V` to verify on an https
page.

**A feature didn't apply to a tab that was already open.**
Reload that tab after (re)loading the extension so the content script is present.

**Fonts/images look missing.**
Ensure the whole `Aidly` folder (including `assets/` and `vendor/`) was loaded, not just
a subfolder.
