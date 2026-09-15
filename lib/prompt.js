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

// How far the redesign is allowed to go. Set by the visitor.
export const SCOPES = {
  "Furniture only": "Change ONLY the furniture, rugs, textiles, lighting fixtures and decor. Every surface must stay exactly as it is: keep the existing wall covering, panelling, paint colour, ceiling, flooring and carpet precisely as they appear in the photo. Do not paint, resurface or replace anything attached to the building.",
  "Furniture and paint": "Change the furniture, rugs, textiles, lighting and decor, and you may repaint or refinish the walls and ceiling. Keep the existing flooring, windows, doors and built-in joinery as they are.",
  "Full renovation": "You may change furniture, decor, paint, flooring, wall coverings, lighting and built-in joinery. Keep the room's structure: walls in the same places, same windows and doors, same ceiling shape.",
};

// True of every redesign, whatever the scope. These are the things that make a
// picture stop being a picture of the visitor's own home.
const ALWAYS = "Reproduce the building itself faithfully. Every doorway, archway, opening, passage, hallway and stairway must stay exactly where it is and must never be blocked, filled in, narrowed or replaced with cabinetry, shelving or a wall. Never add a doorway or opening that is not there. Masonry and permanent features — fireplaces, chimney breasts, stone and brick work, hearths, beams, columns and built-in joinery — must be reproduced with the same stone or brick, the same colour, the same texture, the same shape and the same proportions as the photo, unless the homeowner specifically asked for that feature to change. Keep the ceiling shape, beam layout, skylights, window and door positions and sizes exactly as photographed.";

export function buildPrompt(room, style, notes = "", vibe = "", keep = [], replace = [], scope = "Full renovation") {
  if (style === "Surprise me" || !style) style = SURPRISE[Math.floor(Math.random() * SURPRISE.length)];
  const hint = STYLE_HINTS[style] || style;
  const v = VIBES[vibe] ? `, ${VIBES[vibe]}` : "";
  const k = keep.length ? ` Keep these exactly as they are: ${keep.join(", ")}.` : "";
  const r = replace.length ? ` Swap out these pieces for different ones that suit the new style: ${replace.join(", ")}.` : "";
  const extra = notes ? ` The homeowner says: ${notes}` : "";
  const sc = SCOPES[scope] || SCOPES["Full renovation"];
  return `Redesign this ${room.toLowerCase()} in a ${hint} style${v}. ${sc}${k}${r}${extra} ` +
    `The finished image must contain NO ladders, step stools, tools, toolboxes, paint cans, drop cloths, tarps, packing boxes, bags, laundry, cables or cleaning supplies — remove every trace of them and show the floor, walls and furniture as if the work were already finished. ` +
    `Tidy the space completely: no clutter, no loose blankets, nothing left lying on the floor, unless the homeowner asked to keep it. ` +
    `${ALWAYS} ` +
    `Keep the same viewpoint and proportions: same camera angle, same room shape. ` +
    `Bright and well lit with warm daylight, clean and crisp, sharp focus, professionally styled, magazine-quality interior photograph. No people, no text.`;
}
