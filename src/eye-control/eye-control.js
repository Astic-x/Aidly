// Aidly Head & Eye Control — ported from the working Python head_gaze_test.
//
//  • Head pose (yaw/pitch from FaceLandmarker transformation matrix) -> scroll/zoom
//  • Eye blendshapes (blink) -> double-blink screenshot, long-blink bring-to-top, winks
//  • Open palm (GestureRecognizer) -> pause / resume toggle
//
// Commands are sent to the active web tab via the background service worker
// (which injects them with chrome.scripting.executeScript).

import { FaceLandmarker, GestureRecognizer, FilesetResolver } from "/vendor/mediapipe/vision_bundle.mjs";

const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const octx = overlay.getContext("2d");
const status2 = document.getElementById("status2");
const gestureEl = document.getElementById("gesture");
const startBtn = document.getElementById("startBtn");
const recenterBtn = document.getElementById("recenterBtn");
const toggleBtn = document.getElementById("toggleBtn");
const pitchThreshEl = document.getElementById("pitchThresh");
const yawThreshEl = document.getElementById("yawThresh");
const blinkThreshEl = document.getElementById("blinkThresh");
const scrollSpeedEl = document.getElementById("scrollSpeed");
const statusDot = document.getElementById("statusDot");

// wire slider value chips
[["pitchThresh"], ["yawThresh"], ["blinkThresh"], ["scrollSpeed"]].forEach(function (a) {
  const el = document.getElementById(a[0]);
  const val = document.getElementById(a[0] + "Val");
  if (el && val) {
    const upd = () => { val.textContent = el.value; };
    el.addEventListener("input", upd);
    upd();
  }
});

let faceLandmarker = null;
let gestureRecognizer = null;
let booted = false;
let controlEnabled = false;
let paused = false;            // palm-toggled
let palmArmed = true;
let lastPalmToggle = 0;
let lastVideoTime = -1;
let tickWorker = null;

// head-pose neutral baseline + state
let basePitch = null, baseYaw = null;
let calib = [];
const st = {
  bothClosedSince: 0, longFired: false, blinkCount: 0, blinkWindow: 0,
  lastShot: 0, lastBring: 0, lastZoom: 0, lastScroll: 0, lastWink: 0,
};

function setGesture(t) {
  gestureEl.textContent = t;
  gestureEl.classList.toggle("show", !!t);
  if (t) setTimeout(() => {
    if (gestureEl.textContent === t) { gestureEl.textContent = ""; gestureEl.classList.remove("show"); }
  }, 800);
}
function sendCmd(cmd, value) {
  if (!controlEnabled || paused) return;
  try { chrome.runtime.sendMessage({ type: "EYE_CMD", cmd, value }, () => void chrome.runtime.lastError); }
  catch (e) { /* ignore */ }
}
function setDot(cls) {
  if (!statusDot) return;
  statusDot.className = "dot" + (cls ? " " + cls : "");
}

// ---- (pitch, yaw, roll) degrees from a 4x4 facial transformation matrix ----
function eulerFromMatrix(m) {
  // m.data is column-major Float32Array(16). Build row-major 3x3.
  const d = m.data || m;
  const r00 = d[0], r10 = d[1], r20 = d[2];
  const r01 = d[4], r11 = d[5], r21 = d[6];
  const r02 = d[8], r12 = d[9], r22 = d[10];
  const sy = Math.sqrt(r00 * r00 + r10 * r10);
  let pitch, yaw, roll;
  if (sy > 1e-6) {
    pitch = Math.atan2(r21, r22);
    yaw = Math.atan2(-r20, sy);
    roll = Math.atan2(r10, r00);
  } else {
    pitch = Math.atan2(-r12, r11);
    yaw = Math.atan2(-r20, sy);
    roll = 0;
  }
  const deg = (x) => (x * 180) / Math.PI;
  return [deg(pitch), deg(yaw), deg(roll)];
}

function blendMap(result) {
  const m = {};
  const b = result.faceBlendshapes;
  if (b && b.length) for (const c of b[0].categories) m[c.categoryName] = c.score;
  return m;
}

function handleGestures(bl, br, pitch, yaw, now) {
  const T = blinkThreshEl.value / 100;
  const pitchThr = parseFloat(pitchThreshEl.value);
  const yawThr = parseFloat(yawThreshEl.value);
  const speed = parseInt(scrollSpeedEl.value, 10);

  const both = bl > T && br > T;
  const leftWink = bl > T && br < T * 0.5;
  const rightWink = br > T && bl < T * 0.5;

  // auto-calibrate neutral head pose
  if (basePitch === null) {
    calib.push([pitch, yaw]);
    if (calib.length >= 25) {
      const arr = calib.slice().sort((a, b2) => a[0] - b2[0]);
      basePitch = arr[Math.floor(arr.length / 2)][0];
      const arrY = calib.slice().sort((a, b2) => a[1] - b2[1]);
      baseYaw = arrY[Math.floor(arrY.length / 2)][1];
    }
  }
  let dpitch = basePitch === null ? 0 : pitch - basePitch;
  let dyaw = baseYaw === null ? 0 : yaw - baseYaw;

  // continuously self-recenter while at rest (kills drift / false "chin down")
  if (basePitch !== null) {
    if (Math.abs(dpitch) < pitchThr) basePitch += 0.05 * dpitch;
    if (Math.abs(dyaw) < yawThr) baseYaw += 0.05 * dyaw;
  }

  // ---- BLINK: double -> screenshot, long -> bring to top ----
  if (both) {
    if (st.bothClosedSince === 0) st.bothClosedSince = now;
    if (now - st.bothClosedSince > 1000 && !st.longFired && now - st.lastBring > 1500) {
      st.longFired = true; st.lastBring = now;
      setGesture("BRING TO TOP"); sendCmd("bringTop");
    }
  } else {
    if (st.bothClosedSince > 0) {
      const dur = now - st.bothClosedSince; st.bothClosedSince = 0;
      if (!st.longFired && dur >= 60 && dur < 500) {
        if (now - st.blinkWindow > 700) { st.blinkWindow = now; st.blinkCount = 1; }
        else st.blinkCount += 1;
        if (st.blinkCount >= 2 && now - st.lastShot > 1500) {
          st.lastShot = now; st.blinkCount = 0;
          setGesture("SCREENSHOT"); sendCmd("screenshot");
        }
      }
      st.longFired = false;
    }
  }

  // ---- HEAD YAW -> zoom ----
  if (baseYaw !== null && !both && now - st.lastZoom > 600) {
    if (dyaw < -yawThr) { st.lastZoom = now; setGesture("ZOOM IN"); sendCmd("zoomIn"); }
    else if (dyaw > yawThr) { st.lastZoom = now; setGesture("ZOOM OUT"); sendCmd("zoomOut"); }
  }

  // ---- HEAD PITCH -> scroll ----
  if (basePitch !== null && !both && now - st.lastScroll > 60) {
    if (dpitch < -pitchThr) { st.lastScroll = now; sendCmd("scrollUp", speed); setGesture("scroll up"); }
    else if (dpitch > pitchThr) { st.lastScroll = now; sendCmd("scrollDown", speed); setGesture("scroll down"); }
  }

  return { both, leftWink, rightWink, dpitch, dyaw };
}

function drawHUD(bl, br, pitch, yaw, dpitch, dyaw) {
  const T = blinkThreshEl.value / 100;
  octx.clearRect(0, 0, overlay.width, overlay.height);
  octx.fillStyle = "rgba(0,0,0,0.6)"; octx.fillRect(0, 0, overlay.width, 64);
  octx.font = "12px monospace";
  octx.fillStyle = bl > T ? "#ff5555" : "#7CFC8A";
  octx.fillText(`blinkL=${bl.toFixed(2)}`, 6, 16);
  octx.fillStyle = br > T ? "#ff5555" : "#7CFC8A";
  octx.fillText(`blinkR=${br.toFixed(2)}`, 150, 16);
  octx.fillStyle = "#ffd166";
  octx.fillText(`pitch d=${dpitch.toFixed(1)}  yaw d=${dyaw.toFixed(1)}`, 6, 34);
  octx.fillStyle = paused ? "#ff9933" : (controlEnabled ? "#7CFC8A" : "#aaaaaa");
  octx.fillText(paused ? "PAUSED (show palm)" : (controlEnabled ? "control ON" : "control OFF"), 6, 52);
}

function loop() {
  if (!booted) return;
  const now = performance.now();
  if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
    lastVideoTime = video.currentTime;

    // palm -> pause toggle
    let palmNow = false;
    if (gestureRecognizer) {
      try {
        const gr = gestureRecognizer.recognizeForVideo(video, now);
        if (gr.gestures && gr.gestures.length && gr.gestures[0].length) {
          const top = gr.gestures[0][0];
          if (top.categoryName === "Open_Palm" && top.score > 0.5) palmNow = true;
        }
      } catch (e) { /* ignore */ }
    }
    if (palmNow) {
      setGesture(paused ? "PALM — resume" : "PALM — pause");
      if (palmArmed && now - lastPalmToggle > 800) {
        paused = !paused; palmArmed = false; lastPalmToggle = now;
        setGesture(paused ? "PAUSED" : "RESUMED");
      }
    } else { palmArmed = true; }

    let res;
    try { res = faceLandmarker.detectForVideo(video, now); } catch (e) { res = null; }
    if (res && res.faceLandmarks && res.faceLandmarks.length) {
      const m = blendMap(res);
      const bl = m["eyeBlinkLeft"] || 0, br = m["eyeBlinkRight"] || 0;
      let pitch = 0, yaw = 0;
      if (res.facialTransformationMatrixes && res.facialTransformationMatrixes.length) {
        [pitch, yaw] = eulerFromMatrix(res.facialTransformationMatrixes[0]);
      }
      let info = { dpitch: 0, dyaw: 0 };
      if (!paused) info = handleGestures(bl, br, pitch, yaw, now);
      drawHUD(bl, br, pitch, yaw, info.dpitch, info.dyaw);
      if (paused) { status2.textContent = "Paused"; setDot("paused"); }
      else if (controlEnabled) { status2.textContent = "Tracking"; setDot("on"); }
      else { status2.textContent = "Ready"; setDot(""); }
    } else {
      status2.textContent = "No face detected";
      setDot("");
    }
  }
  // NOTE: the loop is driven by a Web Worker tick (see boot), not rAF,
  // so detection keeps running even when this window is minimized.
}

async function boot() {
  if (booted) return;
  try {
    status2.textContent = "Loading models";
    const fileset = await FilesetResolver.forVisionTasks(chrome.runtime.getURL("vendor/mediapipe/wasm"));
    const fOpts = (delegate) => ({
      baseOptions: { modelAssetPath: chrome.runtime.getURL("models/face_landmarker.task"), delegate },
      runningMode: "VIDEO", numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });
    try { faceLandmarker = await FaceLandmarker.createFromOptions(fileset, fOpts("GPU")); }
    catch (e) { faceLandmarker = await FaceLandmarker.createFromOptions(fileset, fOpts("CPU")); }

    try {
      gestureRecognizer = await GestureRecognizer.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: chrome.runtime.getURL("models/gesture_recognizer.task"), delegate: "CPU" },
        runningMode: "VIDEO", numHands: 1,
      });
    } catch (e) { console.warn("palm recognizer unavailable:", e); gestureRecognizer = null; }
    if (!gestureRecognizer) setGesture("palm gesture unavailable");

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    video.srcObject = stream;
    await video.play();

    booted = true;
    status2.textContent = "Recenter, then Enable control";

    // Drive the loop from a Web Worker so it keeps running when minimized.
    try {
      tickWorker = new Worker(chrome.runtime.getURL("src/eye-control/eye-control.worker.js"));
      tickWorker.onmessage = () => { try { loop(); } catch (e) { /* ignore */ } };
      tickWorker.postMessage({ cmd: "start", ms: 60 });
    } catch (e) {
      console.warn("worker unavailable, falling back to rAF:", e);
      const raf = () => { loop(); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } catch (e) {
    console.error(e);
    status2.textContent = "Error: " + e.message;
  }
}

startBtn.addEventListener("click", boot);
recenterBtn.addEventListener("click", () => { basePitch = null; baseYaw = null; calib = []; setGesture("recentering…"); });
toggleBtn.addEventListener("click", () => {
  controlEnabled = !controlEnabled;
  toggleBtn.textContent = controlEnabled ? "Disable control" : "Enable control";
  toggleBtn.classList.toggle("on", controlEnabled);
});

status2.textContent = "Ready";
