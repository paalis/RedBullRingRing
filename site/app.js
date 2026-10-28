// ---------- Tripdata: rediger her ----------
const RACE_START = new Date("2027-07-11T15:00:00+02:00"); // Forventet løpsstart (CEST)

const CREW = [
  { name: "Filip",      fullName: "Filip Johannes Grydeland", code: "GRY", number: 7,  home: "Trondheim",    role: "Teamsjef",       team: "#e10600", photo: "assets/crew/filip.webp" },
  { name: "Pål André",  fullName: "Pål André Weisethaunet",   code: "WEI", number: 16, home: "Trondheim",    role: "Strateg",        team: "#ff8000", photo: "assets/crew/pal-andre.webp" },
  { name: "Hans-Kristian", fullName: "Hans-Kristian Holthe",  code: "HOL", number: 44, home: "Oslo",         role: "Navigatør",      team: "#27f4d2", photo: "assets/crew/hans-kristian.webp" },
  { name: "Håvard",     fullName: "Håvard Åstum Wahl",        code: "WAH", number: 81, home: "Kristiansand", role: "Schnitzel-sjef", team: "#b64dff", photo: "assets/crew/havard.webp" },
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

// ---------- Teamintro (F1 «line-up»-stil) ----------
const TEAM_TIMELINE = [["title", 1300], ...CREW.map((_, i) => [`d${i}`, 1900]), ["grid", 0]];
// Rekkefølge i line-upen fra venstre: ytterst bak, innerst foran (som F1-plakaten).
const LINEUP = [2, 0, 1, 3];

function teamIntroMarkup(extra = "") {
  return `
    <div class="ti-stage">
      <section class="ti-scene ti-title" data-scene="title">
        <div class="ti-stripes" aria-hidden="true"><i></i><i></i><i></i></div>
        <p class="ti-kicker">Østerrikes Grand Prix · Spielberg 2027</p>
        <h2>Line-up</h2>
        <p class="ti-sub"><span class="brand-mark">RBR</span><span class="brand-year">'27</span></p>
      </section>
      ${CREW.map((d, i) => `<section class="ti-scene ti-driver" data-scene="d${i}">${revealMarkup(d)}</section>`).join("")}
      <section class="ti-scene ti-grid" data-scene="grid">
        <div class="tg-bar" aria-hidden="true"><i></i><span><span class="brand-mark">RBR</span><span class="brand-year">'27</span></span><i></i></div>
        <div class="tg-row">
          ${LINEUP.map((idx, pos) => {
            const d = CREW[idx];
            const inner = pos === 1 || pos === 2;
            return `
            <figure class="tg-driver${inner ? " is-front" : ""}" style="--i:${pos}">
              ${d.photo ? `<img src="${d.photo}" alt="${d.fullName}">` : `<span class="tg-code">${d.code}</span>`}
            </figure>`;
          }).join("")}
        </div>
        <div class="ti-grid-title"><p>Østerrikes Grand Prix · 9.–11. juli 2027</p><h2>Team <span class="brand-mark">RBR</span> '27</h2></div>
        <div class="ti-actions">
          <button type="button" class="plan-btn" data-act="replay">Spill igjen</button>
          <button type="button" class="btn-ghost" data-act="close">Lukk</button>
        </div>
      </section>
      ${extra}
      <button type="button" class="dintro-close" data-act="close" aria-label="Lukk">✕</button>
      <p class="ti-skip" aria-hidden="true">Trykk for å hoppe over</p>
    </div>`;
}

// Bytter scene: den gamle glir ut, den nye starter inngangsanimasjonen sin.
function sceneSwitcher(el) {
  const stage = el.querySelector(".ti-stage");
  const scenes = Object.fromEntries([...el.querySelectorAll(".ti-scene")].map((s) => [s.dataset.scene, s]));
  return (name) => {
    for (const s of Object.values(scenes)) {
      if (s.classList.contains("is-on")) {
        s.classList.remove("is-on");
        s.classList.add("is-off");
      } else s.classList.remove("is-off");
    }
    void scenes[name].offsetWidth; // start inngangsanimasjonen på nytt
    scenes[name].classList.add("is-on");
    stage.dataset.scene = name;
  };
}

function openTeamIntro() {
  const el = document.createElement("div");
  el.className = "tintro";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Teamintro: line-up RBR '27");
  el.innerHTML = teamIntroMarkup();
  document.body.append(el);
  document.body.classList.add("has-modal");

  const stage = el.querySelector(".ti-stage");
  const show = sceneSwitcher(el);
  let timers = [];
  const toEnd = () => {
    timers.forEach(clearTimeout);
    timers = [];
    show("grid");
    stage.classList.add("is-done");
  };
  const play = () => {
    timers.forEach(clearTimeout);
    stage.classList.remove("is-done");
    let t = 0;
    timers = TEAM_TIMELINE.map(([name, dur]) => {
      const id = setTimeout(() => (name === "grid" ? toEnd() : show(name)), t);
      t += dur;
      return id;
    });
  };
  const close = () => {
    timers.forEach(clearTimeout);
    el.remove();
    document.body.classList.remove("has-modal");
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  el.addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act && act.dataset.act === "close") return close();
    if (act && act.dataset.act === "replay") return play();
    if (!stage.classList.contains("is-done")) toEnd();
  });

  whenReady(el, 1500).then(() => (reduceMotion ? toEnd() : play()));
  el.querySelector(".dintro-close").focus();
}

document.querySelector(".team-intro-btn").addEventListener("click", openTeamIntro);

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

// ---------- Nettsideintro: introvideo → teamintro → bil over skjermen, synket til lydsporet ----------
// Tidspunkter (sekunder) i assets/intro-theme.mp3: hornene starter teamintroen på 12 s,
// bilen kommer inn rett før motorlyden topper (24,3 s), og siden åpnes på sluttslaget (25 s).
const SITE_INTRO = [[12, "title"], [14, "d0"], [16, "d1"], [18, "d2"], [20, "d3"], [22, "grid"], [23.6, "car"], [25, "end"]];
// Generisk F1-bil i mørkeblått, rødt og gult (ingen logoer), sett fra siden og på vei mot høyre.
const CAR_SVG = `<svg class="si-car-svg" viewBox="0 0 600 150" aria-hidden="true">
  <path d="M22 26h50v12H22z" fill="#1b2a5c"/><path d="M22 26h50v4H22z" fill="#d6001c"/>
  <path d="M28 22h9v74h-9z" fill="#10172f"/><path d="M58 38l14 0-6 42h-8z" fill="#10172f"/>
  <path d="M50 116L52 82l98-10 45-22 18-22h30l17 28 38 6 120 14 100 14 40 10-2 8-555 8z" fill="#1b2a5c"/>
  <path d="M118 116l12-26q20-10 70-10l130 4q24 4 32 32z" fill="#14204a"/>
  <path d="M136 98q40-8 110-6l120 6-4 6-120-4q-62-2-106 6z" fill="#d6001c"/>
  <path d="M470 90l90 12 5 6-95-10z" fill="#ffcc00"/>
  <path d="M213 28h30l6 10h-40z" fill="#d6001c"/>
  <circle cx="286" cy="58" r="13" fill="#e9e9ec"/><path d="M280 52h17v8h-15z" fill="#10172f"/>
  <path d="M258 60q34-26 76 4" fill="none" stroke="#0b0b10" stroke-width="5" stroke-linecap="round"/>
  <path d="M40 116h520" stroke="#0b0b10" stroke-width="5"/>
  <path d="M452 112h140v9H452z" fill="#10172f"/><path d="M452 112h140v3H452z" fill="#d6001c"/><path d="M584 96h9v26h-9z" fill="#10172f"/>
  <g class="si-wheel"><circle cx="112" cy="106" r="36" fill="#111"/><circle cx="112" cy="106" r="22" fill="#2b2b33"/><path d="M112 86v40M92 106h40" stroke="#555" stroke-width="4"/><circle cx="112" cy="106" r="6" fill="#ffcc00"/></g>
  <g class="si-wheel"><circle cx="476" cy="108" r="32" fill="#111"/><circle cx="476" cy="108" r="19" fill="#2b2b33"/><path d="M476 91v34M459 108h34" stroke="#555" stroke-width="4"/><circle cx="476" cy="108" r="6" fill="#ffcc00"/></g>
</svg>`;

const hero = document.querySelector(".hero");
const video = document.querySelector(".hero-video");
let siteIntro = null;

function startIntro({ sound = false } = {}) {
  stopIntro(true);
  const el = document.createElement("div");
  el.className = "tintro is-site";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Intro: line-up RBR '27");
  el.innerHTML = teamIntroMarkup(`<div class="si-car" aria-hidden="true"><div class="si-trail"></div>${CAR_SVG}</div>`);
  const show = sceneSwitcher(el);
  const audio = sound ? new Audio("assets/intro-theme.mp3") : null;
  const run = { el, audio, raf: 0, next: 0, t0: 0, shown: false };
  siteIntro = run;

  hero.classList.add("intro");
  video.muted = true;
  video.currentTime = 0;
  // Klokka er lydsporet når det spiller, ellers sanntid fra start.
  const clock = () => (audio && !audio.paused && audio.currentTime > 0 ? audio.currentTime : (performance.now() - run.t0) / 1000);
  const tick = () => {
    if (siteIntro !== run) return;
    const t = clock();
    while (run.next < SITE_INTRO.length && t >= SITE_INTRO[run.next][0]) {
      const [, name] = SITE_INTRO[run.next++];
      if (name === "end") return stopIntro();
      if (name === "car") { el.classList.add("car-go"); continue; }
      if (!run.shown) {
        run.shown = true;
        document.body.append(el);
        document.body.classList.add("has-modal");
        hero.classList.remove("intro");
        video.pause();
      }
      show(name);
    }
    run.raf = requestAnimationFrame(tick);
  };
  el.addEventListener("click", () => stopIntro());
  const begin = () => {
    run.t0 = performance.now();
    run.raf = requestAnimationFrame(tick);
  };
  const plays = [video.play()];
  if (audio) plays.push(audio.play().catch(() => {})); // lyd blokkert → kjører videre uten lyd
  return Promise.all(plays).then(begin, (err) => { stopIntro(); throw err; });
}

// Avslutter introen (hopp over, Esc, ferdig): lyden tones ut og siden kommer fram.
function stopIntro(instant = false) {
  const run = siteIntro;
  hero.classList.remove("intro");
  setTimeout(() => { if (!hero.classList.contains("intro")) { video.pause(); video.muted = true; } }, 800);
  if (!run) return;
  siteIntro = null;
  cancelAnimationFrame(run.raf);
  if (run.audio) {
    const a = run.audio;
    const fade = setInterval(() => { a.volume = Math.max(0, a.volume - 0.1); if (a.volume <= 0) { a.pause(); clearInterval(fade); } }, 40);
  }
  if (!run.el.isConnected) return;
  document.body.classList.remove("has-modal");
  if (instant) return run.el.remove();
  run.el.classList.add("si-leave");
  setTimeout(() => run.el.remove(), 600);
}

if (video) {
  video.addEventListener("error", () => stopIntro());
  document.querySelector(".intro-skip").addEventListener("click", () => stopIntro());
  document.addEventListener("keydown", (e) => e.key === "Escape" && siteIntro && stopIntro());
  document.querySelector(".intro-replay").addEventListener("click", () => {
    startIntro({ sound: true }).catch(() => stopIntro());
  });
  if (reduceMotion) stopIntro();
  else startIntro().catch(() => stopIntro()); // autoplay blokkert → rett til siden
}
