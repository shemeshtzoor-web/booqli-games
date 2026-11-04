/* BOOQLI – שרת תמונות קטן לעמוד הסבים (Cloudflare Worker + Workers KV), 4.11.2026
   POST /            ← תמונת JPEG מהעמוד games.booqli.ai/savta/ (עד 8MB) → {url}
   GET  /p/<id>.jpg  ← התמונה (רק מי שיש לו את הקישור; השם אקראי ולא ניתן לניחוש)
   מחיקה: כל תמונה נשמרת עם תפוגה של 90 יום (expirationTtl) ונמחקת לבד.
   למה KV ולא R2: KV כלול בתוכנית החינמית בלי מנוי ובלי כרטיס אשראי (1,000 העלאות ביום, 1GB).
   באוויר (4.11.2026): https://booqli-photos.shemeshtzoor.workers.dev (חשבון Cloudflare של שמש, KV id b0c30dbe8ab643e782d3d5da7d71f315).
   עדכון קוד: dash.cloudflare.com ← Workers & Pages ← booqli-photos ← Edit code ← להדביק ← Deploy.
   הגדרה ב-Cloudflare: Worker בשם booqli-photos, חיבור KV בשם PHOTOS ל-namespace בשם booqli-savta-photos. */
const ALLOW = ["https://games.booqli.ai", "http://localhost:8765"];
const cors = o => ({ "Access-Control-Allow-Origin": ALLOW.includes(o) ? o : ALLOW[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" });
const id = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, "0")).join(""); };

export default {
  async fetch(req, env) {
    const url = new URL(req.url), o = req.headers.get("Origin") || "";
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(o) });
    if (req.method === "POST" && url.pathname === "/") {
      if (!ALLOW.includes(o)) return new Response("forbidden", { status: 403 });
      const type = req.headers.get("Content-Type") || "";
      if (!/^image\/(jpeg|png|webp)$/.test(type)) return new Response("images only", { status: 415, headers: cors(o) });
      const body = await req.arrayBuffer();
      if (body.byteLength < 1000 || body.byteLength > 8e6) return new Response("bad size", { status: 413, headers: cors(o) });
      const key = id() + ".jpg";
      await env.PHOTOS.put(key, body, { expirationTtl: 90 * 24 * 3600, metadata: { type } });
      return Response.json({ url: url.origin + "/p/" + key }, { headers: cors(o) });
    }
    const m = url.pathname.match(/^\/p\/([a-f0-9]{36}\.jpg)$/);
    if (req.method === "GET" && m) {
      const { value, metadata } = await env.PHOTOS.getWithMetadata(m[1], { type: "arrayBuffer" });
      if (!value) return new Response("not found", { status: 404 });
      return new Response(value, { headers: { "Content-Type": (metadata && metadata.type) || "image/jpeg", "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" } });
    }
    return new Response("BOOQLI", { status: 404 });
  }
};
