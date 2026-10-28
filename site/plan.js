// Planleggingstavla: forslag, stemmer og avkrysninger lagret i Firebase (Firestore).
// Alle kan se. For å legge inn eller endre må man bli med med lagkoden.
import {
  initializeApp, getAuth, signInAnonymously, onAuthStateChanged, signOut,
  initializeFirestore, collection, doc, getDocFromServer, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
} from "./assets/vendor/firebase.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDU_0OTxTrH3Itn3mQ0yx3YOjug6L_lwc",
  authDomain: "rbr27-70136e6c.firebaseapp.com",
  projectId: "rbr27-70136e6c",
  appId: "1:806780851873:web:8a265547a4428914ef02e0",
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

const NAMES = CREW.map((c) => c.name);
let me = null; // { uid, name } når man er medlem
let joinError = "";
let joinName = "";
let candidates = [];

// ---------- Medlemskap ----------
function renderBars() {
  document.querySelectorAll(".plan-bar").forEach((bar) => {
    if (me) {
      bar.innerHTML = `
        <div class="plan-bar-in is-member">
          <span class="plan-dot"></span>
          <span>Planlegger som <b>${esc(me.name)}</b> – legg til forslag, stem og huk av.</span>
          <button class="btn-ghost plan-leave" type="button">Logg ut</button>
        </div>`;
      bar.querySelector(".plan-leave").addEventListener("click", () => signOut(auth));
      return;
    }
    bar.innerHTML = `
      <form class="plan-bar-in plan-join">
        <span class="plan-dot is-off"></span>
        <span class="plan-join-text">Vil du legge inn forslag eller stemme?</span>
        <select name="name" required aria-label="Hvem er du">
          <option value="">Hvem er du?</option>
          ${NAMES.map((n) => `<option${n === joinName ? " selected" : ""}>${esc(n)}</option>`).join("")}
        </select>
        <input name="code" type="password" required placeholder="Lagkode" autocomplete="off" aria-label="Lagkode">
        <button class="plan-btn" type="submit">Bli med</button>
        <p class="plan-error" role="alert">${esc(joinError)}</p>
      </form>`;
    const form = bar.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      joinName = form.name.value;
      joinError = "";
      form.querySelector(".plan-error").textContent = "";
      form.querySelector("button").disabled = true;
      try {
        const cred = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
        await setDoc(doc(db, "members", cred.user.uid), {
          name: form.name.value,
          code: form.code.value.trim(),
          joinedAt: serverTimestamp(),
        });
        me = { uid: cred.user.uid, name: form.name.value };
        renderAll();
      } catch (ex) {
        console.error("Kunne ikke bli med:", ex);
        me = null;
        joinError = /permission/i.test(ex.message) ? "Feil lagkode." : "Noe gikk galt – prøv igjen.";
        renderBars();
      }
    });
  });
}

onAuthStateChanged(auth, async (user) => {
  me = null;
  if (user) {
    try {
      const snap = await getDocFromServer(doc(db, "members", user.uid));
      if (snap.exists()) me = { uid: user.uid, name: snap.data().name };
    } catch (_) {}
  }
  renderAll();
});

// ---------- Pris ----------
const PEOPLE = CREW.length;
const kr = (n) => `${Math.round(n).toLocaleString("nb-NO")} kr`;
const hasTotal = (c) => Number.isInteger(c.total);
const nightsFor = (slot) => (STAYS.find((s) => s.id === slot) || {}).nights || 0;

function priceBlock(c) {
  if (!hasTotal(c)) {
    return c.price
      ? `<p class="plan-price is-missing">Oppgitt pris: <b class="plan-legacy">${esc(c.price)}</b> – trykk «Endre pris» og legg inn totalpris for alle, så kommer den med i budsjettet.</p>`
      : `<p class="plan-price is-missing">Pris mangler</p>`;
  }
  const nights = nightsFor(c.slot);
  const per = [`${kr(c.total / PEOPLE)} per person`];
  if (nights > 1) per.push(`${kr(c.total / nights)} per natt`);
  return `
    <div class="plan-price">
      <b>${kr(c.total)}</b><span>totalt</span>
      <small>${per.join(" · ")}</small>
    </div>`;
}

// Det som teller i budsjettet: booket forslag, ellers det med flest stemmer som har pris.
function chosen(slot) {
  const list = candidates.filter((c) => c.slot === slot);
  const booked = list.find((c) => c.status === "booket");
  if (booked) return { c: booked, how: "Booket" };
  const lead = list.filter(hasTotal).sort((a, b) => (b.votes || []).length - (a.votes || []).length)[0];
  return lead ? { c: lead, how: "Flest stemmer" } : null;
}

function renderBudget() {
  const rows = [...STAYS.map((s) => ({ slot: s.id, label: `${s.city} · ${s.nights} ${s.nights === 1 ? "natt" : "netter"}` })), { slot: "car", label: "Leiebil" }];
  let sum = 0;
  let missing = 0;
  const lines = rows.map(({ slot, label }) => {
    const pick = chosen(slot);
    const ok = pick && hasTotal(pick.c);
    if (ok) sum += pick.c.total; else missing++;
    return `
      <li class="${ok ? "" : "is-missing"}">
        <span class="budget-label">${esc(label)}<small>${ok ? `${esc(pick.how)}: ${esc(pick.c.name)}` : "Ingen pris ennå"}</small></span>
        <span class="budget-val">${ok ? kr(pick.c.total) : "–"}</span>
      </li>`;
  }).join("");
  const html = `
    <div class="budget">
      <div class="budget-total">
        <p class="budget-kicker">Totalpris overnatting + leiebil</p>
        <p class="budget-big">${kr(sum)}</p>
        <p class="budget-pp"><b>${kr(sum / PEOPLE)}</b> per person</p>
        ${missing ? `<p class="budget-note">${missing} av ${rows.length} mangler pris ennå</p>` : ""}
      </div>
      <ul class="budget-lines">${lines}</ul>
    </div>`;
  document.querySelectorAll(".plan-budget").forEach((el) => (el.innerHTML = html));
}

// ---------- Navn, bilde og fakta fra annonsen ----------
const triedPreview = new Set();
const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
async function fetchPreview(url) {
  if (!url) return {};
  try {
    const r = await fetch(`/api/preview?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return {};
    const d = await r.json();
    const image = str(d.image, 1000);
    return {
      image: /^https:\/\//.test(image) ? image : "",
      name: str(d.name, 80),
      area: str(d.area, 60),
      details: str(d.details, 200),
      type: ["Hotell", "Airbnb"].includes(d.type) ? d.type : "",
    };
  } catch (_) {
    return {};
  }
}

// Forslag lagt inn før dette fantes: første medlem som ser dem henter bilde og fakta.
function backfillPreviews() {
  if (!me) return;
  candidates
    .filter((c) => c.url && (!("image" in c) || !("details" in c)) && !triedPreview.has(c.id))
    .forEach(async (c) => {
      triedPreview.add(c.id);
      const pv = await fetchPreview(c.url);
      const patch = {};
      if (!("image" in c) && pv.image) patch.image = pv.image;
      if (!("details" in c) && pv.name) patch.details = pv.details || "";
      if (Object.keys(patch).length) await updateDoc(doc(db, "candidates", c.id), patch).catch(() => {});
    });
}

// ---------- Forslag ----------
function candidateItem(c) {
  const votes = c.votes || [];
  const mine = me && votes.includes(me.name);
  const meta = [c.type, c.area].filter(Boolean).map(esc).join(" · ");
  const booked = c.status === "booket";
  return `
    <li class="stay-option plan-item is-${booked ? "booked" : "candidate"}" data-id="${c.id}">
      ${c.image ? `<a class="plan-photo" href="${esc(c.url || c.image)}" target="_blank" rel="noopener"><img src="${esc(c.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.remove()"></a>` : ""}
      <span class="stay-status">${booked ? "Booket" : "Kandidat"}</span>
      <p class="stay-name">${esc(c.name)}</p>
      ${c.details ? `<p class="plan-details">${esc(c.details)}</p>` : ""}
      ${meta ? `<p class="stay-meta">${meta}</p>` : ""}
      ${priceBlock(c)}
      ${c.note ? `<p class="plan-note">${esc(c.note)}</p>` : ""}
      ${c.url ? `<a class="stay-link" href="${esc(c.url)}" target="_blank" rel="noopener">Se tilbudet →</a>` : ""}
      <div class="plan-votes">
        <span class="plan-count">${votes.length} ${votes.length === 1 ? "stemme" : "stemmer"}</span>
        ${votes.length ? `<span class="plan-voters">${votes.map(esc).join(", ")}</span>` : ""}
      </div>
      <p class="plan-by">Lagt inn av ${esc(c.by)}</p>
      ${me ? `
        <div class="plan-actions">
          <button type="button" class="plan-btn plan-vote${mine ? " is-on" : ""}" data-act="vote">${mine ? "Stemt" : "Stem"}</button>
          <button type="button" class="btn-ghost" data-act="price">Endre pris</button>
          <button type="button" class="btn-ghost" data-act="book">${booked ? "Angre booket" : "Merk som booket"}</button>
          <button type="button" class="btn-ghost plan-del" data-act="del">Slett</button>
        </div>` : ""}
    </li>`;
}

function addForm(slot) {
  const car = slot === "car";
  return `
    <details class="plan-add">
      <summary>+ Legg til ${car ? "tilbud" : "forslag"}</summary>
      <form class="plan-form" data-slot="${slot}">
        <label class="plan-wide">Lenke<input name="url" type="url" maxlength="500" placeholder="Lim inn lenken – navn og bilde hentes automatisk"></label>
        <div class="plan-fetch plan-wide" aria-live="polite"></div>
        <label>${car ? "Utleier" : "Navn på stedet"}<input name="name" required maxlength="80" placeholder="${car ? "F.eks. Sixt" : "F.eks. Hotel Daniel"}"></label>
        ${car
          ? `<label>Bil<input name="area" maxlength="60" placeholder="F.eks. VW Passat stasjonsvogn"></label>`
          : `<label>Type<select name="type"><option>Hotell</option><option>Airbnb</option></select></label>
             <label>Nabolag<input name="area" maxlength="60" placeholder="F.eks. Neubau"></label>`}
        <label>Totalpris for alle (kr)<input name="total" type="number" inputmode="numeric" min="0" max="1000000" step="1" placeholder="${car ? "F.eks. 3600" : "F.eks. 4800"}"></label>
        <label class="plan-wide">Notat<input name="note" maxlength="200" placeholder="Hvorfor dette?"></label>
        <button class="plan-btn" type="submit">Legg til</button>
      </form>
    </details>`;
}

function renderSlot(container) {
  const slot = container.dataset.slot;
  const list = candidates
    .filter((c) => c.slot === slot)
    .sort((a, b) => (b.status === "booket") - (a.status === "booket") || (b.votes || []).length - (a.votes || []).length);
  container.innerHTML = `
    ${list.length ? `<ul class="stay-options plan-list">${list.map(candidateItem).join("")}</ul>` : slot === "car" ? `<p class="plan-empty">Ingen tilbud ennå.</p>` : ""}
    ${me ? addForm(slot) : ""}`;

  const booked = list.find((c) => c.status === "booket");
  if (slot === "car") {
    renderCarBooking(booked);
  } else {
    const card = document.getElementById(`stay-${slot}`);
    const empty = card.querySelector(".stay-empty");
    if (empty) empty.hidden = list.length > 0;
    card.classList.toggle("is-booked", !!booked);
    const label = booked ? booked.name : STAYS.find((s) => s.id === slot).city;
    document.querySelectorAll(`.stay-chip a[data-stay="${slot}"] .stay-label`).forEach((el) => (el.textContent = label));
  }
}

function renderCarBooking(b) {
  const card = document.querySelector(".car-board .car-card");
  const set = (k, html) => { const el = card.querySelector(`[data-car="${k}"]`); if (el) el.innerHTML = html; };
  card.classList.toggle("is-booked", !!b || CAR.status === "booket");
  set("status", b || CAR.status === "booket" ? "Booket" : "Planlegges");
  if (b) {
    set("company", esc(b.name));
    set("model", b.area ? esc(b.area) : '<span class="car-tbc">–</span>');
    set("price", hasTotal(b) ? `${kr(b.total)} <small class="car-pp">${kr(b.total / PEOPLE)} per person</small>` : '<span class="car-tbc">–</span>');
    set("link", b.url ? `<a class="stay-link" href="${esc(b.url)}" target="_blank" rel="noopener">Se bestillingen →</a>` : "");
  }
}

function renderAll() {
  renderBars();
  document.querySelectorAll(".plan-live").forEach(renderSlot);
  renderBudget();
  backfillPreviews();
  document.querySelectorAll(".car-todo li").forEach((li) => (li.querySelector(".car-check").disabled = !me));
}

onSnapshot(collection(db, "candidates"), (snap) => {
  candidates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  document.querySelectorAll(".plan-live").forEach(renderSlot);
  renderBudget();
  backfillPreviews();
});

// ---------- Handlinger ----------
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn || !me) return;
  const id = btn.closest(".plan-item").dataset.id;
  const c = candidates.find((x) => x.id === id);
  const ref = doc(db, "candidates", id);
  btn.disabled = true;
  try {
    if (btn.dataset.act === "vote") {
      const on = (c.votes || []).includes(me.name);
      await updateDoc(ref, { votes: on ? arrayRemove(me.name) : arrayUnion(me.name) });
    } else if (btn.dataset.act === "price") {
      const v = prompt(`Totalpris for alle (kr) – ${c.name}`, hasTotal(c) ? c.total : (c.price || "").replace(/[^0-9]/g, ""));
      if (v !== null) {
        const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
        if (Number.isInteger(n)) await updateDoc(ref, { total: n });
      }
    } else if (btn.dataset.act === "book") {
      await updateDoc(ref, { status: c.status === "booket" ? "kandidat" : "booket" });
    } else if (btn.dataset.act === "del" && confirm(`Slette «${c.name}»?`)) {
      await deleteDoc(ref);
    }
  } catch (ex) {
    alert("Kunne ikke lagre: " + ex.message);
  }
  btn.disabled = false;
});

document.addEventListener("submit", async (e) => {
  const form = e.target.closest(".plan-form");
  if (!form || !me) return;
  e.preventDefault();
  const f = form.elements;
  const url = f.url.value.trim();
  if (url && !/^https:\/\//.test(url)) return alert("Lenken må starte med https://");
  const submit = form.querySelector("button");
  submit.disabled = true;
  submit.textContent = url ? "Henter bilde …" : "Legger til …";
  try {
    const pv = form._preview && form._preview.url === url ? form._preview : await fetchPreview(url);
    await addDoc(collection(db, "candidates"), {
      ...(pv.image ? { image: pv.image } : {}),
      ...(pv.details ? { details: pv.details } : {}),
      slot: form.dataset.slot,
      type: f.type ? f.type.value : "Leiebil",
      name: f.name.value.trim(),
      url,
      area: f.area.value.trim(),
      price: "",
      ...(f.total.value !== "" ? { total: parseInt(f.total.value, 10) } : {}),
      note: f.note.value.trim(),
      status: "kandidat",
      votes: [me.name],
      by: me.name,
      createdAt: serverTimestamp(),
    });
  } catch (ex) {
    alert("Kunne ikke lagre: " + ex.message);
    submit.disabled = false;
    submit.textContent = "Legg til";
  }
});

// Lim inn lenke → fyll inn navn, sted og type automatisk.
let fetchTimer;
document.addEventListener("input", (e) => {
  const input = e.target.closest(".plan-form input[name=url]");
  if (!input) return;
  clearTimeout(fetchTimer);
  fetchTimer = setTimeout(() => autofill(input.form), 500);
});

async function autofill(form) {
  const url = form.elements.url.value.trim();
  const status = form.querySelector(".plan-fetch");
  if (!/^https:\/\/.+\..+/.test(url)) {
    status.innerHTML = "";
    return;
  }
  status.innerHTML = `<span class="plan-fetch-wait">Henter navn og bilde …</span>`;
  const pv = await fetchPreview(url);
  if (form.elements.url.value.trim() !== url) return; // lenken ble endret i mellomtiden
  form._preview = { ...pv, url };
  const fill = (field, value) => {
    const el = form.elements[field];
    if (!el || !value) return;
    if (!el.value || el.dataset.auto === "1") {
      el.value = value;
      el.dataset.auto = "1";
    }
  };
  fill("name", pv.name);
  if (form.dataset.slot !== "car") {
    fill("area", pv.area);
    if (pv.type) form.elements.type.value = pv.type;
  }
  status.innerHTML = pv.name || pv.image
    ? `<div class="plan-fetch-found">${pv.image ? `<img src="${esc(pv.image)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}
         <div><b>${esc(pv.name || "Fant bilde")}</b>${pv.details ? `<span>${esc(pv.details)}</span>` : ""}</div></div>`
    : `<span class="plan-fetch-wait">Fant ikke navn automatisk – skriv det inn selv.</span>`;
}

document.addEventListener("input", (e) => {
  const el = e.target.closest(".plan-form input[name=name], .plan-form input[name=area]");
  if (el && e.isTrusted) el.dataset.auto = "";
});

// ---------- Leiebil: avkrysning ----------
onSnapshot(collection(db, "todos"), (snap) => {
  const state = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
  let done = 0;
  document.querySelectorAll(".car-todo li").forEach((li, i) => {
    const s = state[li.dataset.todo];
    const isDone = s ? s.done : CAR.todo[i].done;
    li.classList.toggle("is-done", isDone);
    li.title = s && s.by ? `Sist endret av ${s.by}` : "";
    if (isDone) done++;
  });
  const count = document.querySelector("[data-todo-count]");
  if (count) count.textContent = `${done} / ${CAR.todo.length}`;
});

document.addEventListener("click", async (e) => {
  const check = e.target.closest(".car-check");
  if (!check || !me) return;
  const li = check.closest("li");
  await setDoc(doc(db, "todos", li.dataset.todo), { done: !li.classList.contains("is-done"), by: me.name }).catch((ex) =>
    alert("Kunne ikke lagre: " + ex.message),
  );
});
