"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BRAND, TAGLINE } from "@/lib/brand";

const ROOMS = [
  "Living room", "Bedroom", "Kitchen", "Bathroom", "Dining room", "Home office",
  "Nursery", "Kids room", "Basement", "Laundry room", "Entryway", "Hallway",
  "Front entrance", "Back entrance", "Front porch", "Back porch", "Patio or deck",
  "Backyard", "Front yard", "Garden", "Pool area", "Garage", "Balcony",
];
const STYLES = ["Cabin chic", "Modern classic", "Organic modern", "Coastal", "Moody", "Scandinavian", "Farmhouse", "Japandi", "Mid-century", "Rustic", "Traditional", "Industrial", "Boho", "Glam", "Surprise me"];
const VIBES = ["Cozy & warm", "Bright & airy", "Moody & dramatic", "Calm & minimal", "Elevated & polished", "Collected & eclectic"];
const SCOPES = [
  { id: "Furniture only", label: "Furniture only", hint: "Keep every surface — walls, floor, ceiling stay exactly as they are" },
  { id: "Furniture and paint", label: "Furniture and paint", hint: "New look plus fresh paint. Flooring and joinery stay" },
  { id: "Full renovation", label: "Full renovation", hint: "Anything goes except the room's shape and windows" },
];
const HERO_EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];

function Hero() {
  const [i, setI] = useState(0);
  if (i >= HERO_EXTS.length) return null;
  return <img src={`/hero.${HERO_EXTS[i]}`} alt="" onError={() => setI(i + 1)} />;
}

// A site photo (before/after/hero) that tries each extension, or a photo the
// visitor just uploaded, which is already a blob URL and needs no fallback.
function StackPhoto({ src, base }) {
  const [i, setI] = useState(0);
  if (src) return <span><img src={src} alt="" /></span>;
  if (i >= HERO_EXTS.length) return null;
  return <span><img src={`/${base}.${HERO_EXTS[i]}`} alt="" onError={() => setI(i + 1)} /></span>;
}

const PROMPTS = [
  "Make it feel warm and cozy with modern touches.",
  "Keep my furniture but give it a fresh, elevated look.",
  "I want a lighter, brighter space with natural textures.",
  "Turn this into a moody, luxury space.",
  "Surprise me — I'm open to ideas!",
];

async function shrink(file, max = 1536) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
  return { file: new File([blob], "room.jpg", { type: "image/jpeg" }), aspect: c.width / c.height };
}

// A simple mark for each kind of thing we find in the room.
const KIND_ICON = {
  seating: "🛋", table: "🪵", lighting: "💡", storage: "🗄",
  window: "🪟", floor: "▦", wall: "🖼", plant: "🌿", other: "✦",
};

export default function Designer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aspect, setAspect] = useState(0);
  const [angles, setAngles] = useState([]);          // { file, url }
  const [room, setRoom] = useState("Living room");
  const [style, setStyle] = useState("");
  const [vibe, setVibe] = useState("");
  const [scope, setScope] = useState("Furniture and paint");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [brief, setBrief] = useState(null);
  const [chat, setChat] = useState([]);
  const [draft, setDraft] = useState("");
  const [refining, setRefining] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [split, setSplit] = useState(52);
  const [err, setErr] = useState("");
  const fileRef = useRef();
  const angleRef = useRef();

  // Carried over when someone picks a style on the home page.
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("style");
    if (preset && STYLES.includes(preset)) setStyle(preset);
  }, []);

  const step = !file ? 1 : !notes.trim() ? 2 : !style ? 3 : 4;

  const onFile = async (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    const { file: small, aspect: a } = await shrink(f);
    setFile(small); setAspect(a); setPreview(URL.createObjectURL(small));
    setPhase("idle"); setResult(null); setBrief(null); setChat([]); setErr(""); setItems([]);
    setLoadingItems(true);
    try {
      const fd = new FormData(); fd.append("image", small);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await up.json();
      if (url) {
        const r = await fetch("/api/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: url }) });
        const j = await r.json();
        setItems((j.items || []).map((it) => ({ ...it, keep: !!it.fixed })));
      }
    } catch {}
    setLoadingItems(false);
  };

  const addAngle = async (f) => {
    if (!f || !f.type.startsWith("image/") || angles.length >= 3) return;
    const { file: small } = await shrink(f);
    setAngles((a) => [...a, { file: small, url: URL.createObjectURL(small) }]);
  };

  const loadBrief = (url) => {
    fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: url, room, style }) })
      .then((b) => b.json()).then((b) => { if (!b.error) setBrief(b); }).catch(() => {});
  };

  const generate = async () => {
    if (!file) return;
    setPhase("working"); setErr(""); setBrief(null);
    try {
      const fd = new FormData();
      fd.append("image", file); fd.append("room", room); fd.append("style", style || "Surprise me");
      fd.append("notes", notes); fd.append("vibe", vibe); fd.append("scope", scope); fd.append("aspect", String(aspect));
      angles.forEach((a) => fd.append("extra", a.file));
      fd.append("keep", JSON.stringify(items.filter((i) => i.keep).map((i) => i.name)));
      fd.append("replace", JSON.stringify(items.filter((i) => !i.keep && !i.fixed).map((i) => i.name)));
      const r = await fetch("/api/redesign", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(typeof j.error === "string" && j.error ? j.error : "Design failed. Try again in a moment.");
      setShowAll(false); setResult(j); setPhase("done"); setChat(notes.trim() ? [{ role: "user", content: notes.trim() }] : []);
      loadBrief(j.redesigned);
    } catch (e) { setErr(e.message); setPhase("idle"); }
  };

  const refine = async () => {
    const message = draft.trim();
    if (!message || !result || refining) return;
    setDraft(""); setRefining(true); setErr("");
    const next = [...chat, { role: "user", content: message }];
    setChat(next);
    try {
      const r = await fetch("/api/refine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room, style, history: chat, message }) });
      const j = await r.json();
      if (!r.ok) throw new Error(typeof j.error === "string" && j.error ? j.error : "Couldn't make that change.");
      setChat([...next, { role: "assistant", content: j.reply }]);
      const r2 = await fetch("/api/redesign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: result.original, room, style, prompt: j.prompt, aspect }) });
      const j2 = await r2.json();
      if (!r2.ok) throw new Error(typeof j2.error === "string" && j2.error ? j2.error : "Couldn't re-render that. Try again.");
      setResult(j2); setBrief(null); loadBrief(j2.redesigned);
    } catch (e) { setErr(e.message); }
    setRefining(false);
  };

  return (
    <>
      <nav className="bar">
        <Link href="/" className="logo">{BRAND.toUpperCase()}<small>{TAGLINE}</small></Link>
        <div className="barlinks">
          <Link href="/">Home</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#styles">Styles</Link>
          
        </div>
        <span style={{ color: "var(--soft)", fontSize: 14 }}>Free · 10 a day</span>
      </nav>

      <div className="banner">
        <Hero />
        <div className="scrim" />
        <div className="inner">
          <h1 className="h">Upload. Describe. Redesign.</h1>
          <p>Your space. Our inspiration. Endless possibilities.</p>
        </div>
        <p className="scriptfont say">Same space.<br />A better you.</p>
      </div>

      {phase === "done" && result ? (
        <div className="result">
          <div className="stage" style={aspect ? { aspectRatio: String(aspect) } : undefined}>
            <img src={result.redesigned} alt={`${style || "New"} redesign`} />
            <div className="after" style={{ width: `${split}%` }}>
              <img src={preview} alt="Your room before" style={{ width: `${10000 / split}%` }} />
            </div>
            <span className="pill" style={{ left: 16 }}>BEFORE</span>
            <span className="pill" style={{ right: 16 }}>AFTER</span>
            <input className="range" type="range" min="5" max="95" value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="Compare before and after" />
            {refining && <div className="veil"><div><p className="h">Making that change…</p><small>About half a minute.</small></div></div>}
          </div>

          <div className="panel">
            {!brief ? <p className="summary h" style={{ color: "var(--soft)" }}>Writing your design notes…</p> : (
              <>
                <p className="summary h">{brief.summary}</p>
                <div className="swatches">{brief.palette?.map((c) => <span key={c} title={c} style={{ background: c }} />)}</div>
                <p className="label">WHAT CHANGED</p>
                <ul>{brief.changes?.map((c) => <li key={c}>{c}</li>)}</ul>
                <p className="label">SHOP THIS ROOM</p>
                <div className="shop">
                  {(showAll ? brief.shopping : brief.shopping?.slice(0, 4))?.map((it, i) => (
                    <div key={it.name} className="shopitem">
                      <span className="rank">{i + 1}</span>
                      <span className="swatch" style={{ background: brief.palette?.[i % (brief.palette?.length || 1)] || "var(--taupe)" }} />
                      <span className="what">
                        <span className="name">{it.name}</span>
                        <span className="why">{it.why}</span>
                      </span>
                      <span className="shops">
                        {(it.shops || []).map((sh) => (
                          <a key={sh.id} href={sh.url} target="_blank" rel="noreferrer sponsored">{sh.label} →</a>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                {brief.shopping?.length > 4 && (
                  <button className="seeall" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Show fewer" : `See everything in this room (${brief.shopping.length})`}
                  </button>
                )}
                <p className="disc">Links may earn us a commission at no cost to you.</p>
              </>
            )}

            <div className="chat">
              <p className="label">CHANGE SOMETHING</p>
              {chat.map((m, i) => <p key={i} className={`msg ${m.role}`}>{m.content}</p>)}
              <div className="chatrow">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && refine()}
                  placeholder="Keep the chairs, swap the chandelier for a flush ceiling light…" disabled={refining} aria-label="Describe a change" />
                <button className="btn" onClick={refine} disabled={refining || !draft.trim()}>Update</button>
              </div>
              {err && <p className="err">{err}</p>}
            </div>

            <div className="row" style={{ marginTop: 20 }}>
              <a className="btn quiet" href={result.redesigned} download target="_blank" rel="noreferrer">Download</a>
              <button className="btn quiet" onClick={() => { setPhase("idle"); setResult(null); setBrief(null); setChat([]); }}>Try a different style</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="studio">
            {/* left: photos */}
            <div className="card">
              <ol className="stepper">
                {["Upload", "Describe", "Style", "Generate"].map((s, i) => (
                  <li key={s} data-on={step === i + 1 ? "true" : "false"} data-done={step > i + 1 ? "true" : "false"}><span>{i + 1}</span>{s}</li>
                ))}
              </ol>

              <h3 className="cardhead">Upload a photo of your room</h3>
              {!preview ? (
                <div className="drop" role="button" tabIndex={0}
                  onClick={() => fileRef.current.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileRef.current.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
                  <span className="ic">🖼</span>
                  <p className="lead">Drag &amp; drop your photo here</p>
                  <span className="or">or</span>
                  <span className="btn">Choose a photo</span>
                  <p className="formats">JPG, PNG or HEIC · up to 8 MB</p>
                </div>
              ) : (
                <>
                  <img className="thumb" src={preview} alt="Your room" />
                  <button className="btn quiet" style={{ marginTop: 12 }} onClick={() => fileRef.current.click()}>Use a different photo</button>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files[0])} />

              <div className="more">
                <h4>Add more photos <em>(optional)</em></h4>
                <div className="angles">
                  {angles.map((a, i) => (
                    <img key={i} src={a.url} alt={`Angle ${i + 1}`} onClick={() => setAngles(angles.filter((_, j) => j !== i))} title="Click to remove" />
                  ))}
                  {angles.length < 3 && <div className="add" role="button" tabIndex={0} onClick={() => angleRef.current.click()} onKeyDown={(e) => e.key === "Enter" && angleRef.current.click()}>+</div>}
                </div>
                <input ref={angleRef} type="file" accept="image/*" hidden onChange={(e) => addAngle(e.target.files[0])} />
                <p className="note">Add different angles for better results</p>
              </div>
            </div>

            {/* right: the ask */}
            <div className="card">
              <div className="askhead">
                <h2 className="scriptfont vision">Tell us about your vision.</h2>
                <p className="hand tip">Not sure what to say?<br />Try our suggestions below!</p>
              </div>
              <p className="sub">Be as detailed as you&rsquo;d like. The more you share, the more personalized your results will be.</p>

              <div className="ta">
                <textarea value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} rows={5}
                  placeholder="Example: I want a warm, cozy, modern look. Keep the blue chairs but change the chandelier. I love neutral colors, natural textures and a bit of greenery. I'd like it to feel inviting but still elevated." />
                <span className="count">{notes.length}/500</span>
              </div>

              <div className="selects">
                <label>Room type
                  <span className="selwrap"><span className="ic">🛋</span>
                    <select value={room} onChange={(e) => setRoom(e.target.value)}>{ROOMS.map((r) => <option key={r}>{r}</option>)}</select>
                  </span>
                </label>
                <label>Style preference
                  <span className="selwrap"><span className="ic">🎨</span>
                    <select value={style} onChange={(e) => setStyle(e.target.value)}>
                      <option value="">Select a style</option>{STYLES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </span>
                </label>
                <label>Vibe
                  <span className="selwrap"><span className="ic">♡</span>
                    <select value={vibe} onChange={(e) => setVibe(e.target.value)}>
                      <option value="">Select a vibe</option>{VIBES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </span>
                </label>
              </div>

              <div className="scopewrap">
                <p className="label">HOW FAR SHOULD WE GO?</p>
                <div className="scopes">
                  {SCOPES.map((sc) => (
                    <button key={sc.id} className="scope" data-on={scope === sc.id ? "true" : "false"} onClick={() => setScope(sc.id)}>
                      <span className="name">{sc.label}</span>
                      <span className="hint">{sc.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(loadingItems || items.length > 0) && (
                <>
                  <div className="keephead">
                    <h4>Keep these items</h4><em>Untick anything you&rsquo;d like changed</em>
                  </div>
                  {loadingItems ? <p className="sub">Looking at your room…</p> : (
                    <div className="keeps">
                      {items.map((it, i) => (
                        <button key={it.name} className="keep" data-on={it.keep ? "true" : "false"}
                          onClick={() => setItems(items.map((x, j) => (j === i ? { ...x, keep: !x.keep } : x)))}>
                          <span className="crop"><span className="kind">{KIND_ICON[it.kind] || KIND_ICON.other}</span><span className="what">{it.name}</span></span>
                          <span className="foot"><span className="box">✓</span>{it.keep ? "Keep" : "Change"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <button className="btn brass generate" disabled={!file || phase === "working"} onClick={generate}>
                {phase === "working" ? "Redesigning your room…" : <>Generate my redesign <span>✦</span></>}
              </button>
              {err && <p className="err">{err}</p>}
              {!file && <p className="hint">Add a photo to start.</p>}
            </div>
          </div>

          <section className="section tint">
            <div>
              <div className="explore-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
                <h2 className="h" style={{ fontSize: 30, margin: 0 }}>Need inspiration? Try one of these:</h2>
                <p className="sub" style={{ margin: 0 }}>Click a prompt to use it, then make it your own.</p>
              </div>
              <div className="prompts">
                {PROMPTS.map((p) => <button key={p} className="prompt" onClick={() => setNotes(p)}>&ldquo;{p}&rdquo;</button>)}
              </div>
            </div>
          </section>

          <section className="helpband">
            <div className="stack">
              {["style-modern-classic", "style-moody", "style-farmhouse"].map((base) => <StackPhoto key={base} base={base} />)}
            </div>
            <div>
              <h4>Photos work best when…</h4>
              <ul>
                <li>The room is well lit</li>
                <li>You can see the main furniture and layout</li>
                <li>You include multiple angles (optional)</li>
              </ul>
            </div>
            <div className="pro">
              <h4><span>💡</span> Pro tip</h4>
              <p>Mention what you love, what you don&rsquo;t, and how you want the space to feel.</p>
            </div>
            <p className="scriptfont sign">Great spaces<br />start here.</p>
          </section>
        </>
      )}

      <footer>{BRAND} · <Link href="/privacy">Privacy policy</Link> · <Link href="/terms">Terms of service</Link> · As an Amazon Associate we earn from qualifying purchases. Photos you upload are used only to create your design and are deleted after 30 days.</footer>
    </>
  );
}
