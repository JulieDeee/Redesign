import { put } from "@vercel/blob";

export const runtime = "nodejs";

// Stores the photo so the vision call can see it. Returns a public URL.
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file || typeof file === "string") return Response.json({ url: null }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ url: null }, { status: 400 });
    const blob = await put(`rooms/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, file, {
      access: "public", contentType: file.type || "image/jpeg",
    });
    return Response.json({ url: blob.url });
  } catch (e) {
    console.error("upload failed", e);
    return Response.json({ url: null, error: e?.message || String(e) }, { status: 500 });
  }
}
