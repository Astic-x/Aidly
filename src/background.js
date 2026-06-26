// On Install
chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.sync.set({ ["assistant_enable"]: 1 });
  if (details.reason == "install") {
    chrome.tabs.create(
      { url: `chrome-extension://${chrome.runtime.id}/src/options/options.html` },
      function (tab) {}
    );
  }

  chrome.storage.sync.set({ ["clickedColor"]: "#3399FF80" });
  chrome.storage.sync.set({ ["fontFamily"]: "open-dyslexic-regular" });
  chrome.storage.sync.set({ ["fontTypeButton"]: false });
  chrome.storage.sync.set({ ["cursorType"]: "arrow.png" });
  chrome.storage.sync.set({ ["cursorTypeButton"]: false });
  chrome.storage.sync.set({ ["fontSizeButton"]: false });
  chrome.storage.sync.set({ ["fontColorButton"]: false });
  chrome.storage.sync.set({ ["fontColor"]: "#C0382B" });
  chrome.storage.sync.set({ ["fontColorId"]: "color-12" });
  chrome.storage.sync.set({ ["magnifyButton"]: false });
  chrome.storage.sync.set({ ["imageVeilButton"]: false });
  chrome.storage.sync.set({ ["highlightWordsButton"]: false });
  chrome.storage.sync.set({ ["emphasizeLinksButton"]: false });
  chrome.storage.sync.set({ ["textStrokeButton"]: false });
  chrome.storage.sync.set({ ["textStrokeColor"]: "#C0382B" });
  chrome.storage.sync.set({ ["textStrokeColorId"]: "color-12" });
  chrome.storage.sync.set({ ["scrollValue"]: 0 });
  chrome.storage.sync.set({ ["magnifierSizeSlider"]: 50 });
  chrome.storage.sync.set({ ["magnificationSlider"]: 3 });
  chrome.storage.sync.set({ ["readingRulerButton"]: false });
  chrome.storage.sync.set({ ["bionicButton"]: false });
  chrome.storage.sync.set({ ["readerModeButton"]: false });
  chrome.storage.sync.set({ ["syllableButton"]: false });
  chrome.storage.sync.set({ ["hoverDictButton"]: false });
  chrome.storage.sync.set({ ["spacingButton"]: false });
  chrome.storage.sync.set({ ["colorBlindButton"]: false });
  chrome.storage.sync.set({ ["cbMode"]: "deuteranopia" });
  chrome.storage.sync.set({ ["cbIntensity"]: 100 });
  chrome.storage.sync.set({ ["autoScrollButton"]: false });
  chrome.storage.sync.set({ ["autoScrollSpeed"]: 3 });
});

// On Tab Change
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.storage.sync.get(
    [
      "fontFamily",
      "fontTypeButton",
      "cursorType",
      "cursorTypeButton",
      "fontSizeButton",
      "fontSizeSlider",
      "fontColorButton",
      "fontColor",
      "magnifyButton",
      "highlightWordsButton",
      "imageVeilButton",
      "emphasizeLinksButton",
      "textStrokeButton",
      "textStrokeColor",
      "magnifierSizeSlider",
      "magnificationSlider",
      "readingRulerButton",
      "bionicButton",
      "syllableButton",
      "hoverDictButton",
      "spacingButton",
      "lineSpacing",
      "letterSpacing",
      "wordSpacing",
      "colorBlindButton",
      "cbMode",
      "cbIntensity",
    ],
    function (stored) {
      if (stored.fontTypeButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontFamily",
          fontFamily: stored.fontFamily,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontFamily",
          checkedButton: 0,
        });
      }

      if (stored.cursorTypeButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "cursorType",
          cursorType: stored.cursorType,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "cursorType",
          checkedButton: 0,
        });
      }

      if (stored.fontSizeButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontSize",
          fontSize: stored.fontSizeSlider,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontSize",
          checkedButton: 0,
        });
      }

      if (stored.fontColorButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontColor",
          fontColor: stored.fontColor,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "fontColor",
          checkedButton: 0,
        });
      }

      if (stored.magnifyButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "magnify",
          magnifierSize: stored.magnifierSizeSlider,
          magnification: stored.magnificationSlider,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "magnify",
          checkedButton: 0,
        });
      }

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "imageVeil",
        checkedButton: stored.imageVeilButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "highlight",
        checkedButton: stored.highlightWordsButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "readingRuler",
        checkedButton: stored.readingRulerButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "bionic",
        checkedButton: stored.bionicButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "syllable",
        checkedButton: stored.syllableButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "hoverDict",
        checkedButton: stored.hoverDictButton ? 1 : 0,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "spacing",
        checkedButton: stored.spacingButton ? 1 : 0,
        line: (stored.lineSpacing || 180) / 100,
        letter: parseInt(stored.letterSpacing || 0, 10),
        word: parseInt(stored.wordSpacing || 0, 10),
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "colorBlindCorrect",
        checkedButton: stored.colorBlindButton ? 1 : 0,
        mode: stored.cbMode || "deuteranopia",
        intensity: (stored.cbIntensity != null ? stored.cbIntensity : 100) / 100,
      });

      chrome.tabs.sendMessage(activeInfo.tabId, {
        todo: "emphasizeLinks",
        checkedButton: stored.emphasizeLinksButton ? 1 : 0,
      });

      if (stored.textStrokeButton) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "textStroke",
          textStrokeColor: stored.textStrokeColor,
          checkedButton: 1,
        });
      } else {
        chrome.tabs.sendMessage(activeInfo.tabId, {
          todo: "textStroke",
          checkedButton: 0,
        });
      }
    }
  );
});

chrome.runtime.onConnect.addListener(function (port) {
  var temp;
  console.assert(port.name == "performAction");
  port.onMessage.addListener(function (msg) {
    if (msg.action == "open") {
      temp = msg.result;
      if (temp != null && temp !== "undefined") {
        chrome.tabs.create({
          url: temp,
        });
      }
      port.postMessage({ response: "ok" });
    } else if (msg.action == "play") {
      temp = msg.result;

      if (temp != null && temp !== "undefined") {
        chrome.tabs.create({
          url: temp,
        });
      }
      port.postMessage({ response: "ok" });
    } else if (msg.action == "translate") {
      temp = msg.result;
      if (temp != null && temp !== "undefined") {
        chrome.tabs.create({
          url: temp,
        });
      }
      port.postMessage({ response: "ok" });
    } else if (msg.action == "direction") {
      temp = msg.result;
      if (temp != null && temp !== "undefined") {
        chrome.tabs.create({
          url: temp,
        });
      }
      port.postMessage({ response: "ok" });
    }
  });
});

// Context Menu
var menuItem = {
  id: "Speak",
  title: "Speak",
  contexts: ["selection"],
};

// removeAll first so reloading the unpacked extension doesn't throw
// "Cannot create item with duplicate id Speak".
chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create(menuItem);
});

chrome.contextMenus.onClicked.addListener(function (clickData, tabdata) {
  if (clickData.menuItemId == "Speak" && clickData.selectionText) {
    chrome.tabs.sendMessage(tabdata.id, {
      todo: "speakTTS",
      selectedText: clickData.selectionText,
    });
  }
});

// Chrome Screenshot
var id = 100;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.todo == "screenshot") {
    chrome.tabs.captureVisibleTab({ format: "png" }, function (screenshotUrl) {
      chrome.storage.local.set({ ["setScreenshot"]: screenshotUrl });

      var viewTabUrl = chrome.runtime.getURL("src/screenshot/screenshot.html?id=" + id);
      var targetId = null;
      chrome.tabs.create({ url: viewTabUrl }, function (tab) {
        targetId = tab.id;
      });
    });
  }
});

// ---- Eye Control: route gesture commands to the active web page ----
// Track the most recently active real web tab, so commands target the page you
// were last on even after you click the camera popup / chrome:// pages.
let lastWebTabId = null;
function remember(tabId) {
  chrome.tabs.get(tabId, function (t) {
    if (chrome.runtime.lastError || !t) return;
    if (t.url && /^https?:\/\//.test(t.url)) lastWebTabId = t.id;
  });
}
chrome.tabs.onActivated.addListener(function (info) { remember(info.tabId); });
chrome.tabs.onUpdated.addListener(function (tabId, ch, tab) {
  if (tab && tab.active && tab.url && /^https?:\/\//.test(tab.url)) lastWebTabId = tabId;
});

function getActiveWebTab(cb) {
  // 1) prefer the remembered last web tab if it still exists
  if (lastWebTabId != null) {
    chrome.tabs.get(lastWebTabId, function (t) {
      if (!chrome.runtime.lastError && t && /^https?:\/\//.test(t.url || "")) { cb(t); return; }
      queryFallback(cb);
    });
  } else {
    queryFallback(cb);
  }
}
function queryFallback(cb) {
  chrome.tabs.query({ active: true, windowType: "normal" }, function (tabs) {
    var web = (tabs || []).filter(function (t) { return t.url && /^https?:\/\//.test(t.url); });
    cb(web[0] || null);
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!message || message.type !== "EYE_CMD") return;
  console.log("[Aidly EYE_CMD]", message.cmd, "value", message.value, "lastWebTabId", lastWebTabId);

  if (message.cmd === "screenshot") {
    getActiveWebTab(function (tab) {
      if (!tab) return;
      var winId = tab.windowId;
      // Focus the web window first so the page is allowed to write to the
      // clipboard, then capture and copy. (The camera loop keeps running even
      // when its window loses focus / is minimized.)
      chrome.windows.update(winId, { focused: true }, function () {
        chrome.tabs.captureVisibleTab(winId, { format: "png" }, function (url) {
          if (chrome.runtime.lastError || !url) return;
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async function (dataUrl) {
              function toast(msg, ok) {
                var d = document.createElement("div");
                d.textContent = msg;
                d.style.cssText =
                  "position:fixed;z-index:2147483647;left:50%;bottom:28px;transform:translateX(-50%);" +
                  "background:" + (ok ? "#1e78c2" : "#b3261e") + ";color:#fff;padding:10px 18px;" +
                  "border-radius:10px;font:600 14px Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);";
                document.body.appendChild(d);
                setTimeout(function () { d.remove(); }, 1800);
              }
              try {
                var blob = await (await fetch(dataUrl)).blob();
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                toast("Screenshot copied to clipboard", true);
              } catch (e) {
                toast("Couldn't copy screenshot (try an https page)", false);
              }
            },
            args: [url],
          });
        });
      });
    });
    return;
  }

  // scroll / zoom / bring -> inject directly into the active web tab.
  // Using executeScript (not tabs.sendMessage) so it works even if the page
  // was open before the extension was (re)loaded and has no content script.
  getActiveWebTab(function (tab) {
    if (!tab) return;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: function (action, value) {
        if (window.__aidlyZoom === undefined) window.__aidlyZoom = 1;
        if (action === "scrollDown") window.scrollBy({ top: value || 80, left: 0, behavior: "auto" });
        else if (action === "scrollUp") window.scrollBy({ top: -(value || 80), left: 0, behavior: "auto" });
        else if (action === "bringTop") window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        else if (action === "zoomIn") { window.__aidlyZoom = Math.min(window.__aidlyZoom * 1.1, 3); document.body.style.zoom = window.__aidlyZoom; }
        else if (action === "zoomOut") { window.__aidlyZoom = Math.max(window.__aidlyZoom / 1.1, 0.4); document.body.style.zoom = window.__aidlyZoom; }
      },
      args: [message.cmd, message.value || 80],
    }).then(
      function () { console.log("[Aidly] injected", message.cmd, "-> tab", tab.id, tab.url); },
      function (err) { console.warn("[Aidly] executeScript failed:", err && err.message); }
    );
  });
});

// Keyboard Shortcuts
chrome.commands.onCommand.addListener(function (command) {
  chrome.storage.sync.get(
    [
      "imageVeilButton",
      "highlightWordsButton",
      "magnifyButton",
      "magnifierSizeSlider",
      "magnificationSlider",
      "emphasizeLinksButton",
    ],
    function (stored) {
      if (command === "toggle-image-veil") {
        if (stored.imageVeilButton) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "imageVeil",
                checkedButton: 0,
              });
            }
          );
          chrome.storage.sync.set({
            ["imageVeilButton"]: 0,
          });
        } else {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "imageVeil",
                checkedButton: 1,
              });
            }
          );
          chrome.storage.sync.set({
            ["imageVeilButton"]: 1,
          });
        }
      }

      if (command === "toggle-highlight-words") {
        if (stored.highlightWordsButton) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "highlight",
                checkedButton: 0,
              });
            }
          );
          chrome.storage.sync.set({
            ["highlightWordsButton"]: 0,
          });
        } else {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "highlight",
                checkedButton: 1,
              });
            }
          );
          chrome.storage.sync.set({
            ["highlightWordsButton"]: 1,
          });
        }
      }

      if (command === "toggle-magnifier") {
        if (stored.magnifyButton) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "magnify",
                checkedButton: 0,
              });
            }
          );
          chrome.storage.sync.set({
            ["magnifyButton"]: false,
          });
        } else {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "magnify",
                magnifierSize: stored.magnifierSizeSlider,
                magnification: stored.magnificationSlider,
                checkedButton: 1,
              });
            }
          );
          chrome.storage.sync.set({
            ["magnifyButton"]: true,
          });
        }
      }

      if (command === "toggle-emphasize-links") {
        if (stored.emphasizeLinksButton) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "emphasizeLinks",
                checkedButton: 0,
              });
            }
          );
          chrome.storage.sync.set({
            ["emphasizeLinksButton"]: 0,
          });
        } else {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                todo: "emphasizeLinks",
                checkedButton: 1,
              });
            }
          );
          chrome.storage.sync.set({
            ["emphasizeLinksButton"]: 1,
          });
        }
      }
    }
  );
});
