// [Keep magnifier vars and function before adding chrome message listener]
/****** Size is  set in pixels... supports being written as: '250px' *******/
var magnifierSize = 50;

/******* How many times magnification of image on page. *******/
var magnification = 3;

function magnifier() {
  this.magnifyImg = function (ptr, magnification, magnifierSize) {
    $("body").prepend('<div class="magnify"></div>');

    var $pointer;
    if (typeof ptr == "string") {
      $pointer = $(ptr);
    } else if (typeof ptr == "object") {
      $pointer = ptr;
    }

    if (!$pointer.is("img")) {
      return false;
    }

    magnification = +magnification;

    $pointer.hover(
      function () {
        $(this).css("cursor", "none");
        $(".magnify").show();
        //Setting some variables for later use
        var width = $(this).width();
        var height = $(this).height();
        var src = $(this).attr("src");
        var imagePos = $(this).offset();
        var image = $(this);

        if (magnifierSize == undefined) {
          magnifierSize = "150px";
        }

        $(".magnify").css({
          "background-size":
            width * magnification + "px " + height * magnification + "px",
          "background-image": 'url("' + src + '")',
          width: magnifierSize,
          height: magnifierSize,
        });

        //Setting a few more...
        var magnifyOffset = +($(".magnify").width() / 2);
        var rightSide = +(imagePos.left + $(this).width());
        var bottomSide = +(imagePos.top + $(this).height());

        $(document).mousemove(function (e) {
          if (
            e.pageX < +(imagePos.left - magnifyOffset / 6) ||
            e.pageX > +(rightSide + magnifyOffset / 6) ||
            e.pageY < +(imagePos.top - magnifyOffset / 6) ||
            e.pageY > +(bottomSide + magnifyOffset / 6)
          ) {
            $(".magnify").hide();
            $(document).unbind("mousemove");
          }
          var backgroundPos =
            "" -
            ((e.pageX - imagePos.left) * magnification - magnifyOffset) +
            "px " +
            -((e.pageY - imagePos.top) * magnification - magnifyOffset) +
            "px";
          $(".magnify").css({
            left: e.pageX - magnifyOffset,
            top: e.pageY - magnifyOffset,
            "background-position": backgroundPos,
          });
        });
      },
      function () {}
    );
  };

  this.removeMagnifier = function (ptr) {
    var $pointer;
    if (typeof ptr == "string") {
      $pointer = $(ptr);
    } else if (typeof ptr == "object") {
      $pointer = ptr;
    }

    if (!$pointer.is("img")) {
      return false;
    }

    $pointer.hover(function () {
      $(this).css("cursor", "default");
    });
    $(".magnify").remove();
  };

  this.init = function () {};

  return this.init();
}

var magnify = new magnifier();

var images = [];
var imageSource = [];

// Communication with popup.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Changing color of font
  if (message.todo == "fontColor") {
    if (message.checkedButton == 0) {
      $("#aidly-font-color").remove();
    } else {
      if ($("#aidly-font-color") != null) {
        $("#aidly-font-color").remove();
      }
      $(
        "<style id='aidly-font-color'>:not(a), :not(img)  { color: " +
          message.fontColor +
          "! important; }</style>"
      ).appendTo("head");
    }
  }

  // Changing Font Family
  if (message.todo == "fontFamily") {
    if (message.checkedButton == 0) {
      $("#aidly-font-family").remove();
    } else {
      if ($("#aidly-font-family") != null) {
        $("#aidly-font-family").remove();
      }
      $(
        "<link rel='stylesheet' type='text/css' id='aidly-font-family' href='chrome-extension://" +
          chrome.runtime.id +
          "/assets/fonts/css/" +
          message.fontFamily +
          ".css'>"
      ).appendTo("head");
    }
  }

  // Changing Font Size
  if (message.todo == "fontSize") {
    if (message.checkedButton == 0) {
      $("#aidly-font-size").remove();
    } else {
      if ($("#aidly-font-size") != null) {
        $("#aidly-font-size").remove();
      }
      $(
        "<style id='aidly-font-size'> p,a,h1,h2,h4,h3,h5,h6,input,ul,span,strong,th,td,ul,li,ol,button  { font-size: " +
          message.fontSize.toString() +
          "px" +
          "!important; }</style>"
      ).appendTo("head");
    }
  }

  // Magnify Image Feature
  if (message.todo == "magnify") {
    if (message.checkedButton == 0) {
      magnify.removeMagnifier("img");
    } else {
      magnify.magnifyImg("img", message.magnification, message.magnifierSize);
    }
  }

  //Change Cursor
  if (message.todo == "cursorType") {
    if (message.checkedButton == 0) {
      $("body").css({
        cursor: "",
      });
    } else {
      $("body").css({
        cursor:
          "url(chrome-extension://" +
          chrome.runtime.id +
          "/assets/images/" +
          message.cursorType +
          ") 4 28,auto",
      });
    }
  }

  // Image Veil
  if (message.todo == "imageVeil") {
    if (images.length === 0 && imageSource.length === 0) {
      images = document.getElementsByTagName("img");
      for (var i = 0; i < images.length; i++) {
        imageSource.push(images[i].src || images[i].srcset);
      }
    }
    if (message.checkedButton == 0) {
      for (var i = 0; i < images.length; i++) {
        images[i].src = imageSource[i];
      }
      images = [];
      imageSource = [];
    } else {
      for (var i = 0, l = images.length; i < l; i++) {
        images[i].removeAttribute("srcset");
        images[i].src =
          "https://via.placeholder.com/" +
          images[i].width +
          "x" +
          images[i].height +
          "?text=" +
          images[i].alt.replace(/ /g, "+");
      }
    }
  }

  // Highlight Words
  if (message.todo == "highlight") {
    if (message.checkedButton == 0) {
      if ($("p,h1,h2,h4,h3,h5,h6,li").hasClass("word_split")) {
        $("p,h1,h2,h4,h3,h5,h6,li").removeClass("word_split");
      }
    } else {
      $(document).ready(function () {
        $("p,h1,h2,h4,h3,h5,h6,li").addClass("word_split");
        $(".word_split").lettering("words");
      });
    }
  }

  // Speak TTS
  if (message.todo == "speakTTS") {
    var msg = new SpeechSynthesisUtterance();
    msg.text = message.selectedText;
    window.speechSynthesis.speak(msg);
  }

  // Emphasize Links
  if (message.todo == "emphasizeLinks") {
    if (message.checkedButton == 0) {
      var anchors = document.getElementsByTagName("a");
      for (var i = 0; i < anchors.length; i++) {
        anchors[i].classList.remove("emphasize");
      }
    } else {
      $(document).ready(function () {
        var anchors = document.getElementsByTagName("a");
        for (var i = 0; i < anchors.length; i++) {
          anchors[i].classList.add("emphasize");
        }
      });
    }
  }

  // Text Stroke
  if (message.todo == "textStroke") {
    if (message.checkedButton == 0) {
      $("#text-stroke").remove();
    } else {
      $(document).ready(function () {
        if ($("#text-stroke") != null) {
          $("#text-stroke").remove();
        }
        $(
          "<style id='text-stroke'> p,h1,h2,h3,h4,h5,h6,b,a,li,lo,ul  { -webkit-text-fill-color: white; -webkit-text-stroke-width: 1px; -webkit-text-stroke-color: " +
            message.textStrokeColor +
            " !important; }</style>"
        ).appendTo("head");
      });
    }
  }
  //****** ---- Bionic Reading: bold the leading half of each word ---- ******
  if (message.todo == "bionic") {
    var BIONIC_SEL = "p, li, td, span, h1, h2, h3, h4, h5, h6, a, blockquote, dd, dt";
    if (message.checkedButton == 0) {
      var bionicNodes = document.querySelectorAll("b.aidly-bionic");
      bionicNodes.forEach(function (b) {
        var parent = b.parentNode;
        if (parent) { parent.replaceChild(document.createTextNode(b.textContent), b); parent.normalize(); }
      });
    } else {
      var boldWord = function (w) {
        if (w.length <= 1) return w;
        var n = Math.ceil(w.length / 2);
        return "<b class='aidly-bionic'>" + w.slice(0, n) + "</b>" + w.slice(n);
      };
      var walkBionic = function (root) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        var nodes = [];
        var nd;
        while ((nd = walker.nextNode())) {
          if (!nd.nodeValue.trim()) continue;
          var p = nd.parentNode;
          if (!p) continue;
          var tag = p.nodeName.toLowerCase();
          if (["script", "style", "noscript", "textarea", "input", "code", "pre"].indexOf(tag) >= 0) continue;
          if (p.closest && p.closest("b.aidly-bionic")) continue;
          nodes.push(nd);
        }
        nodes.forEach(function (textNode) {
          var html = textNode.nodeValue.replace(/[A-Za-z\u00C0-\u024F]+/g, boldWord);
          if (html !== textNode.nodeValue) {
            var span = document.createElement("span");
            span.className = "aidly-bionic-wrap";
            span.innerHTML = html;
            textNode.parentNode.replaceChild(span, textNode);
          }
        });
      };
      document.querySelectorAll(BIONIC_SEL).forEach(function (el) {
        if (!el.querySelector(".aidly-bionic")) walkBionic(el);
      });
    }
  }

  //****** ---- Line & letter spacing ---- ******
  if (message.todo == "spacing") {
    var old = document.getElementById("aidly-spacing");
    if (old) old.remove();
    if (message.checkedButton != 0) {
      var line = message.line || 1.8;
      var letter = (message.letter || 0) + "px";
      var word = (message.word || 0) + "px";
      var st = document.createElement("style");
      st.id = "aidly-spacing";
      st.textContent =
        "p,li,td,span,h1,h2,h3,h4,h5,h6,a,div,blockquote{line-height:" + line +
        "!important;letter-spacing:" + letter + "!important;word-spacing:" + word + "!important;}";
      document.head.appendChild(st);
    }
  }

  //****** ---- Syllable splitter: insert soft hyphenation points ---- ******
  if (message.todo == "syllable") {
    var SYL_SEL = "p, li, td, h1, h2, h3, h4, h5, h6, blockquote, dd";
    if (message.checkedButton == 0) {
      document.querySelectorAll("span.aidly-syl").forEach(function (s) {
        var parent = s.parentNode;
        if (parent) { parent.replaceChild(document.createTextNode(s.textContent.replace(/\u00B7/g, "")), s); parent.normalize(); }
      });
    } else {
      var splitSyllables = function (word) {
        if (word.length <= 3) return word;
        // lightweight English heuristic: break between vowel-consonant-consonant-vowel
        // and after a vowel followed by a consonant+vowel.
        var out = word.replace(/([aeiouyAEIOUY])([^aeiouyAEIOUY\s])([aeiouyAEIOUY])/g, "$1\u00B7$2$3");
        out = out.replace(/([^aeiouyAEIOUY\s])([^aeiouyAEIOUY\s])/g, function (m, a, b) {
          return a + "\u00B7" + b;
        });
        return out;
      };
      var walkSyl = function (root) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        var nodes = [], nd;
        while ((nd = walker.nextNode())) {
          if (!nd.nodeValue.trim()) continue;
          var tag = nd.parentNode && nd.parentNode.nodeName.toLowerCase();
          if (["script", "style", "noscript", "code", "pre", "a"].indexOf(tag) >= 0) continue;
          if (nd.parentNode.closest && nd.parentNode.closest(".aidly-syl")) continue;
          nodes.push(nd);
        }
        nodes.forEach(function (textNode) {
          var newText = textNode.nodeValue.replace(/[A-Za-z]{4,}/g, splitSyllables);
          if (newText !== textNode.nodeValue) {
            var span = document.createElement("span");
            span.className = "aidly-syl";
            span.textContent = newText;
            textNode.parentNode.replaceChild(span, textNode);
          }
        });
      };
      document.querySelectorAll(SYL_SEL).forEach(walkSyl);
    }
  }

  //****** ---- Reader Mode: declutter to a clean article ---- ******
  if (message.todo == "readerMode") {
    var existing = document.getElementById("aidly-reader");
    if (message.checkedButton == 0) {
      if (existing) existing.remove();
      var style = document.getElementById("aidly-reader-style");
      if (style) style.remove();
      document.documentElement.style.overflow = "";
    } else if (!existing) {
      // pick the biggest text container as the "article"
      var best = null, bestScore = 0;
      document.querySelectorAll("article, main, [role=main], .post, .article, #content, .content, .entry-content").forEach(function (c) {
        var len = (c.innerText || "").length;
        if (len > bestScore) { bestScore = len; best = c; }
      });
      if (!best) {
        var paras = Array.from(document.querySelectorAll("p"));
        if (paras.length) {
          var counts = {};
          paras.forEach(function (p) {
            var par = p.parentElement; if (!par) return;
            counts[par.tagName + (par.className || "")] = (counts[par.tagName + (par.className || "")] || 0) + (p.innerText || "").length;
            if (!best || (par.innerText || "").length > (best.innerText || "").length) best = par;
          });
        }
      }
      var html = best ? best.innerHTML : "<p>Could not detect article content.</p>";
      var s = document.createElement("style");
      s.id = "aidly-reader-style";
      s.textContent = "#aidly-reader{position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#f7f4ec;color:#1a1a1a;}" +
        "#aidly-reader .aidly-reader-inner{max-width:740px;margin:40px auto;padding:0 24px 80px;font-size:20px;line-height:1.8;font-family:Georgia,serif;}" +
        "#aidly-reader img{max-width:100%;height:auto;}" +
        "#aidly-reader a{color:#1a5fb4;}" +
        "#aidly-reader-close{position:fixed;top:14px;right:18px;z-index:2147483647;background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:15px;cursor:pointer;}";
      document.head.appendChild(s);
      var overlay = document.createElement("div");
      overlay.id = "aidly-reader";
      overlay.innerHTML = "<button id='aidly-reader-close'>Close reader</button><div class='aidly-reader-inner'>" + html + "</div>";
      document.body.appendChild(overlay);
      document.documentElement.style.overflow = "hidden";
      var closeBtn = document.getElementById("aidly-reader-close");
      if (closeBtn) closeBtn.addEventListener("click", function () {
        overlay.remove(); if (s) s.remove(); document.documentElement.style.overflow = "";
        chrome.storage.sync.set({ ["readerModeButton"]: false });
      });
    }
  }

  //****** ---- Hover Dictionary: hover a word -> definition tooltip ---- ******
  if (message.todo == "hoverDict") {
    if (message.checkedButton == 0) {
      if (window.__aidlyDictMove) {
        document.removeEventListener("dblclick", window.__aidlyDictMove);
        window.__aidlyDictMove = null;
      }
      var tip = document.getElementById("aidly-dict-tip");
      if (tip) tip.remove();
    } else {
      var tipEl = document.getElementById("aidly-dict-tip");
      if (!tipEl) {
        tipEl = document.createElement("div");
        tipEl.id = "aidly-dict-tip";
        tipEl.style.cssText =
          "position:fixed;max-width:320px;z-index:2147483647;background:#1a1a1a;color:#fff;" +
          "padding:10px 12px;border-radius:8px;font:14px/1.5 system-ui;box-shadow:0 4px 18px rgba(0,0,0,.35);display:none;";
        document.body.appendChild(tipEl);
      }
      // double-click a word to look it up (avoids spamming the API on every hover)
      window.__aidlyDictMove = function (e) {
        var sel = (window.getSelection().toString() || "").trim();
        var word = sel.split(/\s+/)[0];
        if (!word || !/^[A-Za-z'-]{2,}$/.test(word)) return;
        tipEl.style.left = Math.min(e.clientX + 12, window.innerWidth - 340) + "px";
        tipEl.style.top = Math.min(e.clientY + 12, window.innerHeight - 120) + "px";
        tipEl.style.display = "block";
        tipEl.textContent = "Looking up “" + word + "”…";
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word.toLowerCase()))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (Array.isArray(d) && d[0] && d[0].meanings && d[0].meanings[0]) {
              var m = d[0].meanings[0];
              var def = m.definitions[0].definition;
              tipEl.innerHTML = "<b>" + word + "</b> <i>(" + (m.partOfSpeech || "") + ")</i><br>" + def;
            } else {
              tipEl.textContent = "No definition found for “" + word + "”.";
            }
          })
          .catch(function () { tipEl.textContent = "Lookup failed (offline?)."; });
      };
      document.addEventListener("dblclick", window.__aidlyDictMove);
    }
  }

  //****** ---- Read Aloud whole page (TTS) with word-by-word highlight ---- ******
  if (message.todo == "readAloud") {
    var synth = window.speechSynthesis;
    if (message.action == "stop") {
      synth.cancel();
      var hl = document.getElementById("aidly-tts-style");
      if (hl) hl.remove();
      document.querySelectorAll(".aidly-tts-word").forEach(function (s) {
        var p = s.parentNode; if (p) { p.replaceChild(document.createTextNode(s.textContent), s); p.normalize(); }
      });
    } else if (message.action == "pause") {
      if (synth.speaking && !synth.paused) synth.pause();
    } else if (message.action == "resume") {
      if (synth.paused) synth.resume();
    } else if (message.action == "play") {
      synth.cancel();
      // gather visible main text
      var container = document.querySelector("article, main, [role=main]") || document.body;
      var text = (container.innerText || "").replace(/\s+/g, " ").trim();
      if (!text) { return; }
      if (!document.getElementById("aidly-tts-style")) {
        var st = document.createElement("style");
        st.id = "aidly-tts-style";
        st.textContent = ".aidly-tts-active{background:#ffe66d!important;color:#000!important;border-radius:3px;}";
        document.head.appendChild(st);
      }
      var u = new SpeechSynthesisUtterance(text);
      u.rate = message.rate || 1.0;
      //****** highlight a small banner showing the spoken word (lightweight, robust) ******
      var banner = document.getElementById("aidly-tts-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "aidly-tts-banner";
        banner.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);" +
          "z-index:2147483647;background:#1a1a1a;color:#fff;padding:10px 16px;border-radius:10px;" +
          "font:18px/1.2 system-ui;box-shadow:0 4px 18px rgba(0,0,0,.35);max-width:80%;";
        document.body.appendChild(banner);
      }
      u.onboundary = function (ev) {
        if (ev.name === "word" || ev.charIndex != null) {
          var rest = text.slice(ev.charIndex);
          var w = (rest.match(/^\S+/) || [""])[0];
          banner.textContent = w;
        }
      };
      u.onend = function () { if (banner) banner.remove(); };
      synth.speak(u);
    }
  }

  //****** ---- Color-blind correction (daltonization) with mode + intensity ---- ******
  if (message.todo == "colorBlindCorrect") {
    var CB_BASE = {
      // Corrected = M * RGB  (daltonization correction matrices)
      protanopia: [
        1.0, 0.0, 0.0,
        -0.2549, 1.2549, 0.0,
        0.3031, -0.5451, 1.2420
      ],
      deuteranopia: [
        1.0, 0.0, 0.0,
        -0.4375, 1.4375, 0.0,
        0.2625, -0.5625, 1.3000
      ],
      tritanopia: [
        1.0, 0.0, 0.0,
        0.0350, 1.5320, -0.5670,
        0.0350, -0.5100, 1.4750
      ]
    };
    var svg = document.getElementById("aidly-cb-svg");
    if (message.checkedButton == 0 || !CB_BASE[message.mode]) {
      document.documentElement.style.filter = "";
      if (svg) svg.remove();
    } else {
      var t = (typeof message.intensity === "number") ? message.intensity : 1;
      var I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      var base = CB_BASE[message.mode];
      // interpolate identity -> correction by intensity t
      var m = base.map(function (v, i) { return I3[i] * (1 - t) + v * t; });
      // build 4x5 feColorMatrix string
      var vals =
        m[0] + " " + m[1] + " " + m[2] + " 0 0 " +
        m[3] + " " + m[4] + " " + m[5] + " 0 0 " +
        m[6] + " " + m[7] + " " + m[8] + " 0 0 " +
        "0 0 0 1 0";
      if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "aidly-cb-svg";
        svg.setAttribute("style", "position:absolute;width:0;height:0;");
        svg.innerHTML =
          "<defs><filter id='aidly-cb-filter'>" +
          "<feColorMatrix id='aidly-cb-mat' type='matrix' values='" + vals + "'/>" +
          "</filter></defs>";
        document.body.appendChild(svg);
      } else {
        svg.querySelector("#aidly-cb-mat").setAttribute("values", vals);
      }
      document.documentElement.style.filter = "url(#aidly-cb-filter)";
    }
  }

  if (message.todo == "printJob") {
    window.print();
  }

  //****** ---- Reading Ruler: a band that follows the cursor; dims the rest ---- ******
  if (message.todo == "readingRuler") {
    if (message.checkedButton == 0) {
      if (window.__aidlyRulerMove) {
        document.removeEventListener("mousemove", window.__aidlyRulerMove);
        window.__aidlyRulerMove = null;
      }
      var top = document.getElementById("aidly-ruler-top");
      var bot = document.getElementById("aidly-ruler-bottom");
      var line = document.getElementById("aidly-ruler-line");
      if (top) top.remove();
      if (bot) bot.remove();
      if (line) line.remove();
    } else {
      var bandH = message.bandHeight || 44;
      var dim = (typeof message.dim === "number") ? message.dim : 0.55;
      var color = message.color || "rgba(255, 235, 120, 0.18)";

      var mk = function (id) {
        var d = document.getElementById(id);
        if (!d) {
          d = document.createElement("div");
          d.id = id;
          d.style.cssText =
            "position:fixed;left:0;width:100%;pointer-events:none;z-index:2147483646;";
          document.body.appendChild(d);
        }
        return d;
      };
      var topMask = mk("aidly-ruler-top");
      var botMask = mk("aidly-ruler-bottom");
      var band = mk("aidly-ruler-line");
      topMask.style.top = "0";
      botMask.style.bottom = "0";
      topMask.style.background = "rgba(0,0,0," + dim + ")";
      botMask.style.background = "rgba(0,0,0," + dim + ")";
      band.style.background = color;
      band.style.height = bandH + "px";
      band.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.15)";

      var place = function (y) {
        var topH = Math.max(0, y - bandH / 2);
        topMask.style.height = topH + "px";
        band.style.top = topH + "px";
        var botTop = topH + bandH;
        botMask.style.height = Math.max(0, window.innerHeight - botTop) + "px";
        botMask.style.top = botTop + "px";
        botMask.style.bottom = "auto";
      };
      place(window.innerHeight / 2);

      if (window.__aidlyRulerMove) {
        document.removeEventListener("mousemove", window.__aidlyRulerMove);
      }
      window.__aidlyRulerMove = function (e) { place(e.clientY); };
      document.addEventListener("mousemove", window.__aidlyRulerMove);
    }
  }

  // ---- Eye Control actions (scroll / zoom / bring to top) ----
  if (message.todo == "eyeAction") {
    if (window.__aidlyZoom === undefined) window.__aidlyZoom = 1;
    if (message.action == "scrollDown") {
      window.scrollBy({ top: message.value || 80, left: 0, behavior: "auto" });
    } else if (message.action == "scrollUp") {
      window.scrollBy({ top: -(message.value || 80), left: 0, behavior: "auto" });
    } else if (message.action == "bringTop") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } else if (message.action == "zoomIn") {
      window.__aidlyZoom = Math.min(window.__aidlyZoom * 1.1, 3);
      document.body.style.zoom = window.__aidlyZoom;
    } else if (message.action == "zoomOut") {
      window.__aidlyZoom = Math.max(window.__aidlyZoom / 1.1, 0.4);
      document.body.style.zoom = window.__aidlyZoom;
    } else if (message.action == "zoomReset") {
      window.__aidlyZoom = 1;
      document.body.style.zoom = 1;
    }
  }

  //****** ---- Auto Scroll: gently scroll the page at a steady pace ---- ******
  if (message.todo == "autoScroll") {
    if (window.__aidlyAutoScroll) {
      clearInterval(window.__aidlyAutoScroll);
      window.__aidlyAutoScroll = null;
    }
    if (message.checkedButton != 0) {
      //****** speed is 1..10 -> pixels moved per ~16ms tick ******
      var pxPerTick = Math.max(1, Number(message.speed) || 3);
      window.__aidlyAutoScroll = setInterval(function () {
        var before = window.scrollY || window.pageYOffset;
        window.scrollBy(0, pxPerTick);
        var after = window.scrollY || window.pageYOffset;
        //****** reached the bottom: stop automatically ******
        if (after === before) {
          clearInterval(window.__aidlyAutoScroll);
          window.__aidlyAutoScroll = null;
        }
      }, 16);
    }
  }
});
