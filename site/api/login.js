// Sjekker lagkoden (TEAM_CODE) og gir en signert cookie som slipper deg inn på hele siden i 180 dager.
const crypto = require("crypto");

const DAYS = 180;
const digest = (s) => crypto.createHash("sha256").update(String(s).trim().toLowerCase()).digest();

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).end(JSON.stringify({ error: "Bruk POST" }));
  const { TEAM_CODE, SESSION_SECRET } = process.env;
  if (!TEAM_CODE || !SESSION_SECRET) return res.status(500).end(JSON.stringify({ error: "Innlogging er ikke satt opp" }));
  const code = (req.body && req.body.code) || "";
  if (!crypto.timingSafeEqual(digest(code), digest(TEAM_CODE))) {
    await new Promise((r) => setTimeout(r, 700)); // bremser gjetting
    return res.status(401).end(JSON.stringify({ error: "Feil lagkode" }));
  }
  const exp = Math.floor(Date.now() / 1000) + DAYS * 86400;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(`v1.${exp}`).digest("hex");
  res.setHeader("Set-Cookie", `rbr_pass=${exp}.${sig}; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`);
  return res.status(200).end(JSON.stringify({ ok: true }));
};
