import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });

  const { imageUrl, room, style } = await req.json();
  if (!imageUrl) return Response.json({ error: "No image." }, { status: 400 });

  const client = new Anthropic({ apiKey });
  try {
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 900,
      system: "You are a friendly interior designer helping a homeowner shop for a room. Reply ONLY with raw JSON. No markdown, no preamble.",
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: `This is a ${style} redesign of a ${room}. Return JSON exactly like: {"summary": "one warm sentence describing the new look", "palette": ["#hex","#hex","#hex","#hex"], "changes": ["4 short concrete changes"], "shopping": [{"name": "product a shopper would search for", "why": "under 10 words on where it goes", "price": "$120", "search": "3-5 word shopping search phrase"}]} with exactly 4 shopping items, ordered from biggest visual impact to smallest.` },
        ],
      }],
    });
    const text = msg.content.map((c) => c.text || "").join("");
    const brief = JSON.parse(text.replace(/```json|```/g, "").trim());
    const tag = process.env.AMAZON_AFFILIATE_TAG || "";
    brief.shopping = (brief.shopping || []).map((it) => ({
      ...it,
      url: `https://www.amazon.com/s?k=${encodeURIComponent(it.search || it.name)}${tag ? `&tag=${tag}` : ""}`,
    }));
    return Response.json(brief);
  } catch (e) {
    console.error("brief failed", e);
    return Response.json({ error: "Couldn't write the design brief." }, { status: 502 });
  }
}
