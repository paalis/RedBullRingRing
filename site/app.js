// ---------- Tripdata: rediger her ----------
const RACE_START = new Date("2027-07-11T15:00:00+02:00"); // Forventet løpsstart (CEST)

const CREW = [
  { name: "Filip",      fullName: "Filip Johannes Grydeland", code: "GRY", number: 7,  home: "Trondheim",    role: "Teamsjef",       team: "#e10600", photo: "assets/crew/filip.webp",
    photos: { close: "assets/crew/filip-close.webp", wide: "assets/crew/filip-wide.webp" } },
  { name: "Pål André",  fullName: "Pål André Weisethaunet",   code: "WEI", number: 16, home: "Trondheim",    role: "Strateg",        team: "#ff8000", photo: "assets/crew/pal-andre.webp",
    photos: { close: "assets/crew/pal-andre-close.webp", wide: "assets/crew/pal-andre-wide.webp" } },
  { name: "Hans-Kristian", fullName: "Hans-Kristian Holthe",  code: "HOL", number: 44, home: "Oslo",         role: "Navigatør",      team: "#27f4d2", photo: "assets/crew/hans-kristian.webp",
    photos: { close: "assets/crew/hans-kristian-close.webp", wide: "assets/crew/hans-kristian-wide.webp" } },
  { name: "Håvard",     fullName: "Håvard Åstum Wahl",        code: "WAH", number: 81, home: "Kristiansand", role: "Schnitzel-sjef", team: "#b64dff", photo: "assets/crew/havard.webp",
    photos: { close: "assets/crew/havard-close.webp", wide: "assets/crew/havard-wide.webp" } },
];

// Flyreiser per gruppe. `out`/`ret` er ett fly eller en liste med etapper (`layover` = ventetid før etappen).
// null betyr ikke booket ennå.
const FLIGHTS = [
  {
    base: "Trondheim",
    who: ["Filip", "Pål André"],
    out: { date: "Tor 8. juli", from: "TRD", dep: "17:10", to: "VIE", arr: "22:20", airline: "KLM Cityhopper + 1", stops: "1 bytte (AMS)", dur: "5 t 10 min" },
    ret: [
      { date: "Man 12. juli", from: "VIE", dep: "09:25", to: "AMS", arr: "11:15", airline: "KLM · KL1902", stops: "Direkte", dur: "1 t 50 min", note: "Samme fly som Hans-Kristian" },
      { date: "Man 12. juli", from: "AMS", dep: "20:40", to: "TRD", arr: "22:50", airline: "KLM · KL1155", stops: "Direkte", dur: "2 t 10 min", layover: "Bonusrunde: 9 t 25 min i Amsterdam" },
    ],
  },
  {
    base: "Kristiansand",
    who: ["Håvard"],
    out: { date: "Tor 8. juli", from: "KRS", dep: "10:10", to: "VIE", arr: "15:55", stops: "1 bytte (OSL)", dur: "5 t 45 min" },
    ret: { date: "Man 12. juli", from: "VIE", dep: "16:35", to: "OSL", arr: "18:50", stops: "Direkte", dur: "2 t 15 min" },
  },
  {
    base: "Oslo",
    who: ["Hans-Kristian"],
    out: { date: "Tor 8. juli", from: "OSL", dep: "", to: "VIE", arr: "15:55", stops: "Direkte", dur: "", note: "Samme fly som Håvard fra Gardermoen · avgangstid kommer" },
    ret: [
      { date: "Man 12. juli", from: "VIE", dep: "09:25", to: "AMS", arr: "11:15", airline: "KLM · KL1902", stops: "Direkte", dur: "1 t 50 min", note: "Samme fly som Filip og Pål André" },
      { date: "Man 12. juli", from: "AMS", dep: "21:45", to: "OSL", arr: "23:30", airline: "Norwegian", stops: "Direkte", dur: "1 t 45 min", layover: "Bonusrunde: 10 t 30 min i Amsterdam" },
    ],
  },
];

// Overnatting. `options` er tom til noe er funnet; status "kandidat" eller "booket".
// Eksempel: { status: "booket", type: "Hotell", name: "Hotel X", area: "Neubau", price: "", url: "https://…", distance: "10 min til sentrum" }
const STAYS = [
  { id: "wien-1", city: "Wien",  dates: "Tor 8. – lør 10. juli", nights: 2, note: "Base før løpshelgen. Vi drar tidlig med leiebil lørdag.", options: [] },
  { id: "graz",   city: "Graz",  dates: "Lør 10. – søn 11. juli", nights: 1, note: "Natten mellom kvalifisering og løp. Ca. 1 time til banen.", options: [] },
  { id: "wien-2", city: "Wien",  dates: "Søn 11. – man 12. juli", nights: 1, note: "Siste natt. Nær flyplassen er et pluss – første fly går 09:25.", options: [] },
];

// Leiebil. Felt som er tomme vises som "–". `status`: "planlegges" eller "booket".
const CAR = {
  status: "planlegges",
  company: "",
  model: "",
  size: "Plass til 4 + bagasje",
  price: "",
  url: "",
  drivers: [],
  pickup: { when: "Lør 10. juli, tidlig morgen", where: "Wien – sentrum eller flyplassen", suggested: true },
  dropoff: { when: "Man 12. juli, ca. 07:00", where: "Wien flyplass (VIE)", note: "Tre av oss flyr 09:25, Håvard 16:35", suggested: true },
  todo: [
    { text: "Velge utleiefirma og bilstørrelse", done: false },
    { text: "Hente i sentrum eller på flyplassen?", done: false },
    { text: "Levere søndag kveld eller på VIE mandag morgen?", done: false },
    { text: "Hvem kjører – førerkort og ekstra sjåfør", done: false },
    { text: "Vignett (motorveiavgift) inkludert i leien?", done: false },
    { text: "Parkering ved Red Bull Ring – må den forhåndskjøpes?", done: false },
    { text: "Forsikring og egenandel", done: false },
  ],
};

const PACKING = [
  "Pass / ID",
  "Flybillett",
  "GA-billett (helg)",
  "Sitteunderlag",
  "Førerkort",
  "Leiebil bekreftet",
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
  "«We are checking… leiebilen går tidlig. Veldig tidlig.»",
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
  li.tabIndex = 0;
  li.setAttribute("role", "button");
  li.setAttribute("aria-label", `Se førerintro for ${d.fullName}`);
  li.innerHTML = `
    <span class="driver-pos">P${i + 1}</span>
    <h3 class="driver-name">${d.name}</h3>
    <p class="driver-full">${d.fullName}</p>
    <span class="driver-code">${d.code}</span>
    <p class="driver-meta"><span>${d.home}</span><span>${d.role}</span></p>
    <span class="driver-intro-hint">Se intro →</span>`;
  li.addEventListener("click", () => openDriverIntro(d, i));
  li.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openDriverIntro(d, i)));
  tower.append(li);
});

// ---------- Førerpresentasjon (F1-stil: mørk scene, røde lysstriper, utklippet fører) ----------
function splitName(d) {
  // Stor linje = etternavn, håndskrift = alle fornavn («Filip Johannes» / «Grydeland»).
  const words = d.fullName.split(" ");
  const last = words.length > 1 ? words.pop() : d.fullName;
  return { first: words.length ? words.join(" ") : d.name, last };
}

function revealMarkup(d) {
  const n = splitName(d);
  return `
    <div class="rv" style="--team:${d.team}">
      <div class="rv-glow" aria-hidden="true"></div>
      <div class="rv-beams" aria-hidden="true"><i></i><i></i></div>
      <div class="rv-streaks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="rv-hero">
        ${d.photo ? `<img class="rv-driver" src="${d.photo}" alt="${d.fullName}">` : `<div class="rv-driver is-empty" aria-hidden="true">${d.code}</div>`}
        <div class="rv-floor" aria-hidden="true"></div>
        <div class="rv-name">
          <p class="rv-first">${n.first}</p>
          <p class="rv-last"><span class="w">${n.last}</span><span class="rv-num">/ ${d.number}</span></p>
        </div>
      </div>
    </div>`;
}

// Vent kort på bilder og håndskriftfonten, så ingen scene starter tom.
function whenReady(el, maxMs) {
  const imgs = [...el.querySelectorAll("img")].map((im) => (im.complete ? 1 : new Promise((r) => { im.onload = im.onerror = r; })));
  const font = document.fonts ? document.fonts.load('1em "Mr Dafoe"').catch(() => {}) : 1;
  return Promise.race([Promise.all([...imgs, font]), new Promise((r) => setTimeout(r, maxMs))]);
}

// ---------- Førerintro (F1-stil) ----------
function flightLine(f) {
  if (!f) return "Ikke booket ennå";
  const legs = Array.isArray(f) ? f : [f];
  const first = legs[0];
  const last = legs[legs.length - 1];
  const via = legs.length > 1 ? ` via ${legs.slice(0, -1).map((l) => l.to).join(", ")}` : "";
  const dep = first.dep ? ` ${first.dep}` : "";
  return `${first.date} · ${first.from}${dep} → ${last.to} ${last.arr}${via}`;
}

function openDriverIntro(d, i) {
  const group = FLIGHTS.find((g) => g.who.includes(d.name));
  const el = document.createElement("div");
  el.className = "dintro";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", `Førerintro: ${d.fullName}`);
  el.innerHTML = `
    <div class="dintro-stage">
      ${revealMarkup(d)}
      <section class="dintro-card" aria-label="Førerinfo" style="--team:${d.team}">
        <p class="dintro-pos">P${i + 1} · ${d.code}</p>
        <dl>
          <div><dt>Nummer</dt><dd>${d.number}</dd></div>
          <div><dt>Hjemby</dt><dd>${d.home}</dd></div>
          <div><dt>Rolle</dt><dd>${d.role}</dd></div>
          <div><dt>Lagkode</dt><dd>${d.code}</dd></div>
          <div class="wide"><dt>Utreise</dt><dd>${flightLine(group && group.out)}</dd></div>
          <div class="wide"><dt>Hjemreise</dt><dd>${flightLine(group && group.ret)}</dd></div>
        </dl>
        <div class="dintro-actions">
          <button type="button" class="plan-btn" data-act="replay">Spill igjen</button>
          <button type="button" class="btn-ghost" data-act="close">Lukk</button>
        </div>
      </section>
      <button type="button" class="dintro-close" data-act="close" aria-label="Lukk">✕</button>
      <p class="dintro-skip" aria-hidden="true">Trykk for å hoppe over</p>
    </div>`;
  document.body.append(el);
  document.body.classList.add("has-modal");
  const stage = el.querySelector(".dintro-stage");
  const play = () => {
    stage.classList.remove("is-done", "is-playing");
    void stage.offsetWidth; // start animasjonen på nytt
    stage.classList.add("is-playing");
  };
  const finish = () => stage.classList.add("is-done");
  const close = () => {
    el.remove();
    document.body.classList.remove("has-modal");
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  stage.addEventListener("animationend", (e) => e.target.classList.contains("dintro-card") && finish());
  el.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act && act.dataset.act === "close") return close();
    if (act && act.dataset.act === "replay") return play();
    if (!stage.classList.contains("is-done")) finish();
  });
  whenReady(el, 1000).then(() => (reduceMotion ? finish() : play()));
  el.querySelector(".dintro-close").focus();
}

// ---------- Flyreiser ----------
const BIKE_ICON = '<svg class="sport-mark" viewBox="0 0 30 18" aria-hidden="true"><path class="sm-speed" d="M1 6h4.5M0 9h5.5M1.5 12h4"/><g transform="translate(1.6 0) skewX(-10)"><circle class="sm-thin" cx="12.4" cy="12.4" r="3.6"/><circle class="sm-thin" cx="24.6" cy="12.4" r="3.6"/><path class="sm-thin" d="M12.4 12.4l4-6h6.2l2 5.8M16.4 6.4l2.2 6 4-6M15 4.6h3M21.4 4.2h2.6"/></g></svg>';
const passes = document.querySelector(".passes");
function leg(label, f) {
  if (Array.isArray(f)) {
    return f.map((seg, i) => `${seg.layover ? `<p class="pass-layover">${BIKE_ICON}<span>${seg.layover}</span></p>` : ""}${leg(`${label} ${i + 1}/${f.length}`, seg)}`).join("");
  }
  if (!f) {
    return `<div class="pass-leg pass-pending"><p class="pass-label">${label}</p><p class="pass-tbc">Ikke booket ennå</p></div>`;
  }
  return `
    <div class="pass-leg">
      <p class="pass-label">${label} · ${f.date}</p>
      <div class="pass-route">
        <div><b>${f.from}</b><span>${f.dep || "–"}</span></div>
        <div class="pass-line"><span>${f.stops}</span><i></i><span>${f.dur || "&nbsp;"}</span></div>
        <div class="pass-to"><b>${f.to}</b><span>${f.arr}</span></div>
      </div>
      ${f.airline || f.note ? `<p class="pass-airline">${[f.airline, f.note].filter(Boolean).join(" · ")}</p>` : ""}
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

// ---------- Base camp ----------
const staysEl = document.querySelector(".stays");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function option(o) {
  const meta = [o.type, o.area, o.distance, o.price].filter(Boolean).map(esc).join(" · ");
  return `
    <li class="stay-option is-${o.status === "booket" ? "booked" : "candidate"}">
      <span class="stay-status">${o.status === "booket" ? "Booket" : "Kandidat"}</span>
      <p class="stay-name">${esc(o.name)}</p>
      ${meta ? `<p class="stay-meta">${meta}</p>` : ""}
      ${o.url ? `<a class="stay-link" href="${esc(o.url)}" target="_blank" rel="noopener">Se stedet →</a>` : ""}
    </li>`;
}
STAYS.forEach((s) => {
  const booked = s.options.find((o) => o.status === "booket");
  const shown = booked ? [booked] : s.options;
  const li = document.createElement("li");
  li.className = "stay reveal" + (booked ? " is-booked" : shown.length ? "" : " is-empty");
  li.id = `stay-${s.id}`;
  li.innerHTML = `
    <header class="stay-head">
      <span class="stay-city"><svg class="sport-mark stay-mark stay-mark-head" viewBox="0 0 30 18" aria-hidden="true"><path class="sm-speed" d="M1 6h4.5M0 9h5.5M1.5 12h4"/><g transform="translate(1.6 0) skewX(-10)"><path class="sm-fill" d="M8 3h2.3v7.4h17.9V16h-2.3v-2.4H10.3V16H8z"/><rect class="sm-fill" x="11.2" y="6.9" width="4.2" height="2.7" rx="1"/><path class="sm-fill" d="M16.4 6.9h8.3a3.5 3.5 0 0 1 3.5 2.7H16.4z"/></g></svg>${esc(s.city)}</span>
      <span class="stay-nights">${s.nights} ${s.nights === 1 ? "natt" : "netter"}</span>
    </header>
    <div class="stay-body">
      <p class="stay-dates">${esc(s.dates)}</p>
      <p class="stay-note">${esc(s.note)}</p>
      <div class="plan-map" data-slot="${s.id}" hidden></div>
      ${shown.length
        ? `<ul class="stay-options">${shown.map(option).join("")}</ul>`
        : `<div class="stay-empty"><b>Ikke booket ennå</b><span>Hotell eller Airbnb – legg til et forslag.</span></div>`}
      <div class="plan-live" data-slot="${s.id}"></div>
    </div>`;
  staysEl.append(li);
  if (booked) {
    document.querySelectorAll(`.stay-chip a[data-stay="${s.id}"] .stay-label`).forEach((el) => (el.textContent = booked.name));
  }
});

// ---------- Leiebil ----------
const CAR_ICON = '<svg class="sport-mark" viewBox="0 0 30 18" aria-hidden="true"><path class="sm-speed" d="M1 6h4.5M0 9h5.5M1.5 12h4"/><g transform="translate(1.6 0) skewX(-10)"><path class="sm-fill" fill-rule="evenodd" d="M8 13.6v-2c0-.8.6-1.4 1.4-1.5l3.2-.5 3-3c.5-.5 1.2-.8 1.9-.8h4.1c.7 0 1.4.3 1.8.9l2.2 2.9 1.8.4c.9.2 1.5 1 1.5 1.9v1.7h-1.9a2.8 2.8 0 0 0-5.6 0h-5.6a2.8 2.8 0 0 0-5.6 0zM16.4 7.4l-2.2 2.2h5.2V7.2h-2.2z M20.6 7.2v2.4H24l-1.6-2z"/><circle class="sm-fill" cx="13" cy="13.8" r="2.2"/><circle class="sm-fill" cx="24.2" cy="13.8" r="2.2"/></g></svg>';
const val = (v) => (v ? esc(v) : '<span class="car-tbc">–</span>');
function carStop(label, s) {
  return `
    <div class="car-stop">
      <p class="car-label">${label}${s.suggested ? ' <span class="car-hint">forslag</span>' : ""}</p>
      <p class="car-when">${val(s.when)}</p>
      <p class="car-where">${val(s.where)}</p>
      ${s.note ? `<p class="car-note">${esc(s.note)}</p>` : ""}
    </div>`;
}
{
  const booked = CAR.status === "booket";
  const done = CAR.todo.filter((t) => t.done).length;
  document.querySelector(".car-board").innerHTML = `
    <article class="car-card${booked ? " is-booked" : ""}">
      <header class="car-head">
        <span class="car-title">${CAR_ICON} Leiebil</span>
        <span class="car-status" data-car="status">${booked ? "Booket" : "Planlegges"}</span>
      </header>
      <dl class="car-facts">
        <div><dt>Utleier</dt><dd data-car="company">${val(CAR.company)}</dd></div>
        <div><dt>Bil</dt><dd data-car="model">${val(CAR.model)}</dd></div>
        <div><dt>Størrelse</dt><dd>${val(CAR.size)}</dd></div>
        <div><dt>Pris</dt><dd data-car="price">${val(CAR.price)}</dd></div>
        <div class="car-wide"><dt>Sjåfører</dt><dd>${CAR.drivers.length ? CAR.drivers.map(esc).join(" · ") : val("")}</dd></div>
      </dl>
      <div data-car="link">${CAR.url ? `<a class="stay-link" href="${esc(CAR.url)}" target="_blank" rel="noopener">Se bestillingen →</a>` : ""}</div>
    </article>
    <article class="car-card car-offers">
      <header class="car-head car-head-plain">
        <span class="car-title">Tilbud</span>
        <span class="car-status">Stem på favoritten</span>
      </header>
      <div class="car-offers-body"><div class="plan-live" data-slot="car"></div></div>
    </article>
    <article class="car-card car-route">
      ${carStop("Henting", CAR.pickup)}
      <div class="car-arrow" aria-hidden="true"><i></i><span>Wien → Graz → Spielberg → Wien</span></div>
      ${carStop("Levering", CAR.dropoff)}
    </article>
    <article class="car-card">
      <header class="car-head car-head-plain">
        <span class="car-title">Å avklare</span>
        <span class="car-status" data-todo-count>${done} / ${CAR.todo.length}</span>
      </header>
      <ul class="car-todo">
        ${CAR.todo.map((t, i) => `<li class="${t.done ? "is-done" : ""}" data-todo="car-${i}"><button class="car-check" type="button" disabled aria-label="Huk av: ${esc(t.text)}"></button><span>${esc(t.text)}</span></li>`).join("")}
      </ul>
    </article>`;
}

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
document.querySelectorAll(".section-head, .session, .map, .track, .stats, .checklist, .radio, .passes, .stays").forEach((el) => el.classList.add("reveal"));
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

// ---------- Introfilmen ----------
// Filmen lages med Remotion i video/ og er synket til F1-temaet: åpning, bilen som overgang (14,15 s) og teamintroen
// fra 15,36 s. assets/intro.mp4 er liggende, assets/intro-mobile.mp4 stående. «Spill teamintro» starter ved bilen.
const TEAM_INTRO_AT = 14.15;
const hero = document.querySelector(".hero");
const video = document.querySelector(".hero-video");
const portrait = matchMedia("(max-aspect-ratio: 4/5)");
let intro = null; // { theme } mens filmen vises

function startIntro({ sound = false, from = 0 } = {}) {
  stopIntro(true);
  const src = portrait.matches ? "assets/intro-mobile.mp4" : "assets/intro.mp4";
  if (!video.currentSrc.endsWith(src)) video.src = src;
  // Kommer vi rett fra innloggingen, er lyden låst opp i et eget lydelement av klikket der; filmen spilles da
  // dempet og holdes i takt med det. Ellers bruker filmen sin egen lyd (krever et klikk, som knappene gir).
  const theme = sound && window.__rbrTheme ? window.__rbrTheme : null;
  window.__rbrTheme = null;
  intro = { theme };
  video.muted = !sound || !!theme;
  // Spoling virker først når filmens metadata er lastet (ny kilde starter ellers på 0).
  if (video.readyState >= 1) video.currentTime = from;
  else video.addEventListener("loadedmetadata", () => { video.currentTime = from; }, { once: true });
  hero.classList.add("intro");
  document.body.classList.add("has-modal");
  const plays = [video.play()];
  if (theme) {
    theme.currentTime = from;
    theme.volume = 1;
    plays.push(theme.play().catch(() => { video.muted = false; }));
  }
  return Promise.all(plays);
}

// Lydelementet fra innloggingen er klokka; filmen justeres hvis den glir mer enn et par frames unna.
video?.addEventListener("timeupdate", () => {
  const th = intro && intro.theme;
  if (th && !th.paused && Math.abs(th.currentTime - video.currentTime) > 0.12) video.currentTime = th.currentTime;
});

// Avslutter filmen (ferdig, hopp over, Esc, klikk): lyden tones ut og siden kommer fram.
function stopIntro(instant = false) {
  const run = intro;
  intro = null;
  hero.classList.remove("intro");
  document.body.classList.remove("has-modal");
  const fadeOut = (m) => {
    if (instant) return m.pause();
    const fade = setInterval(() => { m.volume = Math.max(0, m.volume - 0.1); if (m.volume <= 0) { m.pause(); clearInterval(fade); } }, 40);
  };
  if (run && run.theme) fadeOut(run.theme);
  if (!video.muted) fadeOut(video);
  setTimeout(() => { if (!intro) { video.pause(); video.muted = true; video.volume = 1; } }, instant ? 0 : 800);
}

if (video) {
  video.addEventListener("ended", () => stopIntro());
  video.addEventListener("error", () => stopIntro());
  video.addEventListener("click", () => stopIntro());
  document.querySelector(".intro-skip").addEventListener("click", () => stopIntro());
  document.addEventListener("keydown", (e) => e.key === "Escape" && intro && stopIntro());
  document.querySelector(".intro-replay").addEventListener("click", () => {
    startIntro({ sound: true }).catch(() => stopIntro());
  });
  document.querySelector(".team-intro-btn").addEventListener("click", () => {
    startIntro({ sound: true, from: TEAM_INTRO_AT }).catch(() => stopIntro());
  });
  // Rett etter innlogging (et klikk på samme side) tillater nettleseren som regel lyd.
  let fresh = false;
  try { fresh = !!window.__rbrTheme || sessionStorage.getItem("rbr-fresh") === "1"; sessionStorage.removeItem("rbr-fresh"); } catch (_) {}
  if (reduceMotion) stopIntro(true);
  else startIntro({ sound: fresh }).catch(() => stopIntro(true)); // autoplay blokkert → rett til siden
}
