// Gir lagkoden til den som allerede er logget inn på siden (middleware.js slipper bare gjennom en gyldig
// rbr_pass-cookie), slik at planleggeren kan gjøre deg til medlem i Firebase uten en ny innlogging.
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).end(JSON.stringify({ error: "Bruk GET" }));
  const { TEAM_CODE } = process.env;
  if (!TEAM_CODE) return res.status(500).end(JSON.stringify({ error: "Lagkoden er ikke satt opp" }));
  return res.status(200).end(JSON.stringify({ code: TEAM_CODE }));
};
