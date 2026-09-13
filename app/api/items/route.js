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
          { type: "text", text: 'This may be a room or an outdoor space. List the 4-6 most visually significant PERMANENT features: furniture, light fixtures, surfaces, plantings and architectural elements. Ignore temporary items: ladders, tools, drop cloths, boxes, bags, laundry, bins, hoses, pets and vehicles. Return {"items": [{"name": "short label a homeowner would use, e.g. Brown leather sofa or Concrete front steps", "kind": one of "seating" "table" "lighting" "storage" "window" "floor" "wall" "plant" "other", "fixed": true ONLY for major structure that would be expensive to alter (walls, roofline, windows, doors, stairs, flooring) else false}]}. Light fixtures, paint colour, planting and furniture are never fixed.' },
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
