// Keep-alive ticker for Aidly Head & Eye Control.
// Web Workers are NOT throttled when the window is minimized/hidden,
// so this drives the detection loop at full rate even in the background.
let timer = null;
self.onmessage = function (e) {
  const msg = e.data || {};
  if (msg.cmd === "start") {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { self.postMessage("tick"); }, msg.ms || 60);
  } else if (msg.cmd === "stop") {
    if (timer) { clearInterval(timer); timer = null; }
  }
};
