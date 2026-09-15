import { claude, MODEL } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 30;

// Turns the visitor's change request into a fresh image prompt, carrying
// everything they've asked for so far. History is flattened into one message
// so we never send two turns from the same side in a row.
export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });

  const { room, style, history = [], message } = await req.json();
  if (!message) return Response.json({ error: "Say what you'd like to change." }, { status: 400 });

  const asked = history.filter((h) => h.role === "user").map((h) => h.content);
  const brief = asked.length
    ? `Everything they've asked for so far, oldest first:\n${asked.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nTheir newest request: ${message}`
    : `Their request: ${message}`;

  const client = claude();
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: `You are an interior designer refining a room render. The room is a ${room}${style ? ` in ${style} style` : ""}. Reply ONLY with raw JSON, no markdown: {"reply": "one short friendly sentence confirming the change", "prompt": "a complete image prompt for the whole room under 100 words that honours EVERY request listed, including the earlier ones"}. The prompt must end with: every doorway, opening and passage stays exactly where it is and is never blocked or filled in, masonry and fireplaces keep the same stone, colour and shape, bright and well lit, crisp and polished, magazine-quality interior photograph, keep the same room layout, walls, windows and camera angle.`,
      messages: [{ role: "user", content: brief }],
    });
    const text = msg.content.map((c) => c.text || "").join("");
    const out = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!out.prompt) throw new Error("no prompt returned");
    return Response.json(out);
  } catch (e) {
    console.error("refine failed", e);
    const raw = e?.error?.error?.message ?? e?.error?.message ?? e?.message ?? "";
    const detail = typeof raw === "string" && raw.trim() ? raw.trim() : "";
    return Response.json({ error: detail ? `Couldn't make that change. ${detail}` : "Couldn't make that change. Try rephrasing, or reload and start again." }, { status: 502 });
  }
}
