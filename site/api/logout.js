// Sletter innloggingscookien og sender deg tilbake til innloggingssiden.
module.exports = (req, res) => {
  res.setHeader("Set-Cookie", "rbr_pass=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
  res.setHeader("Cache-Control", "no-store");
  res.writeHead(302, { Location: "/login.html" });
  res.end();
};
