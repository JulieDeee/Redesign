// One place to tune how each style is described to the image model.
export const STYLE_HINTS = {
  "Cabin chic": "cabin chic, warm wood, cozy layered textiles, greenery, candlelight, whites browns and greens",
  "Modern classic": "modern classic, tailored upholstery, symmetry, warm neutrals, brass accents, timeless",
  "Organic modern": "organic modern, curved furniture, natural textures, warm whites and clay, abundant greenery",
  Moody: "moody, deep saturated walls, dark wood, layered lamplight, velvet and leather",
  Modern: "modern, clean lines, neutral palette, statement lighting",
  Scandinavian: "Scandinavian, light wood, white walls, soft textiles, cozy minimalism",
  Japandi: "Japandi, warm wood, low furniture, muted earth tones, calm and uncluttered",
  "Mid-century": "mid-century modern, walnut furniture, tapered legs, mustard and teal accents",
  Farmhouse: "modern farmhouse, shiplap, reclaimed wood, black metal fixtures, cozy",
  Rustic: "rustic, reclaimed timber, stone, wool and leather, earthy tones",
  Traditional: "traditional, classic furniture, rich wood, layered patterns, elegant symmetry",
  Transitional: "transitional, blend of classic and contemporary, soft neutrals, tailored furniture",
  Coastal: "coastal, white and sandy tones, rattan, linen, sea-glass blue accents",
  Industrial: "industrial loft, exposed brick, black steel, leather, Edison bulbs",
  Boho: "bohemian, layered textiles, plants, rattan, warm eclectic colors",
  Glam: "glam, velvet, brass and gold accents, mirrored surfaces, jewel tones",
};

const SURPRISE = Object.keys(STYLE_HINTS);

export const VIBES = {
  "Cozy & warm": "cozy and warm, soft layered lighting, inviting textures",
  "Bright & airy": "bright and airy, light filled, uncluttered, fresh",
  "Moody & dramatic": "moody and dramatic, deep tones, pools of lamplight",
  "Calm & minimal": "calm and minimal, restrained, few but beautiful pieces",
  "Elevated & polished": "elevated and polished, tailored, quietly luxurious",
  "Collected & eclectic": "collected and eclectic, layered with character and personal pieces",
};

export function buildPrompt(room, style, notes = "", vibe = "", keep = [], replace = []) {
  if (style === "Surprise me" || !style) style = SURPRISE[Math.floor(Math.random() * SURPRISE.length)];
  const hint = STYLE_HINTS[style] || style;
  const v = VIBES[vibe] ? `, ${VIBES[vibe]}` : "";
  const k = keep.length ? ` Keep these exactly as they are: ${keep.join(", ")}.` : "";
  const r = replace.length ? ` Replace these with something that suits the new style: ${replace.join(", ")}.` : "";
  const extra = notes ? ` The homeowner says: ${notes}` : "";
  return `Redesign this ${room.toLowerCase()} in a ${hint} style${v}.${k}${r}${extra} ` +
    `Tidy the space completely: remove all clutter, loose blankets, cables, boxes, laundry, stray objects and anything left on the floor, unless the homeowner asked to keep it. ` +
    `Keep the exact same room: same walls, windows, doors, floor plan and camera angle. ` +
    `Bright and well lit with warm daylight, clean and crisp, sharp focus, professionally styled, magazine-quality interior photograph. No people, no text.`;
}
