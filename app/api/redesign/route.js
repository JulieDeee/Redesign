import { put } from "@vercel/blob";
import { allow } from "@/lib/ratelimit";
import { buildPrompt } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const QUALITY = process.env.OPENAI_IMAGE_QUALITY || "high"; // low | medium | high — high costs ~20c, medium ~5c

async function storeImage(bytes, name, contentType) {
  const blob = await put(`rooms/${Date.now()}-${Math.random().toString(36).slice(2)}-${name}`, bytes, {
    access: "public", contentType,
  });
  return blob.url;
}

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "Server is missing OPENAI_API_KEY." }, { status: 500 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  let file, room, style, notes, original, prompt, aspect = 0, isTweak = false;
  let extras = [];

  if ((req.headers.get("content-type") || "").includes("application/json")) {
    // Chat tweak: re-render a photo we already stored with a refined prompt.
    const j = await req.json();
    original = j.imageUrl; room = j.room || "Living room"; style = j.style || "Modern"; prompt = j.prompt; aspect = Number(j.aspect) || 0; isTweak = true;
    if (!original || !prompt) return Response.json({ error: "Nothing to re-render." }, { status: 400 });
    const r = await fetch(original);
    if (!r.ok) return Response.json({ error: "Couldn't load the original photo." }, { status: 400 });
    file = new File([await r.arrayBuffer()], "room.jpg", { type: "image/jpeg" });
  } else {
    if (!allow(ip)) {
      return Response.json({ error: "That's 10 new designs today — nice work. You can keep tweaking any design in chat, or come back tomorrow for more." }, { status: 429 });
    }
    let form;
    try { form = await req.formData(); } catch { return Response.json({ error: "No photo received." }, { status: 400 }); }
    file = form.get("image");
    room = String(form.get("room") || "Living room");
    style = String(form.get("style") || "Modern");
    notes = String(form.get("notes") || "").trim().slice(0, 500);
    aspect = Number(form.get("aspect")) || 0;
    const vibe = String(form.get("vibe") || "");
    const keep = JSON.parse(form.get("keep") || "[]");
    const replace = JSON.parse(form.get("replace") || "[]");
    if (!file || typeof file === "string") return Response.json({ error: "No photo received." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Photo is over 8 MB. Try a smaller one." }, { status: 400 });
    extras = form.getAll("extra").filter((f) => f && typeof f !== "string" && f.size <= 8 * 1024 * 1024).slice(0, 3);
    prompt = buildPrompt(room, style, notes, vibe, keep, replace);
    try {
      original = await storeImage(file, "original.jpg", file.type || "image/jpeg");
    } catch (e) {
      console.error("blob upload failed", e);
      const detail = e?.message || String(e);
      const seen = ["BLOB_STORE_ID", "BLOB_READ_WRITE_TOKEN", "VERCEL_OIDC_TOKEN"].filter((k) => process.env[k]).join(", ") || "none";
      return Response.json({ error: `Couldn't store the photo. ${detail} (blob vars present: ${seen})` }, { status: 500 });
    }
  }

  // Ask OpenAI to edit the photo. Same model family as ChatGPT's image tool.
  let b64;
  try {
    const fd = new FormData();
    fd.append("model", MODEL);
    fd.append("image", file, "room.jpg");
    // Extra angles of the same room help the model understand the space.
    extras.forEach((f, i) => fd.append("image[]", f, `angle${i + 1}.jpg`));
    fd.append("prompt", prompt);
    fd.append("quality", QUALITY);
    // Match the shape of the photo they uploaded, so before and after line up.
    fd.append("size", aspect > 1.2 ? "1536x1024" : aspect && aspect < 0.85 ? "1024x1536" : "1024x1024");
    fd.append("n", "1");
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("openai error", data);
      const msg = data?.error?.message || "The design service said no. Try a clearer photo.";
      return Response.json({ error: msg }, { status: 502 });
    }
    b64 = data.data?.[0]?.b64_json;
  } catch (e) {
    console.error("openai request failed", e);
    return Response.json({ error: "The design service didn't answer. Try again in a moment." }, { status: 502 });
  }
  if (!b64) return Response.json({ error: "No image came back. Try again." }, { status: 502 });

  let redesigned;
  try {
    redesigned = await storeImage(Buffer.from(b64, "base64"), "redesign.png", "image/png");
  } catch (e) {
    console.error("blob store result failed", e);
    return Response.json({ error: "Made the design but couldn't save it. Try again." }, { status: 500 });
  }

  return Response.json({ original, redesigned, room, style, prompt, aspect, isTweak });
}
