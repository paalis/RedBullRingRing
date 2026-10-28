/* The film carries its own audio: one media clock, no parallel soundtrack.
 * Offer the still on the first visit in a tab, and after a fresh login.
 * Reloads/later visits and deep links go straight to the planning page.
 * Changing the version below deliberately offers a new intro once again.
 */
(() => {
  "use strict";

  const SEEN_KEY = "rbr-intro-seen-v2";
  const portrait = matchMedia("(max-aspect-ratio: 4/5)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const dialog = document.querySelector("#site-intro");
  const replay = document.querySelector("[data-intro-replay]");
  if (!dialog || !replay) return;

  const video = dialog.querySelector("video");
  const start = dialog.querySelector("[data-intro-start]");
  const direct = dialog.querySelector(".intro-direct");
  const pause = dialog.querySelector("[data-intro-pause]");
  const mute = dialog.querySelector("[data-intro-mute]");
  const panel = dialog.querySelector(".intro-launch-panel");
  const controls = dialog.querySelector(".intro-playback");
  const status = dialog.querySelector(".intro-status");
  const progress = dialog.querySelector("progress");
  const time = dialog.querySelector(".intro-time");
  const motionNote = dialog.querySelector(".intro-motion-note");
  const returnTarget = document.querySelector("#intro-return-target");
  const SOURCES = {
    desktop: "assets/intro-desktop.mp4",
    mobile: "assets/intro-mobile.mp4",
  };

  let state = "closed";
  let runId = 0;
  let waitingTimer = 0;
  let arrivalTimer = 0;
  let focusTarget = null;
  let seenInMemory = false;
  let freshLogin = false;

  // Compatibility with an already-open older login document. Never leave its
  // unlocked sound element playing beside the new film or downloading unused audio.
  if (window.__rbrTheme) {
    window.__rbrTheme.pause();
    window.__rbrTheme.removeAttribute("src");
    window.__rbrTheme.load();
    window.__rbrTheme = null;
  }
  try {
    freshLogin = sessionStorage.getItem("rbr-fresh") === "1";
    sessionStorage.removeItem("rbr-fresh");
  } catch (_) { /* Storage can be disabled; entry must still work. */ }

  function wasSeen() {
    try { return seenInMemory || sessionStorage.getItem(SEEN_KEY) === "1"; }
    catch (_) { return seenInMemory; }
  }

  function remember() {
    seenInMemory = true;
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (_) { /* Optional. */ }
  }

  function announce(message) {
    status.textContent = message;
  }

  function clearWaiting() {
    clearTimeout(waitingTimer);
    waitingTimer = 0;
    dialog.classList.remove("is-buffering");
  }

  function releaseMedia() {
    clearWaiting();
    video.pause();
    video.muted = true;
    video.removeAttribute("src");
    // Calling load after removing src aborts pending network requests/play promises.
    video.load();
  }

  function updateControls() {
    pause.textContent = video.paused ? "Fortsett" : "Pause";
    pause.setAttribute("aria-label", video.paused ? "Fortsett introen" : "Sett introen på pause");
    mute.textContent = video.muted ? "Lyd av" : "Lyd på";
    mute.setAttribute("aria-label", video.muted ? "Slå på lyd" : "Slå av lyd");
    mute.setAttribute("aria-pressed", String(video.muted));
  }

  function updateMotion() {
    motionNote.hidden = !reducedMotion.matches;
    dialog.classList.toggle("is-reduced", reducedMotion.matches);
    start.textContent = reducedMotion.matches ? "Spill intro med bevegelse og lyd ▶" : "Start intro med lyd ▶";
    replay.setAttribute("aria-label", reducedMotion.matches ? "Spill intro med bevegelse og lyd" : "Se introen med lyd");
  }

  function resetPanel() {
    panel.hidden = false;
    controls.hidden = true;
    start.disabled = false;
    progress.value = 0;
    time.textContent = "0:00 / 0:52";
    dialog.classList.remove("is-playing", "is-buffering");
    updateMotion();
  }

  function closeIntro({ restoreFocus = true, arrived = true } = {}) {
    if (state === "closed") return;
    state = "closed";
    runId++;
    remember();
    releaseMedia();
    dialog.close();
    document.body.classList.remove("has-intro");
    resetPanel();
    announce("");

    clearTimeout(arrivalTimer);
    if (arrived && !reducedMotion.matches) {
      document.body.classList.remove("intro-arrived");
      void document.body.offsetWidth;
      document.body.classList.add("intro-arrived");
      arrivalTimer = setTimeout(() => document.body.classList.remove("intro-arrived"), 550);
    }
    if (restoreFocus) {
      const target = focusTarget?.isConnected ? focusTarget : returnTarget;
      target?.focus({ preventScroll: true });
    }
    focusTarget = null;
  }

  function fail(message) {
    if (state === "closed") return;
    state = "error";
    runId++;
    releaseMedia();
    resetPanel();
    start.textContent = "Prøv å starte igjen ▶";
    announce(message);
    // If a disappearing playback control held focus, move it to the retry action.
    if (controls.contains(document.activeElement)) start.focus({ preventScroll: true });
  }

  function watchForStall() {
    clearWaiting();
    if (state === "closed" || state === "error" || video.paused && state !== "loading") return;
    dialog.classList.add("is-buffering");
    announce("Laster introen … Du kan hoppe over når som helst.");
    waitingTimer = setTimeout(() => {
      fail("Videoen bruker for lang tid på å laste. Prøv igjen, eller gå rett til turplanleggingen.");
    }, 20000);
  }

  function beginPlayback() {
    if (!dialog.open || state === "loading") return;
    const attempt = ++runId;
    state = "loading";
    start.disabled = true;
    start.textContent = "Laster introen …";
    video.muted = false;
    video.volume = 1;

    // Choose exactly one video, when the user presses Play. Do not replace it
    // during playback on rotation: that would fetch a second file and restart it.
    const variant = portrait.matches ? "mobile" : "desktop";
    video.dataset.variant = variant;
    video.src = SOURCES[variant];
    video.preload = "auto";
    updateControls();
    watchForStall();
    remember();
    // Keep play() synchronous with the click so browser sound policies allow it.
    const playback = video.play();
    if (playback?.catch) playback.catch((error) => {
      if (attempt !== runId || state === "closed") return;
      fail(error.name === "NotAllowedError"
        ? "Nettleseren stoppet avspillingen. Trykk for å prøve igjen, eller gå rett til turplanleggingen."
        : "Videoen kunne ikke spilles. Prøv igjen, eller gå rett til turplanleggingen.");
    });
  }

  function openIntro({ play = false, opener = null } = {}) {
    if (typeof dialog.showModal !== "function") return;
    clearTimeout(arrivalTimer);
    document.body.classList.remove("intro-arrived");
    focusTarget = opener;
    state = "ready";
    resetPanel();
    announce("");
    document.body.classList.add("has-intro");
    dialog.showModal();
    (reducedMotion.matches ? direct : start).focus({ preventScroll: true });
    if (play) beginPlayback();
  }

  function togglePause() {
    if (state !== "playing" && state !== "paused") return;
    if (video.paused) {
      const attempt = runId;
      video.play().catch(() => {
        if (attempt === runId && state !== "closed") {
          announce("Trykk Fortsett for å prøve igjen, eller hopp over introen.");
          updateControls();
        }
      });
    } else {
      video.pause();
    }
  }

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  video.addEventListener("playing", () => {
    if (state === "closed" || state === "error") return;
    const firstFrame = !dialog.classList.contains("is-playing");
    clearWaiting();
    state = "playing";
    panel.hidden = true;
    controls.hidden = false;
    dialog.classList.add("is-playing");
    announce("");
    updateControls();
    if (firstFrame) pause.focus({ preventScroll: true });
  });
  video.addEventListener("pause", () => {
    if (state !== "playing" && state !== "paused") return;
    state = "paused";
    clearWaiting();
    announce("Introen er satt på pause.");
    updateControls();
  });
  video.addEventListener("waiting", watchForStall);
  video.addEventListener("stalled", watchForStall);
  video.addEventListener("volumechange", updateControls);
  video.addEventListener("timeupdate", () => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 52.1;
    progress.max = duration;
    progress.value = Math.min(video.currentTime, duration);
    time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  });
  video.addEventListener("ended", () => closeIntro());
  video.addEventListener("error", () => {
    if (state === "loading" || state === "playing" || state === "paused") {
      fail("Videoen kunne ikke lastes. Prøv igjen, eller gå rett til turplanleggingen.");
    }
  });

  start.addEventListener("click", beginPlayback);
  pause.addEventListener("click", togglePause);
  mute.addEventListener("click", () => { video.muted = !video.muted; });
  replay.addEventListener("click", () => openIntro({ play: true, opener: replay }));
  dialog.querySelectorAll("[data-intro-skip]").forEach((button) => {
    button.addEventListener("click", () => closeIntro());
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeIntro();
  });
  dialog.addEventListener("close", () => {
    // Covers closing through browser/platform UI as well as our buttons.
    if (state !== "closed") closeIntro();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const buttons = [...dialog.querySelectorAll("button:not(:disabled)")]
      .filter((button) => button.getClientRects().length > 0);
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing") {
      video.pause();
      announce("Introen er satt på pause mens du er borte.");
    }
  });
  window.addEventListener("pagehide", () => closeIntro({ restoreFocus: false, arrived: false }));
  window.addEventListener("hashchange", () => closeIntro({ restoreFocus: false, arrived: false }));
  reducedMotion.addEventListener("change", () => {
    updateMotion();
    if (reducedMotion.matches && (state === "playing" || state === "loading" || state === "paused")) {
      runId++;
      state = "ready";
      releaseMedia();
      resetPanel();
      announce("Redusert bevegelse er slått på. Du kan gå rett til turplanleggingen.");
      direct.focus({ preventScroll: true });
    }
  });

  updateMotion();
  // A shared link to #fly, #basecamp, etc. always lands on its intended section.
  if (!location.hash && (freshLogin || !wasSeen())) openIntro();
})();
