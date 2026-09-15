import { claude, MODEL } from "@/lib/claude";
import { shopLinks } from "@/lib/retailers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });

  const { imageUrl, room, style } = await req.json();
  if (!imageUrl) return Response.json({ error: "No image." }, { status: 400 });

  const client = claude();
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1400,
      system: "You are a friendly interior designer helping a homeowner shop for a room. Reply ONLY with raw JSON. No markdown, no preamble.",
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: `This is a ${style} redesign of a ${room}. Return JSON exactly like: {"summary": "one warm sentence describing the new look", "palette": ["#hex","#hex","#hex","#hex"], "changes": ["4 short concrete changes"], "shopping": [{"name": "the piece as a shopper would name it, capitalised like a product title", "why": "under 10 words on where it goes", "search": "3-5 word shopping search phrase"}]} with exactly 8 shopping items, ordered from biggest visual impact to smallest. Cover the whole room, not just the furniture: include lighting, rugs, window treatments, art, plants, cushions and decorative objects where they are part of the look. Describe only what is actually visible in the image. Never claim a mechanism or feature you cannot see — no swivel, reclining, extendable, convertible, storage, adjustable, smart or motorised unless it is plainly visible. Name pieces by shape, material and colour instead, for example "cream upholstered armchair" or "round woven coffee table". The search phrase must match the name, stay generic enough to return real results, and contain no brand names.` },
        ],
      }],
    });
    const text = msg.content.map((c) => c.text || "").join("");
    const brief = JSON.parse(text.replace(/```json|```/g, "").trim());
    brief.shopping = (brief.shopping || []).map((it) => ({
      ...it,
      shops: shopLinks(it.search || it.name),
    }));
    return Response.json(brief);
  } catch (e) {
    console.error("brief failed", e);
    return Response.json({ error: "Couldn't write the design brief." }, { status: 502 });
  }
}
