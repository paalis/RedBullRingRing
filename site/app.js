// ---------- Tripdata: rediger her ----------
const RACE_START = new Date("2027-07-11T15:00:00+02:00"); // Forventet løpsstart (CEST)

const CREW = [
  { name: "Filip",      fullName: "Filip Johannes Grydeland", code: "GRY", number: 7,  home: "Trondheim",    role: "Teamsjef",       team: "#e10600" },
  { name: "Pål André",  fullName: "Pål André Weisethaunet",   code: "WEI", number: 16, home: "Trondheim",    role: "Strateg",        team: "#ff8000" },
  { name: "Fører 3",    fullName: "Navn kommer",              code: "OSL", number: 44, home: "Oslo",         role: "Navigatør",      team: "#27f4d2" },
  { name: "Håvard",     fullName: "Håvard Åstum Wahl",        code: "WAH", number: 81, home: "Kristiansand", role: "Schnitzel-sjef", team: "#b64dff" },
];

// Flyreiser per hjemby. `out`/`ret` = null betyr ikke booket ennå.
const FLIGHTS = [
  {
    base: "Trondheim",
    who: ["Filip", "Pål André"],
    out: { date: "Tor 8. juli", from: "TRD", dep: "17:10", to: "VIE", arr: "22:20", airline: "KLM Cityhopper + 1", stops: "1 bytte", dur: "5 t 10 min" },
    ret: { date: "Man 12. juli", from: "VIE", dep: "09:25", to: "TRD", arr: "22:50", airline: "KLM + 1", stops: "1 bytte", dur: "13 t 25 min" },
  },
  { base: "Oslo", who: ["Fører 3"], out: null, ret: null },
  {
    base: "Kristiansand",
    who: ["Håvard"],
    out: { date: "Tor 8. juli", from: "KRS", dep: "10:10", to: "VIE", arr: "15:55", stops: "1 bytte (OSL)", dur: "5 t 45 min" },
    ret: { date: "Man 12. juli", from: "VIE", dep: "16:35", to: "OSL", arr: "18:50", stops: "Direkte", dur: "2 t 15 min" },
  },
];

const PACKING = [
  "Pass / ID",
  "Flybillett",
  "Løpsbillett (helg)",
  "Togbillett Wien → Graz",
  "Hotell Wien bekreftet",
  "Hotell Graz bekreftet",
  "Euro i kontanter",
  "Ørepropper",
  "Regnjakke / poncho",
  "Solkrem og caps",
  "Powerbank",
  "Komfortable sko",
  "Teamskjorte",
  "Solbriller",
];

const RADIO = [
  "«Box, box. Schnitzel er klar.»",
  "«We are checking… toget til Graz går tidlig. Veldig tidlig.»",
  "«Plan B. Vi kjører plan B. Det er ingen plan B.»",
  "«Leave me alone, I know what I'm doing.»",
  "«Copy. Én øl til, så gir vi oss.»",
  "«Gap to Wien: 2 timer 35. Push now.»",
];

// ---------- Nedtelling ----------
const cd = Object.fromEntries([...document.querySelectorAll("[data-cd]")].map((el) => [el.dataset.cd, el]));
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  const diff = RACE_START - Date.now();
  if (diff <= 0) {
    document.querySelector(".countdown-label").textContent = "Lights out – and away we go!";
    for (const el of Object.values(cd)) el.textContent = "00";
    return;
  }
  const s = Math.floor(diff / 1000);
  cd.d.textContent = Math.floor(s / 86400);
  cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
  cd.m.textContent = pad(Math.floor((s % 3600) / 60));
  cd.s.textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

// Marker dagens økt under turen
const today = new Date().toISOString().slice(0, 10);
document.querySelector(`.session[data-day="${today}"]`)?.classList.add("is-today");

// ---------- Teamet ----------
const tower = document.querySelector(".tower");
CREW.forEach((d, i) => {
  const li = document.createElement("li");
  li.className = "driver reveal";
  li.dataset.number = d.number;
  li.style.setProperty("--team", d.team);
  li.innerHTML = `
    <span class="driver-pos">P${i + 1}</span>
    <h3 class="driver-name">${d.name}</h3>
    <p class="driver-full">${d.fullName}</p>
    <span class="driver-code">${d.code}</span>
    <p class="driver-meta"><span>${d.home}</span><span>${d.role}</span></p>`;
  tower.append(li);
});

// ---------- Flyreiser ----------
const passes = document.querySelector(".passes");
function leg(label, f) {
  if (!f) {
    return `<div class="pass-leg pass-pending"><p class="pass-label">${label}</p><p class="pass-tbc">Ikke booket ennå</p></div>`;
  }
  return `
    <div class="pass-leg">
      <p class="pass-label">${label} · ${f.date}</p>
      <div class="pass-route">
        <div><b>${f.from}</b><span>${f.dep}</span></div>
        <div class="pass-line"><span>${f.stops}</span><i></i><span>${f.dur}</span></div>
        <div class="pass-to"><b>${f.to}</b><span>${f.arr}</span></div>
      </div>
      ${f.airline ? `<p class="pass-airline">${f.airline}</p>` : ""}
    </div>`;
}
FLIGHTS.forEach((g) => {
  const li = document.createElement("li");
  li.className = "pass reveal" + (g.out ? "" : " is-pending");
  li.innerHTML = `
    <header class="pass-head">
      <span class="pass-base">Fra ${g.base}</span>
      <span class="pass-who">${g.who.join(" · ")}</span>
    </header>
    ${leg("Utreise", g.out)}
    ${leg("Hjemreise", g.ret)}`;
  passes.append(li);
});

// ---------- Pakkeliste ----------
const STORE_KEY = "rbr27-pack";
const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch {} };
const packed = load();
const list = document.querySelector(".checklist");
const countEl = document.querySelector(".pack-count");
document.querySelector(".pack-total").textContent = PACKING.length;

function renderCount() {
  countEl.textContent = PACKING.filter((item) => packed[item]).length;
}
PACKING.forEach((item) => {
  const li = document.createElement("li");
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = !!packed[item];
  box.addEventListener("change", () => {
    packed[item] = box.checked;
    save(packed);
    renderCount();
  });
  label.append(box, document.createTextNode(item));
  li.append(label);
  list.append(li);
});
renderCount();
document.querySelector(".pack-reset").addEventListener("click", () => {
  for (const k of Object.keys(packed)) delete packed[k];
  save(packed);
  list.querySelectorAll("input").forEach((b) => (b.checked = false));
  renderCount();
});

// ---------- Teamradio ----------
const quote = document.querySelector(".radio-quote");
let radioIdx = 0;
setInterval(() => {
  quote.style.opacity = 0;
  setTimeout(() => {
    radioIdx = (radioIdx + 1) % RADIO.length;
    quote.textContent = RADIO[radioIdx];
    quote.style.opacity = 1;
  }, 350);
}, 5000);

// ---------- Bilen rundt banen ----------
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const trackPath = document.querySelector(".track-line");
const car = document.querySelector(".car");
if (trackPath && car) {
  const len = trackPath.getTotalLength();
  const lap = 6500; // ms per runde
  const place = (t) => {
    const p = trackPath.getPointAtLength(((t % lap) / lap) * len);
    car.setAttribute("cx", p.x);
    car.setAttribute("cy", p.y);
  };
  place(0);
  if (!reduceMotion) {
    const loop = (t) => { place(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}

// ---------- Reveal + aktiv meny ----------
document.querySelectorAll(".section-head, .session, .map, .track, .stats, .checklist, .radio, .passes").forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

const links = [...document.querySelectorAll(".nav-links a")];
const navIo = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => navIo.observe(s));

// ---------- Introvideo ----------
// Spilles én gang (dempet) over heroen, deretter tar sideinnholdet over.
const hero = document.querySelector(".hero");
const video = document.querySelector(".hero-video");
function endIntro() {
  if (!hero.classList.contains("intro")) return;
  hero.classList.remove("intro");
  setTimeout(() => { video.pause(); video.muted = true; }, 800);
}
function startIntro({ sound = false } = {}) {
  hero.classList.add("intro");
  video.muted = !sound;
  video.currentTime = 0;
  return video.play();
}
if (video) {
  video.addEventListener("ended", endIntro);
  video.addEventListener("error", endIntro);
  document.querySelector(".intro-skip").addEventListener("click", endIntro);
  document.querySelector(".intro-replay").addEventListener("click", () => {
    startIntro({ sound: true }).catch(endIntro);
  });
  if (reduceMotion) endIntro();
  else startIntro().catch(endIntro); // autoplay blokkert → rett til siden

}
