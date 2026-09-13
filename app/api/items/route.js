import { claude, MODEL } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 30;

// Lists the main pieces in the room, with rough boxes so the page can crop
// a thumbnail of each one out of the visitor's own photo.
export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ items: [] });

  const { imageUrl } = await req.json();
  if (!imageUrl) return Response.json({ items: [] });

  try {
    const client = claude();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: "Reply ONLY with raw JSON. No markdown.",
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: 'List the 4-6 most visually significant furniture pieces, light fixtures and architectural features in this room, biggest first. For each, give a tight bounding box around it as [left, top, right, bottom] where each number is 0-1000 across the image width/height. Return {"items": [{"name": "short label a homeowner would use, e.g. Brown leather sofa", "fixed": true if architectural and unchangeable (fireplace, window, brick wall, flooring) else false, "box": [left, top, right, bottom]}]}' },
        ],
      }],
    });
    const text = msg.content.map((c) => c.text || "").join("");
    const out = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Response.json({ items: out.items || [] });
  } catch (e) {
    console.error("items failed", e);
    return Response.json({ items: [] });
  }
}
