"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { BRAND, TAGLINE, HEADLINE } from "@/lib/brand";

const TILES = ["Modern classic", "Organic modern", "Coastal", "Moody", "Scandinavian", "Farmhouse"];
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];

// Tries each extension so you can drop in .jpg or .jpeg without renaming.
function Photo({ base, alt, className, style }) {
  const [i, setI] = useState(0);
  if (i >= EXTS.length) return null;
  return <img className={className} style={style} src={`/${base}.${EXTS[i]}`} alt={alt} onError={() => setI(i + 1)} />;
}

// Draggable before/after. Works with mouse, touch, and arrow keys.
function Compare() {
  const [pos, setPos] = useState(50);
  const box = useRef();
  const move = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setPos(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };
  const onPointer = (e) => { e.preventDefault(); box.current.setPointerCapture?.(e.pointerId); move(e.clientX); };
  const onMove = (e) => { if (e.buttons === 1 || e.pointerType === "touch") move(e.clientX); };
  const onKey = (e) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(2, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(98, p + 4));
  };

  return (
    <div className="split" ref={box} onPointerDown={onPointer} onPointerMove={onMove}>
      <Photo base="after" alt="The same room redesigned" className="layer" />
      <div className="clip" style={{ width: `${pos}%` }}>
        <Photo base="before" alt="The room before" className="layer" style={{ width: `${10000 / pos}%` }} />
      </div>
      <span className="pill" style={{ left: 14 }}>BEFORE</span>
      <span className="pill" style={{ right: 14 }}>AFTER</span>
      <div className="handle" style={{ left: `${pos}%` }}>
        <button className="knob" onKeyDown={onKey} aria-label="Drag to compare before and after"
          role="slider" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100}>‹ ›</button>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <nav className="bar">
        <Link href="/" className="logo">{BRAND.toUpperCase()}<small>{TAGLINE}</small></Link>
        <div className="barlinks">
          <a href="#how">How it works</a>
          <a href="#styles">Styles</a>
          <a href="#shop">Shop</a>
        </div>
        <Link href="/design" className="btn">Get started</Link>
      </nav>

      <header className="hero">
        <Photo base="hero" alt="" className="bg" />
        <div className="scrim" />
        <div className="inner">
          <h1 className="h">{HEADLINE}</h1>
          <p className="kicker">Upload a photo. Choose a style.<br />{BRAND} redesigns your actual room, in seconds.</p>
          <Link href="/design" className="btn brass">Redesign my room →</Link>
          <div><a className="play" href="#how"><i>▶</i> Watch how it works</a></div>
        </div>
        <p className="heroscript">Same space.<br />A better you.</p>
      </header>

      <section className="showcase">
        <Compare />
        <div>
          <p className="eyebrow">Real rooms.<br />Real transformations.</p>
          <h2 className="h">See what&rsquo;s possible.</h2>
          <p className="body">{BRAND} works from your actual photos, so what you see is your room — same walls, same windows, a whole new feeling.</p>
          <Link href="/design" className="btn quiet">Try your room →</Link>
        </div>
      </section>

      <section className="how" id="how">
        <p className="eyebrow">How it works</p>
        <h2 className="h">A beautiful home is just a few clicks away.</h2>
        <div className="steps">
          <div className="step"><div className="ic">⬆</div><h3>Show us your room</h3><p>Upload a photo. No measuring required.</p></div>
          <div className="step"><div className="ic">🪑</div><h3>Tell us what stays</h3><p>Keep what you love and change what you don&rsquo;t.</p></div>
          <div className="step"><div className="ic">🎨</div><h3>Choose your style</h3><p>From cabin chic to coastal, or let us surprise you.</p></div>
          <div className="step"><div className="ic">✦</div><h3>Meet your new room</h3><p>Your redesign, plus where to buy the pieces.</p></div>
        </div>
      </section>

      <section className="explore" id="styles">
        <div className="head">
          <span>Explore styles</span>
          <em>Find your look, or let us surprise you.</em>
        </div>
        <div className="tiles">
          {TILES.map((t) => (
            <Link key={t} className="tile" href={`/design?style=${encodeURIComponent(t)}`}>
              <Photo base={`style-${t.toLowerCase().replace(/ /g, "-")}`} alt="" />
              <span>{t}</span>
            </Link>
          ))}
          <Link className="tile dice" href="/design?style=Surprise%20me">⚄<span>Surprise me</span></Link>
        </div>
      </section>

      <section className="closer" id="shop">
        <div className="art"><Photo base="plant" alt="" /></div>
        <div className="copy">
          <h2 className="h">Design a home that feels like you.</h2>
          <p>Beautiful spaces, smarter choices, real results. Every design comes with the pieces that made it work and where to find them.</p>
          <Link href="/design" className="btn">Get started →</Link>
        </div>
        <div className="testi">
          <div>
            <q className="h">It&rsquo;s like having a designer in your pocket.</q>
            <p className="stars">★★★★★</p>
            <small>Real people. Happier homes.</small>
          </div>
        </div>
      </section>

      <footer>{BRAND} · As an Amazon Associate we earn from qualifying purchases. Photos you upload are used only to create your design.</footer>
    </>
  );
}
