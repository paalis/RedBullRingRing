// Hele siden ligger bak lagkoden. Uten gyldig innloggingscookie sendes man til /login.html.
// Cookien lages av api/login.js og er signert med SESSION_SECRET (Vercel-miljøvariabel).
import { next } from "@vercel/functions";

export const config = {
  // Alt unntatt innloggingssiden og det den trenger (fonter, Firebase-biblioteket, innloggings-API-et).
  matcher: ["/((?!login\\.html|api/login|api/logout|assets/fonts/|assets/icons/|site\\.webmanifest|apple-touch-icon|assets/vendor/firebase\\.js|favicon).*)"],
};

const COOKIE = "rbr_pass";

async function valid(value, secret) {
  const [exp, sig] = String(value || "").split(".");
  if (!exp || !sig || !secret || Number(exp) < Date.now() / 1000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const bytes = new Uint8Array((sig.match(/../g) || []).map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(`v1.${exp}`));
}

export default async function middleware(request) {
  const cookie = (request.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (await valid(cookie && cookie.slice(COOKIE.length + 1), process.env.SESSION_SECRET)) return next();
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Ikke innlogget" }), { status: 401, headers: { "content-type": "application/json" } });
  }
  return new Response(null, { status: 302, headers: { Location: "/login.html", "Cache-Control": "no-store" } });
}
