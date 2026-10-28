// Henter delingsbildet (og:image) fra en annonse, slik at planleggeren kan vise et forsidebilde.
// Bare kjente bestillings- og utleiesider er tillatt, så funksjonen ikke kan brukes til å hente vilkårlige adresser.
const ALLOWED = [
  /(^|\.)airbnb\.[a-z.]{2,6}$/,
  /(^|\.)abnb\.me$/,
  /(^|\.)booking\.com$/,
  /(^|\.)hotels\.com$/,
  /(^|\.)expedia\.[a-z.]{2,6}$/,
  /(^|\.)vrbo\.com$/,
  /(^|\.)agoda\.com$/,
  /(^|\.)hostelworld\.com$/,
  /(^|\.)sixt\.[a-z.]{2,6}$/,
  /(^|\.)hertz\.[a-z.]{2,6}$/,
  /(^|\.)avis\.[a-z.]{2,6}$/,
  /(^|\.)europcar\.[a-z.]{2,6}$/,
  /(^|\.)enterprise\.[a-z.]{2,6}$/,
  /(^|\.)rentalcars\.com$/,
];

const allowed = (u) => u.protocol === "https:" && ALLOWED.some((re) => re.test(u.hostname.toLowerCase()));

function meta(html, keys) {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
      "i",
    );
    const m = html.match(re);
    if (m) return decodeEntities(m[1] || m[2]).trim();
  }
  return null;
}

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

// Airbnb: og:description er annonsens navn, og:title er «Type · Sted · ★4,9 · 2 soverom · …».
// Andre sider: navnet står i tittelen, gjerne fulgt av « – oppdaterte priser …» eller « | Booking.com».
function describe(host, title, description) {
  const clip = (s, n) => s.replace(/\s+/g, " ").trim().slice(0, n);
  if (/(^|\.)(airbnb\.[a-z.]+|abnb\.me)$/.test(host)) {
    const parts = title.split(" · ").map((s) => s.trim()).filter(Boolean);
    return {
      name: clip(description || parts[0] || "", 80),
      area: clip(parts[1] || "", 60),
      details: clip(title, 200),
      type: "Airbnb",
    };
  }
  const name = title.split(/\s+[|–—-]\s+/)[0].replace(/[★⭐]+/g, "").replace(/,\s*[^,]+$/, (m) => (m.length < 25 ? "" : m));
  const hotel = /(^|\.)(booking\.com|hotels\.com|expedia\.[a-z.]+|agoda\.com|hostelworld\.com)$/.test(host);
  return { name: clip(name, 80), area: "", details: "", type: hotel ? "Hotell" : "" };
}

// Omtrentlig posisjon fra annonsens innebygde data (Airbnb oppgir et punkt nær stedet, ikke nøyaktig adresse).
function coords(html) {
  const lat = html.match(/"lat(?:itude)?"\s*:\s*(-?\d{1,2}\.\d+)/);
  const lng = html.match(/"(?:lng|lon|longitude)"\s*:\s*(-?\d{1,3}\.\d+)/);
  if (!lat || !lng) return null;
  const round = (v) => Math.round(parseFloat(v) * 10000) / 10000;
  const p = { lat: round(lat[1]), lng: round(lng[1]) };
  return Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180 ? p : null;
}

// Bydel: Airbnbs høydepunkt («I Leopoldstadt, rett ved T-banen») hvis det finnes, ellers OpenStreetMap.
async function district(html, pos) {
  const hi = html.match(/"title"\s*:\s*"I ([A-ZÆØÅÄÖÜ][^",]{2,40})[,"]/);
  if (hi) return hi[1].trim();
  if (!pos) return "";
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}&zoom=14&accept-language=de`,
      { headers: { "User-Agent": "RBR27-trip-planner/1.0 (+https://redbullringring.vercel.app)" }, signal: AbortSignal.timeout(4000) },
    );
    const a = (await r.json()).address || {};
    return (a.city_district || a.suburb || a.quarter || a.town || a.village || a.city || "").replace(/^Katastralgemeinde\s+/, "");
  } catch {
    return "";
  }
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  let target;
  try {
    target = new URL(String(req.query.url || ""));
  } catch {
    return res.status(400).end(JSON.stringify({ error: "Ugyldig lenke" }));
  }
  if (!allowed(target)) return res.status(400).end(JSON.stringify({ error: "Siden støttes ikke" }));

  try {
    const r = await fetch(target, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RBR27-linkpreview/1.0; +https://redbullringring.vercel.app)",
        "Accept-Language": "nb-NO,nb;q=0.9,en;q=0.8",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!allowed(new URL(r.url))) return res.status(400).end(JSON.stringify({ error: "Siden støttes ikke" }));
    const html = (await r.text()).slice(0, 600000);
    const raw = meta(html, ["og:image:secure_url", "og:image", "twitter:image"]);
    const img = raw ? new URL(raw, r.url) : null;
    const image = img && img.protocol === "https:" ? img.href : "";
    const title = (meta(html, ["og:title", "twitter:title"]) || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "").trim();
    const description = meta(html, ["og:description", "twitter:description", "description"]) || "";
    if (!image && !title) return res.status(404).end(JSON.stringify({ error: "Fant ingenting" }));
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    const info = describe(new URL(r.url).hostname, decodeEntities(title), description);
    const pos = info.type === "Airbnb" ? coords(html) : null;
    const area = info.type === "Airbnb" ? (await district(html, pos)) || info.area : info.area;
    return res.status(200).end(JSON.stringify({ image, ...info, area: area.slice(0, 60), ...(pos || {}) }));
  } catch {
    return res.status(502).end(JSON.stringify({ error: "Kunne ikke hente siden" }));
  }
};
