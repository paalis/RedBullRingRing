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

function metaImage(html) {
  for (const key of ["og:image:secure_url", "og:image", "twitter:image"]) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
      "i",
    );
    const m = html.match(re);
    if (m) return (m[1] || m[2]).replace(/&amp;/g, "&");
  }
  return null;
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
    const raw = metaImage(html);
    const image = raw ? new URL(raw, r.url) : null;
    if (!image || image.protocol !== "https:") return res.status(404).end(JSON.stringify({ error: "Fant ikke bilde" }));
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).end(JSON.stringify({ image: image.href }));
  } catch {
    return res.status(502).end(JSON.stringify({ error: "Kunne ikke hente siden" }));
  }
};
