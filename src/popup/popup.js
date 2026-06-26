var assistant_start = 0;

// Building Font palette within popup.html [Keep this above popup load function]
var colors = [
  "#1FBC9C",
  "#1CA085",
  "#2ECC70",
  "#27AF60",
  "#3398DB",
  "#2980B9",
  "#A463BF",
  "#3D556E",
  "#222F3D",
  "#F2C511",
  "#F39C19",
  "#E84A3C",
  "#C0382B",
  "#DDE6E8",
  "#BDC3C8",
];

for (var i = 0; i < colors.length; i++) {
  var input = document.createElement("input");
  input.type = "radio";
  input.name = "color";
  input.id = "color-" + i;
  input.value = colors[i];
  if (i == 12) {
    input.checked = true;
  }
  var label = document.createElement("label");
  label.htmlFor = "color-" + i;
  var span = document.createElement("span");
  span.setAttribute("class", "color-" + i);
  span.setAttribute("style", "background-color:" + colors[i]);
  label.appendChild(span);
  document.getElementsByClassName("color-picker")[0].appendChild(input);
  document.getElementsByClassName("color-picker")[0].appendChild(label);
}

for (var i = 0; i < colors.length; i++) {
  var input = document.createElement("input");
  input.type = "radio";
  input.name = "ts-color";
  input.id = "ts-color-" + i;
  input.value = colors[i];
  if (i == 12) {
    input.checked = true;
  }
  var label = document.createElement("label");
  label.htmlFor = "ts-color-" + i;
  var span = document.createElement("span");
  span.setAttribute("class", "color-" + i);
  span.setAttribute("style", "background-color:" + colors[i]);
  label.appendChild(span);
  document.getElementsByClassName("ts-color-picker")[0].appendChild(input);
  document.getElementsByClassName("ts-color-picker")[0].appendChild(label);
}

// On popup load function
$(function () {
  chrome.storage.sync.get("assistant_enable", function (stored) {
    if (stored.assistant_enable) {
      // enabled but not yet listening; click the mic to start talking
      $(".activation-button").attr("src", "/assets/images/microphone-off.png");
    } else {
      $(".activation-button").attr("src", "/assets/images/microphone-disable.png");
    }
  });

  // Font Slider Setting
  chrome.storage.sync.get("fontSizeSlider", function (stored) {
    $("#fontSizeSlider_value").html(stored.fontSizeSlider);
    $("#fontSizeSlider").val(stored.fontSizeSlider);
  });

  chrome.storage.sync.get("fontFamily", function (stored) {
    $("#fontTypeDropDown").val(stored.fontFamily);
  });

  chrome.storage.sync.get("fontTypeButton", function (stored) {
    $("#fontTypeButton").prop("checked", stored.fontTypeButton);
    if (stored.fontTypeButton) {
      document.getElementById("font-type-switch-header").textContent = "On";
    } else {
      document.getElementById("font-type-switch-header").textContent = "Off";
    }
  });

  chrome.storage.sync.get("cursorType", function (stored) {
    $("#cursorTypeDropDown").val(stored.cursorType);
  });

  chrome.storage.sync.get("cursorTypeButton", function (stored) {
    $("#cursorTypeButton").prop("checked", stored.cursorTypeButton);
    if (stored.cursorTypeButton) {
      document.getElementById("cursor-type-switch-header").textContent = "On";
    } else {
      document.getElementById("cursor-type-switch-header").textContent = "Off";
    }
  });

  chrome.storage.sync.get("fontSizeButton", function (stored) {
    $("#fontSizeButton").prop("checked", stored.fontSizeButton);

    if (stored.fontSizeButton) {
      document.getElementById("font-size-switch-header").textContent = "On";
    } else {
      document.getElementById("font-size-switch-header").textContent = "Off";
    }
  });

  // Font Color Button Setting
  chrome.storage.sync.get("fontColorButton", function (stored) {
    $("#fontColorButton").prop("checked", stored.fontColorButton);

    if (stored.fontColorButton) {
      document.getElementById("font-color-switch-header").textContent = "On";
    } else {
      document.getElementById("font-color-switch-header").textContent = "Off";
    }
  });

  // Font Color Palette Setting
  chrome.storage.sync.get("fontColorId", function (stored) {
    $("#" + stored.fontColorId).attr("checked", true);
  });

  // Magnify Button Setting
  chrome.storage.sync.get("magnifyButton", function (stored) {
    $("#magnifierButton").prop("checked", stored.magnifyButton);
  });

  // Magnifier Size Setting
  chrome.storage.sync.get("magnifierSizeSlider", function (stored) {
    $("#magnifierSizeSlider_value").html(stored.magnifierSizeSlider);
    $("#magnifierSizeSlider").val(stored.magnifierSizeSlider);
  });

  // Magnification Setting
  chrome.storage.sync.get("magnificationSlider", function (stored) {
    $("#magnificationSlider_value").html(stored.magnificationSlider);
    $("#magnificationSlider").val(stored.magnificationSlider);
  });

  // Image Veil Setting
  chrome.storage.sync.get("imageVeilButton", function (stored) {
    $("#imageVeilButton").prop("checked", stored.imageVeilButton);
  });

  // Highlight Words Setting
  chrome.storage.sync.get("highlightWordsButton", function (stored) {
    $("#highlightWordsButton").prop("checked", stored.highlightWordsButton);
  });

  // Emphasize Links Setting
  chrome.storage.sync.get("emphasizeLinksButton", function (stored) {
    $("#emphasizeLinksButton").prop("checked", stored.emphasizeLinksButton);
  });

  // Text Stroke Setting
  chrome.storage.sync.get("textStrokeButton", function (stored) {
    $("#textStrokeButton").prop("checked", stored.textStrokeButton);
  });
  chrome.storage.sync.get("scrollValue", function (stored) {
    $("html, body").animate({ scrollTop: stored.scrollValue });
  });
});

// Font Type || Font Family button bind
$("#fontTypeButton").bind("change", function () {
  if ($(this).is(":checked")) {
    document.getElementById("font-type-switch-header").textContent = "On";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontFamily",
        fontFamily: $("#fontTypeDropDown").val(),
        checkedButton: 1,
      });
    });
  } else {
    document.getElementById("font-type-switch-header").textContent = "Off";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontFamily",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["fontFamily"]: $("#fontTypeDropDown").val() });
  chrome.storage.sync.set({ ["fontTypeButton"]: $(this).is(":checked") });
});

// Font Type || Font Family drop down bind
$("#fontTypeDropDown").change(function (data) {
  if ($("#fontTypeButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontFamily",
        fontFamily: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontFamily",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["fontFamily"]: $(data.target).val() });
  // chrome.storage.sync.set({
  // 	["fontTypeButton"]: $("#fontTypeButton").is(":checked"),
  // });
});

// Cursor Type Button
$("#cursorTypeButton").bind("change", function () {
  if ($(this).is(":checked")) {
    document.getElementById("cursor-type-switch-header").textContent = "On";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "cursorType",
        cursorType: $("#cursorTypeDropDown").val(),
        checkedButton: 1,
      });
    });
  } else {
    document.getElementById("cursor-type-switch-header").textContent = "Off";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "cursorType",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["cursorType"]: $("#cursorTypeDropDown").val() });
  chrome.storage.sync.set({ ["cursorTypeButton"]: $(this).is(":checked") });
});

// Cursor Type DropDown Bind
$("#cursorTypeDropDown").change(function (data) {
  if ($("#cursorTypeButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "cursorType",
        cursorType: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "cursorType",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["cursorType"]: $(data.target).val() });
});

//Font Size Slider
$(document).on("input", "#fontSizeSlider", function (data) {
  $("#fontSizeSlider_value").html($(data.target).val());
  if ($("#fontSizeButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontSize",
        fontSize: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontSize",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["fontSizeSlider"]: $(data.target).val() });
});

//Font Size Slider Button
$("#fontSizeButton").bind("change", function (data) {
  if ($(data.target).is(":checked")) {
    document.getElementById("font-size-switch-header").textContent = "On";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontSize",
        fontSize: $("#fontSizeSlider").val(),
        checkedButton: 1,
      });
    });
  } else {
    document.getElementById("font-size-switch-header").textContent = "Off";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontSize",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["fontSizeSlider"]: $("#fontSizeSlider").val() });
  chrome.storage.sync.set({
    ["fontSizeButton"]: $(data.target).is(":checked"),
  });
});

//Font Color Button
$("#fontColorButton").bind("change", function (data) {
  var pickedColor = $("input[name=color]:checked");
  if ($(data.target).is(":checked")) {
    document.getElementById("font-color-switch-header").textContent = "On";
    if (pickedColor.length > 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          todo: "fontColor",
          fontColor: pickedColor[0].value,
          checkedButton: 1,
        });
      });
    }
  } else {
    document.getElementById("font-color-switch-header").textContent = "Off";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontColor",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({
    ["fontColor"]: pickedColor.length > 0 ? pickedColor[0].value : "#C0382B",
  });
  chrome.storage.sync.set({
    ["fontColorId"]: pickedColor.length > 0 ? pickedColor[0].id : "color-12",
  });
  chrome.storage.sync.set({
    ["fontColorButton"]: $(data.target).is(":checked"),
  });
});

// Font Color Palette
$("input[name=color]").bind("change", function (data) {
  if ($("#fontColorButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontColor",
        fontColor: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "fontColor",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["fontColor"]: $(data.target).val() });
  chrome.storage.sync.set({ ["fontColorId"]: $(data.target).attr("id") });
});

// Magnifier Button
$("#magnifierButton").bind("change", function (data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "magnify",
      magnifierSize: $("#magnifierSizeSlider").val(),
      magnification: $("#magnificationSlider").val(),
      checkedButton: $(data.target).is(":checked") ? 1 : 0,
    });
  });
  chrome.storage.sync.set({
    ["magnifyButton"]: $(data.target).is(":checked"),
  });
});

//Magnifier Size Slider
$(document).on("input", "#magnifierSizeSlider", function (data) {
  $("#magnifierSizeSlider_value").html($(data.target).val());
  if ($("#magnifierButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "magnify",
        magnifierSize: $(data.target).val(),
        magnification: $("#magnificationSlider").val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "magnify",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["magnifierSizeSlider"]: $(data.target).val() });
});

//Magnification Slider
$(document).on("input", "#magnificationSlider", function (data) {
  $("#magnificationSlider_value").html($(data.target).val());
  if ($("#magnifierButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "magnify",
        magnifierSize: $("#magnifierSizeSlider").val(),
        magnification: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "magnify",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["magnificationSlider"]: $(data.target).val() });
});

// Image Veil Button
$("#imageVeilButton").bind("change", function (data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "imageVeil",
      checkedButton: $(data.target).is(":checked") ? 1 : 0,
    });
  });
  chrome.storage.sync.set({
    ["imageVeilButton"]: $(data.target).is(":checked"),
  });
});

// Highlight Words Button
$("#highlightWordsButton").bind("change", function (data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "highlight",
      checkedButton: $(data.target).is(":checked") ? 1 : 0,
    });
  });
  chrome.storage.sync.set({
    ["highlightWordsButton"]: $(data.target).is(":checked"),
  });
});

// Reading Ruler Setting (restore checkbox state)
chrome.storage.sync.get("readingRulerButton", function (stored) {
  $("#readingRulerButton").prop("checked", stored.readingRulerButton);
});

// Reading Ruler Button
$("#readingRulerButton").bind("change", function (data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "readingRuler",
      checkedButton: $(data.target).is(":checked") ? 1 : 0,
    });
  });
  chrome.storage.sync.set({
    ["readingRulerButton"]: $(data.target).is(":checked"),
  });
});

// ---- Simple on/off toggle features (Bionic, Reader, Syllable, Dictionary) ----
function aidlySimpleToggle(btnId, todo, storeKey) {
  chrome.storage.sync.get(storeKey, function (stored) {
    $("#" + btnId).prop("checked", stored[storeKey]);
  });
  $("#" + btnId).bind("change", function (data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: todo,
        checkedButton: $(data.target).is(":checked") ? 1 : 0,
      });
    });
    var obj = {};
    obj[storeKey] = $(data.target).is(":checked");
    chrome.storage.sync.set(obj);
  });
}
aidlySimpleToggle("bionicButton", "bionic", "bionicButton");
aidlySimpleToggle("readerModeButton", "readerMode", "readerModeButton");
aidlySimpleToggle("syllableButton", "syllable", "syllableButton");
aidlySimpleToggle("hoverDictButton", "hoverDict", "hoverDictButton");

// ---- Color-Blind Correction (mode + intensity + on/off) ----
function cbSend() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "colorBlindCorrect",
      checkedButton: $("#colorBlindButton").is(":checked") ? 1 : 0,
      mode: $("#cbMode").val(),
      intensity: ($("#cbIntensitySlider").val() || 100) / 100,
    });
  });
}
chrome.storage.sync.get(["colorBlindButton", "cbMode", "cbIntensity"], function (s) {
  $("#colorBlindButton").prop("checked", s.colorBlindButton);
  document.getElementById("color-blind-switch-header").textContent = s.colorBlindButton ? "On" : "Off";
  if (s.cbMode) $("#cbMode").val(s.cbMode);
  if (s.cbIntensity != null) {
    $("#cbIntensitySlider").val(s.cbIntensity);
    $("#cbIntensitySlider_value").html(s.cbIntensity);
  }
});
$("#colorBlindButton").bind("change", function (data) {
  document.getElementById("color-blind-switch-header").textContent = $(data.target).is(":checked") ? "On" : "Off";
  chrome.storage.sync.set({ ["colorBlindButton"]: $(data.target).is(":checked") });
  cbSend();
});
$("#cbMode").bind("change", function () {
  chrome.storage.sync.set({ ["cbMode"]: $(this).val() });
  if ($("#colorBlindButton").is(":checked")) cbSend();
});
$("#cbIntensitySlider").on("input change", function () {
  $("#cbIntensitySlider_value").html($(this).val());
  chrome.storage.sync.set({ ["cbIntensity"]: $(this).val() });
  if ($("#colorBlindButton").is(":checked")) cbSend();
});

// ---- Read Aloud (play / pause / stop + rate) ----
function readAloudSend(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "readAloud",
      action: action,
      rate: ($("#readAloudRateSlider").val() || 100) / 100,
    });
  });
}
$("#readAloudPlay").bind("click", function () { readAloudSend("play"); });
$("#readAloudPause").bind("click", function () { readAloudSend("pause"); });
$("#readAloudStop").bind("click", function () { readAloudSend("stop"); });
chrome.storage.sync.get("readAloudRate", function (s) {
  if (s.readAloudRate) {
    $("#readAloudRateSlider").val(s.readAloudRate);
    $("#readAloudRateSlider_value").html(s.readAloudRate);
  }
});
$("#readAloudRateSlider").on("input change", function () {
  $("#readAloudRateSlider_value").html($(this).val());
  chrome.storage.sync.set({ ["readAloudRate"]: $(this).val() });
});

// ---- Text Spacing (line / letter / word + on-off) ----
function spacingSend() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "spacing",
      checkedButton: $("#spacingButton").is(":checked") ? 1 : 0,
      line: ($("#lineSpacingSlider").val() || 180) / 100,
      letter: parseInt($("#letterSpacingSlider").val() || 0, 10),
      word: parseInt($("#wordSpacingSlider").val() || 0, 10),
    });
  });
}
chrome.storage.sync.get(["spacingButton", "lineSpacing", "letterSpacing", "wordSpacing"], function (s) {
  $("#spacingButton").prop("checked", s.spacingButton);
  document.getElementById("spacing-switch-header").textContent = s.spacingButton ? "On" : "Off";
  if (s.lineSpacing) { $("#lineSpacingSlider").val(s.lineSpacing); }
  if (s.letterSpacing != null) { $("#letterSpacingSlider").val(s.letterSpacing); }
  if (s.wordSpacing != null) { $("#wordSpacingSlider").val(s.wordSpacing); }
  $("#lineSpacingSlider_value").html((($("#lineSpacingSlider").val()) / 100).toFixed(1));
  $("#letterSpacingSlider_value").html($("#letterSpacingSlider").val());
  $("#wordSpacingSlider_value").html($("#wordSpacingSlider").val());
});
$("#lineSpacingSlider").on("input change", function () {
  $("#lineSpacingSlider_value").html(($(this).val() / 100).toFixed(1));
  chrome.storage.sync.set({ ["lineSpacing"]: $(this).val() });
  if ($("#spacingButton").is(":checked")) spacingSend();
});
$("#letterSpacingSlider").on("input change", function () {
  $("#letterSpacingSlider_value").html($(this).val());
  chrome.storage.sync.set({ ["letterSpacing"]: $(this).val() });
  if ($("#spacingButton").is(":checked")) spacingSend();
});
$("#wordSpacingSlider").on("input change", function () {
  $("#wordSpacingSlider_value").html($(this).val());
  chrome.storage.sync.set({ ["wordSpacing"]: $(this).val() });
  if ($("#spacingButton").is(":checked")) spacingSend();
});
$("#spacingButton").bind("change", function (data) {
  document.getElementById("spacing-switch-header").textContent = $(data.target).is(":checked") ? "On" : "Off";
  chrome.storage.sync.set({ ["spacingButton"]: $(data.target).is(":checked") });
  spacingSend();
});

// ---- Auto Scroll (on/off + speed) ----
function autoScrollSend() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "autoScroll",
      checkedButton: $("#autoScrollButton").is(":checked") ? 1 : 0,
      speed: parseInt($("#autoScrollSlider").val() || 3, 10),
    });
  });
}
chrome.storage.sync.get(["autoScrollButton", "autoScrollSpeed"], function (s) {
  $("#autoScrollButton").prop("checked", s.autoScrollButton);
  document.getElementById("auto-scroll-switch-header").textContent = s.autoScrollButton ? "On" : "Off";
  if (s.autoScrollSpeed != null) {
    $("#autoScrollSlider").val(s.autoScrollSpeed);
    $("#autoScrollSlider_value").html(s.autoScrollSpeed);
  }
});
$("#autoScrollSlider").on("input change", function () {
  $("#autoScrollSlider_value").html($(this).val());
  chrome.storage.sync.set({ ["autoScrollSpeed"]: $(this).val() });
  if ($("#autoScrollButton").is(":checked")) autoScrollSend();
});
$("#autoScrollButton").bind("change", function (data) {
  document.getElementById("auto-scroll-switch-header").textContent = $(data.target).is(":checked") ? "On" : "Off";
  chrome.storage.sync.set({ ["autoScrollButton"]: $(data.target).is(":checked") });
  autoScrollSend();
});

// Emphasize Links Button
$("#emphasizeLinksButton").bind("change", function (data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "emphasizeLinks",
      checkedButton: $(data.target).is(":checked") ? 1 : 0,
    });
  });
  chrome.storage.sync.set({
    ["emphasizeLinksButton"]: $(data.target).is(":checked"),
  });
});

//Text Stroke Button
$("#textStrokeButton").bind("change", function (data) {
  var pickedColor = $("input[name=ts-color]:checked");
  if ($(data.target).is(":checked")) {
    if (pickedColor.length > 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          todo: "textStroke",
          textStrokeColor: pickedColor[0].value,
          checkedButton: 1,
        });
      });
    }
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "textStroke",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({
    ["textStrokeColor"]:
      pickedColor.length > 0 ? pickedColor[0].value : "#C0382B",
  });
  chrome.storage.sync.set({
    ["textStrokeColorId"]:
      pickedColor.length > 0 ? pickedColor[0].id : "color-12",
  });
  chrome.storage.sync.set({
    ["textStrokeButton"]: $(data.target).is(":checked"),
  });
});

// Text Stroke Color Palette
$("input[name=ts-color]").bind("change", function (data) {
  if ($("#textStrokeButton").is(":checked")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "textStroke",
        textStrokeColor: $(data.target).val(),
        checkedButton: 1,
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        todo: "textStroke",
        checkedButton: 0,
      });
    });
  }
  chrome.storage.sync.set({ ["textStrokeColor"]: $(data.target).val() });
  chrome.storage.sync.set({ ["textStrokeColorId"]: $(data.target).attr("id") });
});

// ---- Speech Recognition (click the mic to talk) ----
// Commands: "open X", "play X", "translate X", "direction A to B", "search X".
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;
var voiceListening = false;

function showVoiceSnack(msg) {
  var x = document.getElementById("snackbar");
  if (!x) return;
  if (msg) x.textContent = msg;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

function buildRecognition() {
  if (!SpeechRecognition) return null;
  var r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = false;
  r.lang = "en-US";
  r.onresult = function (event) {
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        var txt = event.results[i][0].transcript.trim().toLowerCase();
        if (txt) sendResult(txt);
      }
    }
  };
  r.onerror = function (event) {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      voiceListening = false;
      assistant_start = 0;
      $(".activation-button").attr("src", "/assets/images/microphone-disable.png");
      showVoiceSnack("Microphone blocked. Right-click Aidly and open Options to allow it.");
    } else if (event.error === "network") {
      // Web Speech recognition is backed by Google's service, which is only
      // available in Chrome. Edge / Brave / Opera fail here with "network".
      voiceListening = false;
      assistant_start = 0;
      $(".activation-button").attr("src", "/assets/images/microphone-off.png");
      showVoiceSnack("Voice commands need Google Chrome. This browser doesn't support speech recognition.");
    } else if (event.error === "no-speech") {
      // ignore; onend will restart while listening
    }
  };
  r.onend = function () {
    // keep listening until the user clicks stop
    if (voiceListening) {
      try { r.start(); } catch (e) {}
    }
  };
  return r;
}

async function startVoice() {
  if (!SpeechRecognition) {
    showVoiceSnack("Voice recognition is not supported in this browser.");
    return;
  }
  // Ensure microphone permission (persists for the extension origin).
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(function (t) { t.stop(); });
  } catch (e) {
    showVoiceSnack("Microphone permission denied. Allow it via Aidly > Options.");
    return;
  }
  if (!recognition) recognition = buildRecognition();
  voiceListening = true;
  assistant_start = 1;
  $(".activation-button").attr("src", "/assets/images/microphone-on.png");
  showVoiceSnack("Listening… say open, play, translate or search.");
  try { recognition.start(); } catch (e) { /* already started */ }
}

function stopVoice() {
  voiceListening = false;
  assistant_start = 0;
  $(".activation-button").attr("src", "/assets/images/microphone-off.png");
  if (recognition) { try { recognition.stop(); } catch (e) {} }
}

const startButton = document.getElementsByClassName("activation-button")[0];
startButton.addEventListener("click", function () {
  chrome.storage.sync.get("assistant_enable", function (stored) {
    if (!stored.assistant_enable) {
      $(".activation-button").attr("src", "/assets/images/microphone-disable.png");
      showVoiceSnack("Voice is off. Right-click Aidly and open Options to enable it.");
      return;
    }
    if (voiceListening) stopVoice();
    else startVoice();
  });
});


function sendResult(data) {
  var result;
  var port = chrome.runtime.connect({ name: "performAction" });
  if (data.startsWith("open ")) {
    var temp = data.slice(5);
    if (temp != null && temp !== "undefined") {
      result = "https://duckduckgo.com/?q=!" + temp;
      port.postMessage({ action: "open", result: result });
      port.onMessage.addListener(function (msg) {
        if (msg.response == "ok") {
        }
      });
    }
  } else if (data.startsWith("play ")) {
    var temp = data.slice(5);
    if (temp != null && temp !== "undefined") {
      result = "https://www.youtube.com/results?search_query=" + temp;
      port.postMessage({ action: "play", result: result });
      port.onMessage.addListener(function (msg) {
        if (msg.response == "ok") {
        }
      });
    }
  } else if (data.startsWith("translate ")) {
    var temp = data.slice(10);
    if (temp != null && temp !== "undefined") {
      result =
        "https://translate.google.com/?sl=auto&tl=en&text=" +
        temp +
        "&op=translate";
      port.postMessage({ action: "translate", result: result });
      port.onMessage.addListener(function (msg) {
        if (msg.response == "ok") {
        }
      });
    }
  } else if (data.includes("direction")) {
    var temp = data.split("to");
    if (temp != null && temp !== "undefined") {
      result =
        "https://www.google.com/maps/dir/" +
        temp[0].split("direction")[1].trim() +
        "/" +
        temp[1].trim();
      port.postMessage({ action: "direction", result: result });
      port.onMessage.addListener(function (msg) {
        if (msg.response == "ok") {
        }
      });
    }
  } else {
    // "search X" or any other phrase -> web search
    var query = data.startsWith("search ") ? data.slice(7) : data;
    result = "https://duckduckgo.com/?q=" + encodeURIComponent(query);
    port.postMessage({ action: "open", result: result });
    port.onMessage.addListener(function (msg) {
      if (msg.response == "ok") {
      }
    });
  }
}

//Print
$("#printjob").bind("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "printJob",
    });
  });
});
// Screenshot
$("#screenshotClick").bind("click", function () {
  chrome.runtime.sendMessage({
    todo: "screenshot",
  });
});

// Eye Control — open the camera/gesture window
$("#eyeControlOpen").bind("click", function () {
  chrome.windows.create({
    url: chrome.runtime.getURL("src/eye-control/eye-control.html"),
    type: "popup",
    width: 380,
    height: 560,
  });
});

// Change Cursor
$("#changeCursor").bind("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      todo: "cursor",
    });
  });
});

// window.scroll

var last_scroll_val = 0;
setInterval(function () {
  var st = $(window).scrollTop();
  if (last_scroll_val != st) {
    last_scroll_val = st;
    chrome.storage.sync.set({
      ["scrollValue"]: st,
    });
  }
}, 1000);
