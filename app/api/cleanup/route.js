import { list, del } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

// Deletes room photos older than PHOTO_RETENTION_DAYS (default 30).
// Runs on a schedule via vercel.json, and can be triggered by hand with
// the CRON_SECRET as a bearer token.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const days = Number(process.env.PHOTO_RETENTION_DAYS || 30);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  let cursor;
  let checked = 0;
  let deleted = 0;
  try {
    do {
      const page = await list({ prefix: "rooms/", cursor, limit: 1000 });
      const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff);
      checked += page.blobs.length;
      if (old.length) {
        await del(old.map((b) => b.url));
        deleted += old.length;
      }
      cursor = page.cursor;
    } while (cursor);
  } catch (e) {
    console.error("cleanup failed", e);
    return Response.json({ error: e?.message || "Cleanup failed.", checked, deleted }, { status: 500 });
  }

  return Response.json({ ok: true, checked, deleted, olderThanDays: days });
}
